import HomeClient from './home-client';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Trang chủ | Hải Thích Đi',
  pathname: '/',
  description:
    'Hải Thích Đi - Chuyên tour trekking khám phá thiên nhiên Việt Nam. Trải nghiệm hành trình kết nối và thiện nguyện cùng chúng tôi.',
});

export default function Page() {
  return <HomeClient />;
}
