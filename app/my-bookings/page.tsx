import type { Metadata } from 'next';
import { createMetadata } from '@/lib/seo';
import MyBookingsClient from './my-bookings-client';

export const metadata: Metadata = createMetadata({
  title: 'Tours bạn đã đặt',
  description:
    'Theo dõi danh sách tour đã booking, xem trạng thái xác nhận và chi tiết từng booking.',
  pathname: '/my-bookings',
});

export default function Page() {
  return <MyBookingsClient />;
}
