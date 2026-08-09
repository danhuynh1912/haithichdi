import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import { tourService } from '@/lib/services/tour';
import TourBookingClient from './tour-booking-client';

type PageProps = { params: Promise<{ locale: Locale; tourId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tourId: id } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.tourBooking' });
  const pathname = `/tour-booking/${id}`;

  // Reads the same RPC the page itself does. This used to call a Django
  // endpoint through SERVER_API_BASE_URL, which stopped existing with the move
  // to Supabase and was never set again — so every tour had been quietly
  // serving the generic fallback title and the site's default share image.
  const tourId = Number(id);
  const tour = Number.isFinite(tourId)
    ? await tourService.getTourDetail(tourId, locale).catch(() => null)
    : null;

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

  return <TourBookingClient tourIdParam={tourId} />;
}
