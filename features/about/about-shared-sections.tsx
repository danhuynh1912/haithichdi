'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type HomeMomentsGalleryImage } from '@/lib/services/home';
import { useMomentsGalleryQuery } from '@/lib/services/queries';
import { PhotoGallery, type GalleryPhoto } from '@/components/photo-gallery';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Camera, MapPin } from 'lucide-react';

const FALLBACK_PHOTO = '/images/haithichdi1.jpg';

/**
 * A photo plus where it sits in the original gallery, kept together because the
 * columns below reorder and repeat photos — the lightbox still has to open on
 * the one that was clicked.
 */
type ColumnItem = { image: HomeMomentsGalleryImage; index: number };

/**
 * Which copy set the section renders. Both variants share the same markup —
 * only the headline block differs, so the strings stay in one catalogue.
 */
type SectionVariant = 'default' | 'home';

type SectionProps = {
  id?: string;
  className?: string;
  variant?: SectionVariant;
};

/**
 * Seconds a single photo takes to travel its own height. The per-column
 * duration is scaled by item count from this, so a long column and a short one
 * drift at the same speed instead of racing to finish together.
 */
const SECONDS_PER_PHOTO = 18;

/** Photos per column before the loop can run without visible gaps. */
const MIN_PHOTOS_PER_COLUMN = 4;

/**
 * How many photos the wall actually mounts.
 *
 * The gallery holds every route photo on the site — 70 and climbing. Each is
 * rendered twice to make the loop seamless, so an uncapped wall put 140
 * full-resolution images on the home page and mobile browsers killed the tab.
 * A reader scrolling past sees a handful; the rest was weight nobody looked at.
 */
const MAX_PHOTOS = 24;

/**
 * Phones get a shorter wall than laptops. Two columns show half as much at a
 * time, and a phone has an order of magnitude less memory to spend on decoded
 * bitmaps than the machine this was designed on.
 */
const MAX_PHOTOS_MOBILE = 16;

/**
 * How far ahead of the viewport the wall mounts. Far enough that the photos
 * have arrived by the time the section scrolls into view, near enough that a
 * reader who never reaches it pays nothing.
 */
const MOUNT_MARGIN = '700px';

/** How long the cursor must sit still before the columns start moving again. */
const RESUME_AFTER_STILL_MS = 4000;

/** Fisher–Yates on a copy — the source array belongs to the query cache. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Deal the photos across `count` columns round-robin, then repeat each column
 * until it is tall enough to fill the frame — a column of one photo would
 * otherwise leave a hole for most of its cycle.
 */
function toColumns(images: HomeMomentsGalleryImage[], count: number): ColumnItem[][] {
  const columns: ColumnItem[][] = Array.from({ length: count }, () => []);
  images.forEach((image, index) => columns[index % count].push({ image, index }));

  return columns.map(column => {
    if (!column.length) return column;
    const filled = [...column];
    while (filled.length < MIN_PHOTOS_PER_COLUMN) filled.push(...column);
    return filled;
  });
}

export function MomentsGallerySection({
  id,
  className,
  variant = 'default',
}: SectionProps) {
  const t = useTranslations('moments');

  const { data, isPending, isError } = useMomentsGalleryQuery();

  const galleryImages = useMemo(() => data?.images ?? [], [data]);

  /**
   * A fresh order on every visit.
   *
   * The wall only mounts a couple of dozen of the seventy photos, so without
   * this the same handful is the whole gallery as far as any reader is
   * concerned. Shuffling in an effect rather than during render keeps it off
   * the server: a random order there would not match the one the browser
   * produces, and React would report a hydration mismatch.
   */
  const [shuffled, setShuffled] = useState<HomeMomentsGalleryImage[] | null>(null);
  useEffect(() => {
    setShuffled(galleryImages.length ? shuffle(galleryImages) : null);
  }, [galleryImages]);

  // Shuffled once and held: re-shuffling on every render would reorder the
  // wall under the reader each time anything else in here changes.
  const pool = shuffled ?? galleryImages;

  // One grid, not one per breakpoint. Mounting both and hiding one with CSS
  // still downloads and decodes every image in the hidden copy, which doubled
  // the memory cost of this section for nothing.
  const isMobile = useIsMobile();
  const columns = useMemo(
    () =>
      toColumns(
        pool.slice(0, isMobile ? MAX_PHOTOS_MOBILE : MAX_PHOTOS),
        isMobile ? 2 : 3,
      ),
    [pool, isMobile],
  );

  // Clicking a photo hands off to the same lightbox the tour pages use, so the
  // arrows, counter and Esc handling behave identically across the site.
  const [openAt, setOpenAt] = useState<number | null>(null);

  // The pause flag is written straight to the DOM node: mousemove fires on
  // every pixel, and routing that through state would re-render the whole wall
  // dozens of times a second.
  const frameRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The wall sits far below the fold. Mounting its photos on page load costs
  // every reader the decode even if they never scroll this far, so it waits
  // until the frame is within a screen of the viewport. The frame itself never
  // moves — only the tracks inside it — so an observer on it fires reliably.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || mounted) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) setMounted(true);
      },
      { rootMargin: MOUNT_MARGIN },
    );
    observer.observe(frame);
    return () => observer.disconnect();
    // `galleryImages.length` matters: the frame only exists once the photos
    // have loaded, so an effect keyed on `mounted` alone runs while the ref is
    // still null and never gets a second chance to attach.
  }, [mounted, galleryImages.length]);

  const setPaused = useCallback((paused: boolean) => {
    if (frameRef.current) frameRef.current.dataset.paused = String(paused);
  }, []);

  /** Movement stops the wall; four still seconds means the reader has moved on. */
  const handlePointerMove = useCallback(() => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), RESUME_AFTER_STILL_MS);
  }, [setPaused]);

  const handlePointerLeave = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setPaused(false);
  }, [setPaused]);

  useEffect(
    () => () => {
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    },
    [],
  );
  const photos = useMemo<GalleryPhoto[]>(
    () =>
      pool.map(image => ({
        id: image.id,
        url: image.image_url || FALLBACK_PHOTO,
        caption: getMomentLabel(image),
      })),
    // `pool`, not the raw list: a card carries its position in whichever array
    // the columns were dealt from, and the lightbox opens on that index.
    [pool],
  );

  return (
    <section
      id={id}
      className={cn(
        'relative md:min-h-screen bg-gradient-to-b from-elev-2 via-elev-3 to-elev-5 border-t border-line/60 py-14 sm:py-16 lg:py-24 scroll-mt-28',
        className,
      )}
    >
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,80,80,0.08),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(255,140,100,0.08),transparent_28%)] opacity-40' />
      <div className='relative max-w-6xl mx-auto px-4 sm:px-8 space-y-10'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.25em] text-brand-soft'>
              {t(`${variant}.eyebrow`)}
            </p>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black mt-2'>
              {t(`${variant}.title`)}
            </h2>
            <p className='text-ink-3 mt-3 max-w-2xl'>
              {t(`${variant}.description`)}
            </p>
          </div>
          <div className='inline-flex items-center gap-2 text-xs text-ink-3 bg-surface border border-line px-3 py-2 rounded-full'>
            <Camera className='w-4 h-4 text-brand-soft-2' />
            <span>{t('swipeHint')}</span>
          </div>
        </div>

        {isPending ? (
          <MomentsGalleryLoadingState />
        ) : galleryImages.length ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: ANIMATION_EASE }}
            // The frame is capped so more photos make the columns scroll longer
            // instead of making the page taller. `data-paused` is the hook for
            // the rule in globals.css that stops every column at once — what a
            // reader reaching for a photo expects.
            ref={frameRef}
            data-moments-gallery
            data-paused='false'
            onMouseMove={handlePointerMove}
            onMouseLeave={handlePointerLeave}
            className='relative h-[130vh] overflow-hidden'
          >
            {mounted && (
              <MarqueeGrid
                columns={columns}
                className={cn('grid gap-3 sm:gap-4', isMobile ? 'grid-cols-2' : 'grid-cols-3')}
                onOpen={setOpenAt}
              />
            )}
          </motion.div>
        ) : (
          <div className='rounded-3xl border border-line bg-surface px-4 py-6 text-sm text-ink-4'>
            {isError ? t('loadError') : t('empty')}
          </div>
        )}
      </div>

      <PhotoGallery
        open={openAt !== null}
        onClose={() => setOpenAt(null)}
        photos={photos}
        title={t(`${variant}.title`)}
        initialIndex={openAt}
      />
    </section>
  );
}

/**
 * One breakpoint's worth of scrolling columns. Odd columns run against the even
 * ones so the wall never reads as a single sheet sliding past.
 */
function MarqueeGrid({
  columns,
  className,
  onOpen,
}: {
  columns: ColumnItem[][];
  className: string;
  onOpen: (index: number) => void;
}) {
  return (
    <div className={cn('h-full', className)}>
      {columns.map((column, columnIndex) => (
        <MarqueeColumn
          key={columnIndex}
          items={column}
          reverse={columnIndex % 2 === 1}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

/** Ceiling on the padding a column may add, as a multiple of its own length. */
const MAX_PADDING_FACTOR = 3;

function MarqueeColumn({
  items,
  reverse,
  onOpen,
}: {
  items: ColumnItem[];
  reverse: boolean;
  onOpen: (index: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // A column whose photos are mostly landscape is far shorter than one of
  // portraits, so a fixed photo count leaves the short column with dead space
  // at the bottom until the loop carries it away. Measure instead: keep
  // repeating this column's own photos until one copy of the track is taller
  // than the frame, which is the condition for the loop to never show a gap.
  // Grown one card at a time rather than by doubling the column: doubling
  // overshoots badly — a column one card short of filling the frame would
  // mount a second full set, and every extra card is another decoded photo.
  const [extra, setExtra] = useState(0);
  useEffect(() => {
    const track = trackRef.current;
    const frame = track?.parentElement;
    if (!track || !frame) return;

    const measure = () => {
      const copyHeight = track.scrollHeight / 2;
      if (copyHeight > 0 && copyHeight < frame.clientHeight) {
        setExtra(current =>
          current < items.length * MAX_PADDING_FACTOR ? current + 1 : current,
        );
      }
    };

    // Photos arrive one by one and each one changes the height, so this has to
    // re-check as they land rather than once on mount.
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [extra, items]);

  const filled = useMemo(() => {
    const out = [...items];
    for (let i = 0; i < extra; i++) out.push(items[i % items.length]);
    return out;
  }, [items, extra]);

  if (!items.length) return null;

  return (
    <div className='h-full overflow-hidden'>
      <div
        ref={trackRef}
        className={cn(
          // `moments-marquee-track` is what the frame's :hover rule pauses.
          'moments-marquee-track flex flex-col will-change-transform',
          // One animation class, never both: two `animation` declarations of
          // equal specificity resolve by stylesheet order, not class order.
          reverse
            ? 'animate-[moments-marquee-down_linear_infinite]'
            : 'animate-[moments-marquee-up_linear_infinite]',
        )}
        style={{ animationDuration: `${filled.length * SECONDS_PER_PHOTO}s` }}
      >
        {/* Rendered twice: the keyframes shift by half the track, so the copy
            slides into the spot the original just left. */}
        {[0, 1].map(copy =>
          filled.map((item, position) => (
            <MomentCard
              key={`${copy}-${position}-${item.image.id}`}
              image={item.image}
              hidden={copy === 1}
              onOpen={() => onOpen(item.index)}
            />
          )),
        )}
      </div>
    </div>
  );
}

function MomentCard({
  image,
  hidden,
  onOpen,
}: {
  image: HomeMomentsGalleryImage;
  hidden: boolean;
  onOpen: () => void;
}) {
  const label = getMomentLabel(image);

  return (
    <button
      type='button'
      onClick={onOpen}
      // The second copy exists only to keep the loop seamless; screen readers,
      // search engines and the tab order should see each photo once.
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      aria-label={label}
      // Spacing lives on the card, not as a `gap` on the track: a gap would add
      // one extra separator between the two copies, so a 50% shift would land
      // half a gap off and the loop would visibly jump every cycle.
      className='group/photo block shrink-0 mb-3 sm:mb-4 cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-surface text-left shadow-[var(--shadow-medium)] transition-colors hover:border-brand/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
    >
      <Image
        src={image.image_url || '/images/haithichdi1.jpg'}
        alt={hidden ? '' : label}
        width={image.width || 900}
        height={image.height || 1200}
        // Eager, not lazy: lazy loading waits on an IntersectionObserver, and
        // observers fire unreliably for a subtree under a running transform —
        // photos would only start arriving once a hover stopped the animation.
        // Both copies of a photo share a URL, so this is one request each.
        loading='eager'
        decoding='async'
        sizes='(max-width: 640px) 50vw, 33vw'
        quality={82}
        className='w-full h-auto object-cover transition-transform duration-500 group-hover/photo:scale-[1.03]'
        // Optimised, unlike the rest of the site: these originals run to
        // 2731x4096, roughly 45MB of bitmap each once decoded. At a column
        // width near 180px the resized copy is a rounding error, and it is the
        // difference between this section fitting in memory and not.
      />
      <span className='hidden sm:flex p-3 text-sm text-ink-2 items-center justify-between gap-3'>
        <span className='min-w-0 truncate'>{label}</span>
        <MapPin className='w-4 h-4 shrink-0 text-brand-soft-2' />
      </span>
    </button>
  );
}

function MomentsGalleryLoadingState() {
  return (
    <div className='h-[130vh] overflow-hidden'>
      <div className='grid h-full grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4'>
        {[
          ['h-[220px]', 'h-[300px]', 'h-[260px]'],
          ['h-[300px]', 'h-[220px]', 'h-[280px]'],
          ['h-[260px]', 'h-[280px]', 'h-[240px]'],
        ].map((column, columnIndex) => (
          <div
            key={`moments-gallery-skeleton-column-${columnIndex}`}
            className={cn(
              'flex flex-col gap-3 sm:gap-4',
              columnIndex === 2 && 'hidden sm:flex',
            )}
          >
            {column.map((heightClassName, index) => (
              <div
                key={`moments-gallery-skeleton-${columnIndex}-${index}`}
                className={cn(
                  'shrink-0 rounded-2xl sm:rounded-3xl border border-line bg-surface animate-pulse',
                  heightClassName,
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Caption comes from the DB; fall back to the route the photo belongs to. */
function getMomentLabel(image: HomeMomentsGalleryImage) {
  return image.caption.trim() || image.location_name.trim();
}
