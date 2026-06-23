import { describe, expect, it } from 'vitest';
import type { TourDetail } from '@/lib/services/tour';
import {
  formatTourPriceVnd,
  getDayZeroDate,
  getDurationDays,
  normalizeItineraryDays,
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
    itinerary_md: '',
    images: [],
    itinerary_days: [],
    ...overrides,
  };
}

describe('booking-view-model', () => {
  it('formats tour price in VND and falls back when invalid', () => {
    expect(formatTourPriceVnd('3290000.00')).toContain('3.290.000');
    expect(formatTourPriceVnd('invalid')).toBe('Liên hệ');
    expect(formatTourPriceVnd(null)).toBe('Liên hệ');
  });

  it('computes duration days from start/end dates', () => {
    expect(getDurationDays('2026-02-18', '2026-02-19')).toBe(2);
    expect(getDurationDays('2026-02-18', null)).toBeNull();
    expect(getDurationDays('2026-02-19', '2026-02-18')).toBeNull();
  });

  it('computes day 0 as one day before start date', () => {
    expect(getDayZeroDate('2026-02-18')).toBe('2026-02-17');
    expect(getDayZeroDate(null)).toBeNull();
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

  it('creates day 0 fallback from legacy itinerary markdown when itinerary_days is empty', () => {
    const tour = createTourDetail({
      itinerary_md: '## Chuẩn bị đồ cá nhân',
      itinerary_days: [],
    });

    const normalized = normalizeItineraryDays(tour);
    expect(normalized).toHaveLength(1);
    expect(normalized[0]).toMatchObject({
      day_number: 0,
      date: '2026-02-17',
      title: 'Day 0 - Chuẩn bị trước hành trình',
      content_md: '## Chuẩn bị đồ cá nhân',
    });
  });

  it('returns empty array when there is no itinerary data', () => {
    const tour = createTourDetail({
      itinerary_md: '   ',
      itinerary_days: [],
    });

    expect(normalizeItineraryDays(tour)).toEqual([]);
  });
});
