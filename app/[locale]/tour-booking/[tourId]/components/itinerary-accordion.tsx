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

  const defaultDayNumber = sortedDays.find((day) => day.day_number === 0)?.day_number ?? sortedDays[0]?.day_number;
  const [openDayNumber, setOpenDayNumber] = useState<number | null>(defaultDayNumber ?? null);

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
          const isOpen = day.day_number === openDayNumber;
          const dayLabel = `Day ${String(day.day_number).padStart(2, '0')}`;
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
                onClick={() => setOpenDayNumber((prev) => (prev === day.day_number ? null : day.day_number))}
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
