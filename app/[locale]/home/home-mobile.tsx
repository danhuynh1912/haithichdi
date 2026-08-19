'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';
import { Calendar, ChevronRight, Search, Tent } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useHotToursQuery, useLocationsQuery } from '@/lib/services/queries';
import { formatDateDdMm, slugify } from '@/lib/utils';
import HomeMobileSectionSkeleton from './components/home-mobile-section-skeleton';
import { HomeAboutJourneySection } from './components/home-about-journey';
import LocationsSection from '@/app/[locale]/locations/locations-client';
import { MomentsGallerySection } from '@/features/about/about-shared-sections';
import { HomeRouteTours } from './components/home-route-tours';

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
      className='relative h-44 w-40 shrink-0 overflow-hidden rounded-3xl border border-line text-left'
    >
      <Image
        src={src}
        alt={name}
        fill
        className='object-cover'
        unoptimized={isRemote}
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10' />
      <div className='theme-dark text-ink-1 absolute left-3 right-3 bottom-3 flex flex-col gap-1'>
        <p className='text-sm font-semibold leading-tight line-clamp-2'>{name}</p>
        <p className='text-xs text-ink-3'>{elevation}m</p>
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
  const tCommon = useTranslations('common');
  const src = imageUrl || '/images/haithichdi1.jpg';
  const isRemote = src.startsWith('http');
  const handleClick = useCallback(() => onCardClick(tourId), [onCardClick, tourId]);
  const dateLabel = startDate
    ? `${formatDateDdMm(startDate)}${endDate ? ` - ${formatDateDdMm(endDate)}` : ''}`
    : tCommon('updating');

  return (
    <button
      onClick={handleClick}
      className='relative w-full h-40 overflow-hidden rounded-3xl border border-line text-left'
    >
      <Image
        src={src}
        alt={title}
        fill
        className='object-cover'
        unoptimized={isRemote}
      />
      <div className='absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20' />
      <div className='theme-dark text-ink-1 absolute inset-0 p-4 flex flex-col justify-between'>
        <div>
          <p className='text-[10px] uppercase tracking-[0.08em] text-brand-soft'>
            {locationName}
          </p>
          <h3 className='text-lg font-bold mt-1 line-clamp-2'>{title}</h3>
        </div>
        <div className='flex items-center justify-between text-xs text-ink-2'>
          <span className='inline-flex items-center gap-1.5'>
            <Calendar size={13} className='text-brand-soft-2' />
            {dateLabel}
          </span>
          <span className='rounded-full border border-line-3 bg-black/45 px-2.5 py-1'>
            {tCommon('slotsLeft', { count: slotsLeft })}
          </span>
        </div>
      </div>
    </button>
  );
});

export default function HomeMobile() {
  const router = useRouter();
  const t = useTranslations('home.mobile');
  const tCommon = useTranslations('common');

  const { data: locations = [], isPending: locationsPending } = useLocationsQuery();
  const { data: hotTours = [], isPending: toursPending } = useHotToursQuery();

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
    <main className='relative min-h-screen overflow-hidden bg-elev-1 text-ink-1 pt-24 pb-28 text-[11px]'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute inset-0 bg-[linear-gradient(180deg,var(--sheen)_0%,transparent_28%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(112%_84%_at_50%_-8%,var(--brand-glow)_0%,transparent_58%)]' />
        <div className='absolute inset-0 bg-[radial-gradient(88%_70%_at_100%_90%,var(--brand-wash-soft)_0%,transparent_64%)]' />
      </div>

      <div className='relative z-10 mx-auto max-w-lg px-4 flex flex-col gap-7'>
        <section>
          <div className='h-11 rounded-2xl border border-line bg-surface px-4 flex items-center gap-2'>
            <Search size={16} className='text-ink-5' />
            <input
              type='text'
              placeholder={t('searchPlaceholder')}
              className='w-full bg-transparent border-none outline-none text-base md:text-sm text-ink-1 placeholder:text-ink-5'
            />
          </div>
        </section>

        <section className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold'>{t('hotLocationsHeading')}</h2>
            <button
              onClick={() => router.push('/tours?mode=location')}
              className='text-xs inline-flex items-center gap-1.5 text-brand-soft-2 hover:text-brand-soft transition-colors active:text-brand-soft'
            >
              {tCommon('seeAll')} <ChevronRight size={15} />
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
                <p className='text-sm text-ink-4'>{t('emptyLocations')}</p>
              )}
            </div>
          )}
        </section>

        <section className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <h2 className='text-xl font-bold'>{t('upcomingToursHeading')}</h2>
            <button
              onClick={() => router.push('/tours?mode=tour')}
              className='text-xs inline-flex items-center gap-1.5 text-brand-soft-2 hover:text-brand-soft transition-colors active:text-brand-soft'
            >
              {tCommon('seeMore')} <ChevronRight size={15} />
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
                <div className='rounded-2xl border border-line bg-surface px-4 py-6 text-sm text-ink-4 text-center'>
                  {t('emptyTours')}
                </div>
              )}
            </div>
          )}
        </section>

        <button
          onClick={() => router.push('/tours')}
          className='w-full rounded-2xl bg-brand text-brand-ink text-sm font-semibold py-3.5 inline-flex items-center justify-center gap-2 hover:bg-brand-strong transition-colors'
        >
          <Tent size={18} />
          {tCommon('exploreAllTours')}
        </button>

        <p className='text-[10px] text-ink-5 text-center'>
          {t('footerNote')}
        </p>
      </div>

      <div className='relative z-10 mt-10'>
        <HomeAboutJourneySection />
        <LocationsSection layout='section' />
        <HomeRouteTours />
        <MomentsGallerySection
          variant='home'
          className='bg-gradient-to-b from-elev-2 via-elev-3 to-elev-4'
        />
      </div>
    </main>
  );
}
