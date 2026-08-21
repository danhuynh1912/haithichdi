'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useLocationsQuery } from '@/lib/services/queries';
import { Location } from '@/lib/types';
import BackgroundBlur from '@/components/background-blur';
import LocationCarousel from './components/location-carousel';
import { motion } from 'motion/react';
import { ANIMATION_EASE } from '@/lib/constants';
import { slugify } from '@/lib/utils';

/** Card the carousel opens on. Clamped below, so a shorter list still works. */
const DEFAULT_ACTIVE_INDEX = 2;

/**
 * `standalone` — the /locations route, owns the viewport.
 * `embedded`   — a tab panel inside the mobile tours screen, compact cards.
 * `section`    — one band of a longer page (the home page), full-size cards
 *                but the photo backdrop is confined to the band.
 */
type LocationsLayout = 'standalone' | 'embedded' | 'section';

export default function LocationsClient({
  layout = 'standalone',
}: {
  layout?: LocationsLayout;
}) {
  const t = useTranslations('locations');
  const isEmbedded = layout === 'embedded';
  const isSection = layout === 'section';
  const { data: locations = [], isPending: loading } = useLocationsQuery();
  const [activeIndex, setActiveIndex] = useState(DEFAULT_ACTIVE_INDEX);
  const router = useRouter();

  /**
   * A route now has its own page, so the carousel navigates instead of opening
   * a dialog over the list.
   */
  const openLocation = useCallback(
    (location: Location) => {
      const index = locations.findIndex((item) => item.id === location.id);
      if (index !== -1) setActiveIndex(index);
      router.push(`/locations/${slugify(location.name)}`);
    },
    [locations, router],
  );

  // The default index is a guess made before the list arrives; the carousel
  // indexes into `locations` unguarded, so keep it in range.
  const safeActiveIndex = Math.min(activeIndex, Math.max(locations.length - 1, 0));

  if (loading) {
    return (
      <div
        className={`${
          isSection ? 'min-h-[520px]' : 'min-h-screen'
        } bg-elev-1 flex items-center justify-center text-ink-1`}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className='w-12 h-12 border-4 border-brand border-t-transparent rounded-full'
        />
      </div>
    );
  }

  // A band of the home page is a <section>; the other layouts own their route.
  const Wrapper = isSection ? 'section' : 'main';
  // The home page already has its <h1> in the hero.
  const Heading = isSection ? motion.h2 : motion.h1;

  return (
    <Wrapper
      className={`relative w-full flex flex-col items-center justify-center overflow-hidden ${
        isEmbedded
          ? 'min-h-[calc(100dvh-15rem)] pt-4 text-[11px]'
          : isSection
            ? 'py-14 sm:py-16 lg:py-20 border-t border-line/60'
            : 'h-[calc(100vh)] pt-24'
      }`}
    >
      {/* Background with blur transition */}
      <BackgroundBlur
        imageUrl={locations[safeActiveIndex]?.full_image_url}
        scoped={isSection}
      />

      <div className='container mx-auto px-4 z-10'>
        <div className={`text-center ${isEmbedded ? 'mb-6' : 'mb-12'}`}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: ANIMATION_EASE, duration: 0.8 }}
            className='text-brand font-bold tracking-[0.14em] md:tracking-[0.3em] uppercase mb-1 text-[10px] md:text-sm'
          >
            {t('eyebrow')}
          </motion.p>
          <Heading
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ease: ANIMATION_EASE, duration: 0.8 }}
            className='text-ink-1 text-xl md:text-5xl font-black uppercase tracking-tight'
          >
            {t('title')}
          </Heading>
        </div>

        <LocationCarousel
          locations={locations}
          activeIndex={safeActiveIndex}
          compact={isEmbedded}
          onActiveChange={(index) => setActiveIndex(index)}
          onDetailsClick={openLocation}
        />
      </div>
    </Wrapper>
  );
}
