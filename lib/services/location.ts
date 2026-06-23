import { supabase } from '@/lib/supabase';
import { Location, Tour } from '@/app/locations/types';
import { mapLocation, mapTourCard, RawLocation, RawTourCard } from './_mappers';

export const locationService = {
  getLocations: async (): Promise<Location[]> => {
    const { data, error } = await supabase
      .from('locations')
      .select(
        'id, name, elevation_m, description, image_path, image_url, quotation_path',
      )
      .order('name');
    if (error) throw new Error(error.message);
    return (data as RawLocation[]).map(mapLocation);
  },
  getToursByLocation: async (locationId: number): Promise<Tour[]> => {
    const { data, error } = await supabase.rpc('search_tours', {
      p_search: null,
      p_location_ids: [locationId],
      p_ordering: 'start_date',
    });
    if (error) throw new Error(error.message);
    // TourListItem is a superset of Tour (it also carries `location`); the
    // location-detail UI only reads the Tour fields.
    return (data as RawTourCard[]).map(mapTourCard) as unknown as Tour[];
  },
};
