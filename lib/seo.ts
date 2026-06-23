import type { Metadata } from 'next';

export const SITE_NAME = 'Hải Thích Đi';
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export const DEFAULT_DESCRIPTION =
  'Hải Thích Đi - Chuyên tour trekking Việt Nam, khám phá thiên nhiên và văn hóa địa phương bền vững.';
const DEFAULT_IMAGE = '/images/haithichdi1.webp';
const ICON_VERSION = '20260402';

type SeoParams = {
  title?: string;
  description?: string;
  pathname?: string;
  images?: string[];
};

export function createRootMetadata(): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    openGraph: {
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      images: [DEFAULT_IMAGE],
      locale: 'vi_VN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
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
      canonical: SITE_URL,
    },
  };
}

export function createMetadata({
  title,
  description,
  pathname = '/',
  images,
}: SeoParams): Metadata {
  const url = new URL(pathname, SITE_URL).toString();
  const metaTitle = title || SITE_NAME;
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const metaImages = images && images.length > 0 ? images : [DEFAULT_IMAGE];

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      siteName: SITE_NAME,
      images: metaImages,
      locale: 'vi_VN',
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
