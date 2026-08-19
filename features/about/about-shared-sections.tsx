'use client';

import { useMemo, useState } from 'react';
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

  // Two layouts rather than one measured at runtime: a JS breakpoint would
  // have to guess during SSR and re-deal the columns after hydration. The
  // browser serves each photo once regardless of how many times it is used.
  const mobileColumns = useMemo(() => toColumns(galleryImages, 2), [galleryImages]);
  const desktopColumns = useMemo(() => toColumns(galleryImages, 3), [galleryImages]);

  // Clicking a photo hands off to the same lightbox the tour pages use, so the
  // arrows, counter and Esc handling behave identically across the site.
  const [openAt, setOpenAt] = useState<number | null>(null);
  const photos = useMemo<GalleryPhoto[]>(
    () =>
      galleryImages.map(image => ({
        id: image.id,
        url: image.image_url || FALLBACK_PHOTO,
        caption: getMomentLabel(image),
      })),
    [galleryImages],
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
            // instead of making the page taller. The data attribute is the hook
            // for the :hover rule in globals.css that stops every column at
            // once — what a reader reaching for a photo expects.
            data-moments-gallery
            className='relative h-[130vh] overflow-hidden'
          >
            <MarqueeGrid
              columns={mobileColumns}
              className='grid grid-cols-2 gap-3 sm:hidden'
              onOpen={setOpenAt}
            />
            <MarqueeGrid
              columns={desktopColumns}
              className='hidden sm:grid grid-cols-3 gap-4'
              onOpen={setOpenAt}
            />
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

function MarqueeColumn({
  items,
  reverse,
  onOpen,
}: {
  items: ColumnItem[];
  reverse: boolean;
  onOpen: (index: number) => void;
}) {
  if (!items.length) return null;

  return (
    <div className='h-full overflow-hidden'>
      <div
        className={cn(
          // `moments-marquee-track` is what the frame's :hover rule pauses.
          'moments-marquee-track flex flex-col will-change-transform',
          // One animation class, never both: two `animation` declarations of
          // equal specificity resolve by stylesheet order, not class order.
          reverse
            ? 'animate-[moments-marquee-down_linear_infinite]'
            : 'animate-[moments-marquee-up_linear_infinite]',
        )}
        style={{ animationDuration: `${items.length * SECONDS_PER_PHOTO}s` }}
      >
        {/* Rendered twice: the keyframes shift by half the track, so the copy
            slides into the spot the original just left. */}
        {[0, 1].map(copy =>
          items.map((item, position) => (
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
        className='w-full h-auto object-cover transition-transform duration-500 group-hover/photo:scale-[1.03]'
        unoptimized={Boolean(image.image_url?.startsWith('http'))}
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
