import sharp from 'sharp';
import type { Locale } from '@/i18n/routing';
import { campaignService } from '@/lib/services/campaign';
import { SITE_URL } from '@/lib/seo';

/**
 * The share card for the charity page itself.
 *
 * Shows whatever is being raised for right now rather than a fixed picture:
 * this link gets posted when a campaign opens, and the preview should be that
 * campaign. Falls back to the site card between seasons.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const runtime = 'nodejs';
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const campaigns = await campaignService.getCampaigns(locale).catch(() => []);
  const featured = campaigns.find((campaign) => campaign.is_open) ?? campaigns[0];

  const source =
    featured?.poster_url ??
    featured?.tours.find((tour) => tour.image_url)?.image_url ??
    new URL('/images/og-default.jpg', SITE_URL).toString();

  const response = await fetch(source);
  if (!response.ok) throw new Error(`Share image source: ${response.status}`);

  const body = await sharp(Buffer.from(await response.arrayBuffer()))
    .resize(size.width, size.height, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(body), {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
