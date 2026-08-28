import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata, websiteJsonLd } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { getCachedLocations } from '@/lib/services/locations-cached';
import { tourService } from '@/lib/services/tour';
import { homeService } from '@/lib/services/home';
import { campaignService } from '@/lib/services/campaign';
import HomeClient from './home-client';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return createMetadata({
    locale,
    pathname: '/',
    // Carries the site name itself. `title.template` in the layout applies to
    // child segments only, and the homepage is the layout's own segment — so
    // the `%s | Hải Thích Đi` every other page gets never reaches this one.
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = getQueryClient();
  // Read here rather than through react-query: the strip is above the fold on
  // the first screen, and it has to be in the served HTML.
  const campaignsPromise = campaignService.getCampaigns(locale).catch(() => []);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.locations(locale),
      queryFn: () => getCachedLocations(locale),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.hotTours(locale),
      queryFn: () => tourService.getHotTours(locale),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.featuredRoutes(locale),
      queryFn: () => homeService.getFeaturedRoutes(locale),
    }),
    queryClient.prefetchQuery({
      queryKey: queryKeys.momentsGallery(locale),
      queryFn: () => homeService.getMomentsGallery(locale),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Only the homepage carries this: Google reads the site name from the
          root of the domain and applies it to every result beneath it. */}
      <JsonLd data={websiteJsonLd(locale)} />
      <HomeClient campaigns={await campaignsPromise} />
    </HydrationBoundary>
  );
}
