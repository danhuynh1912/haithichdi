'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { CampaignCard } from '@/lib/services/campaign';
import { ANIMATION_EASE } from '@/lib/constants';

/**
 * The open campaign, hinted at on the home page.
 *
 * A strip rather than a section: this is the first screen, and the hero has
 * one job already. What it has to do is be noticed and be clicked — so it
 * carries a photograph, a live dot and the campaign's own name, and hands the
 * reader straight to the page rather than explaining anything here.
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
  const open = campaigns.filter((campaign) => campaign.is_open);
  if (open.length === 0) return null;

  const featured = open[0];
  const cover =
    featured.poster_url ?? featured.tours.find((tour) => tour.image_url)?.image_url ?? null;

  // With several running, the strip stops naming one and points at the page
  // that lists them all — picking a favourite would bury the others.
  const many = open.length > 1;
  const href = many ? '/thien-nguyen' : `/thien-nguyen/${featured.slug}`;
  const label = many ? t('openCount', { count: open.length }) : featured.title;

  const onMedia = variant === 'onMedia';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.75, duration: 0.8, ease: ANIMATION_EASE }}
      className={className}
    >
      <Link
        href={href}
        className={[
          'group inline-flex max-w-full items-center gap-3 rounded-full py-2 pr-4 pl-2 transition-colors',
          onMedia
            ? 'border border-white/25 bg-black/35 text-white backdrop-blur-md hover:border-white/50'
            : 'border-line bg-surface text-ink-1 hover:border-brand/60 border',
        ].join(' ')}
      >
        {cover && (
          <span className='relative size-9 shrink-0 overflow-hidden rounded-full md:size-10'>
            <Image
              src={cover}
              alt=''
              fill
              sizes='40px'
              className='object-cover transition-transform duration-500 group-hover:scale-110'
            />
          </span>
        )}

        <span className='min-w-0'>
          <span
            className={[
              'flex items-center gap-1.5 text-[10px] font-bold tracking-[0.14em] uppercase',
              onMedia ? 'text-white/80' : 'text-ink-4',
            ].join(' ')}
          >
            <span className='bg-success size-1.5 animate-pulse rounded-full' />
            {t('openHeading')}
          </span>
          <span className='block truncate text-sm font-bold md:text-base'>{label}</span>
        </span>

        <ArrowRight className='size-4 shrink-0 transition-transform group-hover:translate-x-1' />
      </Link>
    </motion.div>
  );
}
