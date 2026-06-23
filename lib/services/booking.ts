import { supabase } from '@/lib/supabase';
import { mapLocation, RawLocation } from './_mappers';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingLocationSummary {
  id: number;
  name: string;
  elevation_m: number;
  description: string;
  full_image_url: string | null;
  quotation_file_url?: string | null;
}

export interface BookingTourSummary {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: BookingLocationSummary;
}

export interface BookingDetail {
  id: number;
  tour: BookingTourSummary;
  full_name: string;
  phone: string;
  email: string;
  note: string;
  medal_name: string;
  dob: string | null;
  citizen_id: string;
  status: BookingStatus;
  status_label: string;
  created_at: string;
}

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; tone: 'warning' | 'success' | 'danger' }
> = {
  pending: { label: 'Chờ xác nhận', tone: 'warning' },
  confirmed: { label: 'Đã xác nhận', tone: 'success' },
  cancelled: { label: 'Đã hủy', tone: 'danger' },
};

export function getBookingStatusMeta(status: string, fallbackLabel?: string) {
  if (status in BOOKING_STATUS_META) {
    return BOOKING_STATUS_META[status as BookingStatus];
  }
  return {
    label: fallbackLabel || status,
    tone: 'warning' as const,
  };
}

interface RawBookingDetail {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  note: string;
  medal_name: string;
  dob: string | null;
  citizen_id: string;
  status: BookingStatus;
  created_at: string;
  tour: {
    id: number;
    title: string;
    start_date: string | null;
    end_date: string | null;
    location: RawLocation;
  };
}

function mapBooking(raw: RawBookingDetail): BookingDetail {
  const loc = mapLocation(raw.tour.location);
  return {
    id: raw.id,
    full_name: raw.full_name,
    phone: raw.phone,
    email: raw.email,
    note: raw.note,
    medal_name: raw.medal_name,
    dob: raw.dob,
    citizen_id: raw.citizen_id,
    status: raw.status,
    status_label:
      BOOKING_STATUS_META[raw.status]?.label ?? raw.status,
    created_at: raw.created_at,
    tour: {
      id: raw.tour.id,
      title: raw.tour.title,
      start_date: raw.tour.start_date,
      end_date: raw.tour.end_date,
      location: {
        id: loc.id,
        name: loc.name,
        elevation_m: loc.elevation_m,
        description: loc.description,
        full_image_url: loc.full_image_url,
        quotation_file_url: loc.quotation_file_url,
      },
    },
  };
}

export const bookingService = {
  getBookingDetail: async (bookingId: number): Promise<BookingDetail> => {
    const { data, error } = await supabase.rpc('get_bookings_by_ids', {
      p_ids: [bookingId],
    });
    if (error) throw new Error(error.message);
    const rows = (data as RawBookingDetail[]) ?? [];
    if (!rows.length) throw new Error('Booking not found');
    return mapBooking(rows[0]);
  },
  getBookingsByIds: async (bookingIds: number[]): Promise<BookingDetail[]> => {
    if (!bookingIds.length) return [];
    const { data, error } = await supabase.rpc('get_bookings_by_ids', {
      p_ids: bookingIds,
    });
    if (error) throw new Error(error.message);
    return ((data as RawBookingDetail[]) ?? []).map(mapBooking);
  },
};
