import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import { locationService } from '@/lib/services/location';
import { slugify } from '@/lib/utils';
import { RouteDetailClient } from './route-detail-client';

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

/**
 * Slugs are derived from the route name in JS, not stored, so resolution goes
 * through the same `slugify` the links are built with. `locations_list` is the
 * only query that returns every route, and it is already cached by the page's
 * own revalidation.
 */
async function findLocation(locale: Locale, slug: string) {
  const locations = await locationService.getLocations(locale).catch(() => []);
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

  return createMetadata({
    locale,
    pathname: `/locations/${slug}`,
    title: `${location.name}${location.elevation_m > 0 ? ` ${location.elevation_m}m` : ''}`,
    description: location.description,
    images: location.full_image_url ? [location.full_image_url] : undefined,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const summary = await findLocation(locale, slug);
  if (!summary) notFound();

  const location = await locationService.getLocationDetail(summary.id, locale);
  if (!location) notFound();

  return <RouteDetailClient location={location} />;
}
