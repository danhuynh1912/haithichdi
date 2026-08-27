import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
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

  // The carousel that used to own this screen lives on in the home page's
  // routes band and in the mobile tours tab; here it was the only thing on the
  // page, and it showed three routes at a time behind a spinner.
  return <AllRoutes locale={locale} />;
}
