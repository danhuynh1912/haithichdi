'use client';

import Image from 'next/image';
import { Calendar, Star, MoveRight } from 'lucide-react';
import { motion } from 'motion/react';
import React, { forwardRef, memo, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatDateDdMm } from '@/lib/utils';

export type HotTourData = {
  id: number;
  title: string;
  start_date: string | null;
  end_date: string | null;
  image_url: string | null;
  location: {
    id: number;
    name: string;
    elevation_m: number;
  } | null;
  slots_left: number;
  booked_count: number;
};

type HotTourProps = React.ComponentPropsWithoutRef<'div'> & {
  tour: HotTourData;
};

const formatDateRange = (startDate: string | null, endDate: string | null) => {
  if (startDate && endDate) {
    return `${formatDateDdMm(startDate)} – ${formatDateDdMm(endDate)}`;
  }
  if (startDate) return formatDateDdMm(startDate);
  if (endDate) return formatDateDdMm(endDate);
  return 'TBD';
};

const HotTourBase = forwardRef<HTMLDivElement, HotTourProps>(
  ({ className, tour, ...props }, ref) => {
    const router = useRouter();
    const imageUrl = tour.image_url ?? '/images/tachinhu1.jpg';
    const isRemoteImage = imageUrl.startsWith('http');
    const dateRange = useMemo(
      () => formatDateRange(tour.start_date, tour.end_date),
      [tour.start_date, tour.end_date],
    );
    return (
      <div
        ref={ref}
        className={`bg-white flex gap-4 rounded-2xl text-black p-6 shadow-lg ${
          className ?? ''
        }`}
        {...props}
      >
        <div className='relative aspect-square min-w-28'>
          <Image
            className='object-cover rounded-xl'
            src={imageUrl}
            alt={tour.title}
            fill
            priority
            unoptimized={isRemoteImage}
            referrerPolicy='no-referrer'
          />
        </div>

        <div className='flex flex-col gap-1 pt-2'>
          <h1 className='text-xl font-bold leading-tight'>{tour.title}</h1>

          {/* <p className='text-sm text-gray-600'>{locationName}</p> */}

          <div className='flex gap-1 items-center text-sm text-gray-500'>
            <Calendar size={14} />
            <p>{dateRange}</p>
          </div>

          <div className='flex gap-1'>
            <Button
              variant='outline'
              onClick={() => router.push(`/tour-booking/${tour.id}`)}
            >
              Chi tiết <MoveRight />
            </Button>
            <Button variant='outline'>
              <Star />
            </Button>
          </div>
        </div>
      </div>
    );
  },
);

HotTourBase.displayName = 'HotTour';

const HotTour = memo(HotTourBase, (prev, next) => {
  return (
    prev.tour.id === next.tour.id &&
    prev.tour.start_date === next.tour.start_date &&
    prev.tour.end_date === next.tour.end_date &&
    prev.tour.slots_left === next.tour.slots_left &&
    prev.tour.title === next.tour.title &&
    prev.tour.image_url === next.tour.image_url
  );
});

export const MotionHotTour = motion(HotTour);
export default HotTour;
