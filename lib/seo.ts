import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  localizedPath,
  routing,
  OG_LOCALE,
  type Locale,
} from '@/i18n/routing';

export const SITE_NAME = 'Hải Thích Đi';
/**
 * The full brand, and what Google is being asked to print above the title in
 * place of the bare domain. Deliberately not the same string as `SITE_NAME`:
 * that one is the suffix on every page title, where the shorter form leaves
 * more of the 60-odd characters Google shows for what the page is about.
 * `websiteJsonLd` lists the short form as an `alternateName`, which is exactly
 * what that field is for.
 */
export const SITE_BRAND = 'Hải Thích Đi Travel';
// Falls back to the production origin, matching robots.ts and sitemap.ts — a
// missing env var must never ship localhost canonicals to production.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://haithichdi.com';
// JPG on purpose: Facebook and Zalo scrapers handle WebP unreliably, and
// 1200×630 is the canonical share-card size. Derived from haithichdi1.webp,
// which stays in /images as the homepage hero poster.
const DEFAULT_IMAGE = {
  url: '/images/og-default.jpg',
  width: 1200,
  height: 630,
};
const ICON_VERSION = '20260402';

type SeoParams = {
  locale: Locale;
  /** Unprefixed app path, e.g. `/tours` — locale prefixes are added here. */
  pathname: string;
  title?: string;
  description?: string;
  /**
   * `null` leaves og:image unset, for a page with its own
   * `opengraph-image` file — naming one here would override what that
   * generates. Omitted entirely falls back to the site-wide card.
   */
  images?: string[] | null;
  /**
   * Keeps the page out of search results. Robots.txt must NOT also disallow a
   * noindexed page — a crawler that cannot fetch the page never sees the tag.
   * Canonical and hreflang are omitted too: they invite indexing of a page
   * that is asking not to be indexed.
   */
  noindex?: boolean;
};

/**
 * Google renders roughly 155-160 characters of a description and drops the
 * rest mid-word. Route and tour summaries are written for the page, not for a
 * search result, and ran to 170-236 — so they are clipped here, on a word
 * boundary, rather than by the search engine mid-syllable.
 */
const DESCRIPTION_LIMIT = 158;

export function clampDescription(value: string): string {
  const text = value.trim().replace(/\s+/g, ' ');
  if (text.length <= DESCRIPTION_LIMIT) return text;

  const cut = text.slice(0, DESCRIPTION_LIMIT - 1);
  const lastSpace = cut.lastIndexOf(' ');
  // A single word longer than the limit has no boundary to fall back on.
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.\u2026-]+$/, '')}\u2026`;
}

function absoluteUrl(pathname: string, locale: Locale) {
  return new URL(localizedPath(pathname, locale), SITE_URL).toString();
}

/** `hreflang` map so each locale's page points at all of its siblings. */
function alternateLanguages(pathname: string) {
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(pathname, locale)]),
  );
}

/**
 * The site's own identity, for the line above the title in a search result.
 *
 * Google shows a domain there — "haithichdi.com" — until the homepage tells it
 * what the site is called, and the type it reads for that is `WebSite`. The
 * `TravelAgency` block in the layout says who runs the site, which is a
 * different question and does not stand in for this one.
 *
 * Only the homepage counts: Google takes the site name from the root of the
 * domain and applies it to every result beneath it.
 */
export function websiteJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_BRAND,
    // Other forms Google may already have seen, the title suffix among them.
    // These are weighed together with `og:site_name` and the homepage <title>,
    // and a site that disagrees with itself keeps its domain.
    alternateName: [SITE_NAME, 'Haithichdi', 'Hai Thich Di'],
    url: absoluteUrl('/', locale),
  };
}

/** One step of the trail, as a path this site actually serves. */
export interface Crumb {
  name: string;
  /** Unprefixed app path; the last crumb may omit it. */
  pathname?: string;
}

/**
 * The trail Google prints in place of the raw URL — "Hải Thích Đi › Thiện
 * nguyện" rather than "haithichdi.com › thien-ngu…".
 *
 * Without it Google guesses from the URL, which is why the path segment shows
 * up truncated and unreadable.
 */
export function breadcrumbJsonLd(locale: Locale, crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.pathname ? { item: absoluteUrl(crumb.pathname, locale) } : {}),
    })),
  };
}

export async function createRootMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const description = clampDescription(t('siteDescription'));

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
      siteName: SITE_BRAND,
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
  noindex,
}: SeoParams): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const url = absoluteUrl(pathname, locale);
  const metaTitle = title || SITE_NAME;
  const metaDescription = clampDescription(description || t('siteDescription'));
  const metaImages =
    images === null ? null : images && images.length > 0 ? images : [DEFAULT_IMAGE];

  return {
    title: metaTitle,
    description: metaDescription,
    ...(noindex
      ? {
          robots: { index: false, follow: true },
          // Without this the root layout's canonical (the homepage) merges in.
          alternates: null,
        }
      : {
          alternates: {
            canonical: url,
            languages: alternateLanguages(pathname),
          },
        }),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: SITE_BRAND,
      ...(metaImages ? { images: metaImages } : {}),
      locale: OG_LOCALE[locale],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      ...(metaImages ? { images: metaImages } : {}),
    },
  };
}
