import type { MetadataRoute } from 'next';

/**
 * Nothing is disallowed here, on purpose.
 *
 * `/tour-booking/:id` must stay crawlable despite the name: it is the tour
 * detail page — description, itinerary, gallery, price — and blocking it once
 * kept every tour out of Google and made Facebook refuse to scrape previews.
 *
 * `/my-bookings` and `/tour-booking/:id/success` are kept out of search with a
 * `noindex` meta tag (see their `createMetadata({ noindex: true })`) instead of
 * a disallow rule: a crawler that is forbidden from fetching a page can never
 * read its noindex, so the URL can still surface as a bare "blocked" result.
 * Letting it crawl and read the tag is what actually removes it.
 */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haithichdi.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
