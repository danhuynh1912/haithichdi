import { Suspense } from 'react';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import { getQueryClient } from '@/lib/get-query-client';
import { queryKeys } from '@/lib/services/query-keys';
import { getCachedLocations } from '@/lib/services/locations-cached';
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

  // Seeds the carousel's own query so it renders on the server instead of
  // shipping a spinner — that is where the page's <h1> lives.
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.locations(locale),
    queryFn: () => getCachedLocations(locale),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {/* Both branches are hidden by CSS rather than by `useIsMobile`, which
          only resolves after hydration — a phone would paint the full-height
          carousel first and then have it yanked out from under the reader.
          It also keeps the route links in the served HTML at every width. */}
      <div className='hidden md:block'>
        <Suspense
          fallback={
            <main className='min-h-screen bg-elev-1 flex items-center justify-center text-ink-1'>
              <div className='w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin' />
            </main>
          }
        >
          <LocationsClient />
        </Suspense>
      </div>
      <div className='md:hidden'>
        <AllRoutes locale={locale} />
      </div>
    </HydrationBoundary>
  );
}
