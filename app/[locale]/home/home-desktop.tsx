'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { MoveRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import HotTours from '@/components/hot-tours/hot-tours';
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
  const t = useTranslations('home.hero');
  const tCommon = useTranslations('common');

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
              {t('eyebrow')}
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
              {t('title')} <br />{' '}
              <span className='leading-[clamp(1rem,3vw,30px)] text-[clamp(2rem,5vw,36px)]'>
                {tCommon('tagline')}
              </span>
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
              {t('description')}
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
                {tCommon('exploreAllTours')}
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
        variant='home'
        className='bg-gradient-to-b from-[#0f0f0f] via-[#121212] to-[#171717]'
      />
      <HomeFeaturedRoutesSection />
      <MomentsGallerySection
        variant='home'
        className='bg-gradient-to-b from-[#101010] via-[#131313] to-[#181818]'
      />
    </main>
  );
}
