'use client';

import { memo } from 'react';
import { Location } from '@/app/locations/types';
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
  return (
    <aside
      className={cn(
        'w-full md:w-72 bg-neutral-900/80 border border-white/10 rounded-3xl p-4 md:p-6 flex flex-col gap-6 md:sticky top-28 h-fit',
        className,
      )}
    >
      <div className='space-y-3'>
        <h3 className='text-sm font-bold uppercase tracking-[0.18em] text-white'>
          Tours theo location
        </h3>
        <div className='space-y-2 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar'>
          {locations.map((loc) => (
            <label
              key={loc.id}
              className='flex items-center gap-3 text-sm text-neutral-300 cursor-pointer hover:text-white'
            >
              <Checkbox
                checked={selectedIds.includes(loc.id)}
                onCheckedChange={() => onToggle(loc.id)}
                className='cursor-pointer border-white/40 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600'
              />
              <span className='flex-1'>{loc.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className='space-y-3'>
        <h3 className='text-sm font-bold uppercase tracking-[0.18em] text-white'>
          Sắp xếp
        </h3>
        <div className='w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 flex items-center justify-between gap-3'>
          <span className='text-sm text-neutral-200'>Tours sắp diễn ra</span>
          <button
            type='button'
            role='switch'
            aria-checked={sortUpcoming}
            aria-label='Bật tắt bộ lọc tours sắp diễn ra'
            onClick={onToggleSort}
            className={cn(
              'tap-bg-only relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-out',
              sortUpcoming
                ? 'border-red-400/70 bg-red-600/80'
                : 'border-white/25 bg-white/10',
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
