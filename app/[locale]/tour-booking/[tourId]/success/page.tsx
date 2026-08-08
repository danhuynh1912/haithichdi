import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import BookingSuccessClient from './success-client';

type PageProps = { params: Promise<{ locale: Locale; tourId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, tourId } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.bookingSuccess' });

  return createMetadata({
    locale,
    pathname: `/tour-booking/${tourId}/success`,
    title: t('title', { id: tourId }),
    description: t('description'),
  });
}

export default async function Page({ params }: PageProps) {
  const { locale, tourId } = await params;
  setRequestLocale(locale);

  return <BookingSuccessClient tourIdParam={tourId} />;
}
