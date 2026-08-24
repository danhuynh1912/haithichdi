import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { localizedPath, routing, type Locale } from '@/i18n/routing';
import { slugify } from '@/lib/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const BASE = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haithichdi.com'
).replace(/\/+$/, '');

type Entry = Omit<MetadataRoute.Sitemap[number], 'url' | 'alternates'> & {
  /**
   * Unprefixed app path — one sitemap row is emitted per locale. A plain
   * string when the path is identical in every locale; a per-locale map when
   * a segment is derived from translated content (location slugs).
   */
  path: string | Record<Locale, string>;
};

const url = (path: string, locale: Locale) =>
  `${BASE}${localizedPath(path, locale)}`;

const pathFor = (path: Entry['path'], locale: Locale) =>
  typeof path === 'string' ? path : path[locale];

/** One row per (page × locale), each cross-linking its siblings via hreflang. */
function expand(entries: Entry[]): MetadataRoute.Sitemap {
  return entries.flatMap(({ path, ...rest }) =>
    routing.locales.map((locale) => ({
      ...rest,
      url: url(pathFor(path, locale), locale),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alternate) => [
            alternate,
            url(pathFor(path, alternate), alternate),
          ]),
        ),
      },
    })),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: Entry[] = [
    { path: '/', lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { path: '/tours', lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { path: '/locations', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { path: '/blog', lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { path: '/about', lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { path: '/chatbot', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { path: '/contact', lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const { data: tours } = await supabase
    .from('tours')
    .select('id, updated_at')
    .eq('is_active', true);

  // `/tours/:id` is not a route — the tour detail page lives under
  // /tour-booking/:id. Every tour URL in this sitemap used to 404.
  const tourPages: Entry[] = (tours ?? []).map((tour) => ({
    path: `/tour-booking/${tour.id}`,
    lastModified: new Date(tour.updated_at ?? now),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // `/locations/:slug` slugs are derived from the route NAME, which the RPC
  // localises — so each locale gets its own slug, matched across locales by
  // the location id. Mirrors `findLocation` in locations/[slug]/page.tsx.
  const locationsByLocale = Object.fromEntries(
    await Promise.all(
      routing.locales.map(async (locale) => {
        const { data } = await supabase.rpc('locations_list', {
          p_locale: locale,
        });
        return [locale, (data as { id: number; name: string }[]) ?? []];
      }),
    ),
  ) as Record<Locale, { id: number; name: string }[]>;

  const locationPages: Entry[] = locationsByLocale[routing.defaultLocale].map(
    (location) => ({
      path: Object.fromEntries(
        routing.locales.map((locale) => {
          const match =
            locationsByLocale[locale].find((row) => row.id === location.id) ??
            location;
          return [locale, `/locations/${slugify(match.name)}`];
        }),
      ) as Record<Locale, string>,
      changeFrequency: 'weekly',
      priority: 0.8,
    }),
  );

  // Published only — the RLS policy on `blogs` already hides drafts from the
  // anon key, but the filter keeps that intent visible here too.
  const { data: posts } = await supabase
    .from('blogs')
    .select('slug, updated_at')
    .eq('status', 'published');

  const blogPages: Entry[] = (posts ?? []).map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: new Date(post.updated_at ?? now),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return expand([...staticPages, ...tourPages, ...locationPages, ...blogPages]);
}
