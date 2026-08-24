'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LinkSpinner } from '@/components/link-spinner';
import type { TourListItem } from '@/lib/types';
import { cn, formatDateDdMm } from '@/lib/utils';

interface RelatedToursCarouselProps {
  tours: TourListItem[];
}

function DateRange({ startDate, endDate }: { startDate: string | null; endDate: string | null }) {
  const t = useTranslations('booking');

  if (!startDate && !endDate) {
    return <span>{t('relatedDateTbd')}</span>;
  }

  if (startDate && endDate) {
    return (
      <span>
        {formatDateDdMm(startDate)} - {formatDateDdMm(endDate)}
      </span>
    );
  }

  const oneDate = startDate || endDate;
  if (!oneDate) return <span>{t('relatedDateTbd')}</span>;

  return <span>{formatDateDdMm(oneDate)}</span>;
}

export function RelatedToursCarousel({ tours }: RelatedToursCarouselProps) {
  const t = useTranslations('booking');

  const trackRef = useRef<HTMLDivElement>(null);
  // Both true until measured, which keeps the arrows hidden on the first paint
  // rather than flashing them on a track that turns out not to scroll.
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);

  const syncEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setAtStart(scrollLeft <= 1);
    // A pixel of slack: fractional widths mean the end is rarely exact.
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  }, []);

  // Re-measured on resize too — a breakpoint change alters both the card width
  // and how many fit, so which arrows apply changes with it.
  useEffect(() => {
    syncEdges();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(syncEdges);
    observer.observe(track);
    return () => observer.disconnect();
  }, [syncEdges, tours.length]);

  const scrollByCard = useCallback((direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gap = 16;
    const step = card ? card.offsetWidth + gap : track.clientWidth;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  }, []);

  if (tours.length === 0) {
    return (
      <div className='rounded-3xl border border-line bg-well p-6 text-sm text-ink-4'>
        {t('relatedEmpty')}
      </div>
    );
  }

  return (
    <div className='relative'>
      {atStart ? null : (
        <ScrollArrow side='left' label={t('relatedPrev')} onClick={() => scrollByCard(-1)} />
      )}
      {atEnd ? null : (
        <ScrollArrow side='right' label={t('relatedNext')} onClick={() => scrollByCard(1)} />
      )}

      <div
        ref={trackRef}
        onScroll={syncEdges}
        className='flex gap-4 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
      >
      {tours.map((tour) => (
        <article
          key={tour.id}
          className='group w-[78vw] max-w-[300px] shrink-0 snap-start rounded-3xl border border-line bg-well overflow-hidden sm:w-[300px]'
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
              <div className='absolute inset-0 bg-elev-4' />
            )}
            <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
          </div>

          <div className='p-4 flex flex-col gap-3'>
            <h3 className='text-base font-bold text-ink-1 line-clamp-2 min-h-[3rem]'>{tour.title}</h3>

            <div className='space-y-1 text-xs text-ink-4'>
              <p className='flex items-center gap-2'>
                <MapPin size={13} className='text-brand' />
                <span className='truncate'>{tour.location.name}</span>
              </p>
              <p className='flex items-center gap-2'>
                <Calendar size={13} className='text-brand' />
                <DateRange startDate={tour.start_date} endDate={tour.end_date} />
              </p>
            </div>

            {/* A link, not a button with a router.push: this is how a
                crawler reaches the tour, and it is what lets the spinner
                report the wait. */}
            <Link
              href={`/tour-booking/${tour.id}`}
              className='mt-1 flex w-full items-center justify-center gap-2 rounded-full border border-brand/60 bg-brand/10 px-4 py-2.5 text-sm font-semibold text-ink-1 transition-colors hover:bg-brand hover:text-brand-ink active:bg-brand-strong'
            >
              {t('relatedCta')}
              <LinkSpinner size={15} />
            </Link>
          </div>
        </article>
      ))}
      </div>
    </div>
  );
}

/**
 * Nudges the track by one card. Reads the first card's real width rather than
 * assuming one, so the step stays right when the breakpoint changes it.
 */
function ScrollArrow({
  side,
  label,
  onClick,
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      // Touch devices swipe; the arrows are for pointers that cannot.
      className={cn(
        'absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center',
        'rounded-full border border-line-3 bg-elev-0/90 text-ink-1 shadow-[var(--shadow-soft)]',
        'backdrop-blur-sm transition-colors hover:border-brand/70 hover:text-brand md:flex',
        side === 'left' ? '-left-3' : '-right-3',
      )}
    >
      {side === 'left' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );
}
