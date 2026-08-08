import type { MetadataRoute } from 'next';
import { localizedPath, routing } from '@/i18n/routing';

/** Private/transactional routes, blocked in every locale. */
const PRIVATE_PATHS = ['/my-bookings', '/tour-booking/'];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haithichdi.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: routing.locales.flatMap((locale) =>
        PRIVATE_PATHS.map((path) => localizedPath(path, locale)),
      ),
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
