'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocationsQuery } from '@/lib/services/queries';
import { Location } from '@/lib/types';
import BackgroundBlur from '@/components/background-blur';
import LocationCarousel from './components/location-carousel';
import LocationDetailModal from './components/location-detail-modal';
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
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  /**
   * The `?name` this modal has already reacted to.
   *
   * The URL is a mirror of the modal, not its source. It used to be the other
   * way round — closing only removed the query and left an effect to notice —
   * and on this page that could not work: `/locations` is prerendered, so
   * arriving straight at `/locations?name=x` leaves the router holding the
   * static `/locations` as its current URL. Pushing `/locations` to drop the
   * query then matched what the router already believed, it collapsed the
   * navigation into a no-op, and the modal had no way to close. Reaching the
   * same URL by clicking through worked, which is why this only ever showed up
   * after a reload.
   */
  const handledParam = useRef<string | null>(null);

  /** Open, close, and the back button, all from one comparison. */
  useEffect(() => {
    if (!locations.length) return;
    const nameParam = searchParams?.get('name') ?? null;
    if (nameParam === handledParam.current) return;
    handledParam.current = nameParam;

    if (!nameParam) {
      setSelectedLocation(null);
      return;
    }

    const index = locations.findIndex((loc) => slugify(loc.name) === nameParam);
    if (index === -1) return;

    setActiveIndex(index);
    setSelectedLocation(locations[index]);
  }, [locations, searchParams]);

  // Open modal & sync query param
  const openLocation = useCallback(
    (location: Location) => {
      const slug = slugify(location.name);
      handledParam.current = slug;

      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('name', slug);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });

      const index = locations.findIndex((item) => item.id === location.id);
      if (index !== -1) {
        setActiveIndex(index);
      }
      setSelectedLocation(location);
    },
    [searchParams, pathname, router, locations],
  );

  /**
   * Closing owns the modal outright and only then tidies the address bar,
   * through the History API rather than the router: this is a query parameter
   * nothing outside this component reads, and the router declines the
   * navigation on a prerendered page.
   */
  const closeLocation = useCallback(() => {
    handledParam.current = null;
    setSelectedLocation(null);

    const params = new URLSearchParams(window.location.search);
    params.delete('name');
    const query = params.toString();
    window.history.replaceState(
      null,
      '',
      query ? `${window.location.pathname}?${query}` : window.location.pathname,
    );
  }, []);

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

      <LocationDetailModal
        location={selectedLocation}
        compact={isEmbedded}
        onClose={closeLocation}
      />
    </Wrapper>
  );
}
