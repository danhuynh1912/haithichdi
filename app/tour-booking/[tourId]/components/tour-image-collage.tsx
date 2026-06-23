'use client';

import Image from 'next/image';
import { Mountain } from 'lucide-react';
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

function CollageItem({ slot, className }: { slot: CollageSlot; className?: string }) {
  if (!slot.src) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-neutral-700/70 to-neutral-800/70',
          className,
        )}
      >
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.08),transparent_60%)]' />
        <div className='absolute inset-0 flex items-center justify-center text-white/35'>
          <Mountain size={38} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/10', className)}>
      <Image src={slot.src} alt={slot.alt} fill sizes='(max-width: 1024px) 100vw, 60vw' className='object-cover' />
      <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10' />
    </div>
  );
}

export function TourImageCollage({ title, images, fallbackImageUrl, className }: TourImageCollageProps) {
  const slots = resolveCollageSlots({ title, images, fallbackImageUrl });

  return (
    <section className={cn('w-full', className)}>
      <div className='hidden md:grid md:grid-cols-[1.6fr_1fr] gap-3'>
        <CollageItem slot={slots[0]} className='h-[410px]' />
        <div className='grid grid-rows-[1fr_1fr] gap-3'>
          <CollageItem slot={slots[1]} className='h-[198px]' />
          <div className='grid grid-cols-2 gap-3'>
            <CollageItem slot={slots[2]} className='h-[198px]' />
            <CollageItem slot={slots[3]} className='h-[198px]' />
          </div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 md:hidden'>
        {slots.map((slot) => (
          <CollageItem key={slot.key} slot={slot} className='h-[132px]' />
        ))}
      </div>
    </section>
  );
}
