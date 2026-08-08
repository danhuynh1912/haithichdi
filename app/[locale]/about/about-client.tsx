'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { BadgeCheck, Sparkles, Users } from 'lucide-react';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  LeadersShowcaseSection,
  MomentsGallerySection,
} from '@/features/about/about-shared-sections';

export default function AboutClient() {
  return (
    <main className='bg-black text-white overflow-hidden'>
      <StorySection />
      <LeadersShowcaseSection />
      <MomentsGallerySection />
    </main>
  );
}

function StorySection() {
  const t = useTranslations('about');
  const tCommon = useTranslations('common');

  const storyParagraphs = t.raw('story') as string[];
  const pills = t.raw('pills') as string[];

  return (
    <section className='relative min-h-screen flex items-center bg-gradient-to-b from-black via-[#0b0b0b] to-[#0a0a0a]'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-10 left-[-10%] w-[320px] h-[320px] bg-red-500/20 blur-[120px]' />
        <div className='absolute bottom-0 right-[-10%] w-[380px] h-[380px] bg-[#ff7b47]/20 blur-[140px]' />
        <div className='absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_rgba(255,80,80,0.08),transparent_45%)]' />
      </div>

      <div className='relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center'>
        <div className='space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-200'>
            <Sparkles className='w-4 h-4 text-red-400' />
            {t('eyebrow')}
          </div>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black leading-tight'>
            {t('title')}
          </h1>
          <p className='text-red-200/90 text-lg font-medium'>{t('lead')}</p>

          <div className='space-y-4 text-sm sm:text-base text-neutral-200 leading-relaxed max-w-3xl'>
            {storyParagraphs.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: ANIMATION_EASE, delay: idx * 0.05 }}
                className={cn(idx === storyParagraphs.length - 1 && 'font-semibold text-red-100')}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <div className='flex flex-wrap gap-3 pt-4'>
            {pills.map((pill) => (
              <span
                key={pill}
                className='inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.15em] text-red-100'
              >
                <BadgeCheck className='w-4 h-4 text-red-400' />
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className='relative'>
          <div className='absolute inset-0 -left-6 -top-6 rounded-[36px] border border-white/10 bg-gradient-to-br from-red-500/15 via-transparent to-white/5' />
          <div className='relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-red-900/30'>
            <Image
              src='/images/haithichdi1.jpg'
              alt={t('imageAlt')}
              width={1200}
              height={1400}
              className='h-full w-full object-cover'
              priority
            />
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6'>
              <p className='text-sm text-red-100 uppercase tracking-[0.2em] mb-1'>
                {tCommon('brand')}
              </p>
              <p className='text-xl font-semibold'>{t('quote')}</p>
            </div>
          </div>
          <motion.div
            className='absolute -left-6 -bottom-8 bg-black border border-white/10 rounded-2xl px-4 py-3 shadow-lg shadow-red-900/20 flex items-center gap-3'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            viewport={{ once: true }}
          >
            <Users className='w-5 h-5 text-red-400' />
            <div>
              <p className='text-xs text-neutral-400'>{t('statLabel')}</p>
              <p className='font-semibold text-lg'>{t('statValue')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
