import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { Location } from '@/lib/types';
import { mapLocation, RawLocation } from './_mappers';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export type BookingLocationSummary = Location;

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
  created_at: string;
}

export type BookingStatusTone = 'warning' | 'success' | 'danger';

/**
 * Only the visual tone lives here — the human-readable label is a translation
 * (`bookingStatus.*`), so the service layer stays locale-agnostic.
 */
export const BOOKING_STATUS_TONE: Record<BookingStatus, BookingStatusTone> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'danger',
};

export function getBookingStatusTone(status: string): BookingStatusTone {
  return BOOKING_STATUS_TONE[status as BookingStatus] ?? 'warning';
}

export function isBookingStatus(status: string): status is BookingStatus {
  return status in BOOKING_STATUS_TONE;
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
    created_at: raw.created_at,
    tour: {
      id: raw.tour.id,
      title: raw.tour.title,
      start_date: raw.tour.start_date,
      end_date: raw.tour.end_date,
      location: mapLocation(raw.tour.location),
    },
  };
}

export const bookingService = {
  getBookingDetail: async (
    bookingId: number,
    locale: Locale,
  ): Promise<BookingDetail> => {
    const { data, error } = await supabase.rpc('get_bookings_by_ids', {
      p_ids: [bookingId],
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    const rows = (data as RawBookingDetail[]) ?? [];
    if (!rows.length) throw new Error('Booking not found');
    return mapBooking(rows[0]);
  },
  getBookingsByIds: async (
    bookingIds: number[],
    locale: Locale,
  ): Promise<BookingDetail[]> => {
    if (!bookingIds.length) return [];
    const { data, error } = await supabase.rpc('get_bookings_by_ids', {
      p_ids: bookingIds,
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    return ((data as RawBookingDetail[]) ?? []).map(mapBooking);
  },
};
