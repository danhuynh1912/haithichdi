import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { resolveMediaUrl } from '@/lib/media';
import { Location, TourListItem } from '@/lib/types';
import { mapLocation, mapTourCard, RawLocation, RawTourCard } from './_mappers';
import type { TourImageItem, TourItineraryDay } from './tour';

/**
 * A route on its own, for the page a salesperson sends to someone still
 * choosing. Mirrors `TourDetail` minus everything that belongs to a departure:
 * no price for a given date, and the itinerary carries no dates at all.
 */
export interface LocationDetail extends Location {
  summary: string;
  default_price: number | null;
  default_trek_days: number;
  default_lead_nights: number;
  images: TourImageItem[];
  itinerary_days: TourItineraryDay[];
}

interface RawLocationDetail extends RawLocation {
  summary: string;
  default_price: string | number | null;
  default_trek_days: number;
  default_lead_nights: number;
  images: Array<{
    id: number;
    image_path: string | null;
    image_url: string | null;
    caption: string;
    sort_order: number;
  }>;
  itinerary_days: TourItineraryDay[];
}

export const locationService = {
  getLocations: async (locale: Locale): Promise<Location[]> => {
    const { data, error } = await supabase.rpc('locations_list', {
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    return ((data as RawLocation[]) ?? []).map(mapLocation);
  },
  getLocationDetail: async (
    locationId: number,
    locale: Locale,
  ): Promise<LocationDetail | null> => {
    const { data, error } = await supabase.rpc('location_detail', {
      p_location_id: locationId,
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    const raw = data as RawLocationDetail | null;
    if (!raw) return null;

    return {
      ...mapLocation(raw),
      summary: raw.summary,
      default_price: raw.default_price == null ? null : Number(raw.default_price),
      default_trek_days: raw.default_trek_days,
      default_lead_nights: raw.default_lead_nights,
      images: raw.images.map((img) => ({
        id: img.id,
        image_url: resolveMediaUrl(img.image_path, img.image_url),
        caption: img.caption,
        sort_order: img.sort_order,
      })),
      itinerary_days: raw.itinerary_days,
    };
  },
  getToursByLocation: async (
    locationId: number,
    locale: Locale,
  ): Promise<TourListItem[]> => {
    const { data, error } = await supabase.rpc('search_tours', {
      p_search: null,
      p_location_ids: [locationId],
      p_ordering: 'start_date',
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    // The rows already are TourListItem — the route page renders them with the
    // same TourCard the tours list uses, so the type is no longer narrowed to
    // Tour on the way out.
    return ((data as RawTourCard[]) ?? []).map(mapTourCard);
  },
};
