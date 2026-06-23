'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { memo, useMemo } from 'react';
import { Location } from '../types';
import { ANIMATION_EASE } from '@/lib/constants';

interface LocationCardProps {
  location: Location;
  index: number;
  activeIndex: number;
  is2xl: boolean;
  compact?: boolean;
  cardTapOpensDetails?: boolean;
  onClick: () => void;
  onDetailsClick: (location: Location) => void;
}

function LocationCardBase({
  location,
  index,
  activeIndex,
  is2xl,
  compact = false,
  cardTapOpensDetails = false,
  onClick,
  onDetailsClick,
}: LocationCardProps) {
  const diff = index - activeIndex;
  const isCenter = diff === 0;

  const { translateX, scale, rotateY, zIndex, opacity } = useMemo(() => {
    const getScale = () => {
      if (isCenter) return 1.0;
      return 1 + Math.min(Math.abs(diff) * 0.25, 0.75);
    };

    const getRotateY = () => {
      if (isCenter) return 0;
      return diff < 0 ? 35 : -35;
    };

    const getTranslateX = () => {
      const multiplier = is2xl ? 260 : 200;
      return diff * multiplier;
    };

    const getZIndex = () => 100 - Math.abs(diff);

    const getOpacity = () => (Math.abs(diff) > 2 ? 0 : 1);

    return {
      scale: getScale(),
      rotateY: getRotateY(),
      translateX: getTranslateX(),
      zIndex: getZIndex(),
      opacity: getOpacity(),
    };
  }, [diff, isCenter, is2xl]);

  return (
    <motion.div
      whileHover={isCenter ? 'hover' : undefined}
      initial='initial'
      animate={{
        x: translateX,
        scale,
        rotateY,
        zIndex,
        opacity: isCenter ? 1 : opacity,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      onClick={onClick}
      className='absolute cursor-pointer perspective-1000'
      style={{ transformStyle: 'preserve-3d' }}
    >
      <motion.div
        layoutId={`location-card-${location.id}`}
        transition={{
          duration: 0.4,
          ease: ANIMATION_EASE,
        }}
        className={`relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] border border-[#d1d1d1] group transform-gpu bg-neutral-900 flex ${
          compact
            ? 'w-[170px] h-[260px] rounded-[40px]'
            : 'w-[250px] h-[400px] 2xl:w-[300px] 2xl:h-[450px] rounded-[60px]'
        }`}
      >
        {/* Left Side (Image Area) - Synchronized with Modal structure but without intermediate layoutId */}
        <div
          className='relative h-full overflow-hidden shrink-0'
          style={{ width: '100%' }}
        >
          <motion.div
            layoutId={`location-image-${location.id}`}
            className='absolute inset-0'
            layout
          >
            {location.full_image_url &&
            typeof location.full_image_url === 'string' &&
            location.full_image_url.trim() !== '' ? (
              <Image
                src={location.full_image_url}
                alt={location.name}
                fill
                unoptimized
                priority
                className='object-cover transition-transform duration-500 group-hover:scale-110'
              />
            ) : (
              <div className='w-full h-full bg-neutral-800 flex items-center justify-center'>
                <span className='text-neutral-500'>No Image</span>
              </div>
            )}
          </motion.div>
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]' />
        </div>

        {/* Right Side (Content Area Placeholder for Parity) */}
        <div className='w-0 h-full overflow-hidden invisible' />

        {/* Floating Overlay Content - Labels no longer use layoutId to stop production flicker */}
        <div
          className={`absolute inset-0 z-10 flex flex-col justify-end pointer-events-none ${
            compact ? 'p-4' : 'p-8'
          }`}
        >
          <div className='pointer-events-auto'>
            <p className={`text-red-500 font-bold mb-1 ${compact ? 'text-[10px]' : ''}`}>
              #{String(index + 1).padStart(2, '0')}
            </p>
            <h3
              className={`font-black uppercase tracking-tight text-white ${
                compact ? 'text-xl' : 'text-3xl'
              }`}
            >
              {location.name}
            </h3>

            <motion.div
              variants={{
                initial: { opacity: 0, height: 0, marginTop: 0 },
                hover: { opacity: 1, height: 'auto', marginTop: 16 },
              }}
              transition={{ ease: ANIMATION_EASE, duration: 0.5 }}
              className='overflow-hidden'
            >
              <p className={`text-neutral-300 line-clamp-2 ${compact ? 'text-[11px]' : 'text-sm'}`}>
                {location.description}
              </p>

              {isCenter && !cardTapOpensDetails && (
                <div className='mt-1'>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetailsClick(location);
                    }}
                    className={`w-full cursor-pointer bg-white text-black font-extrabold rounded-full text-xs uppercase hover:bg-red-600 hover:text-white transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95 ${
                      compact
                        ? 'py-2.5 tracking-[0.08em]'
                        : 'py-4 tracking-[0.2em]'
                    }`}
                  >
                    Chi tiết
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export const LocationCard = memo(LocationCardBase, (prev, next) => {
  return (
    prev.location.id === next.location.id &&
    prev.index === next.index &&
    prev.activeIndex === next.activeIndex &&
    prev.is2xl === next.is2xl &&
    prev.cardTapOpensDetails === next.cardTapOpensDetails
  );
});

export default LocationCard;
