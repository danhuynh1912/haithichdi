import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import TourBookingClient from './tour-booking-client';

const SERVER_API_BASE_URL = process.env.SERVER_API_BASE_URL;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tourId: string }>;
}): Promise<Metadata> {
  const { tourId: id } = await params;

  const res = await fetch(`${SERVER_API_BASE_URL}/api/tours/${id}/`, {
    next: { revalidate: 60 },
  }).catch((error) => {
    console.error('generateMetadata tour error', error);
    return null;
  });

  if (res?.ok) {
    try {
      const data = await res.json();
      const title = data?.title
        ? `Đăng ký tour ${data.title}`
        : `Đăng ký tour #${id}`;
      const description = data?.location?.name
        ? `Đăng ký tour ${data.title} - ${data.location.name} cùng Hải Thích Đi.`
        : `Đăng ký tour ${data.title || id} cùng Hải Thích Đi.`;
      const images = data?.image_url ? [data.image_url] : undefined;
      return createMetadata({
        title,
        description,
        pathname: `/tour-booking/${id}`,
        images,
      });
    } catch (error) {
      console.error('generateMetadata parse error', error);
    }
  }

  return createMetadata({
    title: `Đăng ký tour #${id}`,
    description: 'Đăng ký tour trekking cùng Hải Thích Đi.',
    pathname: `/tour-booking/${id}`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;
  return <TourBookingClient tourIdParam={tourId} />;
}
