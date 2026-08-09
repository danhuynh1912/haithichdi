import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import LocationsClient from './locations-client';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.locations' });

  return createMetadata({
    locale,
    pathname: '/locations',
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense
      fallback={
        <main className='min-h-screen bg-elev-1 flex items-center justify-center text-ink-1'>
          <div className='w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin' />
        </main>
      }
    >
      <LocationsClient />
    </Suspense>
  );
}
