'use client';

import { useMemo, useState } from 'react';
import type { TourItineraryDay } from '@/lib/services/tour';
import { cn, formatDateDdMm } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { MarkdownArticle } from './markdown-article';

interface ItineraryAccordionProps {
  days: TourItineraryDay[];
}

export function ItineraryAccordion({ days }: ItineraryAccordionProps) {
  const sortedDays = useMemo(
    () => [...days].sort((left, right) => left.day_number - right.day_number),
    [days],
  );

  const defaultDayNumber = sortedDays.find((day) => day.day_number === 0)?.day_number ?? sortedDays[0]?.day_number;
  const [openDayNumber, setOpenDayNumber] = useState<number | null>(defaultDayNumber ?? null);

  if (sortedDays.length === 0) {
    return (
      <div className='rounded-3xl border border-white/10 bg-neutral-900/60 p-6 text-neutral-400 text-sm'>
        Lịch trình đang được cập nhật.
      </div>
    );
  }

  return (
    <div className='rounded-3xl border border-white/10 bg-neutral-900/60 p-4 md:p-6'>
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
                isOpen ? 'border-[#d00600]/60 bg-[#d00600]/10' : 'border-white/10 bg-black/40',
              )}
            >
              <button
                type='button'
                onClick={() => setOpenDayNumber((prev) => (prev === day.day_number ? null : day.day_number))}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-4 md:px-5 py-4 text-left transition-colors',
                  'active:bg-white/5',
                )}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <span className='inline-flex shrink-0 items-center rounded-full border border-[#d00600]/50 bg-[#d00600]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ff6b67]'>
                    {dayLabel}
                  </span>
                  <div className='min-w-0'>
                    <p className='text-sm md:text-base font-semibold text-white truncate'>{day.title || dayLabel}</p>
                    {dateLabel && <p className='text-xs text-neutral-400 mt-0.5'>Ngày {dateLabel}</p>}
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={cn('shrink-0 text-neutral-400 transition-transform', isOpen && 'rotate-180')}
                />
              </button>

              {isOpen && (
                <div className='px-4 md:px-5 pb-5 border-t border-white/10'>
                  <div className='pt-4'>
                    <MarkdownArticle
                      markdown={day.content_md || ''}
                      emptyMessage='Nội dung ngày này đang được cập nhật.'
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
