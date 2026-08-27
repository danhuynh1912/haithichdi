import sharp from 'sharp';
import type { Locale } from '@/i18n/routing';
import { campaignService } from '@/lib/services/campaign';
import { SITE_URL } from '@/lib/seo';

/**
 * A landscape share card for one campaign.
 *
 * Same reasoning as the route pages': Facebook and Messenger only render the
 * wide preview — the one with room for the description under the title — when
 * the image is roughly 1.91:1, and a poster uploaded from a phone is as likely
 * to be portrait as not. A campaign link is going to be shared far more than
 * anything else on this site, since sharing it is the whole point, so the
 * shape of that card matters more here than anywhere.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const runtime = 'nodejs';
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const campaign = await campaignService.getCampaign(locale, slug).catch(() => null);

  // The poster if there is one, else the cover of a trek it is raising for,
  // else the site's own card — which is already the right shape.
  const source =
    campaign?.poster_url ??
    campaign?.tours.find((tour) => tour.image_url)?.image_url ??
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
