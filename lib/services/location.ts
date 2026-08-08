import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { Location, Tour } from '@/lib/types';
import { mapLocation, mapTourCard, RawLocation, RawTourCard } from './_mappers';

export const locationService = {
  getLocations: async (locale: Locale): Promise<Location[]> => {
    const { data, error } = await supabase.rpc('locations_list', {
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    return ((data as RawLocation[]) ?? []).map(mapLocation);
  },
  getToursByLocation: async (
    locationId: number,
    locale: Locale,
  ): Promise<Tour[]> => {
    const { data, error } = await supabase.rpc('search_tours', {
      p_search: null,
      p_location_ids: [locationId],
      p_ordering: 'start_date',
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    // TourListItem is a superset of Tour (it also carries `location`); the
    // location-detail UI only reads the Tour fields.
    return ((data as RawTourCard[]) ?? []).map(mapTourCard) as unknown as Tour[];
  },
};
