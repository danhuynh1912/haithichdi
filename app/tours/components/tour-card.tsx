'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Calendar, Users, Flame } from 'lucide-react';
import { TourListItem } from '../types';
import { formatDateDdMm } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface TourCardProps {
  tour: TourListItem;
  showImage?: boolean;
  isHotTour?: boolean;
}

function TourCardBase({ tour, showImage = true, isHotTour }: TourCardProps) {
  return (
    <Link
      href={`/tour-booking/${tour.id}`}
      className={cn(
        'group flex gap-4 p-4 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors',
        isHotTour && 'border-red-500/30 shadow-red-500/20 shadow-lg',
      )}
    >
      {showImage && (
        <div className='relative w-24 h-24 rounded-2xl overflow-hidden bg-neutral-800 shrink-0'>
          {tour.image_url ? (
            <Image
              src={tour.image_url}
              alt={tour.title}
              fill
              unoptimized
              priority
              className='object-cover group-hover:scale-105 transition-transform duration-300'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-neutral-500 text-xs'>
              No Image
            </div>
          )}
          {isHotTour && (
            <div className='absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 uppercase tracking-[0.15em]'>
              <Flame size={12} />
              Hot
            </div>
          )}
        </div>
      )}

      <div className='flex flex-col gap-2 flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2'>
          <h3 className='text-lg font-bold text-white group-hover:text-red-500 transition-colors line-clamp-2'>
            {tour.title}
          </h3>
          {!showImage && isHotTour && (
            <span className='text-[10px] px-2 py-0.5 bg-red-600/20 text-red-400 rounded-full uppercase tracking-[0.12em]'>
              Hot
            </span>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-3 text-xs text-neutral-400'>
          {tour.start_date && (
            <span className='flex items-center gap-1.5'>
              <Calendar size={14} className='text-red-600' />
              {formatDateDdMm(tour.start_date)}
              {tour.end_date ? ` - ${formatDateDdMm(tour.end_date)}` : ''}
            </span>
          )}
          <span className='flex items-center gap-1.5'>
            <Users size={14} className='text-red-600' />
            Còn {tour.slots_left} chỗ
          </span>
          <span className='text-[11px] uppercase tracking-[0.18em] text-red-500'>
            {tour.location.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

export const TourCard = memo(TourCardBase);
