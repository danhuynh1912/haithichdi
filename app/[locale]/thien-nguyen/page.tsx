import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { createMetadata } from '@/lib/seo';
import { campaignService } from '@/lib/services/campaign';
import { CampaignBillboard } from './components/campaign-billboard';
import { CampaignTrail, QuietSeasonHero } from './components/campaign-trail';
import { TrailHero } from './components/trail-hero';

type PageProps = { params: Promise<{ locale: Locale }> };

// A campaign opens and closes on a date nobody redeploys for, so the page has
// to be able to change its mind without a build.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.campaigns' });

  return createMetadata({
    locale,
    pathname: '/thien-nguyen',
    title: t('title'),
    description: t('description'),
    // `opengraph-image.tsx` beside this file crops the current campaign's
    // poster to the shape Facebook needs; naming an image here would override
    // it with the uncropped original.
    images: null,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Fetched here rather than in the client component below it: this is the
  // page's whole content, and it has to be in the served HTML.
  const campaigns = await campaignService.getCampaigns(locale).catch(() => []);

  const open = campaigns.filter((campaign) => campaign.is_open);

  return (
    <main className='bg-elev-0 flex min-h-screen flex-col'>
      {/* Source order is the phone's order: the page says what it is, then
          shows what is running. A desktop puts the billboard first instead —
          it fills the screen, and a title above it would be a title nobody
          scrolls past. Hence `order`, rather than rendering the heading twice
          and giving the page two <h1>s. */}
      <TrailHero compact={open.length > 0} />
      {open.length > 0 && (
        <div className='md:order-first'>
          <CampaignBillboard campaigns={open} />
        </div>
      )}
      {open.length === 0 && <QuietSeasonHero />}
      <CampaignTrail campaigns={campaigns} />
    </main>
  );
}
