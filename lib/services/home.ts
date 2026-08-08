import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { resolveMediaUrl } from '@/lib/media';

export interface HomeFeaturedRouteAudience {
  id: number;
  code: string;
  title: string;
  description: string;
}

export interface HomeFeaturedRoute {
  id: number;
  name: string;
  display_name: string;
  subtitle: string;
  summary: string;
  image_url: string | null;
  suitable_audiences: HomeFeaturedRouteAudience[];
}

export interface HomeHighlightAudienceLocation {
  id: number;
  name: string;
  display_name: string;
}

export interface HomeHighlightAudience {
  id: number;
  code: string;
  title: string;
  description: string;
  locations: HomeHighlightAudienceLocation[];
}

export interface HomeFeaturedRoutesResponse {
  routes: HomeFeaturedRoute[];
  highlight_audience: HomeHighlightAudience | null;
}

export interface HomeMomentsGalleryImage {
  id: number;
  image_url: string | null;
  caption: string;
  tour_title: string;
  location_name: string;
  width: number | null;
  height: number | null;
}

export interface HomeMomentsGalleryResponse {
  images: HomeMomentsGalleryImage[];
}

interface RawFeaturedRoute extends Omit<HomeFeaturedRoute, 'image_url'> {
  image_path: string | null;
  image_url: string | null;
}

interface RawMomentImage extends Omit<HomeMomentsGalleryImage, 'image_url'> {
  image_path: string | null;
  image_url: string | null;
}

export const homeService = {
  getFeaturedRoutes: async (locale: Locale): Promise<HomeFeaturedRoutesResponse> => {
    const { data, error } = await supabase.rpc('home_featured_routes', {
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    const payload = data as {
      routes: RawFeaturedRoute[];
      highlight_audience: HomeHighlightAudience | null;
    };
    return {
      routes: (payload.routes ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        display_name: r.display_name,
        subtitle: r.subtitle,
        summary: r.summary,
        image_url: resolveMediaUrl(r.image_path, r.image_url),
        suitable_audiences: r.suitable_audiences,
      })),
      highlight_audience: payload.highlight_audience,
    };
  },
  getMomentsGallery: async (locale: Locale): Promise<HomeMomentsGalleryResponse> => {
    const { data, error } = await supabase.rpc('home_moments_gallery', {
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    const payload = data as { images: RawMomentImage[] };
    return {
      images: (payload.images ?? []).map((img) => ({
        id: img.id,
        image_url: resolveMediaUrl(img.image_path, img.image_url),
        caption: img.caption,
        tour_title: img.tour_title,
        location_name: img.location_name,
        width: img.width,
        height: img.height,
      })),
    };
  },
};
