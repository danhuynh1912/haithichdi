'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { CampaignCard } from '@/lib/services/campaign';
import { ANIMATION_EASE } from '@/lib/constants';

/** Long enough to read a title, short enough to see a second one go by. */
const ROTATE_MS = 4000;

/**
 * The open campaigns, hinted at on the home page.
 *
 * A strip rather than a section: the first screen has one job already, and
 * what this has to do is be noticed and be clicked. It always names a
 * campaign — "4 chiến dịch đang kêu gọi" is a category, and nobody clicks a
 * category — taking turns through them so none is buried.
 *
 * `onMedia` is the hero's case, where this sits over video and has to bring
 * its own contrast; on the page background it can use the ordinary tokens.
 */
export function HomeCampaignHint({
  campaigns,
  variant = 'onPage',
  className = '',
}: {
  campaigns: CampaignCard[];
  variant?: 'onMedia' | 'onPage';
  className?: string;
}) {
  const t = useTranslations('campaigns');
  const reduceMotion = useReducedMotion();
  const open = campaigns.filter((campaign) => campaign.is_open);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = open.length;

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [count, paused, reduceMotion]);

  // A campaign closing while the page is open would leave the index past the
  // end of the list.
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  if (count === 0) return null;

  const campaign = open[index] ?? open[0];
  const cover =
    campaign.poster_url ?? campaign.tours.find((tour) => tour.image_url)?.image_url ?? null;
  const onMedia = variant === 'onMedia';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.8, ease: ANIMATION_EASE }}
      className={className}
    >
      <Link
        href={`/thien-nguyen/${campaign.slug}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        className={[
          'group inline-flex max-w-full items-center gap-3 rounded-full py-2 pr-4 pl-2 transition-colors',
          onMedia
            ? 'border border-white/25 bg-black/35 text-white backdrop-blur-md hover:border-white/50'
            : 'border-line bg-surface text-ink-1 hover:border-brand/60 border',
        ].join(' ')}
      >
        <span className='relative size-9 shrink-0 overflow-hidden rounded-full md:size-10'>
          <AnimatePresence mode='sync'>
            {cover && (
              <motion.span
                key={campaign.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className='absolute inset-0'
              >
                <Image
                  src={cover}
                  alt=''
                  fill
                  sizes='40px'
                  className='object-cover transition-transform duration-500 group-hover:scale-110'
                />
              </motion.span>
            )}
          </AnimatePresence>
        </span>

        {/* Fixed width, not fit-to-content: the titles are different lengths,
            and a pill that resizes itself every four seconds beside the hero's
            call to action reads as a glitch. */}
        <span className='block w-[11.5rem] md:w-[15rem]'>
          <span
            className={[
              'block text-[10px] font-bold tracking-[0.14em] uppercase',
              onMedia ? 'text-white/80' : 'text-ink-4',
            ].join(' ')}
          >
            {t('hintLabel')}
          </span>

          <span className='relative block h-6 overflow-hidden md:h-7'>
            <AnimatePresence mode='wait'>
              <motion.span
                key={campaign.id}
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduceMotion ? 0 : -12 }}
                transition={{ duration: 0.4, ease: ANIMATION_EASE }}
                className='absolute inset-x-0 top-0 truncate text-sm font-bold md:text-base'
              >
                {campaign.title}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>

        <ArrowRight className='size-4 shrink-0 transition-transform group-hover:translate-x-1' />
      </Link>
    </motion.div>
  );
}
