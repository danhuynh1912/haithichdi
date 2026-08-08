import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import HomeClient from './home-client';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return createMetadata({
    locale,
    pathname: '/',
    // The root layout's `%s | Hải Thích Đi` template appends the site name.
    title: t('title'),
    description: t('description'),
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeClient />;
}
