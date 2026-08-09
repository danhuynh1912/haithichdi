import type { MetadataRoute } from 'next';
import { localizedPath, routing } from '@/i18n/routing';

/**
 * Private routes, blocked in every locale.
 *
 * `/tour-booking/:id` is deliberately NOT here despite the name: it is the tour
 * detail page — description, itinerary, gallery, price — with a booking form at
 * the bottom, and it is the page a search result or a shared link should land
 * on. Blocking it kept every tour out of Google and made Facebook refuse to
 * scrape it, which is what a link preview needs. `/my-bookings` stays blocked:
 * it renders whatever booking ids the visitor's own browser is holding.
 */
const PRIVATE_PATHS = ['/my-bookings'];

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
