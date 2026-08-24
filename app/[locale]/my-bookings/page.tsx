import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import MyBookingsClient from './my-bookings-client';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.myBookings' });

  return createMetadata({
    locale,
    pathname: '/my-bookings',
    title: t('title'),
    description: t('description'),
    // Renders whatever booking ids the visitor's own browser is holding —
    // there is nothing here for a search result to show.
    noindex: true,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MyBookingsClient />;
}
