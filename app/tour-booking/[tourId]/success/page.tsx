import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import BookingSuccessClient from './success-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tourId: string }>;
}): Promise<Metadata> {
  const { tourId } = await params;

  return createMetadata({
    title: `Booking tour #${tourId} thành công`,
    description:
      'Đăng ký tour thành công. Đội ngũ Hải Thích Đi sẽ sớm liên hệ để xác nhận thông tin của bạn.',
    pathname: `/tour-booking/${tourId}/success`,
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;
  return <BookingSuccessClient tourIdParam={tourId} />;
}
