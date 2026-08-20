'use client';

import { memo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Calendar, Users, Flame } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { TourListItem } from '@/lib/types';
import { cn, formatDateDdMm } from '@/lib/utils';

interface TourCardProps {
  tour: TourListItem;
  showImage?: boolean;
  isHotTour?: boolean;
}

function TourCardBase({ tour, showImage = true, isHotTour }: TourCardProps) {
  const t = useTranslations('common');

  return (
    <Link
      href={`/tour-booking/${tour.id}`}
      className={cn(
        'group flex gap-4 p-4 rounded-3xl border border-line/60 bg-surface hover:bg-surface-2 transition-colors',
        isHotTour && 'border-brand/30 shadow-red-500/20 shadow-lg',
      )}
    >
      {showImage && (
        <div className='relative w-24 h-24 rounded-2xl overflow-hidden bg-surface-2 shrink-0'>
          {tour.image_url ? (
            <Image
              src={tour.image_url}
              alt={tour.title}
              fill
              priority
              className='object-cover group-hover:scale-105 transition-transform duration-300'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-ink-5 text-xs'>
              {t('noImage')}
            </div>
          )}
          {isHotTour && (
            <div className='absolute top-2 right-2 bg-brand text-brand-ink text-[10px] px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-[0.15em]'>
              <Flame size={12} />
              {t('hotBadge')}
            </div>
          )}
        </div>
      )}

      <div className='flex flex-col gap-2 flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='text-lg font-bold text-ink-1 group-hover:text-brand transition-colors line-clamp-2'>
            {tour.title}
          </h3>
          {!showImage && isHotTour && (
            <span className='text-[10px] px-2 py-0.5 bg-brand/20 text-brand-soft-2 rounded-full uppercase tracking-[0.12em]'>
              {t('hotBadge')}
            </span>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-3 text-xs text-ink-4'>
          {tour.start_date && (
            <span className='flex items-center gap-1.5'>
              <Calendar size={14} className='text-brand' />
              {formatDateDdMm(tour.start_date)}
              {tour.end_date ? ` - ${formatDateDdMm(tour.end_date)}` : ''}
            </span>
          )}
          <span className='flex items-center gap-1.5'>
            <Users size={14} className='text-brand' />
            {t('slotsLeft', { count: tour.slots_left })}
          </span>
          <span className='text-[11px] uppercase tracking-[0.18em] text-brand'>
            {tour.location.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

export const TourCard = memo(TourCardBase);
