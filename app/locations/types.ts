export interface Location {
  id: number;
  name: string;
  elevation_m: number;
  description: string;
  full_image_url: string | null;
  quotation_file_url?: string | null;
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
