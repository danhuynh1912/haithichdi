'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { ANIMATION_EASE } from '@/lib/constants';

/**
 * The head of the trail.
 *
 * The heading arrives a word at a time — slow enough to read as deliberate,
 * short enough not to keep anyone waiting — over a soft light that drifts
 * behind it. Both stop dead for a reader who has asked for reduced motion; the
 * words are then simply there.
 */
export function TrailHero({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('campaigns');
  const reduceMotion = useReducedMotion();
  const words = t('heading').split(' ');

  return (
    // `compact` is the case where a billboard fills the screen above — but
    // only on a desktop. On a phone this heading is still the top of the page
    // and needs the room to clear the fixed header.
    <section
      className={
        compact
          ? 'relative overflow-hidden px-4 pt-24 pb-6 md:px-8 md:pt-10 md:pb-10'
          : 'relative overflow-hidden px-4 pt-28 pb-10 md:px-8 md:pt-36 md:pb-16'
      }
    >
      {!reduceMotion && (
        <motion.div
          aria-hidden
          className={[
            'bg-brand/12 pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full blur-[120px]',
            // Behind the billboard on a desktop it would be invisible anyway.
            compact ? 'md:hidden' : '',
          ].join(' ')}
          animate={{ opacity: [0.55, 0.9, 0.55], scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className='relative mx-auto max-w-5xl md:text-center'>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ANIMATION_EASE }}
          className='text-brand text-[10px] font-bold tracking-[0.24em] uppercase md:text-xs md:tracking-[0.34em]'
        >
          {t('eyebrow')}
        </motion.p>

        <h1
          className={[
            'text-ink-1 mt-2 font-black tracking-tight uppercase',
            compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-6xl',
          ].join(' ')}
        >
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.12 + index * 0.09,
                ease: ANIMATION_EASE,
              }}
              className='mr-[0.25em] inline-block'
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: ANIMATION_EASE }}
          className='text-ink-3 mt-5 text-sm leading-relaxed md:mx-auto md:max-w-2xl md:text-lg'
        >
          {t('intro')}
        </motion.p>
      </div>
    </section>
  );
}
