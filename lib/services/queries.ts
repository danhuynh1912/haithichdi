'use client';

import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import type { Locale } from '@/i18n/routing';
import { bookingService } from './booking';
import { homeService } from './home';
import { locationService } from './location';
import { tourService, type TourQueryParams } from './tour';
import { blogService, type BlogQueryParams } from './blog';
import { queryKeys } from './query-keys';

/**
 * Every server-state read in the app, with the active locale already bound —
 * both to the request and to the React Query cache key.
 *
 * Routing every read through these hooks is what makes it impossible to
 * forget binding the locale — prefer adding a hook here over calling
 * `useQuery(...)` with a service function directly.
 */

export { queryKeys };

export function useLocationsQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.locations(locale),
    queryFn: () => locationService.getLocations(locale),
  });
}

export function useLocationToursQuery(locationId: number | null) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.locationTours(locale, locationId ?? 0),
    queryFn: () => locationService.getToursByLocation(locationId!, locale),
    enabled: locationId !== null,
  });
}

export function useToursQuery(filter: TourQueryParams) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.tours(locale, filter),
    queryFn: () => tourService.getTours(locale, filter),
  });
}

export function useHotToursQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.hotTours(locale),
    queryFn: () => tourService.getHotTours(locale),
  });
}

export function useTourDetailQuery(tourId: number) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.tourDetail(locale, tourId),
    queryFn: () => tourService.getTourDetail(tourId, locale),
    enabled: Number.isFinite(tourId),
    staleTime: 30_000,
  });
}

export function useRelatedToursQuery(tourId: number, limit = 12) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.relatedTours(locale, tourId),
    queryFn: () => tourService.getRelatedTours(tourId, locale, limit),
    enabled: Number.isFinite(tourId),
    staleTime: 60_000,
  });
}

export function useFeaturedRoutesQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.featuredRoutes(locale),
    queryFn: () => homeService.getFeaturedRoutes(locale),
    staleTime: 60_000,
  });
}

export function useMomentsGalleryQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.momentsGallery(locale),
    queryFn: () => homeService.getMomentsGallery(locale),
    staleTime: 60_000,
  });
}

export function useBookingsByIdsQuery(bookingIds: number[], enabled: boolean) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.bookingsByIds(locale, bookingIds),
    queryFn: () => bookingService.getBookingsByIds(bookingIds, locale),
    enabled: enabled && bookingIds.length > 0,
  });
}

export function useBookingDetailQuery(bookingId: number | null) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.bookingDetail(locale, bookingId),
    queryFn: () => bookingService.getBookingDetail(bookingId!, locale),
    enabled: bookingId !== null,
  });
}

export function useBlogTagsQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.blogTags(locale),
    queryFn: () => blogService.getTags(locale),
    staleTime: 60_000,
  });
}

export function useBlogPostsQuery(params: BlogQueryParams) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.blogPosts(locale, params),
    queryFn: () => blogService.getPosts(locale, params),
    // Typing in the search box walks through keys; holding the previous rows
    // keeps the list from blanking between them.
    placeholderData: (previous) => previous,
  });
}

export function useBlogPostQuery(slug: string) {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.blogPost(locale, slug),
    queryFn: () => blogService.getPost(locale, slug),
    enabled: Boolean(slug),
  });
}
