import type { TourDetail, TourItineraryDay } from '@/lib/services/tour';

export function getDurationDays(startDate: string | null, endDate: string | null): number | null {
  if (!startDate || !endDate) return null;

  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);
  if (!start || !end) return null;

  const diff = Math.floor((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  return diff > 0 ? diff : null;
}

/** `null` means "no usable price" — the caller renders its own copy for that. */
export function parseTourPrice(price: string | null): number | null {
  if (!price) return null;
  const parsed = Number(price);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * The route's days, in order. There used to be a fallback that turned a
 * free-form `itinerary_md` blob into a single synthetic "day 0" — that column
 * is gone (supabase 0014), and the days are the only source now.
 */
export function normalizeItineraryDays(tour: TourDetail): TourItineraryDay[] {
  return [...tour.itinerary_days].sort((left, right) => left.day_number - right.day_number);
}

function parseIsoDate(value: string | null): Date | null {
  if (!value) return null;
  const [yearRaw, monthRaw, dayRaw] = value.split('-');
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day));
}
