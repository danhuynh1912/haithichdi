'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { type Leader } from '@/lib/services/leader';
import { type HomeMomentsGalleryImage } from '@/lib/services/home';
import { useLeadersQuery, useMomentsGalleryQuery } from '@/lib/services/queries';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import FullscreenModalShell from '@/components/fullscreen-modal-shell';
import {
  ArrowUpRight,
  Camera,
  Calendar,
  Flame,
  Heart,
  MapPin,
} from 'lucide-react';

type LeaderCard = Leader & {
  role_label?: string;
  relationship?: string;
  dob?: string;
  highlight?: string | null;
  location?: string | null;
};

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

/** Shape of one entry under `leaders.samples`. */
type LeaderSample = {
  fullName: string;
  role: string;
  relationship: string;
  dob: string;
  highlight: string;
  bio: string;
  strengths: string[];
};

/** Stand-ins shown while the profiles table is still empty. */
const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80&sat=-40',
];

export function LeadersShowcaseSection({
  id,
  className,
  variant = 'default',
}: SectionProps) {
  const t = useTranslations('leaders');
  const tCommon = useTranslations('common');

  const { data: leaders = [], isLoading: leadersLoading } = useLeadersQuery();

  const roleFallback = t('roleFallback');
  const samples = t.raw('samples') as LeaderSample[];

  const mergedLeaders = useMemo<LeaderCard[]>(() => {
    if (leaders.length === 0) {
      return samples.map((sample, index) => ({
        id: -(index + 1),
        username: '',
        first_name: '',
        last_name: '',
        full_name: sample.fullName,
        avatar_url: SAMPLE_AVATARS[index] ?? SAMPLE_AVATARS[0],
        role_label: sample.role,
        relationship: sample.relationship,
        dob: sample.dob,
        highlight: sample.highlight,
        bio: sample.bio,
        strengths: sample.strengths,
      }));
    }

    return leaders.map((leader) => ({
      ...leader,
      role_label: leader.display_role || roleFallback,
      avatar_url: leader.full_avatar_url || leader.avatar_url,
    }));
  }, [leaders, samples, roleFallback]);

  const [selectedLeader, setSelectedLeader] = useState<LeaderCard | null>(null);

  return (
    <>
      <section
        id={id}
        className={cn(
          'relative md:min-h-screen bg-[#121212] border-t border-white/5 py-14 sm:py-16 lg:py-24 scroll-mt-28',
          className,
        )}
      >
        <div className='pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,80,80,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,120,80,0.12),transparent_30%)]' />
        <div className='relative max-w-[1400px] mx-auto px-4 sm:px-8 space-y-10'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-red-200'>
                {t(`${variant}.eyebrow`)}
              </p>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black mt-2'>
                {t(`${variant}.title`)}
              </h2>
              <p className='text-neutral-300 mt-3 max-w-2xl'>
                {t(`${variant}.description`)}
              </p>
            </div>
            <div className='inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-200'>
              <Heart className='w-4 h-4 text-red-400' />
              <span>{t(`${variant}.helperText`)}</span>
            </div>
          </div>

          {leadersLoading ? (
            <p className='text-neutral-400 text-sm'>{t('loading')}</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {mergedLeaders.map((leader, idx) => (
                <motion.div
                  key={leader.id ?? idx}
                  onClick={() => setSelectedLeader(leader)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedLeader(leader);
                    }
                  }}
                  className='group text-left rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-black/12 to-black/45 p-5 md:cursor-pointer hover:border-red-400/50 hover:shadow-[0_20px_60px_-35px_rgba(255,80,80,0.6)] transition-all duration-300'
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: ANIMATION_EASE, delay: idx * 0.05 }}
                >
                  <div className='flex items-center gap-4'>
                    <AvatarBubble name={leader.full_name} src={leader.avatar_url} />
                    <div className='flex-1'>
                      <p className='text-xs uppercase tracking-[0.2em] text-red-200'>
                        {leader.role_label || roleFallback}
                      </p>
                      <p className='text-lg font-semibold leading-tight'>{leader.full_name}</p>
                      <p className='text-xs text-neutral-400 flex items-center gap-1 mt-1'>
                        <MapPin className='w-3 h-3' />
                        {leader.location || t('locationFallback')}
                      </p>
                    </div>
                    <ArrowUpRight className='w-4 h-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>

                  <p className='text-sm text-neutral-200 mt-4 line-clamp-3'>
                    {leader.highlight || leader.bio || t('highlightFallback')}
                  </p>

                  <div className='mt-4 flex flex-wrap gap-2'>
                    {(leader.strengths && leader.strengths.length > 0
                      ? leader.strengths
                      : (t.raw('strengthsFallback') as string[])
                    )
                      .slice(0, 4)
                      .map((strength) => (
                        <span
                          key={strength}
                          className='text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-100'
                        >
                          {strength}
                        </span>
                      ))}
                  </div>
                  <div className='mt-4 flex justify-end md:hidden'>
                    <button
                      type='button'
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedLeader(leader);
                      }}
                      className='inline-flex items-center gap-1.5 text-xs font-semibold text-red-200 active:text-red-100 transition-colors'
                    >
                      {tCommon('details')}
                      <ArrowUpRight className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <LeaderModal leader={selectedLeader} onClose={() => setSelectedLeader(null)} />
    </>
  );
}

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
        'relative md:min-h-screen bg-gradient-to-b from-[#121212] via-[#141414] to-[#1a1a1a] border-t border-white/5 py-14 sm:py-16 lg:py-24 scroll-mt-28',
        className,
      )}
    >
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,80,80,0.08),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(255,140,100,0.08),transparent_28%)] opacity-40' />
      <div className='relative max-w-6xl mx-auto px-4 sm:px-8 space-y-10'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.25em] text-red-200'>
              {t(`${variant}.eyebrow`)}
            </p>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black mt-2'>
              {t(`${variant}.title`)}
            </h2>
            <p className='text-neutral-300 mt-3 max-w-2xl'>
              {t(`${variant}.description`)}
            </p>
          </div>
          <div className='inline-flex items-center gap-2 text-xs text-neutral-300 bg-white/5 border border-white/10 px-3 py-2 rounded-full'>
            <Camera className='w-4 h-4 text-red-300' />
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
                className='mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)]'
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
                <div className='p-3 text-sm text-neutral-200 flex items-center justify-between gap-3'>
                  <span className='min-w-0 truncate'>{getMomentLabel(img)}</span>
                  <MapPin className='w-4 h-4 shrink-0 text-red-300' />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-neutral-400'>
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
              'mb-4 break-inside-avoid rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse',
              heightClassName,
            )}
          />
        ),
      )}
    </div>
  );
}

/** Caption comes from the DB; fall back to the tour and then the location. */
function getMomentLabel(image: HomeMomentsGalleryImage) {
  return image.caption.trim() || image.tour_title.trim() || image.location_name.trim();
}

function LeaderModal({
  leader,
  onClose,
}: {
  leader: LeaderCard | null;
  onClose: () => void;
}) {
  const t = useTranslations('leaders');
  const format = useFormatter();

  return (
    <FullscreenModalShell
      open={Boolean(leader)}
      onClose={onClose}
      closeAriaLabel={t('modal.closeAria')}
      backdropClassName='bg-black/80 backdrop-blur-md'
      containerClassName='h-full w-full md:flex md:items-center md:justify-center md:p-6'
      contentClassName='h-full w-full overflow-y-auto bg-gradient-to-br from-[#101010] to-[#0a0a0a] border border-white/10 rounded-none shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-5xl md:w-[90vw] md:rounded-3xl'
      closeButtonClassName='right-4 top-4 md:right-3 md:top-3 border-white/10 bg-black/70 hover:border-red-400/70'
      contentKey={leader?.id}
    >
      {leader && (
        <div className='grid md:grid-cols-[1.05fr_0.95fr]'>
          <div className='relative min-h-[320px] bg-gradient-to-br from-red-600/60 to-red-800/40'>
            <Image
              src={leader.avatar_url || '/images/haithichdi1.jpg'}
              alt={leader.full_name}
              fill
              unoptimized
              sizes='(max-width: 768px) 100vw, 50vw'
              className='object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent' />
            <div className='absolute bottom-4 left-4 right-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-red-200'>
                {leader.role_label || t('roleFallback')}
              </p>
              <p className='text-2xl font-semibold'>{leader.full_name}</p>
              <div className='flex flex-wrap gap-3 text-xs text-neutral-200 mt-2'>
                {leader.relationship && (
                  <span className='inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-white/10'>
                    <Heart className='w-3 h-3 text-red-300' />
                    {leader.relationship}
                  </span>
                )}
                {leader.dob && (
                  <span className='inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-white/10'>
                    <Calendar className='w-3 h-3' />
                    {leader.dob}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='p-6 sm:p-8 space-y-4'>
            <div className='flex items-center gap-3 text-sm text-red-200'>
              <Flame className='w-4 h-4' />
              <span>{leader.highlight || t('modal.highlightFallback')}</span>
            </div>

            <div className='text-neutral-200 text-sm leading-relaxed space-y-3'>
              <p>{leader.bio || t('modal.bioFallback')}</p>
            </div>

            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-red-200'>
                {t('modal.strengthsHeading')}
              </p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(leader.strengths && leader.strengths.length > 0
                  ? leader.strengths
                  : (t.raw('modal.strengthsFallback') as string[])
                ).map((item) => (
                  <span
                    key={item}
                    className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-100'
                  >
                    <Camera className='w-3 h-3 text-red-300' />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 text-sm text-neutral-300'>
              <div className='rounded-2xl border border-white/5 bg-white/5 px-3 py-3'>
                <p className='text-xs uppercase tracking-[0.2em] text-red-200'>
                  {t('modal.emailHeading')}
                </p>
                <p className='font-medium mt-1'>
                  {leader.email || t('modal.emailFallback')}
                </p>
              </div>
              <div className='rounded-2xl border border-white/5 bg-white/5 px-3 py-3'>
                <p className='text-xs uppercase tracking-[0.2em] text-red-200'>
                  {t('modal.joinedHeading')}
                </p>
                <p className='font-medium mt-1'>
                  {leader.date_joined
                    ? format.dateTime(new Date(leader.date_joined), 'date')
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </FullscreenModalShell>
  );
}

function AvatarBubble({ name, src }: { name: string; src?: string | null }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className='relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-red-600 to-red-400 text-center flex items-center justify-center text-lg font-semibold text-white shadow-[0_12px_45px_-25px_rgba(255,80,80,0.8)]'>
      {src ? (
        <Image src={src} alt={name} fill sizes='56px' className='object-cover' unoptimized />
      ) : (
        initials
      )}
    </div>
  );
}
