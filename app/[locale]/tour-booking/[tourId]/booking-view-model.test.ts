import { describe, expect, it } from 'vitest';
import type { TourDetail } from '@/lib/services/tour';
import {
  getDurationDays,
  normalizeItineraryDays,
  parseTourPrice,
} from './booking-view-model';

function createTourDetail(overrides: Partial<TourDetail> = {}): TourDetail {
  return {
    id: 1,
    title: 'Chinh phục Ky Quan San',
    start_date: '2026-02-18',
    end_date: '2026-02-19',
    location: {
      id: 10,
      name: 'Ky Quan San',
      elevation_m: 3046,
      difficulty: 7.5,
      description: '',
      full_image_url: null,
      quotation_file_url: null,
    },
    image_url: null,
    slots_left: 12,
    booked_count: 3,
    price: '3290000.00',
    description_md: '',
    summary: '',
    price_includes: [],
    price_excludes: [],
    images: [],
    itinerary_days: [],
    ...overrides,
  };
}

describe('booking-view-model', () => {
  it('parses the tour price and reports null when unusable', () => {
    expect(parseTourPrice('3290000.00')).toBe(3290000);
    expect(parseTourPrice('invalid')).toBeNull();
    expect(parseTourPrice(null)).toBeNull();
  });

  it('computes duration days from start/end dates', () => {
    expect(getDurationDays('2026-02-18', '2026-02-19')).toBe(2);
    expect(getDurationDays('2026-02-18', null)).toBeNull();
    expect(getDurationDays('2026-02-19', '2026-02-18')).toBeNull();
  });

  it('normalizes itinerary days by sorting existing records', () => {
    const tour = createTourDetail({
      itinerary_days: [
        { day_number: 2, date: '2026-02-19', title: 'Day 2', content_md: 'Nội dung day 2' },
        { day_number: 0, date: '2026-02-17', title: 'Day 0', content_md: 'Nội dung day 0' },
      ],
    });

    const normalized = normalizeItineraryDays(tour);
    expect(normalized.map((item) => item.day_number)).toEqual([0, 2]);
  });

  it('returns an empty list when the route has no days', () => {
    expect(normalizeItineraryDays(createTourDetail({ itinerary_days: [] }))).toEqual([]);
  });
});
