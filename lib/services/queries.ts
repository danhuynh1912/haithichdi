'use client';

import { useLocale } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import type { Locale } from '@/i18n/routing';
import { bookingService } from './booking';
import { homeService } from './home';
import { leaderService } from './leader';
import { locationService } from './location';
import { tourService, type TourQueryParams } from './tour';

/**
 * Every server-state read in the app, with the active locale already bound —
 * both to the request and to the React Query cache key.
 *
 * The locale MUST be part of the key: without it, switching language would
 * serve the previous language's cached rows with no refetch, and nothing would
 * look broken until a user complained. Routing every read through these hooks
 * is what makes that impossible to forget — prefer adding a hook here over
 * calling `useQuery(...)` with a service function directly.
 */

/** Key factory — exported so tests and prefetches build identical keys. */
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
  leaders: (locale: Locale) => ['leaders', locale] as const,
  bookingsByIds: (locale: Locale, ids: number[]) =>
    ['bookings-by-ids', locale, ids.join(',')] as const,
  bookingDetail: (locale: Locale, bookingId: number | null) =>
    ['booking-detail', locale, bookingId] as const,
};

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

export function useLeadersQuery() {
  const locale = useLocale();
  return useQuery({
    queryKey: queryKeys.leaders(locale),
    queryFn: () => leaderService.getLeaders(locale),
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
