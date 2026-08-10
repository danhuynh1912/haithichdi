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
}

/** Wraps at both ends, so the arrows never dead-end. */
export function stepIndex(current: number, delta: number, total: number): number {
  if (total <= 0) return 0;
  return (current + delta + total) % total;
}

export function PhotoGallery({
  open,
  onClose,
  photos,
  title,
  initialIndex = null,
}: {
  open: boolean;
  onClose: () => void;
  photos: GalleryPhoto[];
  /** Names the gallery for screen readers and captions the grid header. */
  title: string;
  /** Open straight onto one picture; null opens the grid. */
  initialIndex?: number | null;
}) {
  const t = useTranslations('gallery');
  const [activeIndex, setActiveIndex] = useState<number | null>(initialIndex);

  // Re-opening should honour whatever the caller asked for this time, not the
  // picture that happened to be open when it was last closed.
  useEffect(() => {
    if (open) setActiveIndex(initialIndex);
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
        if (activeIndex !== null) setActiveIndex(null);
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
              onClick={() => setActiveIndex(null)}
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
              <div className='relative min-h-0 flex-1'>
                <Image
                  src={activePhoto.url}
                  alt={activePhoto.caption || title}
                  fill
                  unoptimized
                  sizes='100vw'
                  className='object-contain'
                  priority
                />
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
                    className='group relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-elev-3 transition-colors hover:border-brand/60'
                  >
                    <Image
                      src={photo.url}
                      alt={photo.caption || ''}
                      fill
                      unoptimized
                      sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                      className='object-cover transition-transform duration-300 group-hover:scale-105'
                    />
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
