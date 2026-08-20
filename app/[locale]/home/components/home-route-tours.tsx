'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useLocationsQuery } from '@/lib/services/queries';
import { type Location } from '@/lib/types';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn, slugify } from '@/lib/utils';

/** Description lines a card shows before it clamps. */
const DESCRIPTION_LINES = 3;

/**
 * Every route we run, as a grid of tour cards.
 *
 * The data is routes (`locations`), but the copy says "tour" throughout: a
 * reader shopping for a trip does not think in terms of our internal split
 * between a route and its departures.
 */
export function HomeRouteTours({ id, className }: { id?: string; className?: string }) {
  const t = useTranslations('routeTours');
  const { data: locations = [], isPending, isError } = useLocationsQuery();

  return (
    <section
      id={id}
      className={cn(
        'relative bg-gradient-to-b from-elev-5 via-elev-3 to-elev-2 border-t border-line/60 py-14 sm:py-16 lg:py-24 scroll-mt-28',
        className,
      )}
    >
      <div className='relative max-w-6xl mx-auto px-4 sm:px-8'>
        <div className='text-center'>
          <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black'>{t('title')}</h2>
          <p className='text-ink-3 mt-3 max-w-2xl mx-auto'>{t('description')}</p>
        </div>

        {isPending ? (
          <RouteToursSkeleton />
        ) : locations.length ? (
          <div className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {locations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: ANIMATION_EASE, delay: (index % 3) * 0.06 }}
              >
                <RouteTourCard location={location} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='mt-10 rounded-3xl border border-line bg-surface px-4 py-6 text-sm text-ink-4'>
            {isError ? t('loadError') : t('empty')}
          </div>
        )}
      </div>
    </section>
  );
}

function RouteTourCard({ location }: { location: Location }) {
  const t = useTranslations('routeTours');
  const nights = location.default_trek_days ?? 0;

  return (
    <Link
      // Lands on the tours list with this route already ticked, so the reader
      // sees its departures rather than a page they must filter themselves.
      href={{ pathname: '/tours', query: { location: slugify(location.name) } }}
      // A card-wide link rather than a link on the button alone: the whole card
      // already reads as one target, and `group` lets the button react to it.
      className='group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-elev-0 shadow-[var(--shadow-soft)] transition-all hover:border-brand/50 hover:shadow-[var(--shadow-medium)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
    >
      <div className='relative aspect-[4/3] overflow-hidden bg-surface-2'>
        {location.full_image_url ? (
          <Image
            src={location.full_image_url}
            alt={location.name}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            quality={82}
            className='object-cover transition-transform duration-500 group-hover:scale-[1.04]'
            // Optimised rather than served raw: the originals are multi-megapixel
            // and this grid puts fourteen of them on the home page at card size.
          />
        ) : (
          <div className='flex h-full items-center justify-center text-sm text-ink-5'>
            {t('noImage')}
          </div>
        )}

        {nights > 0 && (
          <span className='absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm'>
            <Clock className='size-3.5' />
            {t('duration', { days: nights, nights })}
          </span>
        )}
      </div>

      <div className='flex flex-1 flex-col gap-3 p-4'>
        <h3 className='text-base font-bold leading-snug'>
          {location.name}
          {location.elevation_m > 0 && (
            <span className='text-ink-3'> {location.elevation_m}m</span>
          )}
        </h3>

        <p
          className='text-sm text-ink-3'
          // Clamped rather than truncated by character count: routes have
          // descriptions of very different lengths, and the cards in a row
          // should still end at the same place.
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: DESCRIPTION_LINES,
            overflow: 'hidden',
          }}
        >
          {location.description}
        </p>

        <div className='mt-auto flex items-end justify-between gap-3 pt-1'>
          <div>
            <p className='text-[11px] uppercase tracking-wider text-ink-5'>{t('priceLabel')}</p>
            <p className='text-lg font-black text-brand'>
              {location.default_price
                ? t('price', { amount: location.default_price })
                : t('priceOnRequest')}
            </p>
          </div>
          <span className='inline-flex items-center gap-1.5 rounded-full border border-line-2 px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-brand-ink'>
            {t('viewMore')}
            <ArrowRight className='size-3.5' />
          </span>
        </div>
      </div>
    </Link>
  );
}

function RouteToursSkeleton() {
  return (
    <div className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={`route-tour-skeleton-${index}`}
          className='overflow-hidden rounded-3xl border border-line bg-elev-0'
        >
          <div className='aspect-[4/3] animate-pulse bg-surface-2' />
          <div className='flex flex-col gap-3 p-4'>
            <div className='h-4 w-2/3 animate-pulse rounded bg-surface-2' />
            <div className='h-3 w-full animate-pulse rounded bg-surface-2' />
            <div className='h-3 w-5/6 animate-pulse rounded bg-surface-2' />
            <div className='h-6 w-1/3 animate-pulse rounded bg-surface-2' />
          </div>
        </div>
      ))}
    </div>
  );
}
