'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/lib/services/location';
import { Location } from '@/app/locations/types';
import { FilterSidebar } from './components/filter-sidebar';
import { TourSearchBar } from './components/tour-search-bar';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useTours } from './hooks/use-tours';
import { TourCard } from './components/tour-card';
import { MotionConfig, motion } from 'motion/react';
import { ANIMATION_EASE } from '@/lib/constants';
import { TourListItem } from './types';

export default function ToursClient({
  layout = 'standalone',
}: {
  layout?: 'standalone' | 'embedded';
}) {
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [sortUpcoming, setSortUpcoming] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const { data: locations = [], isLoading: locationsLoading } = useQuery<
    Location[]
  >({
    queryKey: ['locations'],
    queryFn: locationService.getLocations,
  });

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

  const content = useMemo(() => renderToursList(tours), [tours]);

  return (
    <main
      className={`min-h-screen bg-black text-white px-4 md:px-8 ${
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
          <TourSearchBar value={search} onChange={setSearch} />

          {toursLoading || locationsLoading ? (
            <div className='text-neutral-400 text-sm'>Đang tải tours...</div>
          ) : (
            content
          )}
        </section>
      </div>
    </main>
  );
}

function renderToursList(tours: TourListItem[]) {
  if (!tours.length) {
    return (
      <div className='text-neutral-400 text-sm bg-white/5 border border-white/10 rounded-3xl p-8 text-center'>
        Không tìm thấy tour phù hợp.
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
