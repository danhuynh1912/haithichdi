'use client';

import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BackgroundBlurProps {
  imageUrl: string | null;
  /**
   * Confine the backdrop to the nearest positioned ancestor instead of the
   * viewport. Needed when the locations UI is embedded as one section of a
   * longer page — a fixed backdrop would bleed across the whole page.
   */
  scoped?: boolean;
}

export default function BackgroundBlur({ imageUrl, scoped = false }: BackgroundBlurProps) {
  const t = useTranslations('locations');

  return (
    <div
      className={cn(
        'w-full h-full overflow-hidden bg-elev-1',
        scoped ? 'absolute inset-0 z-0' : 'fixed inset-0 -z-10',
      )}
    >
      <AnimatePresence>
        {imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' ? (
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className='absolute inset-0 transform-gpu will-change-[opacity]'
          >
            {/* The crossfade owns the wrapper's opacity, so the per-theme
                strength lives on the image: the backdrop has to sit further
                back on a light canvas to keep the copy on top readable. */}
            <Image
              src={imageUrl}
              alt={t('backgroundAlt')}
              fill
              className='object-cover blur-sm scale-110 opacity-25 dark:opacity-50'
              priority
            />
          </motion.div>
        ) : (
          <motion.div
            key='default'
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-elev-4'
          />
        )}
      </AnimatePresence>
      <div className='absolute inset-0 bg-gradient-to-t from-elev-1 via-transparent to-elev-1/70 dark:from-black dark:to-black/60' />
    </div>
  );
}
