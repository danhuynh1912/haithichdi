'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type HomeMomentsGalleryImage } from '@/lib/services/home';
import { useMomentsGalleryQuery } from '@/lib/services/queries';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Camera, MapPin } from 'lucide-react';

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

export function MomentsGallerySection({
  id,
  className,
  variant = 'default',
}: SectionProps) {
  const t = useTranslations('moments');

  const { data, isPending, isError } = useMomentsGalleryQuery();

  const galleryImages = data?.images ?? [];

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
          <div className='columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]'>
            {galleryImages.map((img, idx) => (
              <motion.div
                key={img.id}
                className='mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-line bg-surface shadow-[var(--shadow-medium)]'
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: ANIMATION_EASE, delay: idx * 0.03 }}
              >
                <Image
                  src={img.image_url || '/images/haithichdi1.jpg'}
                  alt={getMomentLabel(img)}
                  width={img.width || 900}
                  height={img.height || 1200}
                  className='w-full h-auto object-cover'
                  unoptimized={Boolean(img.image_url?.startsWith('http'))}
                />
                <div className='p-3 text-sm text-ink-2 flex items-center justify-between gap-3'>
                  <span className='min-w-0 truncate'>{getMomentLabel(img)}</span>
                  <MapPin className='w-4 h-4 shrink-0 text-brand-soft-2' />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='rounded-3xl border border-line bg-surface px-4 py-6 text-sm text-ink-4'>
            {isError ? t('loadError') : t('empty')}
          </div>
        )}
      </div>
    </section>
  );
}

function MomentsGalleryLoadingState() {
  return (
    <div className='columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]'>
      {['h-[420px]', 'h-[280px]', 'h-[520px]', 'h-[360px]', 'h-[460px]', 'h-[320px]'].map(
        (heightClassName, index) => (
          <div
            key={`moments-gallery-skeleton-${index}`}
            className={cn(
              'mb-4 break-inside-avoid rounded-3xl border border-line bg-surface animate-pulse',
              heightClassName,
            )}
          />
        ),
      )}
    </div>
  );
}

/** Caption comes from the DB; fall back to the route the photo belongs to. */
function getMomentLabel(image: HomeMomentsGalleryImage) {
  return image.caption.trim() || image.location_name.trim();
}
