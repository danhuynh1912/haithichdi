import { supabase } from '@/lib/supabase';
import { resolveMediaUrl } from '@/lib/media';
import { Location } from '@/app/locations/types';
import { TourListItem } from '@/app/tours/types';
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
  itinerary_md: string;
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
  itinerary_md: string;
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
    itinerary_md: raw.itinerary_md,
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
  getTourDetail: async (tourId: number): Promise<TourDetail> => {
    const { data, error } = await supabase.rpc('tour_detail', { p_tour_id: tourId });
    const raw = unwrap<RawTourDetail | null>(data, error);
    if (!raw) throw new Error('Tour not found');
    return mapTourDetail(raw);
  },
  getTours: async (params: TourQueryParams = {}): Promise<TourListItem[]> => {
    const { data, error } = await supabase.rpc('search_tours', {
      p_search: params.search?.trim() || null,
      p_location_ids:
        params.locationIds && params.locationIds.length ? params.locationIds : null,
      p_ordering: 'start_date',
    });
    const raw = unwrap<RawTourCard[]>(data ?? [], error);
    return raw.map(mapTourCard);
  },
  getHotTours: async (): Promise<TourListItem[]> => {
    const { data, error } = await supabase.rpc('hot_tours');
    const raw = unwrap<RawTourCard[]>(data ?? [], error);
    return raw.map(mapTourCard);
  },
  getRelatedTours: async (tourId: number, limit = 12): Promise<TourListItem[]> => {
    const { data, error } = await supabase.rpc('related_tours', {
      p_tour_id: tourId,
      p_limit: limit,
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
    if (error) throw new Error(translateBookingError(error.message));
    return { id: data.id, status: data.status };
  },
};

/** Map create_booking()'s raised exceptions to user-facing Vietnamese text. */
function translateBookingError(message: string): string {
  if (message.includes('TOUR_FULL')) return 'Tour đã hết chỗ.';
  if (message.includes('TOUR_INACTIVE')) return 'Tour hiện không nhận đặt chỗ.';
  if (message.includes('TOUR_NOT_FOUND')) return 'Không tìm thấy tour.';
  if (message.includes('PHONE_DUPLICATE')) return 'Số điện thoại đã đăng ký tour này.';
  if (message.includes('MEDAL_NAME_REQUIRED')) return 'Vui lòng nhập tên in trên huy chương.';
  if (message.includes('DOB_REQUIRED')) return 'Vui lòng nhập ngày sinh.';
  if (message.includes('CITIZEN_ID_REQUIRED')) return 'Vui lòng nhập số căn cước công dân.';
  if (message.includes('FULL_NAME_REQUIRED')) return 'Vui lòng nhập họ tên.';
  if (message.includes('PHONE_REQUIRED')) return 'Vui lòng nhập số điện thoại.';
  return 'Đặt tour thất bại. Vui lòng thử lại.';
}
