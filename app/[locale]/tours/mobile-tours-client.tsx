'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import LocationsClient from '@/app/[locale]/locations/locations-client';
import ToursClient from './tours-client';

type MobileToursMode = 'location' | 'tour';

function resolveMode(value: string | null): MobileToursMode {
  return value === 'location' ? 'location' : 'tour';
}

export default function MobileToursClient() {
  const t = useTranslations('tours');
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
    <main className='min-h-screen bg-elev-0 text-ink-1 text-[11px] pt-24 pb-24 px-4'>
      <div className='mx-auto max-w-lg flex flex-col gap-4'>
        <div className='rounded-2xl border border-line bg-surface p-1.5 grid grid-cols-2 gap-1.5'>
          <button
            onClick={() => switchMode('location')}
            className={cn(
              'tap-bg-only rounded-xl py-2.5 text-xs font-semibold transition-colors duration-150',
              mode === 'location'
                ? 'bg-brand text-brand-ink active:bg-brand-strong'
                : 'text-ink-3 hover:bg-surface active:bg-surface-3',
            )}
          >
            {t('modeLocation')}
          </button>
          <button
            onClick={() => switchMode('tour')}
            className={cn(
              'tap-bg-only rounded-xl py-2.5 text-xs font-semibold transition-colors duration-150',
              mode === 'tour'
                ? 'bg-brand text-brand-ink active:bg-brand-strong'
                : 'text-ink-3 hover:bg-surface active:bg-surface-3',
            )}
          >
            {t('modeTour')}
          </button>
        </div>

        <div className='rounded-3xl border border-line bg-surface overflow-hidden'>
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
