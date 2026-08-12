/**
 * Shared domain shapes returned by `lib/services/*` and consumed by the routes.
 * They live here (not under `app/`) so services never import from a route.
 */

export interface Location {
  id: number;
  name: string;
  elevation_m: number;
  description: string;
  full_image_url: string | null;
  quotation_file_url?: string | null;
  /**
   * The route's long-form write-up. Only `locations_list` carries it — it is
   * what the detail modal shows in place of a quotation PDF, and putting it on
   * the shared location card would ship it with every tour in every list.
   */
  description_md?: string | null;
}

export interface Tour {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  image_url: string | null;
  slots_left: number;
  booked_count: number;
}

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
