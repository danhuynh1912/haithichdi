import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { breadcrumbJsonLd, createMetadata } from '@/lib/seo';
import { JsonLd } from '@/components/json-ld';
import { campaignService } from '@/lib/services/campaign';
import { CampaignDetailView } from '../components/campaign-detail-view';

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

// A campaign closes on a date nobody redeploys for.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const [campaign, t] = await Promise.all([
    campaignService.getCampaign(locale, slug).catch(() => null),
    getTranslations({ locale, namespace: 'metadata.campaigns' }),
  ]);

  if (!campaign) {
    return createMetadata({
      locale,
      pathname: `/thien-nguyen/${slug}`,
      title: t('title'),
      description: t('description'),
    });
  }

  return createMetadata({
    locale,
    pathname: `/thien-nguyen/${campaign.slug}`,
    title: campaign.title,
    // The summary is written for the page; a campaign without one falls back
    // to the section's own description rather than shipping an empty card.
    description: campaign.summary || t('description'),
    // Cropped by `opengraph-image.tsx` beside this file — see there.
    images: null,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const campaign = await campaignService.getCampaign(locale, slug);
  if (!campaign) notFound();

  const tNav = await getTranslations({ locale, namespace: 'nav' });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav('home'), pathname: '/' },
          { name: tNav('campaigns'), pathname: '/thien-nguyen' },
          { name: campaign.title },
        ])}
      />
      <CampaignDetailView campaign={campaign} />
    </>
  );
}
