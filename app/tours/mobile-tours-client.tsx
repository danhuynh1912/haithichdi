'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import LocationsClient from '@/app/locations/locations-client';
import ToursClient from './tours-client';

type MobileToursMode = 'location' | 'tour';

function resolveMode(value: string | null): MobileToursMode {
  return value === 'location' ? 'location' : 'tour';
}

export default function MobileToursClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const mode = useMemo(
    () => resolveMode(searchParams?.get('mode') || null),
    [searchParams],
  );

  const switchMode = (nextMode: MobileToursMode) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('mode', nextMode);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <main className='min-h-screen bg-black text-white text-[11px] pt-24 pb-24 px-4'>
      <div className='mx-auto max-w-lg flex flex-col gap-4'>
        <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 grid grid-cols-2 gap-1.5'>
          <button
            onClick={() => switchMode('location')}
            className={cn(
              'tap-bg-only rounded-xl py-2.5 text-xs font-semibold transition-colors duration-150',
              mode === 'location'
                ? 'bg-[#d00600] text-white active:bg-[#a90500]'
                : 'text-neutral-300 hover:bg-white/5 active:bg-white/12',
            )}
          >
            Tìm theo cung
          </button>
          <button
            onClick={() => switchMode('tour')}
            className={cn(
              'tap-bg-only rounded-xl py-2.5 text-xs font-semibold transition-colors duration-150',
              mode === 'tour'
                ? 'bg-[#d00600] text-white active:bg-[#a90500]'
                : 'text-neutral-300 hover:bg-white/5 active:bg-white/12',
            )}
          >
            Tìm theo tour
          </button>
        </div>

        <div className='rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden'>
          {mode === 'location' ? (
            <LocationsClient layout='embedded' />
          ) : (
            <ToursClient layout='embedded' />
          )}
        </div>
      </div>
    </main>
  );
}
