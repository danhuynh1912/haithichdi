import { supabase } from '@/lib/supabase';
import type { Locale } from '@/i18n/routing';
import { resolveMediaUrl } from '@/lib/media';

export interface BlogTag {
  id: number;
  slug: string;
  name: string;
}

export interface BlogCard {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  hero_url: string | null;
  hero_alt: string;
  published_at: string | null;
  tags: BlogTag[];
}

export interface BlogPost extends BlogCard {
  content_md: string;
  updated_at: string;
  /** Intrinsic sizes for the images inside `content_md`, keyed by S3 key. */
  images: BlogImageMeta[];
}

export interface BlogImageMeta {
  image_path: string;
  width: number | null;
  height: number | null;
}

export interface BlogQueryParams {
  search?: string;
  tagSlugs?: string[];
}

interface RawBlogCard extends Omit<BlogCard, 'hero_url'> {
  hero_path: string | null;
  hero_url: string | null;
}

type RawBlogPost = RawBlogCard & Pick<BlogPost, 'content_md' | 'updated_at' | 'images'>;

/** One place that turns a raw row's media columns into a usable URL. */
function mapCard(raw: RawBlogCard): BlogCard {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    hero_url: resolveMediaUrl(raw.hero_path, raw.hero_url),
    hero_alt: raw.hero_alt,
    published_at: raw.published_at,
    tags: raw.tags ?? [],
  };
}

/**
 * Searching and tag filtering are deliberately not done here: `blogs_list`
 * owns both, so the list page and any future caller cannot disagree about
 * what matches. Empty values are dropped so the RPC sees SQL NULL rather
 * than an empty string it would have to special-case.
 */
export const blogService = {
  getTags: async (locale: Locale): Promise<BlogTag[]> => {
    const { data, error } = await supabase.rpc('blog_tags_list', { p_locale: locale });
    if (error) throw new Error(error.message);
    return (data as BlogTag[]) ?? [];
  },

  getPosts: async (locale: Locale, params: BlogQueryParams = {}): Promise<BlogCard[]> => {
    const search = params.search?.trim();
    const tagSlugs = params.tagSlugs?.length ? params.tagSlugs : null;

    const { data, error } = await supabase.rpc('blogs_list', {
      p_search: search || null,
      p_tag_slugs: tagSlugs,
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    return ((data as RawBlogCard[]) ?? []).map(mapCard);
  },

  getPost: async (locale: Locale, slug: string): Promise<BlogPost | null> => {
    const { data, error } = await supabase.rpc('blog_detail', {
      p_slug: slug,
      p_locale: locale,
    });
    if (error) throw new Error(error.message);
    if (!data) return null;

    const raw = data as RawBlogPost;
    return {
      ...mapCard(raw),
      content_md: raw.content_md,
      updated_at: raw.updated_at,
      images: raw.images ?? [],
    };
  },
};
