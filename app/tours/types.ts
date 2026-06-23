import { Location } from '@/app/locations/types';

export interface TourListItem {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  location: Location;
  image_url: string | null;
  slots_left: number;
  booked_count: number;
}
