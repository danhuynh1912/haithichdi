'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { TourListItem } from '@/lib/types';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { TourCard } from './tour-card';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local date → `YYYY-MM-DD`, the shape a tour's dates already arrive in. */
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * A month as a Monday-first grid, padded with nulls so every row is a full
 * week — the blanks keep each date under its weekday heading.
 */
function monthCells(year: number, month: number): (Date | null)[] {
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= days; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/** Every date a tour occupies, departure through return. */
function eachDay(tour: TourListItem): string[] {
  if (!tour.start_date || !tour.end_date) return [];
  const out: string[] = [];
  const end = new Date(`${tour.end_date}T00:00:00`);
  for (const d = new Date(`${tour.start_date}T00:00:00`); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(toISO(d));
  }
  return out;
}

export function TourCalendar({ tours }: { tours: TourListItem[] }) {
  const t = useTranslations('tours.calendar');
  const locale = useLocale();
  const todayISO = toISO(new Date());

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selected, setSelected] = useState<string | null>(null);
  // Mobile stacks the month above the day panel, and a six-row grid is most of
  // a screen — collapsing it is how a reader gets to the tours themselves. The
  // `md:` overrides below keep it open on wider screens.
  const [gridOpen, setGridOpen] = useState(true);

  // One pass over the filtered tours: the calendar never queries on its own, so
  // the location and search filters shape it exactly as they shape the list.
  const toursByDay = useMemo(() => {
    const map = new Map<string, TourListItem[]>();
    for (const tour of tours) {
      for (const day of eachDay(tour)) {
        const bucket = map.get(day);
        if (bucket) bucket.push(tour);
        else map.set(day, [tour]);
      }
    }
    return map;
  }, [tours]);

  const cells = useMemo(() => monthCells(month.getFullYear(), month.getMonth()), [month]);

  // Tours arrive after mount, so the opening month is whatever today happens to
  // be — which, filtered down to one route, is often a month with nothing in
  // it. Land on the first month that actually has departures instead. Runs once
  // per set of results, never against a month the reader paged to themselves.
  const autoJumped = useRef(false);
  useEffect(() => {
    autoJumped.current = false;
  }, [tours]);

  useEffect(() => {
    if (autoJumped.current || !tours.length) return;
    autoJumped.current = true;

    const monthKey = `${month.getFullYear()}-${pad(month.getMonth() + 1)}`;
    const hasThisMonth = [...toursByDay.keys()].some((day) => day.startsWith(monthKey));
    if (hasThisMonth) return;

    const next = tours
      .map((tour) => tour.start_date)
      .filter((date): date is string => Boolean(date) && date! >= todayISO)
      .sort()[0];
    const target = next ?? tours.map((tour) => tour.start_date).filter(Boolean).sort().pop();
    if (!target) return;

    const [year, monthNumber] = target.split('-').map(Number);
    setMonth(new Date(year, monthNumber - 1, 1));
  }, [tours, toursByDay, month, todayISO]);

  const monthLabel = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    month: 'long',
    year: 'numeric',
  }).format(month);

  const shift = (by: number) =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + by, 1));

  const goToday = () => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelected(todayISO);
  };

  // With no day picked the panel previews what is coming rather than sitting
  // empty — an empty half-screen reads as "no tours", not "pick a date".
  const upcoming = useMemo(
    () =>
      tours
        .filter((tour) => tour.start_date && tour.start_date >= todayISO)
        .slice(0, 4),
    [tours, todayISO],
  );

  const selectedTours = selected ? (toursByDay.get(selected) ?? []) : [];
  const weekdays = t.raw('weekdays') as string[];

  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)]'>
      <div className='rounded-3xl border border-line bg-elev-2/80 backdrop-blur-sm p-4 sm:p-6'>
        <div className='flex items-center justify-between gap-3'>
          {/* Narrow screens cannot fit "tháng 8 năm 2026" at display tracking,
              and it wrapped to three lines; the spacing opens up from sm. */}
          <h3 className='min-w-0 text-sm font-bold uppercase tracking-[0.06em] text-ink-1 sm:tracking-[0.18em]'>
            {monthLabel}
          </h3>
          <div className='flex items-center gap-1.5'>
            <button
              type='button'
              onClick={goToday}
              className='tap-bg-only rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink-3 transition-colors hover:border-brand/60 hover:text-brand'
            >
              {t('today')}
            </button>
            <button
              type='button'
              onClick={() => shift(-1)}
              aria-label={t('previousMonth')}
              className='tap-bg-only inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-brand/60 hover:text-brand'
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type='button'
              onClick={() => shift(1)}
              aria-label={t('nextMonth')}
              className='tap-bg-only inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-brand/60 hover:text-brand'
            >
              <ChevronRight size={16} />
            </button>
            <button
              type='button'
              onClick={() => setGridOpen((v) => !v)}
              aria-expanded={gridOpen}
              aria-controls='tours-calendar-grid'
              aria-label={gridOpen ? t('collapseCalendar') : t('expandCalendar')}
              className='tap-bg-only inline-flex size-9 items-center justify-center rounded-full border border-line text-ink-2 transition-colors hover:border-brand/60 hover:text-brand md:hidden'
            >
              <ChevronDown
                size={16}
                className={cn('transition-transform duration-200', gridOpen && 'rotate-180')}
              />
            </button>
          </div>
        </div>

        <div
          id='tours-calendar-grid'
          className={cn('mt-5 grid-cols-7 gap-1.5 sm:gap-2 md:grid', gridOpen ? 'grid' : 'hidden')}
        >
          {weekdays.map((day) => (
            <span
              key={day}
              className='pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-5'
            >
              {day}
            </span>
          ))}

          {cells.map((date, index) => {
            if (!date) return <span key={`blank-${index}`} />;

            const key = toISO(date);
            const dayTours = toursByDay.get(key) ?? [];
            const count = dayTours.length;
            const isSelected = selected === key;
            const isToday = todayISO === key;
            const isPast = key < todayISO;

            return (
              <button
                key={key}
                type='button'
                disabled={!count}
                onClick={() => setSelected((prev) => (prev === key ? null : key))}
                aria-label={t('dayAria', { date: key, count })}
                className={cn(
                  'tap-bg-only relative flex aspect-square flex-col items-center justify-center rounded-2xl border text-sm transition-all duration-200',
                  count
                    ? 'cursor-pointer border-brand-line bg-brand-tint font-bold text-brand hover:-translate-y-0.5 hover:bg-brand-tint-2 hover:shadow-[var(--shadow-soft)]'
                    : 'border-transparent text-ink-5',
                  // Past days stay legible but visibly spent, so the eye lands
                  // on what can still be booked.
                  isPast && count > 0 && 'opacity-45',
                  isSelected &&
                    'border-brand bg-brand text-brand-ink shadow-[var(--shadow-brand)] hover:bg-brand hover:text-brand-ink',
                  isToday && !isSelected && 'ring-2 ring-brand/40',
                )}
              >
                {date.getDate()}
                {count > 0 && (
                  <span
                    className={cn(
                      'mt-0.5 flex items-center gap-0.5',
                      isSelected ? 'text-brand-ink' : 'text-brand',
                    )}
                  >
                    {Array.from({ length: Math.min(count, 3) }, (_, dot) => (
                      <span
                        key={dot}
                        className={cn(
                          'block size-1 rounded-full',
                          isSelected ? 'bg-brand-ink' : 'bg-brand',
                        )}
                      />
                    ))}
                    {count > 3 && (
                      <span className='ml-0.5 text-[9px] font-bold leading-none'>
                        +{count - 3}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p
          className={cn(
            'mt-5 items-center gap-2 text-xs text-ink-4 md:flex',
            gridOpen ? 'flex' : 'hidden',
          )}
        >
          <span className='inline-block size-2.5 rounded-full bg-brand-tint-2 ring-1 ring-brand-line' />
          {t('legend')}
        </p>
      </div>

      <aside className='rounded-3xl border border-line bg-surface p-4 sm:p-6'>
        <h3 className='flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ink-1'>
          <CalendarDays size={16} className='text-brand' />
          {selected ? t('dayHeading', { date: formatDayLabel(selected, locale) }) : t('upcomingHeading')}
        </h3>

        <AnimatePresence mode='wait'>
          <motion.div
            key={selected ?? 'upcoming'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: ANIMATION_EASE }}
            className='mt-4 flex flex-col gap-3'
          >
            {(selected ? selectedTours : upcoming).map((tour) => (
              <TourCard key={tour.id} tour={tour} showImage={false} />
            ))}

            {selected && !selectedTours.length && (
              <p className='rounded-2xl border border-line bg-elev-2/60 p-4 text-sm text-ink-4'>
                {t('emptyDay')}
              </p>
            )}
            {!selected && !upcoming.length && (
              <p className='rounded-2xl border border-line bg-elev-2/60 p-4 text-sm text-ink-4'>
                {t('emptyUpcoming')}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {selected && (
          <button
            type='button'
            onClick={() => setSelected(null)}
            className='tap-bg-only mt-4 w-full rounded-2xl border border-line px-3 py-2 text-xs font-semibold text-ink-3 transition-colors hover:border-brand/60 hover:text-brand'
          >
            {t('clearDay')}
          </button>
        )}
      </aside>
    </div>
  );
}

function formatDayLabel(iso: string, locale: string) {
  const [year, month, day] = iso.split('-');
  return locale === 'en' ? `${day}/${month}/${year}` : `${day}/${month}`;
}
