import type { NextConfig } from 'next';

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
].filter((pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern));

const nextConfig: NextConfig = {
  images: {
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

export default nextConfig;
