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
 * Sorts the API's itinerary, or synthesises a single "day 0" entry from the
 * legacy `itinerary_md` blob. `dayZeroTitle` is passed in so this stays free of
 * user-facing copy.
 */
export function normalizeItineraryDays(
  tour: TourDetail,
  dayZeroTitle: string,
): TourItineraryDay[] {
  if (tour.itinerary_days.length > 0) {
    return [...tour.itinerary_days].sort((left, right) => left.day_number - right.day_number);
  }

  if (!tour.itinerary_md?.trim()) {
    return [];
  }

  return [
    {
      day_number: 0,
      date: getDayZeroDate(tour.start_date),
      title: dayZeroTitle,
      content_md: tour.itinerary_md,
    },
  ];
}

export function getDayZeroDate(startDate: string | null): string | null {
  const parsed = parseIsoDate(startDate);
  if (!parsed) return null;

  parsed.setUTCDate(parsed.getUTCDate() - 1);
  return parsed.toISOString().slice(0, 10);
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
