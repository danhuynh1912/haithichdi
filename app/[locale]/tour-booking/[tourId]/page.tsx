import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import TourBookingClient from './tour-booking-client';

const SERVER_API_BASE_URL = process.env.SERVER_API_BASE_URL;

type PageProps = { params: Promise<{ locale: Locale; tourId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tourId: id } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.tourBooking' });
  const pathname = `/tour-booking/${id}`;

  const res = await fetch(`${SERVER_API_BASE_URL}/api/tours/${id}/`, {
    next: { revalidate: 60 },
  }).catch((error) => {
    console.error('generateMetadata tour error', error);
    return null;
  });

  if (res?.ok) {
    try {
      const data = await res.json();
      const tour: string | undefined = data?.title;
      const location: string | undefined = data?.location?.name;

      return createMetadata({
        locale,
        pathname,
        title: tour ? t('title', { tour }) : t('titleFallback', { id }),
        description: location
          ? t('description', { tour: tour ?? id, location })
          : t('descriptionNoLocation', { tour: tour ?? id }),
        images: data?.image_url ? [data.image_url] : undefined,
      });
    } catch (error) {
      console.error('generateMetadata parse error', error);
    }
  }

  return createMetadata({
    locale,
    pathname,
    title: t('titleFallback', { id }),
    description: t('descriptionFallback'),
  });
}

export default async function Page({ params }: PageProps) {
  const { locale, tourId } = await params;
  setRequestLocale(locale);

  return <TourBookingClient tourIdParam={tourId} />;
}
