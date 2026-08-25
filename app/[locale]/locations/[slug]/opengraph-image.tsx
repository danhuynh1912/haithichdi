import sharp from 'sharp';
import type { Locale } from '@/i18n/routing';
import { locationService } from '@/lib/services/location';
import { slugify } from '@/lib/utils';
import { SITE_URL } from '@/lib/seo';

/**
 * A landscape share card for a route.
 *
 * Facebook and Messenger only render the wide preview — the one with room for
 * a description under the title — when the image is roughly 1.91:1. Seven of
 * the twelve route photos are portrait, shot on a phone up a mountain, so
 * those links collapsed to the compact card: picture, title, domain, and the
 * description dropped even though the page has always sent one.
 *
 * Cropping here rather than asking for better photos: the originals are what
 * the route pages want, and a share card is a different shape by nature.
 *
 * No text drawn over it on purpose. The card already shows the title and the
 * description as real text, and rendering Vietnamese into an image means
 * shipping a font that covers the diacritics — a tofu box in place of "Nhìu Cồ
 * San" would be worse than the photo alone.
 */

export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';
export const runtime = 'nodejs';
// The photo behind a route changes about as often as the route does.
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;

  const locations = await locationService.getLocations(locale).catch(() => []);
  const location = locations.find((row) => slugify(row.name) === slug);

  // Falls back to the site-wide card, which is already the right shape.
  const source =
    location?.full_image_url ?? new URL('/images/og-default.jpg', SITE_URL).toString();

  const response = await fetch(source);
  if (!response.ok) throw new Error(`Share image source: ${response.status}`);

  const body = await sharp(Buffer.from(await response.arrayBuffer()))
    // Centre, not sharp's `attention`: on these photos attention chases the
    // busiest texture and picked the tree canopy over the person standing
    // under it. The subject of a trek photo is reliably somewhere near the
    // middle, so the plain crop keeps more of them.
    //
    // Nothing is written back — the original on S3 is untouched, and the page
    // itself still shows it in full. This crop exists only in the response to
    // whoever asked for the share card.
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
