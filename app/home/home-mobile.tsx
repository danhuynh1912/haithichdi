'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback } from 'react';
import { Calendar, ChevronRight, Search, Tent } from 'lucide-react';
import { locationService } from '@/lib/services/location';
import { tourService } from '@/lib/services/tour';
import { formatDateDdMm, slugify } from '@/lib/utils';
import HomeMobileSectionSkeleton from './components/home-mobile-section-skeleton';
import {
  HomeAboutJourneySection,
  HomeFeaturedRoutesSection,
} from './components/home-about-journey';
import {
  LeadersShowcaseSection,
  MomentsGallerySection,
} from '@/features/about/about-shared-sections';

const HotLocationCard = memo(function HotLocationCard({
  name,
  imageUrl,
  elevation,
  onCardClick,
}: {
  name: string;
  imageUrl: string | null;
  elevation: number;
  onCardClick: (name: string) => void;
}) {
  const src = imageUrl || '/images/tachinhu1.jpg';
  const isRemote = src.startsWith('http');
  const handleClick = useCallback(() => onCardClick(name), [onCardClick, name]);

  return (
    <button
      onClick={handleClick}
      className='relative h-44 w-40 shrink-0 overflow-hidden rounded-3xl border border-white/10 text-left'
    >
      <Image
        src={src}
        alt={name}
        fill
        className='object-cover'
        unoptimized={isRemote}
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10' />
      <div className='absolute left-3 right-3 bottom-3 flex flex-col gap-1'>
        <p className='text-sm font-semibold leading-tight line-clamp-2'>{name}</p>
        <p className='text-xs text-neutral-300'>{elevation}m</p>
      </div>
    </button>
  );
});

const HotTourFeatureCard = memo(function HotTourFeatureCard({
  tourId,
  title,
  imageUrl,
  locationName,
  startDate,
  endDate,
  slotsLeft,
  onCardClick,
}: {
  tourId: number;
  title: string;
  imageUrl: string | null;
  locationName: string;
  startDate: string | null;
  endDate: string | null;
  slotsLeft: number;
  onCardClick: (tourId: number) => void;
}) {
  const src = imageUrl || '/images/haithichdi1.jpg';
  const isRemote = src.startsWith('http');
  const handleClick = useCallback(() => onCardClick(tourId), [onCardClick, tourId]);
  const dateLabel = startDate
    ? `${formatDateDdMm(startDate)}${endDate ? ` - ${formatDateDdMm(endDate)}` : ''}`
    : 'Đang cập nhật';

  return (
    <button
      onClick={handleClick}
      className='relative w-full h-40 overflow-hidden rounded-3xl border border-white/10 text-left'
    >
      <Image
        src={src}
        alt={title}
        fill
        className='object-cover'
        unoptimized={isRemote}
      />
      <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20' />
      <div className='absolute inset-0 p-4 flex flex-col justify-between'>
        <div>
          <p className='text-[10px] uppercase tracking-[0.08em] text-red-200'>
            {locationName}
          </p>
          <h3 className='text-lg font-bold mt-1 line-clamp-2'>{title}</h3>
        </div>
        <div className='flex items-center justify-between text-xs text-neutral-200'>
          <span className='inline-flex items-center gap-1.5'>
            <Calendar size={13} className='text-red-300' />
            {dateLabel}
          </span>
          <span className='rounded-full border border-white/20 bg-black/45 px-2.5 py-1'>
            Còn {slotsLeft} chỗ
          </span>
        </div>
      </div>
    </button>
  );
});

export default function HomeMobile() {
  const router = useRouter();

  const { data: locations = [], isPending: locationsPending } = useQuery({
    queryKey: ['mobile-home-locations'],
    queryFn: locationService.getLocations,
  });

  const { data: hotTours = [], isPending: toursPending } = useQuery({
    queryKey: ['mobile-home-hot-tours'],
    queryFn: tourService.getHotTours,
  });

  const openLocation = useCallback(
    (locationName: string) => {
      router.push(`/tours?mode=location&name=${slugify(locationName)}`);
    },
    [router],
  );

  const openTour = useCallback(
    (tourId: number) => {
      router.push(`/tour-booking/${tourId}`);
    },
    [router],
  );

  return (
    <main className='relative min-h-screen overflow-hidden bg-[#0d0d0d] text-white pt-24 pb-28 text-[11px]'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_28%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(112%_84%_at_50%_-8%,rgba(208,6,0,0.14)_0%,transparent_58%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(88%_70%_at_100%_90%,rgba(208,6,0,0.08)_0%,transparent_64%)]' />
      </div>

      <div className='relative z-10 mx-auto max-w-lg px-4 flex flex-col gap-7'>
        <section>
          <div className='h-11 rounded-2xl border border-white/10 bg-white/5 px-4 flex items-center gap-2'>
            <Search size={16} className='text-neutral-500' />
            <input
              type='text'
              placeholder='Tìm kiếm tour hoặc địa điểm...'
              className='w-full bg-transparent border-none outline-none text-base md:text-sm text-white placeholder:text-neutral-500'
            />
          </div>
        </section>

        <section className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold'>Cung trekking hot</h2>
            <button
              onClick={() => router.push('/tours?mode=location')}
              className='text-xs inline-flex items-center gap-1.5 text-red-300 hover:text-red-200 transition-colors active:text-red-100'
            >
              Xem tất cả <ChevronRight size={15} />
            </button>
          </div>

          {locationsPending ? (
            <HomeMobileSectionSkeleton variant='location' count={4} />
          ) : (
            <div className='flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'>
              {locations.map((location) => (
                <HotLocationCard
                  key={location.id}
                  name={location.name}
                  elevation={location.elevation_m}
                  imageUrl={location.full_image_url}
                  onCardClick={openLocation}
                />
              ))}
              {!locations.length && (
                <p className='text-sm text-neutral-400'>Chưa có địa điểm.</p>
              )}
            </div>
          )}
        </section>

        <section className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold'>Tours sắp diễn ra</h2>
            <button
              onClick={() => router.push('/tours?mode=tour')}
              className='text-xs inline-flex items-center gap-1.5 text-red-300 hover:text-red-200 transition-colors active:text-red-100'
            >
              Xem thêm <ChevronRight size={15} />
            </button>
          </div>

          {toursPending ? (
            <HomeMobileSectionSkeleton variant='tour' count={3} />
          ) : (
            <div className='flex flex-col gap-3'>
              {hotTours.map((tour) => (
                <HotTourFeatureCard
                  key={tour.id}
                  tourId={tour.id}
                  title={tour.title}
                  imageUrl={tour.image_url}
                  locationName={tour.location.name}
                  startDate={tour.start_date}
                  endDate={tour.end_date}
                  slotsLeft={tour.slots_left}
                  onCardClick={openTour}
                />
              ))}
              {!hotTours.length && (
                <div className='rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-neutral-400 text-center'>
                  Chưa có tour nổi bật.
                </div>
              )}
            </div>
          )}
        </section>

        <button
          onClick={() => router.push('/tours')}
          className='w-full rounded-2xl bg-[#d00600] text-white text-sm font-semibold py-3.5 inline-flex items-center justify-center gap-2 hover:bg-[#ab0500] transition-colors'
        >
          <Tent size={18} />
          Khám phá tất cả tour trekking
        </button>

        <p className='text-[10px] text-neutral-500 text-center'>
          Hải Thích Đi • Trekking, Kết nối, Thiện nguyện
        </p>
      </div>

      <div className='relative z-10 mt-10'>
        <HomeAboutJourneySection />
        <LeadersShowcaseSection
          id='leaders'
          eyebrow='Đội ngũ dẫn đoàn'
          title='Leaders - Trái tim của mỗi hành trình'
          description='Không chỉ dẫn đường, leaders của Hải Thích Đi là những người giữ nhịp đoàn, truyền năng lượng và đảm bảo an toàn trên từng chặng trek.'
          helperText='Mở profile để xem thế mạnh của từng leader'
          className='bg-gradient-to-b from-[#0f0f0f] via-[#121212] to-[#171717]'
        />
        <HomeFeaturedRoutesSection />
        <MomentsGallerySection
          eyebrow='Khoảnh khắc đáng nhớ'
          title='Khoảnh khắc đáng nhớ'
          description='Giữ lại những khoảnh khắc thật nhất trên đường trek, từ bình minh trên đỉnh đến nụ cười cuối ngày.'
          className='bg-gradient-to-b from-[#101010] via-[#131313] to-[#181818]'
        />
      </div>
    </main>
  );
}
