import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haithichdi.com';

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base,                    lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${base}/tours`,         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/locations`,     lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/about`,         lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Dynamic tour pages
  const { data: tours } = await supabase
    .from('tours')
    .select('id, updated_at')
    .eq('is_active', true);

  const tourPages: MetadataRoute.Sitemap = (tours ?? []).map(tour => ({
    url: `${base}/tours/${tour.id}`,
    lastModified: new Date(tour.updated_at ?? Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Dynamic location pages
  const { data: locations } = await supabase
    .from('locations')
    .select('id, updated_at');

  const locationPages: MetadataRoute.Sitemap = (locations ?? []).map(loc => ({
    url: `${base}/locations/${loc.id}`,
    lastModified: new Date(loc.updated_at ?? Date.now()),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...tourPages, ...locationPages];
}
