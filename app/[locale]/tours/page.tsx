import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { getCachedLocations } from '@/lib/services/locations-cached';
import type { Location } from '@/lib/types';
import { tourService, type TourQueryParams } from '@/lib/services/tour';
import { slugify } from '@/lib/utils';
import ToursRouteClient from './tours-route-client';
import UpcomingDepartures from './upcoming-departures';

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

  const queryClient = getQueryClient();
  const locationsPromise = getCachedLocations(locale);

  // Matches tours-client.tsx's initial useState seeds, so the query key the
  // client renders with on its very first pass is the one prefetched here.
  const unfiltered: TourQueryParams = {
    locationIds: [],
    search: '',
    sortUpcoming: true,
  };

  let locations: Location[];
  let filter: TourQueryParams;

  if (locationSlug) {
    // `?location=` names a route by slug, and only the routes themselves say
    // which id that is — so this one case has to wait before it can ask for
    // the right tours. Mirrors `findLocation` in locations/[slug]/page.tsx.
    locations = await locationsPromise;
    const matched = locations.find(
      (location) => slugify(location.name) === locationSlug,
    );
    filter = matched ? { ...unfiltered, locationIds: [matched.id] } : unfiltered;
    await queryClient.prefetchQuery({
      queryKey: queryKeys.tours(locale, filter),
      queryFn: () => tourService.getTours(locale, filter),
    });
  } else {
    // Nothing to resolve, so the two reads have no reason to queue behind one
    // another — and they were, which is most of the pause between clicking
    // Tours in the menu and the page arriving.
    filter = unfiltered;
    const [resolved] = await Promise.all([
      locationsPromise,
      queryClient.prefetchQuery({
        queryKey: queryKeys.tours(locale, filter),
        queryFn: () => tourService.getTours(locale, filter),
      }),
    ]);
    locations = resolved;
  }

  queryClient.setQueryData(queryKeys.locations(locale), locations);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <h1 className='sr-only'>{t('heading')}</h1>
      <ToursRouteClient />
      <UpcomingDepartures locale={locale} />
    </HydrationBoundary>
  );
}
