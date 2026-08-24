import { cache } from 'react';
import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { localizedPath, type Locale } from '@/i18n/routing';
import { createMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { tourService } from '@/lib/services/tour';
import { parseTourPrice } from './booking-view-model';
import TourBookingClient from './tour-booking-client';

type PageProps = { params: Promise<{ locale: Locale; tourId: string }> };

// `cache` dedupes between generateMetadata and the page render, so the RPC
// runs once per request even though both need the tour.
const getTour = cache(async (id: string, locale: Locale) => {
  const tourId = Number(id);
  if (!Number.isFinite(tourId)) return null;
  return tourService.getTourDetail(tourId, locale).catch(() => null);
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tourId: id } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.tourBooking' });
  const pathname = `/tour-booking/${id}`;

  // Reads the same RPC the page itself does. This used to call a Django
  // endpoint through SERVER_API_BASE_URL, which stopped existing with the move
  // to Supabase and was never set again — so every tour had been quietly
  // serving the generic fallback title and the site's default share image.
  const tour = await getTour(id, locale);

  if (!tour) {
    return createMetadata({
      locale,
      pathname,
      title: t('titleFallback', { id }),
      description: t('descriptionFallback'),
    });
  }

  const location = tour.location?.name;

  return createMetadata({
    locale,
    pathname,
    title: t('title', { tour: tour.title }),
    // The tour's own summary is written for readers; the templated sentence is
    // only there for a tour that has not been given one.
    description:
      tour.summary?.trim() ||
      (location
        ? t('description', { tour: tour.title, location })
        : t('descriptionNoLocation', { tour: tour.title })),
    images: tour.image_url ? [tour.image_url] : undefined,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale, tourId } = await params;
  setRequestLocale(locale);

  const numericId = Number(tourId);
  const queryClient = getQueryClient();

  // Related tours only need the id, so there is no reason for that read to
  // queue behind the tour itself — and it was, which doubled the pause before
  // this page appeared.
  const [tour] = await Promise.all([
    getTour(tourId, locale),
    Number.isFinite(numericId)
      ? queryClient.prefetchQuery({
          queryKey: queryKeys.relatedTours(locale, numericId),
          queryFn: () => tourService.getRelatedTours(numericId, locale),
        })
      : Promise.resolve(),
  ]);

  // Seeds the cache with the value already fetched above instead of a second
  // `prefetchQuery` call, which would re-run the same RPC a second time.
  if (tour) {
    queryClient.setQueryData(queryKeys.tourDetail(locale, numericId), tour);
  }

  // Product + Offer is the schema pair Google shows a price for. The body of
  // this page is client-rendered, so this block is also the only machine-
  // readable statement of what the page sells.
  const jsonLd = tour
    ? (() => {
        const price = parseTourPrice(tour.price);
        const url = new URL(
          localizedPath(`/tour-booking/${tour.id}`, locale),
          SITE_URL,
        ).toString();
        // The cover usually appears in the gallery too — Set drops the repeat.
        const images = [
          ...new Set(
            [
              tour.image_url,
              ...tour.images.map((image) => image.image_url),
            ].filter((src): src is string => Boolean(src)),
          ),
        ];

        return {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: tour.title,
          description: tour.summary?.trim() || undefined,
          image: images.length > 0 ? images : undefined,
          brand: { '@type': 'Brand', name: SITE_NAME },
          offers:
            price != null
              ? {
                  '@type': 'Offer',
                  price,
                  priceCurrency: 'VND',
                  url,
                  availability:
                    tour.slots_left > 0
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/SoldOut',
                  // The quoted price stands until the departure date.
                  ...(tour.start_date
                    ? { priceValidUntil: tour.start_date }
                    : {}),
                }
              : undefined,
        };
      })()
    : null;

  return (
    <>
      {jsonLd ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TourBookingClient tourIdParam={tourId} />
      </HydrationBoundary>
    </>
  );
}
