'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { slugify } from '@/lib/utils';
import { useLocationsQuery } from '@/lib/services/queries';
import { FilterSidebar } from './components/filter-sidebar';
import { TourSearchBar } from './components/tour-search-bar';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useTours } from './hooks/use-tours';
import { TourCard } from './components/tour-card';
import { TourCalendar } from './components/tour-calendar';
import { MotionConfig, motion } from 'motion/react';
import { LayoutGrid, CalendarDays } from 'lucide-react';
import { ANIMATION_EASE } from '@/lib/constants';
import { TourListItem } from '@/lib/types';
import { cn } from '@/lib/utils';

type ToursView = 'list' | 'calendar';

export default function ToursClient({
  layout = 'standalone',
}: {
  layout?: 'standalone' | 'embedded';
}) {
  const t = useTranslations('tours');
  const { data: locations = [], isLoading: locationsLoading } = useLocationsQuery();

  // `?location=<slug>` arrives from the home page's tour cards, and now also
  // from the server-prefetched HTML for this exact URL (see page.tsx). Reading
  // it in the lazy useState initializer — rather than an effect — means the
  // very first render already reflects the filter, both during SSR and on the
  // client's first paint before hydration finishes. `locations` is already
  // populated at that point because the server hydrates it into the query
  // cache before this component ever mounts.
  const searchParams = useSearchParams();
  const [selectedLocations, setSelectedLocations] = useState<number[]>(() => {
    const slug = searchParams?.get('location') ?? null;
    if (!slug) return [];
    const match = locations.find((loc) => slugify(loc.name) === slug);
    return match ? [match.id] : [];
  });
  const [search, setSearch] = useState('');
  const [sortUpcoming, setSortUpcoming] = useState(true);
  const [view, setView] = useState<ToursView>('calendar');

  const debouncedSearch = useDebounce(search, 300);

  const { data: tours, isLoading: toursLoading } = useTours({
    locationIds: selectedLocations,
    search: debouncedSearch,
    sortUpcoming,
  });

  const toggleLocation = (id: number) => {
    setSelectedLocations((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const content = useMemo(
    () =>
      view === 'calendar' ? (
        <TourCalendar tours={tours} />
      ) : (
        <ToursList tours={tours} emptyMessage={t('empty')} />
      ),
    [tours, t, view],
  );

  return (
    <main
      className={`min-h-screen bg-elev-0 text-ink-1 px-4 md:px-8 ${
        layout === 'embedded' ? 'pt-4 pb-6' : 'pt-24 pb-16'
      }`}
    >
      <div className='max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6'>
        <FilterSidebar
          locations={locations}
          selectedIds={selectedLocations}
          onToggle={toggleLocation}
          sortUpcoming={sortUpcoming}
          onToggleSort={() => setSortUpcoming((v) => !v)}
        />

        <section className='flex flex-col gap-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <TourSearchBar value={search} onChange={setSearch} className='flex-1' />
            <ViewToggle value={view} onChange={setView} />
          </div>

          {toursLoading || locationsLoading ? (
            <div className='text-ink-4 text-sm'>{t('loading')}</div>
          ) : (
            content
          )}
        </section>
      </div>
    </main>
  );
}

function ToursList({
  tours,
  emptyMessage,
}: {
  tours: TourListItem[];
  emptyMessage: string;
}) {
  if (!tours.length) {
    return (
      <div className='text-ink-4 text-sm bg-surface border border-line rounded-3xl p-8 text-center'>
        {emptyMessage}
      </div>
    );
  }

  return (
    <MotionConfig transition={{ duration: 0.4, ease: ANIMATION_EASE }}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className='grid grid-cols-1 xl:grid-cols-2 gap-4'
      >
        {tours.map((tour) => (
          <motion.div key={tour.id} layout>
            <TourCard tour={tour} showImage />
          </motion.div>
        ))}
      </motion.div>
    </MotionConfig>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ToursView;
  onChange: (next: ToursView) => void;
}) {
  const t = useTranslations('tours.view');
  const options = [
    { key: 'list' as const, label: t('list'), Icon: LayoutGrid },
    { key: 'calendar' as const, label: t('calendar'), Icon: CalendarDays },
  ];

  return (
    <div
      role='tablist'
      aria-label={t('aria')}
      className='grid grid-cols-2 gap-1.5 rounded-3xl border border-line bg-surface p-1.5 sm:w-[248px]'
    >
      {options.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type='button'
            role='tab'
            aria-selected={active}
            onClick={() => onChange(key)}
            className={cn(
              'tap-bg-only flex items-center justify-center gap-2 rounded-2xl py-2.5 text-xs font-semibold transition-colors duration-150',
              active
                ? 'bg-brand text-brand-ink active:bg-brand-strong'
                : 'text-ink-3 hover:bg-surface-2 active:bg-surface-3',
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
