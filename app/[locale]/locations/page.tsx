import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { getCachedLocations } from '@/lib/services/locations-cached';
import { createMetadata } from '@/lib/seo';
import LocationsClient from './locations-client';
import AllRoutes from './all-routes';

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

  // Without this the carousel renders its spinner on the server and the page
  // ships with no <h1> and no route names at all — the same list the section
  // below links to, but invisible in the served HTML. The home page already
  // seeds this query the same way.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.locations(locale),
    queryFn: () => getCachedLocations(locale),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense
        fallback={
          <main className='min-h-screen bg-elev-1 flex items-center justify-center text-ink-1'>
            <div className='w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin' />
          </main>
        }
      >
        <LocationsClient />
      </Suspense>
      <AllRoutes locale={locale} />
    </HydrationBoundary>
  );
}
