import { notFound } from 'next/navigation';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { locationService } from '@/lib/services/location';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { getCachedLocations } from '@/lib/services/locations-cached';
import { slugify } from '@/lib/utils';
import { RouteDetailClient } from './route-detail-client';

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

/**
 * Slugs are derived from the route name in JS, not stored, so resolution goes
 * through the same `slugify` the links are built with. `locations_list` is the
 * only query that returns every route, and it is held between requests by
 * `getCachedLocations`, so resolving a slug costs nothing most of the time.
 */
async function findLocation(locale: Locale, slug: string) {
  const locations = await getCachedLocations(locale);
  return locations.find((location) => slugify(location.name) === slug) ?? null;
}

export async function generateStaticParams() {
  const locations = await locationService
    .getLocations(routing.defaultLocale)
    .catch(() => []);
  return locations.map((location) => ({ slug: slugify(location.name) }));
}

// A route edited in the admin panel should appear without a redeploy.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const location = await findLocation(locale, slug);

  if (!location) {
    const t = await getTranslations({ locale, namespace: 'metadata.locations' });
    return createMetadata({
      locale,
      pathname: `/locations/${slug}`,
      title: t('title'),
      description: t('description'),
    });
  }

  // No `images` here on purpose: opengraph-image.tsx beside this file supplies
  // one, cropped to the shape Facebook needs before it will render the wide
  // card. Naming the raw photo here would override it and hand back the
  // portrait original that collapsed the preview in the first place.
  return createMetadata({
    locale,
    pathname: `/locations/${slug}`,
    title: `${location.name}${location.elevation_m > 0 ? ` ${location.elevation_m}m` : ''}`,
    description: location.description,
    images: null,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const summary = await findLocation(locale, slug);
  if (!summary) notFound();

  const location = await locationService.getLocationDetail(summary.id, locale);
  if (!location) notFound();

  // The departures block is the natural home for a link to each trip on this
  // route — and it was fetching in the browser, so the served HTML carried no
  // link to any of them. A reader arriving from search sees the dates without
  // waiting for a second round trip; a crawler sees them at all.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.locationTours(locale, location.id),
    queryFn: () => locationService.getToursByLocation(location.id, locale),
  });

  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav('home'), pathname: '/' },
          { name: tNav('locations'), pathname: '/locations' },
          { name: location.name },
        ])}
      />
      <RouteDetailClient location={location} />
    </HydrationBoundary>
  );
}
