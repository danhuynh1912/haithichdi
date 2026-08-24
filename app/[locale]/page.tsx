import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { getCachedLocations } from '@/lib/services/locations-cached';
import { tourService } from '@/lib/services/tour';
import { homeService } from '@/lib/services/home';
import HomeClient from './home-client';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return createMetadata({
    locale,
    pathname: '/',
    // The root layout's `%s | Hải Thích Đi` template appends the site name.
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const queryClient = getQueryClient();
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
      <HomeClient />
    </HydrationBoundary>
  );
}
