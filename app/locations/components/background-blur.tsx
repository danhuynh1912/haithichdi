'use client';

import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { ANIMATION_EASE } from '@/lib/constants';

interface BackgroundBlurProps {
  imageUrl: string | null;
}

export default function BackgroundBlur({ imageUrl }: BackgroundBlurProps) {
  return (
    <div className='fixed inset-0 -z-10 w-full h-full overflow-hidden bg-black'>
      <AnimatePresence>
        {imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' ? (
          <motion.div
            key={imageUrl}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className='absolute inset-0 transform-gpu will-change-[opacity]'
          >
            <Image
              src={imageUrl}
              alt='Background'
              fill
              unoptimized
              className='object-cover blur-sm scale-110'
              priority
            />
          </motion.div>
        ) : (
          <motion.div
            key='default'
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className='absolute inset-0 bg-neutral-900'
          />
        )}
      </AnimatePresence>
      <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60' />
    </div>
  );
}
