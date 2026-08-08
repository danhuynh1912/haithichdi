import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  localizedPath,
  routing,
  OG_LOCALE,
  type Locale,
} from '@/i18n/routing';

export const SITE_NAME = 'Hải Thích Đi';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const DEFAULT_IMAGE = '/images/haithichdi1.webp';
const ICON_VERSION = '20260402';

type SeoParams = {
  locale: Locale;
  /** Unprefixed app path, e.g. `/tours` — locale prefixes are added here. */
  pathname: string;
  title?: string;
  description?: string;
  images?: string[];
};

function absoluteUrl(pathname: string, locale: Locale) {
  return new URL(localizedPath(pathname, locale), SITE_URL).toString();
}

/** `hreflang` map so each locale's page points at all of its siblings. */
function alternateLanguages(pathname: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(pathname, locale)]),
  );
}

export async function createRootMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const description = t('siteDescription');

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    openGraph: {
      title: SITE_NAME,
      description,
      url: absoluteUrl('/', locale),
      siteName: SITE_NAME,
      images: [DEFAULT_IMAGE],
      locale: OG_LOCALE[locale],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description,
      images: [DEFAULT_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: `/favicon.ico?v=${ICON_VERSION}`, type: 'image/x-icon' },
        { url: `/icon.png?v=${ICON_VERSION}`, type: 'image/png' },
      ],
      shortcut: [`/favicon.ico?v=${ICON_VERSION}`],
      apple: [{ url: `/apple-icon.png?v=${ICON_VERSION}`, type: 'image/png' }],
    },
    alternates: {
      canonical: absoluteUrl('/', locale),
      languages: alternateLanguages('/'),
    },
  };
}

export async function createMetadata({
  locale,
  pathname,
  title,
  description,
  images,
}: SeoParams): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const url = absoluteUrl(pathname, locale);
  const metaTitle = title || SITE_NAME;
  const metaDescription = description || t('siteDescription');
  const metaImages = images && images.length > 0 ? images : [DEFAULT_IMAGE];

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: url,
      languages: alternateLanguages(pathname),
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: SITE_NAME,
      images: metaImages,
      locale: OG_LOCALE[locale],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: metaImages,
    },
  };
}
