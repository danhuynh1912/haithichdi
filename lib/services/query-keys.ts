import type { Locale } from '@/i18n/routing';
import type { TourQueryParams } from './tour';
import type { BlogQueryParams } from './blog';

/**
 * Key factory — exported so both the client hooks in `queries.ts` and server
 * component prefetches build identical keys.
 *
 * Lives in its own module, without `'use client'`, on purpose: `queries.ts`
 * is a client file, and a server component that imports a plain function from
 * a `'use client'` module gets a client reference back, not the real
 * function — calling it throws at runtime. Keeping the key factory here, with
 * no client-only code, makes it safe to import from either side.
 *
 * The locale MUST be part of every key: without it, switching language would
 * serve the previous language's cached rows with no refetch, and nothing
 * would look broken until a user complained.
 */
export const queryKeys = {
  locations: (locale: Locale) => ['locations', locale] as const,
  locationTours: (locale: Locale, locationId: number) =>
    ['location-tours', locale, locationId] as const,
  tours: (locale: Locale, filter: TourQueryParams) =>
    ['tours', locale, filter] as const,
  hotTours: (locale: Locale) => ['hot-tours', locale] as const,
  tourDetail: (locale: Locale, tourId: number) =>
    ['tour-detail', locale, tourId] as const,
  relatedTours: (locale: Locale, tourId: number) =>
    ['tour-related', locale, tourId] as const,
  featuredRoutes: (locale: Locale) => ['home-featured-routes', locale] as const,
  momentsGallery: (locale: Locale) => ['home-moments-gallery', locale] as const,
  bookingsByIds: (locale: Locale, ids: number[]) =>
    ['bookings-by-ids', locale, ids.join(',')] as const,
  bookingDetail: (locale: Locale, bookingId: number | null) =>
    ['booking-detail', locale, bookingId] as const,
  blogTags: (locale: Locale) => ['blog-tags', locale] as const,
  blogPosts: (locale: Locale, filter: BlogQueryParams) =>
    ['blog-posts', locale, filter] as const,
  blogPost: (locale: Locale, slug: string) => ['blog-post', locale, slug] as const,
};
