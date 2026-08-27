import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { resolveMediaUrl } from '@/lib/media';
import { mapTourCard, type RawTourCard } from './_mappers';
import type { TourListItem } from '@/lib/types';

/** One figure worth counting up on screen: `120` `phần quà`. */
export interface CampaignStat {
  label: string;
  value: string;
}

export interface CampaignCard {
  id: number;
  slug: string;
  title: string;
  summary: string;
  poster_url: string | null;
  poster_alt: string;
  /**
   * A campaign has no dates of its own — it runs while any of its treks has
   * yet to finish, which `campaigns_list` works out in SQL so that the site,
   * the admin panel and any future caller cannot disagree about it.
   */
  is_open: boolean;
  /** Whether a write-up exists — a closed campaign with one has a story. */
  has_result: boolean;
  result_stats: CampaignStat[];
  tours: TourListItem[];
}

export interface CampaignImage {
  id: number;
  image_url: string | null;
  caption: string;
  width: number | null;
  height: number | null;
}

export interface CampaignDetail extends CampaignCard {
  /** The appeal. Empty once a result is written — the RPC drops it. */
  body_md: string;
  /** What came of it. Empty until someone writes it. */
  result_md: string;
  /** How to give. Empty once the appeal has closed. */
  donate_md: string;
  updated_at: string;
  images: CampaignImage[];
}

interface RawCampaignCard extends Omit<CampaignCard, 'poster_url' | 'tours'> {
  poster_path: string | null;
  poster_url: string | null;
  tours: RawTourCard[];
}

type RawCampaignDetail = RawCampaignCard &
  Pick<CampaignDetail, 'body_md' | 'result_md' | 'donate_md' | 'updated_at'> & {
    images: (Omit<CampaignImage, 'image_url'> & {
      image_path: string | null;
      image_url: string | null;
    })[];
  };

function mapCard(raw: RawCampaignCard): CampaignCard {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    summary: raw.summary,
    poster_url: resolveMediaUrl(raw.poster_path, raw.poster_url),
    poster_alt: raw.poster_alt,
    is_open: raw.is_open,
    has_result: raw.has_result,
    result_stats: raw.result_stats ?? [],
    tours: (raw.tours ?? []).map(mapTourCard),
  };
}

/**
 * Whether a campaign is still running is decided in SQL, not here: it follows
 * from the departure dates of the treks hanging off it, and two answers to
 * "is this open" is one too many.
 */
export const campaignService = {
  getCampaigns: async (locale: Locale): Promise<CampaignCard[]> => {
    const { data, error } = await supabase.rpc('campaigns_list', { p_locale: locale });
    if (error) throw new Error(error.message);
    return ((data as RawCampaignCard[]) ?? []).map(mapCard);
  },

  getCampaign: async (locale: Locale, slug: string): Promise<CampaignDetail | null> => {
    const { data, error } = await supabase.rpc('campaign_detail', {
      p_slug: slug,
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    if (!data) return null;

    const raw = data as RawCampaignDetail;
    return {
      ...mapCard(raw),
      body_md: raw.body_md,
      result_md: raw.result_md,
      donate_md: raw.donate_md,
      updated_at: raw.updated_at,
      images: (raw.images ?? []).map((image) => ({
        id: image.id,
        image_url: resolveMediaUrl(image.image_path, image.image_url),
        caption: image.caption,
        width: image.width,
        height: image.height,
      })),
    };
  },
};
