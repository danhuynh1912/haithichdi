import { Suspense } from 'react';
import { createMetadata } from '@/lib/seo';
import LocationsClient from './locations-client';

export const metadata = createMetadata({
  title: 'Các cung trekking nổi bật',
  description:
    'Khám phá các cung đường trekking nổi bật cùng Hải Thích Đi, đầy đủ thông tin địa điểm và tour sắp diễn ra.',
  pathname: '/locations',
});

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className='min-h-screen bg-black flex items-center justify-center text-white'>
          <div className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin' />
        </main>
      }
    >
      <LocationsClient />
    </Suspense>
  );
}
