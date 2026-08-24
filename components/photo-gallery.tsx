'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import FullscreenModalShell from '@/components/fullscreen-modal-shell';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * One picture, already resolved to a URL. Deliberately not tied to any table:
 * a tour's gallery, a route's gallery and a blog post's images are all just
 * lists of pictures, and this component should not know which it is showing.
 */
export interface GalleryPhoto {
  id: string | number;
  url: string;
  caption?: string;
  /** `#rrggbb` painted in the tile until the picture has decoded. */
  color?: string | null;
}

/** Wraps at both ends, so the arrows never dead-end. */
export function stepIndex(current: number, delta: number, total: number): number {
  if (total <= 0) return 0;
  return (current + delta + total) % total;
}

/** What the grid tiles here ask the optimiser for. */
const GRID_SIZES = '(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
const GRID_QUALITY = 82;

export function PhotoGallery({
  open,
  onClose,
  photos,
  title,
  initialIndex = null,
  thumbnail,
}: {
  open: boolean;
  onClose: () => void;
  photos: GalleryPhoto[];
  /** Names the gallery for screen readers and captions the grid header. */
  title: string;
  /** Open straight onto one picture; null opens the grid. */
  initialIndex?: number | null;
  /**
   * What the caller's own thumbnails asked the optimiser for.
   *
   * Opening a picture blurs up from the thumbnail the reader just clicked,
   * and that only costs nothing if the blurred copy resolves to the byte-identical
   * URL the browser already holds. `sizes` is measured against the viewport
   * rather than the element, so repeating the caller's string here lands on
   * the same srcset candidate however the backdrop is laid out — but only if
   * the numbers match, which is why they have to be passed in rather than
   * guessed.
   */
  thumbnail?: { sizes: string; quality?: number };
}) {
  const t = useTranslations('gallery');
  const [activeIndex, setActiveIndex] = useState<number | null>(initialIndex);

  // Which full-size pictures the browser already holds. The optimiser
  // re-encodes on a cache miss, so the first view of a photo can take seconds
  // while every later one is instant — remembering them is what keeps the
  // spinner from flashing over a picture that is already in hand.
  const [loadedUrls, setLoadedUrls] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const markSettled = useCallback((url: string) => {
    setLoadedUrls((current) => {
      if (current.has(url)) return current;
      const next = new Set(current);
      next.add(url);
      return next;
    });
  }, []);

  /**
   * Whether the reader has been through the grid in here.
   *
   * It decides which cached thumbnail the blur-up can reach for: the grid's
   * own tiles once it has been on screen, and otherwise the tile in the page
   * behind that opened this picture directly.
   */
  const [gridSeen, setGridSeen] = useState(initialIndex === null);

  // Re-opening should honour whatever the caller asked for this time, not the
  // picture that happened to be open when it was last closed.
  useEffect(() => {
    if (open) {
      setActiveIndex(initialIndex);
      setGridSeen(initialIndex === null);
    }
  }, [open, initialIndex]);

  const close = useCallback(() => {
    setActiveIndex(null);
    onClose();
  }, [onClose]);

  const step = useCallback(
    (delta: number) =>
      setActiveIndex((current) =>
        current === null ? null : stepIndex(current, delta, photos.length),
      ),
    [photos.length],
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      // Escape backs out one level at a time: picture, then grid, then closed.
      if (event.key === 'Escape') {
        if (activeIndex !== null) {
          setActiveIndex(null);
          setGridSeen(true);
        }
        else close();
        return;
      }
      if (activeIndex === null) return;
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, activeIndex, step, close]);

  // Without this the page behind keeps scrolling under the overlay on mobile.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const activePhoto = activeIndex === null ? null : photos[activeIndex];
  const activeSettled = activePhoto ? loadedUrls.has(activePhoto.url) : false;

  // Once the grid has been on screen its tiles are the cached ones; before
  // that, the only thumbnail the reader has seen is the caller's.
  const previewSizes = gridSeen ? GRID_SIZES : thumbnail?.sizes ?? GRID_SIZES;
  const previewQuality = gridSeen
    ? GRID_QUALITY
    : thumbnail?.quality ?? GRID_QUALITY;

  /**
   * The pictures either side, fetched once the current one is on screen — the
   * same URLs the arrows will ask for, so stepping is instant rather than
   * another wait on the optimiser. Deliberately not started before the current
   * picture settles: three encodes at once would only slow down the one the
   * reader is actually waiting for.
   */
  const neighbours =
    activeIndex === null || !activeSettled || photos.length < 2
      ? []
      : Array.from(
          new Set(
            [1, -1]
              .map((delta) => photos[stepIndex(activeIndex, delta, photos.length)])
              .filter((photo) => photo && photo.url !== activePhoto?.url)
              .map((photo) => photo.url),
          ),
        );

  return (
    <FullscreenModalShell
      open={open}
      onClose={close}
      closeAriaLabel={t('close')}
      containerClassName='h-full w-full'
      contentClassName='h-full w-full bg-elev-0'
      contentKey={activeIndex ?? 'grid'}
    >
      <div className='mx-auto flex h-full w-full max-w-[1400px] flex-col px-4 py-5 md:px-8 md:py-6'>
        <header className='mb-5 flex items-center gap-4 pr-12'>
          {activePhoto ? (
            <button
              type='button'
              onClick={() => {
                setActiveIndex(null);
                setGridSeen(true);
              }}
              className='inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-2 transition-colors hover:border-brand/60 hover:text-brand'
            >
              <LayoutGrid size={15} />
              {t('backToGrid')}
            </button>
          ) : (
            <h2 className='truncate text-lg font-bold text-ink-1 md:text-xl'>{title}</h2>
          )}
          <span className='ml-auto shrink-0 text-sm text-ink-4'>
            {activePhoto
              ? t('counter', { current: (activeIndex ?? 0) + 1, total: photos.length })
              : t('total', { count: photos.length })}
          </span>
        </header>

        <AnimatePresence mode='wait'>
          {activePhoto ? (
            <motion.div
              key='single'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: ANIMATION_EASE }}
              className='relative flex min-h-0 flex-1 flex-col'
            >
              <div className='relative min-h-0 flex-1 overflow-hidden'>
                {/* The thumbnail the reader just clicked, blown up. It resolves
                    to the URL the browser already holds, so it paints
                    immediately and costs no request.

                    Stays mounted underneath even after the full picture has
                    arrived. Removing it the moment the real one *starts* its
                    fade left 300ms with nothing fully opaque in between, and
                    the background showing through read as a flash.

                    Barely blurred: a heavy blur belongs to placeholders a few
                    dozen pixels wide, where it hides the pixel grid. This is a
                    real photo several hundred pixels across, and softening it
                    that much throws away detail the reader could already be
                    looking at. */}
                <Image
                  key={`preview-${activePhoto.url}`}
                  src={activePhoto.url}
                  alt=''
                  aria-hidden
                  fill
                  sizes={previewSizes}
                  quality={previewQuality}
                  className='scale-[1.02] object-contain blur-[1px]'
                />

                {activeSettled ? null : (
                  <div
                    role='status'
                    aria-label={t('loading')}
                    className='absolute inset-0 flex items-center justify-center'
                  >
                    <div className='h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent' />
                  </div>
                )}

                <Image
                  // Remounts per picture so `onLoad` fires again for the next
                  // one instead of staying settled from the previous src.
                  key={activePhoto.url}
                  src={activePhoto.url}
                  alt={activePhoto.caption || title}
                  fill
                  sizes='100vw'
                  quality={90}
                  onLoad={() => markSettled(activePhoto.url)}
                  // A picture that cannot load must still stop the spinner.
                  onError={() => markSettled(activePhoto.url)}
                  className={cn(
                    'object-contain transition-opacity duration-300',
                    activeSettled ? 'opacity-100' : 'opacity-0',
                  )}
                  priority
                />
              </div>

              {/* Off-screen, and matching the visible image's sizes/quality so
                  the browser lands on the very same optimiser URL. */}
              <div aria-hidden className='pointer-events-none absolute h-px w-px overflow-hidden opacity-0'>
                {neighbours.map((url) => (
                  <Image
                    key={url}
                    src={url}
                    alt=''
                    width={1}
                    height={1}
                    sizes='100vw'
                    quality={90}
                    onLoad={() => markSettled(url)}
                  />
                ))}
              </div>

              {photos.length > 1 && (
                <>
                  <ArrowButton side='left' label={t('previous')} onClick={() => step(-1)} />
                  <ArrowButton side='right' label={t('next')} onClick={() => step(1)} />
                </>
              )}

              {activePhoto.caption ? (
                <p className='mt-4 text-center text-sm text-ink-3'>{activePhoto.caption}</p>
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key='grid'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: ANIMATION_EASE }}
              className='min-h-0 flex-1 overflow-y-auto pb-6'
            >
              <div className='grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4'>
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    type='button'
                    onClick={() => setActiveIndex(index)}
                    aria-label={photo.caption || t('openPhoto', { index: index + 1 })}
                    // `content-visibility` lets the browser skip laying out and
                    // painting the tiles that are scrolled out of view — with
                    // 163 of them that is most of the work in a fast scroll.
                    // The intrinsic height keeps the scrollbar honest for the
                    // ones it skips; `auto` means a tile that has been on
                    // screen once is remembered at its real height.
                    style={{
                      contentVisibility: 'auto',
                      containIntrinsicSize: 'auto 220px',
                      // Falls back to the neutral tile colour for a picture
                      // that has no stored average yet.
                      backgroundColor: photo.color ?? undefined,
                    }}
                    className='group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-elev-3 transition-colors hover:border-brand/60'
                  >
                    <GridTileImage photo={photo} />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FullscreenModalShell>
  );
}

/**
 * A grid tile's picture, fading in over the tile's stored average colour.
 *
 * Its own component so that a picture arriving re-renders one tile rather
 * than the whole wall — with 163 of them, lifting this flag into the gallery
 * would turn every load into a full re-render.
 */
function GridTileImage({ photo }: { photo: GalleryPhoto }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      src={photo.url}
      alt={photo.caption || ''}
      fill
      // Same values the blur-up reads back, so the two cannot drift into
      // asking the optimiser for different URLs.
      sizes={GRID_SIZES}
      quality={GRID_QUALITY}
      // A wall this long decodes many pictures in one scroll, and decoding on
      // the main thread is what makes the grid sit still for half a second
      // while the scrollbar keeps travelling. Async hands that work to
      // another thread.
      decoding='async'
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(true)}
      className={cn(
        'object-cover transition-[opacity,transform] duration-300 group-hover:scale-105',
        loaded ? 'opacity-100' : 'opacity-0',
      )}
    />
  );
}

function ArrowButton({
  side,
  label,
  onClick,
}: {
  side: 'left' | 'right';
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={label}
      className={cn(
        'absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-3 bg-elev-0/80 text-ink-1 backdrop-blur-sm transition-colors hover:border-brand/70 hover:text-brand',
        side === 'left' ? 'left-1 md:left-3' : 'right-1 md:right-3',
      )}
    >
      {side === 'left' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
    </button>
  );
}
