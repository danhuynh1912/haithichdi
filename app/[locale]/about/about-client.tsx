'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { BadgeCheck, Sparkles, Users } from 'lucide-react';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { MomentsGallerySection } from '@/features/about/about-shared-sections';

export default function AboutClient() {
  return (
    <main className='bg-elev-0 text-ink-1 overflow-hidden'>
      <StorySection />
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
    <section className='relative min-h-screen flex items-center bg-gradient-to-b from-elev-1 via-elev-0 to-elev-0'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-10 left-[-10%] w-[320px] h-[320px] bg-brand/20 blur-[120px]' />
        <div className='absolute bottom-0 right-[-10%] w-[380px] h-[380px] bg-brand/15 blur-[140px]' />
        <div className='absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_var(--brand-wash-soft),transparent_45%)]' />
      </div>

      <div className='relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center'>
        <div className='space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs uppercase tracking-[0.2em] text-brand-soft'>
            <Sparkles className='w-4 h-4 text-brand-soft-2' />
            {t('eyebrow')}
          </div>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black leading-tight'>
            {t('title')}
          </h1>
          <p className='text-brand-soft/90 text-lg font-medium'>{t('lead')}</p>

          <div className='space-y-4 text-sm sm:text-base text-ink-2 leading-relaxed max-w-3xl'>
            {storyParagraphs.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: ANIMATION_EASE, delay: idx * 0.05 }}
                className={cn(idx === storyParagraphs.length - 1 && 'font-semibold text-brand-soft')}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <div className='flex flex-wrap gap-3 pt-4'>
            {pills.map((pill) => (
              <span
                key={pill}
                className='inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-xs uppercase tracking-[0.15em] text-brand-soft'
              >
                <BadgeCheck className='w-4 h-4 text-brand-soft-2' />
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className='relative'>
          <div className='absolute inset-0 -left-6 -top-6 rounded-[36px] border border-line bg-gradient-to-br from-brand/15 via-transparent to-surface' />
          <div className='relative overflow-hidden rounded-[32px] border border-line shadow-[var(--shadow-strong)]'>
            <Image
              src='/images/haithichdi1.jpg'
              alt={t('imageAlt')}
              width={1200}
              height={1400}
              className='h-full w-full object-cover'
              priority
            />
            <div className='theme-dark text-ink-1 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6'>
              <p className='text-sm text-brand-soft uppercase tracking-[0.2em] mb-1'>
                {tCommon('brand')}
              </p>
              <p className='text-xl font-semibold'>{t('quote')}</p>
            </div>
          </div>
          <motion.div
            className='absolute -left-6 -bottom-8 bg-elev-0 border border-line rounded-2xl px-4 py-3 shadow-[var(--shadow-soft)] flex items-center gap-3'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            viewport={{ once: true }}
          >
            <Users className='w-5 h-5 text-brand-soft-2' />
            <div>
              <p className='text-xs text-ink-4'>{t('statLabel')}</p>
              <p className='font-semibold text-lg'>{t('statValue')}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
