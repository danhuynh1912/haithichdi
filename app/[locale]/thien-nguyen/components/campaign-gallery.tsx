'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { PhotoGallery, type GalleryPhoto } from '@/components/photo-gallery';
import { ANIMATION_EASE } from '@/lib/constants';
import type { CampaignImage } from '@/lib/services/campaign';

/** Matches the grid below, so the lightbox opens on the byte the browser has. */
const GRID_SIZES = '(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw';

/**
 * What the campaign left behind.
 *
 * The tiles arrive one after another rather than all at once — a wall of
 * photographs appearing in a single frame reads as a stock gallery, while a
 * short stagger reads as a roll of film being laid out. Clicking one hands
 * over to the site's own lightbox.
 */
export function CampaignGallery({
  images,
  title,
}: {
  images: CampaignImage[];
  title: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const photos: GalleryPhoto[] = images
    .filter((image) => image.image_url)
    .map((image) => ({
      id: image.id,
      url: image.image_url as string,
      caption: image.caption || undefined,
    }));

  if (photos.length === 0) return null;

  return (
    <>
      <ul className='mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4'>
        {photos.map((photo, index) => (
          <motion.li
            key={photo.id}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-8% 0px' }}
            transition={{
              duration: 0.55,
              // Capped so a fifty-photo gallery does not take half a minute to
              // finish arriving.
              delay: Math.min(index, 8) * 0.06,
              ease: ANIMATION_EASE,
            }}
          >
            <button
              type='button'
              onClick={() => setOpenAt(index)}
              className='group border-line/60 focus-visible:ring-brand relative block aspect-square w-full overflow-hidden rounded-2xl border focus-visible:ring-2 focus-visible:outline-none'
            >
              <Image
                src={photo.url}
                alt={photo.caption || title}
                fill
                sizes={GRID_SIZES}
                className='object-cover transition-transform duration-500 group-hover:scale-105'
              />
            </button>
          </motion.li>
        ))}
      </ul>

      <PhotoGallery
        open={openAt !== null}
        onClose={() => setOpenAt(null)}
        photos={photos}
        title={title}
        initialIndex={openAt}
        thumbnail={{ sizes: GRID_SIZES }}
      />
    </>
  );
}
