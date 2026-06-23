import AboutClient from './about-client';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
  title: 'Về chúng tôi',
  pathname: '/about',
  description:
    'Hải Thích Đi - Hành trình trekking, kết nối và thiện nguyện. Gặp đội ngũ leader và xem những khoảnh khắc đáng nhớ.',
});

export default function AboutPage() {
  return <AboutClient />;
}
