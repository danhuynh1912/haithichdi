import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

type RemotePattern = NonNullable<
  NonNullable<NextConfig['images']>['remotePatterns']
>[number];

function parseRemotePattern(urlValue: string | undefined): RemotePattern | null {
  if (!urlValue) return null;

  try {
    const url = new URL(urlValue);
    const protocol = url.protocol.replace(':', '');

    if (protocol !== 'http' && protocol !== 'https') {
      return null;
    }

    return {
      protocol,
      hostname: url.hostname,
      port: url.port || undefined,
    };
  } catch {
    return null;
  }
}

const envRemotePatterns = [
  parseRemotePattern(process.env.NEXT_PUBLIC_API_BASE_URL),
  parseRemotePattern(process.env.NEXT_PUBLIC_MEDIA_BASE_URL),
  parseRemotePattern(process.env.NEXT_PUBLIC_CDN_BASE_URL),
].filter((pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern));

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP behind it: AVIF lands 20–30% smaller than WebP at the
    // same quality, and browsers that cannot read it fall through.
    formats: ['image/avif', 'image/webp'],
    // Next 16 only serves qualities listed here. 82 is the house default for
    // photography — at the sizes these are displayed it is indistinguishable
    // from the original by eye, while 75 can show banding in skies and haze.
    // 90 is kept for the lightbox, where a photo is examined full-screen.
    qualities: [75, 82, 90],
    // The optimiser re-encodes on a miss, and the default TTL is 60 seconds —
    // on a gallery this size that means re-encoding the same photos all day.
    // The source objects are content-addressed by upload timestamp, so a long
    // TTL is safe: a replaced photo arrives under a new key.
    minimumCacheTTL: 60 * 60 * 24 * 31,
    // Photo walls are dense thumbnails; without these the smallest candidate
    // Next will pick for a 170px column is 640px wide.
    imageSizes: [16, 32, 48, 64, 96, 128, 180, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'scontent.fhan20-1.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      ...envRemotePatterns,
    ],
  },
};

export default withNextIntl(nextConfig);
