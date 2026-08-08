import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { resolveMediaUrl } from '@/lib/media';

export interface Leader {
  id: string | number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  full_avatar_url?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  strengths?: string[];
  display_role?: string;
  relationship_status?: string;
  date_of_birth?: string | null;
  location?: string | null;
  highlight?: string | null;
  years_experience?: number;
  date_joined?: string;
}

interface RawProfile {
  id: string;
  full_name: string;
  avatar_path: string | null;
  avatar_url: string | null;
  bio: string;
  display_role: string;
  strengths: string[];
  highlight: string;
  location: string;
  relationship_status: string;
  date_of_birth: string | null;
  years_experience: number;
  created_at: string;
}

function mapLeader(raw: RawProfile): Leader {
  return {
    id: raw.id,
    username: '',
    first_name: '',
    last_name: '',
    full_name: raw.full_name,
    full_avatar_url: resolveMediaUrl(raw.avatar_path, raw.avatar_url),
    avatar_url: raw.avatar_url,
    bio: raw.bio,
    strengths: raw.strengths ?? [],
    display_role: raw.display_role,
    relationship_status: raw.relationship_status,
    date_of_birth: raw.date_of_birth,
    location: raw.location,
    highlight: raw.highlight,
    years_experience: raw.years_experience,
    date_joined: raw.created_at,
  };
}

export const leaderService = {
  getLeaders: async (locale: Locale): Promise<Leader[]> => {
    // `leaders_list` resolves the `_en` fallback in SQL and already filters to
    // active leaders — the previous PostgREST select did neither.
    const { data, error } = await supabase.rpc('leaders_list', {
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    return ((data as RawProfile[]) ?? []).map(mapLeader);
  },
};
