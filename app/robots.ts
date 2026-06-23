import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://haithichdi.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/my-bookings', '/tour-booking/'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
