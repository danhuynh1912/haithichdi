import { supabase } from '@/lib/supabase';
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
  getLeaders: async (): Promise<Leader[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select(
        'id, full_name, avatar_path, avatar_url, bio, display_role, strengths, highlight, location, relationship_status, date_of_birth, years_experience, created_at',
      )
      .eq('role', 'leader')
      .eq('is_active', true)
      .order('created_at');
    if (error) throw new Error(error.message);
    return (data as RawProfile[]).map(mapLeader);
  },
};
