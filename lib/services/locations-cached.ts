import { unstable_cache } from 'next/cache';
import type { Locale } from '@/i18n/routing';
import { locationService } from './location';

/**
 * The routes list, held between requests.
 *
 * Server components only — `unstable_cache` has no meaning in the browser, and
 * importing this from a client component would fail the build. Client code
 * reads the same data through `useLocationsQuery`, which has its own cache.
 *
 * Worth caching because three server-rendered pages ask for it on the way in
 * (the home page, the tours filter and a route's own page) and it costs a
 * round trip of roughly 230 ms each time, while the list itself changes only
 * when someone edits a route in the admin panel.
 */

/** Names this entry so a future admin save can clear it with `revalidateTag`. */
export const LOCATIONS_TAG = 'locations';

const cached = unstable_cache(
  async (locale: Locale) => locationService.getLocations(locale).catch(() => []),
  ['locations-list'],
  {
    // Matches the revalidation the blog and route pages already use, so an
    // edit shows up on the same schedule everywhere rather than one screen
    // lagging behind another.
    revalidate: 60,
    tags: [LOCATIONS_TAG],
  },
);

/** `locale` is part of the cache key — the RPC returns translated names. */
export function getCachedLocations(locale: Locale) {
  return cached(locale);
}
