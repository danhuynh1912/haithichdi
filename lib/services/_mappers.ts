/**
 * Maps raw RPC/PostgREST rows (which carry `*_path` + `*_url` media columns)
 * into the public interfaces the components already consume (which carry
 * pre-resolved absolute URLs like `full_image_url` / `image_url`). Keeping the
 * resolution here means components are untouched by the AWS→Supabase swap.
 */
import { resolveMediaUrl } from '@/lib/media';
import { Location, TourListItem } from '@/lib/types';

export interface RawLocation {
  id: number;
  name: string;
  elevation_m: number;
  description: string;
  image_path: string | null;
  image_url: string | null;
  quotation_path: string | null;
  /** Only `locations_list` sends these; the card embedded in a tour does not. */
  description_md?: string | null;
  default_price?: string | number | null;
  default_trek_days?: number | null;
}

export interface RawTourCard {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  image_path: string | null;
  image_url: string | null;
  slots_left: number;
  booked_count: number;
  location: RawLocation;
}

export function mapLocation(raw: RawLocation): Location {
  return {
    id: raw.id,
    name: raw.name,
    elevation_m: raw.elevation_m,
    description: raw.description,
    full_image_url: resolveMediaUrl(raw.image_path, raw.image_url),
    quotation_file_url: resolveMediaUrl(raw.quotation_path, null),
    description_md: raw.description_md ?? null,
    // numeric arrives as a string over PostgREST; the card formats it itself.
    default_price: raw.default_price == null ? null : Number(raw.default_price),
    default_trek_days: raw.default_trek_days ?? null,
  };
}

export function mapTourCard(raw: RawTourCard): TourListItem {
  return {
    id: raw.id,
    title: raw.title,
    start_date: raw.start_date,
    end_date: raw.end_date,
    location: mapLocation(raw.location),
    image_url: resolveMediaUrl(raw.image_path, raw.image_url),
    slots_left: raw.slots_left,
    booked_count: raw.booked_count,
  };
}
