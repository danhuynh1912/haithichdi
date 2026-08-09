'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import { Location } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  locations: Location[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  sortUpcoming: boolean;
  onToggleSort: () => void;
  className?: string;
}

function FilterSidebarBase({
  locations,
  selectedIds,
  onToggle,
  sortUpcoming,
  onToggleSort,
  className,
}: FilterSidebarProps) {
  const t = useTranslations('tours.filters');

  return (
    <aside
      className={cn(
        'w-full md:w-72 bg-elev-2/80 backdrop-blur-sm border border-line rounded-3xl p-4 md:p-6 flex flex-col gap-6 md:sticky top-28 h-fit',
        className,
      )}
    >
      <div className='space-y-3'>
        <h3 className='text-sm font-bold uppercase tracking-[0.18em] text-ink-1'>
          {t('locationHeading')}
        </h3>
        <div className='space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar'>
          {locations.map((loc) => (
            <label
              key={loc.id}
              className='flex items-center gap-3 text-sm text-ink-3 cursor-pointer hover:text-ink-1'
            >
              <Checkbox
                checked={selectedIds.includes(loc.id)}
                onCheckedChange={() => onToggle(loc.id)}
                className='cursor-pointer border-line-4 data-[state=checked]:bg-brand data-[state=checked]:border-brand'
              />
              <span className='flex-1'>{loc.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <h3 className='text-sm font-bold uppercase tracking-[0.18em] text-ink-1'>
          {t('sortHeading')}
        </h3>
        <div className='w-full rounded-2xl border border-line bg-surface px-3 py-2.5 flex items-center justify-between gap-3'>
          <span className='text-sm text-ink-2'>{t('upcoming')}</span>
          <button
            type='button'
            role='switch'
            aria-checked={sortUpcoming}
            aria-label={t('upcomingAria')}
            onClick={onToggleSort}
            className={cn(
              'tap-bg-only relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-out',
              sortUpcoming
                ? 'border-brand/70 bg-brand/80'
                : 'border-line-3 bg-surface-2',
            )}
          >
            <span
              className={cn(
                'pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-out',
                sortUpcoming ? 'translate-x-5' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}

export const FilterSidebar = memo(FilterSidebarBase);
