'use client';

import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import { MoveRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HotTours from '@/app/components/hotTours/hot-tours';
import { ANIMATION_EASE } from '@/lib/constants';
import {
  HomeAboutJourneySection,
  HomeFeaturedRoutesSection,
} from './components/home-about-journey';
import {
  LeadersShowcaseSection,
  MomentsGallerySection,
} from '@/features/about/about-shared-sections';

export default function HomeDesktop() {
  const router = useRouter();

  return (
    <main className='bg-[#0d0d0d] text-white'>
      <section className='relative min-h-screen overflow-hidden'>
        <video
          autoPlay
          loop
          muted
          playsInline
          preload='metadata'
          poster='/images/haithichdi1.webp'
          aria-hidden='true'
          className='absolute inset-0 h-full w-full object-cover'
        >
          <source src='/vids/haithichdi-homepage.webm' type='video/webm' />
        </video>
        <div className='relative lg:flex justify-between min-h-screen p-8 lg:pr-0'>
          <div className='z-0 absolute inset-0 bg-black/35' />
          <div className='relative lg:pl-[clamp(16px,7vw,110px)] pt-31 lg:pt-[calc(35vh)] z-1 lg:w-[60%] max-w-[900px]'>
            <motion.p
              initial={{ opacity: 0, transform: 'translateY(60px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{
                delay: 0.3,
                ease: ANIMATION_EASE,
                duration: 1,
              }}
            >
              Vietnam
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, transform: 'translateY(60px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{
                delay: 0.4,
                ease: ANIMATION_EASE,
                duration: 1,
              }}
              className='leading-[clamp(2rem,5vw,65px)] text-[clamp(2rem,5vw,82px)] font-black mt-4'
            >
              HẢI THÍCH ĐI <br /> <span className='leading-[clamp(1rem,3vw,30px)] text-[clamp(2rem,5vw,36px)]'>TREKKING - KẾT NỐI - THIỆN NGUYỆN</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, transform: 'translateY(60px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{
                delay: 0.5,
                ease: ANIMATION_EASE,
                duration: 1,
              }}
              className='text-[20px] mt-6 max-w-[550px]'
            >
              Chúng tôi không đưa bạn đi du lịch. Chúng tôi đưa bạn bước ra khỏi
              vùng an toàn, chạm đến những đỉnh núi cao nhất Việt Nam và chạm đến
              chính mình.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, transform: 'translateY(60px)' }}
              animate={{ opacity: 1, transform: 'translateY(0px)' }}
              transition={{
                delay: 0.6,
                duration: 1,
                ease: ANIMATION_EASE,
              }}
            >
              <Button
                size='xl'
                className='mt-6 text-lg has-[>svg]:px-8 has-[>svg]:py-8 shadow-lg'
                onClick={() => router.push('/tours')}
              >
                Khám phá tất cả tour trekking
                <MoveRight className='ml-2' />
              </Button>
            </motion.div>
          </div>
          <HotTours className='mt-16 max-w-[500px] w-[500px]' />
          <div className='pointer-events-none absolute h-[420px] bottom-0 left-0 right-0 bg-gradient-to-b from-black/0 to-[#111111]' />
        </div>
      </section>

      <HomeAboutJourneySection />
      <LeadersShowcaseSection
        id='leaders'
        eyebrow='Đội ngũ dẫn đoàn'
        title='Leaders - Trái tim của mỗi hành trình'
        description='Không chỉ dẫn đường, leaders của Hải Thích Đi là những người giữ nhịp đoàn, truyền năng lượng và đảm bảo an toàn trên từng chặng trek.'
        helperText='Mở profile để xem thế mạnh của từng leader'
        className='bg-gradient-to-b from-[#0f0f0f] via-[#121212] to-[#171717]'
      />
      <HomeFeaturedRoutesSection />
      <MomentsGallerySection
        eyebrow='Khoảnh khắc đáng nhớ'
        title='Khoảnh khắc đáng nhớ'
        description='Giữ lại những khoảnh khắc thật nhất trên đường trek, từ bình minh trên đỉnh đến nụ cười cuối ngày.'
        className='bg-gradient-to-b from-[#101010] via-[#131313] to-[#181818]'
      />
    </main>
  );
}
