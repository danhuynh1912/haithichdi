import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { resolveMediaUrl } from '@/lib/media';
import { Location, TourListItem } from '@/lib/types';
import { mapTourCard, RawTourCard } from './_mappers';

export interface TourDetail {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: Location;
  image_url: string | null;
  slots_left: number;
  booked_count: number;
  price: string | null;
  description_md: string;
  summary: string;
  images: TourImageItem[];
  itinerary_days: TourItineraryDay[];
}

export interface TourImageItem {
  id: number;
  image_url: string | null;
  caption: string;
  sort_order: number;
}

export interface TourItineraryDay {
  day_number: number;
  date: string | null;
  title: string;
  content_md: string;
}

export interface BookingPayload {
  tour: number;
  full_name: string;
  phone: string;
  email?: string;
  note?: string;
  medal_name: string;
  dob: string;
  citizen_id: string;
}

export interface BookingResponse {
  id: number;
  status: string;
}

export interface TourQueryParams {
  locationIds?: number[];
  search?: string;
  sortUpcoming?: boolean;
}

interface RawTourDetail extends RawTourCard {
  price: string | null;
  description_md: string;
  summary: string;
  images: Array<{
    id: number;
    image_path: string | null;
    image_url: string | null;
    caption: string;
    sort_order: number;
  }>;
  itinerary_days: TourItineraryDay[];
}

function mapTourDetail(raw: RawTourDetail): TourDetail {
  const card = mapTourCard(raw);
  return {
    ...card,
    price: raw.price,
    description_md: raw.description_md,
    summary: raw.summary,
    images: raw.images.map((img) => ({
      id: img.id,
      image_url: resolveMediaUrl(img.image_path, img.image_url),
      caption: img.caption,
      sort_order: img.sort_order,
    })),
    itinerary_days: raw.itinerary_days,
  };
}

/** PostgREST/RPC errors throw; surface a typed message to callers. */
function unwrap<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(error.message);
  return data as T;
}

export const tourService = {
  getTourDetail: async (tourId: number, locale: Locale): Promise<TourDetail> => {
    const { data, error } = await supabase.rpc('tour_detail', {
      p_tour_id: tourId,
      p_locale: locale,
    });
    const raw = unwrap<RawTourDetail | null>(data, error);
    if (!raw) throw new Error('Tour not found');
    return mapTourDetail(raw);
  },
  getTours: async (
    locale: Locale,
    params: TourQueryParams = {},
  ): Promise<TourListItem[]> => {
    const { data, error } = await supabase.rpc('search_tours', {
      p_search: params.search?.trim() || null,
      p_location_ids:
        params.locationIds && params.locationIds.length ? params.locationIds : null,
      p_ordering: 'start_date',
      p_locale: locale,
    });
    const raw = unwrap<RawTourCard[]>(data ?? [], error);
    return raw.map(mapTourCard);
  },
  getHotTours: async (locale: Locale): Promise<TourListItem[]> => {
    const { data, error } = await supabase.rpc('hot_tours', { p_locale: locale });
    const raw = unwrap<RawTourCard[]>(data ?? [], error);
    return raw.map(mapTourCard);
  },
  getRelatedTours: async (
    tourId: number,
    locale: Locale,
    limit = 12,
  ): Promise<TourListItem[]> => {
    const { data, error } = await supabase.rpc('related_tours', {
      p_tour_id: tourId,
      p_limit: limit,
      p_locale: locale,
    });
    const raw = unwrap<RawTourCard[]>(data ?? [], error);
    return raw.map(mapTourCard);
  },
  createBooking: async (payload: BookingPayload): Promise<BookingResponse> => {
    const { data, error } = await supabase.rpc('create_booking', {
      p_tour_id: payload.tour,
      p_full_name: payload.full_name,
      p_phone: payload.phone,
      p_email: payload.email ?? '',
      p_note: payload.note ?? '',
      p_medal_name: payload.medal_name,
      p_dob: payload.dob,
      p_citizen_id: payload.citizen_id,
    });
    if (error) throw new BookingError(toBookingErrorCode(error.message));
    return { id: data.id, status: data.status };
  },
};

/**
 * The exceptions `create_booking()` raises, as codes. They are also the key
 * names under the `bookingErrors` namespace — the UI translates, the service
 * never carries user-facing text.
 */
export const BOOKING_ERROR_CODES = [
  'TOUR_FULL',
  'TOUR_INACTIVE',
  'TOUR_NOT_FOUND',
  'PHONE_DUPLICATE',
  'MEDAL_NAME_REQUIRED',
  'DOB_REQUIRED',
  'CITIZEN_ID_REQUIRED',
  'FULL_NAME_REQUIRED',
  'PHONE_REQUIRED',
] as const;

export type BookingErrorCode = (typeof BOOKING_ERROR_CODES)[number] | 'UNKNOWN';

export class BookingError extends Error {
  constructor(readonly code: BookingErrorCode) {
    super(code);
    this.name = 'BookingError';
  }
}

export function toBookingErrorCode(message: string): BookingErrorCode {
  return BOOKING_ERROR_CODES.find((code) => message.includes(code)) ?? 'UNKNOWN';
}
