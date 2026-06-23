'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { locationService } from '@/lib/services/location';
import { Location } from './types';
import BackgroundBlur from './components/background-blur';
import LocationCarousel from './components/location-carousel';
import LocationDetailModal from './components/location-detail-modal';
import { motion } from 'motion/react';
import { ANIMATION_EASE } from '@/lib/constants';
import { slugify } from '@/lib/utils';

export default function LocationsClient({
  layout = 'standalone',
}: {
  layout?: 'standalone' | 'embedded';
}) {
  const isEmbedded = layout === 'embedded';
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const paramName = searchParams?.get('name');

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationService.getLocations();
        setLocations(data);
      } catch (error) {
        console.error('Error fetching locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (!paramName && !!selectedLocation) {
      setSelectedLocation(null);
    }
  }, [paramName, selectedLocation]);

  // Open modal & sync query param
  const openLocation = useCallback(
    (location: Location) => {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('name', slugify(location.name));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      const index = locations.findIndex((item) => item.id === location.id);
      if (index !== -1) {
        setActiveIndex(index);
      }
      setSelectedLocation(location);
    },
    [searchParams, pathname, router, locations],
  );

  // Close modal & remove query param
  const closeLocation = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.delete('name');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  // Auto-open modal from query param on load/reload
  useEffect(() => {
    if (!locations.length) return;
    const nameParam = searchParams?.get('name');
    if (!nameParam) return;

    const index = locations.findIndex((loc) => slugify(loc.name) === nameParam);

    if (index !== -1) {
      setActiveIndex(index);
      if (!selectedLocation || selectedLocation.id !== locations[index].id) {
        setSelectedLocation(locations[index]);
      }
    }
  }, [locations, searchParams, selectedLocation]);

  if (loading) {
    return (
      <div className='min-h-screen bg-black flex items-center justify-center text-white'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full'
        />
      </div>
    );
  }

  return (
    <main
      className={`relative w-full flex flex-col items-center justify-center overflow-hidden ${
        isEmbedded
          ? 'min-h-[calc(100dvh-15rem)] pt-4 text-[11px]'
          : 'h-[calc(100vh)] pt-24'
      }`}
    >
      {/* Background with blur transition */}
      <BackgroundBlur imageUrl={locations[activeIndex]?.full_image_url} />

      <div className='container mx-auto px-4 z-10'>
        <div className={`text-center ${isEmbedded ? 'mb-6' : 'mb-12'}`}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: ANIMATION_EASE, duration: 0.8 }}
            className='text-red-600 font-bold tracking-[0.14em] md:tracking-[0.3em] uppercase mb-1 text-[10px] md:text-sm'
          >
            Hải Thích đi
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: ANIMATION_EASE, duration: 0.8 }}
            className='text-white text-xl md:text-5xl font-black uppercase tracking-tight'
          >
            CÁC CUNG NỔI BẬT
          </motion.h1>
        </div>

        <LocationCarousel
          locations={locations}
          activeIndex={activeIndex}
          compact={isEmbedded}
          onActiveChange={(index) => setActiveIndex(index)}
          onDetailsClick={openLocation}
        />
      </div>

      <LocationDetailModal
        location={selectedLocation}
        compact={isEmbedded}
        onClose={closeLocation}
      />
    </main>
  );
}
