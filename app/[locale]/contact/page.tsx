import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.contact' });

  return createMetadata({
    locale,
    pathname: '/contact',
    title: t('title'),
    description: t('description'),
  });
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // TODO: build the contact page — the header/footer currently link to
  // `/#site-footer` instead of here.
  return <div>danh</div>;
}
