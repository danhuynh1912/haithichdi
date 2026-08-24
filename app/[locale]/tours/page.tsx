import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { locationService } from '@/lib/services/location';
import { tourService, type TourQueryParams } from '@/lib/services/tour';
import { slugify } from '@/lib/utils';
import ToursRouteClient from './tours-route-client';

type PageProps = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ location?: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.tours' });

  return createMetadata({
    locale,
    pathname: '/tours',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { location: locationSlug } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'tours' });

  const locations = await locationService.getLocations(locale).catch(() => []);
  // Mirrors `findLocation` in locations/[slug]/page.tsx — the `?location=`
  // param comes from the same slugs used there.
  const matchedLocation = locationSlug
    ? locations.find((location) => slugify(location.name) === locationSlug)
    : undefined;

  // Matches tours-client.tsx's initial useState seeds, so the query key the
  // client renders with on its very first pass is the one prefetched here.
  const filter: TourQueryParams = {
    locationIds: matchedLocation ? [matchedLocation.id] : [],
    search: '',
    sortUpcoming: true,
  };

  const queryClient = getQueryClient();
  queryClient.setQueryData(queryKeys.locations(locale), locations);
  await queryClient.prefetchQuery({
    queryKey: queryKeys.tours(locale, filter),
    queryFn: () => tourService.getTours(locale, filter),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <h1 className='sr-only'>{t('heading')}</h1>
      <ToursRouteClient />
    </HydrationBoundary>
  );
}
