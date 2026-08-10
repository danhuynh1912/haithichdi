'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { TourItineraryDay } from '@/lib/services/tour';
import { cn, formatDateDdMm } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { MarkdownContent } from '@/components/markdown-content';

interface ItineraryAccordionProps {
  days: TourItineraryDay[];
}

export function ItineraryAccordion({ days }: ItineraryAccordionProps) {
  const t = useTranslations('booking');
  const sortedDays = useMemo(
    () => [...days].sort((left, right) => left.day_number - right.day_number),
    [days],
  );

  // A set, not a single value: reading day two rarely means you are finished
  // with day one, and comparing them meant reopening the other every time.
  // The first day starts open.
  const [openDays, setOpenDays] = useState<Set<number>>(
    () => new Set(sortedDays[0] ? [sortedDays[0].day_number] : []),
  );

  const toggleDay = (dayNumber: number) =>
    setOpenDays((previous) => {
      const next = new Set(previous);
      if (!next.delete(dayNumber)) next.add(dayNumber);
      return next;
    });

  if (sortedDays.length === 0) {
    return (
      <div className='rounded-3xl border border-line bg-well p-6 text-ink-4 text-sm'>
        {t('itineraryEmpty')}
      </div>
    );
  }

  return (
    <div className='rounded-3xl border border-line bg-well p-4 md:p-6'>
      <div className='space-y-3'>
        {sortedDays.map((day) => {
          const isOpen = openDays.has(day.day_number);
          // Labels are one behind the stored number: the first entry is the
          // travel-in day, which the trip is sold as "Day 0". `day_number`
          // itself stays 1-based — it is the sort key, and tour_detail derives
          // each date from it as start_date + (day_number - 1).
          const dayLabel = t('itineraryDayLabel', {
            number: String(Math.max(day.day_number - 1, 0)).padStart(2, '0'),
          });
          const dateLabel = day.date ? formatDateDdMm(day.date) : null;

          return (
            <article
              key={day.day_number}
              className={cn(
                'rounded-2xl border transition-colors',
                isOpen ? 'border-brand/60 bg-brand/10' : 'border-line bg-well',
              )}
            >
              <button
                type='button'
                aria-expanded={isOpen}
                onClick={() => toggleDay(day.day_number)}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 md:px-5 py-4 text-left transition-colors',
                  'active:bg-surface',
                )}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <span className='inline-flex shrink-0 items-center rounded-full border border-brand/50 bg-brand/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-soft-2'>
                    {dayLabel}
                  </span>
                  <div className='min-w-0'>
                    <p className='text-sm md:text-base font-semibold text-ink-1 truncate'>{day.title || dayLabel}</p>
                    {dateLabel && (
                      <p className='text-xs text-ink-4 mt-0.5'>
                        {t('itineraryDate', { date: dateLabel })}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={cn('shrink-0 text-ink-4 transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className='px-4 md:px-5 pb-5 border-t border-line'>
                  <div className='pt-4'>
                    <MarkdownContent
                      markdown={day.content_md || ''}
                      emptyMessage={t('itineraryDayEmpty')}
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
