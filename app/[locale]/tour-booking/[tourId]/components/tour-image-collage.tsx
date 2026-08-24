'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Images, Mountain } from 'lucide-react';
import { PhotoGallery, type GalleryPhoto } from '@/components/photo-gallery';
import { cn } from '@/lib/utils';
import type { TourImageItem } from '@/lib/services/tour';

interface TourImageCollageProps {
  title: string;
  images: TourImageItem[];
  fallbackImageUrl?: string | null;
  className?: string;
}

interface CollageSlot {
  key: string;
  src: string | null;
  alt: string;
}

/**
 * Every picture the tour has, in one flat list — the collage only ever shows
 * the first four, so this is what the gallery needs in order to show the rest.
 */
export function resolveGalleryPhotos({
  title,
  images,
  fallbackImageUrl,
}: Pick<TourImageCollageProps, 'title' | 'images' | 'fallbackImageUrl'>): GalleryPhoto[] {
  const photos: GalleryPhoto[] = images
    .filter((image): image is TourImageItem & { image_url: string } => Boolean(image.image_url))
    .map((image) => ({ id: image.id, url: image.image_url, caption: image.caption || undefined }));

  if (photos.length === 0 && fallbackImageUrl) {
    return [{ id: 'fallback', url: fallbackImageUrl, caption: title }];
  }
  return photos;
}

export function resolveCollageSlots({
  title,
  images,
  fallbackImageUrl,
}: Pick<TourImageCollageProps, 'title' | 'images' | 'fallbackImageUrl'>): CollageSlot[] {
  const urls = images.map((image) => image.image_url).filter((url): url is string => Boolean(url));

  if (urls.length === 0 && fallbackImageUrl) {
    urls.push(fallbackImageUrl);
  }

  return Array.from({ length: 4 }).map((_, index) => ({
    key: `slot-${index}`,
    src: urls[index] ?? null,
    alt: `${title} - image ${index + 1}`,
  }));
}

/** Shared with the gallery so its blur-up reuses the tile already loaded. */
const COLLAGE_SIZES = '(max-width: 1024px) 100vw, 60vw';

function CollageItem({
  slot,
  className,
  onOpen,
}: {
  slot: CollageSlot;
  className?: string;
  onOpen?: () => void;
}) {
  if (!slot.src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-elev-3 to-elev-5',
          className,
        )}
      >
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.08),transparent_60%)]' />
        <div className='absolute inset-0 flex items-center justify-center text-ink-4'>
          <Mountain size={38} />
        </div>
      </div>
    );
  }

  const Wrapper = onOpen ? 'button' : 'div';

  return (
    <Wrapper
      {...(onOpen ? { type: 'button' as const, onClick: onOpen, 'aria-label': slot.alt } : {})}
      className={cn(
        'group relative block w-full overflow-hidden rounded-2xl border border-line',
        onOpen && 'cursor-pointer transition-colors hover:border-brand/60',
        className,
      )}
    >
      <Image
        src={slot.src}
        alt={slot.alt}
        fill
        sizes={COLLAGE_SIZES}
        className={cn('object-cover', onOpen && 'transition-transform duration-500 group-hover:scale-105')}
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10' />
    </Wrapper>
  );
}

export function TourImageCollage({ title, images, fallbackImageUrl, className }: TourImageCollageProps) {
  const t = useTranslations('gallery');
  const slots = resolveCollageSlots({ title, images, fallbackImageUrl });
  const photos = resolveGalleryPhotos({ title, images, fallbackImageUrl });

  const [openAt, setOpenAt] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const openGallery = (index: number | null) => {
    setOpenAt(index);
    setOpen(true);
  };

  // A collage tile is only clickable if there is a picture behind it to open.
  const tileHandler = (slotIndex: number) =>
    photos[slotIndex] ? () => openGallery(slotIndex) : undefined;

  return (
    <section className={cn('relative w-full', className)}>
      <div className='hidden md:grid md:grid-cols-[1.6fr_1fr] gap-3'>
        <CollageItem slot={slots[0]} className='h-[410px]' onOpen={tileHandler(0)} />
        <div className='grid grid-rows-[1fr_1fr] gap-3'>
          <CollageItem slot={slots[1]} className='h-[198px]' onOpen={tileHandler(1)} />
          <div className='grid grid-cols-2 gap-3'>
            <CollageItem slot={slots[2]} className='h-[198px]' onOpen={tileHandler(2)} />
            <CollageItem slot={slots[3]} className='h-[198px]' onOpen={tileHandler(3)} />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 md:hidden'>
        {slots.map((slot, index) => (
          <CollageItem
            key={slot.key}
            slot={slot}
            className='h-[132px]'
            onOpen={tileHandler(index)}
          />
        ))}
      </div>

      {photos.length > 0 && (
        <button
          type='button'
          onClick={() => openGallery(null)}
          className='absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-line-3 bg-elev-0/85 px-4 py-2 text-sm font-semibold text-ink-1 shadow-[var(--shadow-soft)] backdrop-blur-sm transition-colors hover:border-brand/70 hover:text-brand md:bottom-4 md:right-4'
        >
          <Images size={16} />
          {t('viewAll', { count: photos.length })}
        </button>
      )}

      <PhotoGallery
        open={open}
        onClose={() => setOpen(false)}
        photos={photos}
        title={title}
        initialIndex={openAt}
        // Must stay in step with CollageItem's own Image, or opening a tile
        // blurs up from a URL the browser has to fetch rather than the one
        // already on screen.
        thumbnail={{ sizes: COLLAGE_SIZES }}
      />
    </section>
  );
}
