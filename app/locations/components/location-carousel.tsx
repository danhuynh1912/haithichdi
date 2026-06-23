'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Location } from '../types';
import LocationCard from './location-card';
import { motion } from 'motion/react';
import { useMediaQuery } from '@/hooks/use-media-query';

interface LocationCarouselProps {
  locations: Location[];
  activeIndex?: number;
  compact?: boolean;
  onActiveChange: (index: number) => void;
  onDetailsClick: (location: Location) => void;
}

export default function LocationCarousel({
  locations,
  activeIndex: activeIndexProp,
  compact = false,
  onActiveChange,
  onDetailsClick,
}: LocationCarouselProps) {
  const [internalActiveIndex, setInternalActiveIndex] = useState(0);
  const is2xl = useMediaQuery('(min-width: 1536px)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const activeIndex =
    typeof activeIndexProp === 'number' ? activeIndexProp : internalActiveIndex;

  const updateActive = (index: number) => {
    if (typeof activeIndexProp !== 'number') {
      setInternalActiveIndex(index);
    }
    onActiveChange(index);
  };

  const handleNext = () => {
    const nextIndex = (activeIndex + 1) % locations.length;
    updateActive(nextIndex);
  };

  const handlePrev = () => {
    const nextIndex = (activeIndex - 1 + locations.length) % locations.length;
    updateActive(nextIndex);
  };

  const setIndex = (index: number) => {
    updateActive(index);
  };

  const handleCardClick = (location: Location, index: number) => {
    if (isMobile && index === activeIndex) {
      onDetailsClick(location);
      return;
    }
    setIndex(index);
  };

  if (!locations.length) return null;

  return (
    <>
      <div
        className={`relative w-full flex flex-col items-center justify-center overflow-visible ${
          compact ? 'min-h-[340px]' : 'min-h-[500px]'
        }`}
      >
        {/* Carousel Container with Perspective */}
        <div
          className={`relative w-full flex items-center justify-center ${
            compact ? 'h-[280px]' : 'h-[calc(100vh-400px)]'
          }`}
          style={{ perspective: '1200px' }}
        >
          {locations.map((location, index) => (
            <LocationCard
              key={location.id}
              location={location}
              index={index}
              activeIndex={activeIndex}
              is2xl={is2xl}
              compact={compact}
              cardTapOpensDetails={isMobile}
              onClick={() => handleCardClick(location, index)}
              onDetailsClick={onDetailsClick}
            />
          ))}
        </div>
      </div>
      <div className='flex flex-col justify-center items-center'>
        {/* Navigation Controls */}
        <div
          className={`flex items-center ${compact ? 'mt-3 gap-3' : 'mt-8 gap-8'}`}
        >
          <button
            onClick={handlePrev}
            className={`cursor-pointer rounded-full border border-white/40 bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 text-white/90 ${
              compact ? 'w-8 h-8' : 'w-9 h-9 md:w-14 md:h-14'
            }`}
          >
            <ChevronLeft size={compact ? 16 : 24} />
          </button>

          <div className='flex flex-col items-center'>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='text-center'
            >
              <h2
                className={`font-black text-white uppercase mb-1 ${
                  compact ? 'text-xl tracking-tight' : 'text-4xl tracking-wider'
                }`}
              >
                {locations[activeIndex].name}
              </h2>
              <p
                className={`text-red-500 font-medium ${
                  compact ? 'text-[10px] tracking-[0.12em]' : 'tracking-widest'
                }`}
              >
                {locations[activeIndex].elevation_m}M ABOVE SEA LEVEL
              </p>
            </motion.div>
          </div>

          <button
            onClick={handleNext}
            className={`cursor-pointer rounded-full border border-white/40 bg-white/5 flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 text-white/90 ${
              compact ? 'w-8 h-8' : 'w-9 h-9 md:w-14 md:h-14'
            }`}
          >
            <ChevronRight size={compact ? 16 : 24} />
          </button>
        </div>

        {/* Indicators */}
        <div className={`flex gap-2 ${compact ? 'mt-3' : 'mt-4'}`}>
          {locations.map((_, index) => (
            <div
              key={index}
              onClick={() => setIndex(index)}
              className={`h-1 transition-all duration-300 rounded-full cursor-pointer ${
                index === activeIndex
                  ? compact
                    ? 'w-6 bg-red-600'
                    : 'w-8 bg-red-600'
                  : compact
                    ? 'w-3 bg-white/20'
                    : 'w-4 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
}
