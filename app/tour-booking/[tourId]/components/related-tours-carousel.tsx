'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin } from 'lucide-react';
import type { TourListItem } from '@/app/tours/types';
import { formatDateDdMm } from '@/lib/utils';

interface RelatedToursCarouselProps {
  tours: TourListItem[];
}

function DateRange({ startDate, endDate }: { startDate: string | null; endDate: string | null }) {
  if (!startDate && !endDate) {
    return <span>Đang cập nhật lịch</span>;
  }

  if (startDate && endDate) {
    return (
      <span>
        {formatDateDdMm(startDate)} - {formatDateDdMm(endDate)}
      </span>
    );
  }

  const oneDate = startDate || endDate;
  if (!oneDate) return <span>Đang cập nhật lịch</span>;

  return <span>{formatDateDdMm(oneDate)}</span>;
}

export function RelatedToursCarousel({ tours }: RelatedToursCarouselProps) {
  const router = useRouter();

  if (tours.length === 0) {
    return (
      <div className='rounded-3xl border border-white/10 bg-neutral-900/60 p-6 text-sm text-neutral-400'>
        Chưa có tour liên quan để gợi ý.
      </div>
    );
  }

  return (
    <div className='flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
      {tours.map((tour) => (
        <article
          key={tour.id}
          className='group min-w-[84%] sm:min-w-[48%] lg:min-w-[31%] snap-start rounded-3xl border border-white/10 bg-neutral-900/60 overflow-hidden'
        >
          <div className='relative h-[180px] overflow-hidden'>
            {tour.image_url ? (
              <Image
                src={tour.image_url}
                alt={tour.title}
                fill
                sizes='(max-width: 640px) 84vw, (max-width: 1024px) 48vw, 31vw'
                className='object-cover transition-transform duration-500 group-hover:scale-105'
              />
            ) : (
              <div className='absolute inset-0 bg-neutral-800' />
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
          </div>

          <div className='p-4 flex flex-col gap-3'>
            <h3 className='text-base font-bold text-white line-clamp-2 min-h-[3rem]'>{tour.title}</h3>

            <div className='space-y-1 text-xs text-neutral-400'>
              <p className='flex items-center gap-2'>
                <MapPin size={13} className='text-[#d00600]' />
                <span className='truncate'>{tour.location.name}</span>
              </p>
              <p className='flex items-center gap-2'>
                <Calendar size={13} className='text-[#d00600]' />
                <DateRange startDate={tour.start_date} endDate={tour.end_date} />
              </p>
            </div>

            <button
              type='button'
              onClick={() => router.push(`/tour-booking/${tour.id}`)}
              className='mt-1 w-full rounded-full border border-[#d00600]/60 bg-[#d00600]/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d00600] active:bg-[#a80500]'
            >
              Đăng ký tour này
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
