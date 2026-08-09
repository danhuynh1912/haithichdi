'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { type HomeMomentsGalleryImage } from '@/lib/services/home';
import { useMomentsGalleryQuery } from '@/lib/services/queries';
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

/**
 * One person on the team card grid. The section used to merge these with rows
 * from `profiles`, but that table now only holds admin-panel logins, so the
 * copy in the message catalogue is the single source.
 */
type TeamMember = {
  id: number;
  full_name: string;
  avatar_url: string;
  role_label?: string;
  relationship?: string;
  dob?: string;
  highlight?: string | null;
  location?: string | null;
  bio?: string;
  strengths?: string[];
  email?: string;
  date_joined?: string | null;
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

/** Shape of one entry under `team.samples`. */
type TeamSample = {
  fullName: string;
  role: string;
  relationship: string;
  dob: string;
  highlight: string;
  bio: string;
  strengths: string[];
};

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80&sat=-40',
];

export function TeamShowcaseSection({
  id,
  className,
  variant = 'default',
}: SectionProps) {
  const t = useTranslations('team');
  const tCommon = useTranslations('common');

  const roleFallback = t('roleFallback');
  const samples = t.raw('samples') as TeamSample[];

  const members = useMemo<TeamMember[]>(
    () =>
      samples.map((sample, index) => ({
        id: index + 1,
        full_name: sample.fullName,
        avatar_url: SAMPLE_AVATARS[index] ?? SAMPLE_AVATARS[0],
        role_label: sample.role,
        relationship: sample.relationship,
        dob: sample.dob,
        highlight: sample.highlight,
        bio: sample.bio,
        strengths: sample.strengths,
      })),
    [samples],
  );

  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  return (
    <>
      <section
        id={id}
        className={cn(
          'relative md:min-h-screen bg-elev-2 border-t border-line/60 py-14 sm:py-16 lg:py-24 scroll-mt-28',
          className,
        )}
      >
        <div className='pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,80,80,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,120,80,0.12),transparent_30%)]' />
        <div className='relative max-w-[1400px] mx-auto px-4 sm:px-8 space-y-10'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
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
            <div className='inline-flex items-center gap-3 rounded-full border border-line bg-surface px-3 sm:px-4 py-2 text-xs sm:text-sm text-ink-2'>
              <Heart className='w-4 h-4 text-brand-soft-2' />
              <span>{t(`${variant}.helperText`)}</span>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {members.map((member, idx) => (
                <motion.div
                  key={member.id ?? idx}
                  onClick={() => setSelectedMember(member)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedMember(member);
                    }
                  }}
                  className='group text-left rounded-3xl border border-line bg-gradient-to-br from-surface-2 via-well to-well-2 p-5 md:cursor-pointer hover:border-brand/50 hover:shadow-[var(--shadow-brand)] transition-all duration-300'
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: ANIMATION_EASE, delay: idx * 0.05 }}
                >
                  <div className='flex items-center gap-4'>
                    <AvatarBubble name={member.full_name} src={member.avatar_url} />
                    <div className='flex-1'>
                      <p className='text-xs uppercase tracking-[0.2em] text-brand-soft'>
                        {member.role_label || roleFallback}
                      </p>
                      <p className='text-lg font-semibold leading-tight'>{member.full_name}</p>
                      <p className='text-xs text-ink-4 flex items-center gap-1 mt-1'>
                        <MapPin className='w-3 h-3' />
                        {member.location || t('locationFallback')}
                      </p>
                    </div>
                    <ArrowUpRight className='w-4 h-4 text-brand-soft-2 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>

                  <p className='text-sm text-ink-2 mt-4 line-clamp-3'>
                    {member.highlight || member.bio || t('highlightFallback')}
                  </p>

                  <div className='mt-4 flex flex-wrap gap-2'>
                    {(member.strengths && member.strengths.length > 0
                      ? member.strengths
                      : (t.raw('strengthsFallback') as string[])
                    )
                      .slice(0, 4)
                      .map((strength) => (
                        <span
                          key={strength}
                          className='text-xs rounded-full border border-line bg-surface px-3 py-1 text-ink-2'
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
                        setSelectedMember(member);
                      }}
                      className='inline-flex items-center gap-1.5 text-xs font-semibold text-brand-soft active:text-brand-soft transition-colors'
                    >
                      {tCommon('details')}
                      <ArrowUpRight className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>
      <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />
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

function TeamMemberModal({
  member,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}) {
  const t = useTranslations('team');
  const format = useFormatter();

  return (
    <FullscreenModalShell
      open={Boolean(member)}
      onClose={onClose}
      closeAriaLabel={t('modal.closeAria')}
      backdropClassName='bg-scrim backdrop-blur-md'
      containerClassName='h-full w-full md:flex md:items-center md:justify-center md:p-6'
      contentClassName='h-full w-full overflow-y-auto bg-gradient-to-br from-elev-2 to-elev-0 border border-line rounded-none shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-5xl md:w-[90vw] md:rounded-3xl'
      closeButtonClassName='right-4 top-4 md:right-3 md:top-3 border-line bg-elev-0/70 hover:border-brand/70'
      contentKey={member?.id}
    >
      {member && (
        <div className='grid md:grid-cols-[1.05fr_0.95fr]'>
          <div className='relative min-h-[320px] bg-gradient-to-br from-brand/60 to-brand-strong/40'>
            <Image
              src={member.avatar_url || '/images/haithichdi1.jpg'}
              alt={member.full_name}
              fill
              unoptimized
              sizes='(max-width: 768px) 100vw, 50vw'
              className='object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent' />
            {/* Layered on the portrait — pinned to the dark palette so the
                tokens inside resolve against the photo, not the canvas. */}
            <div className='theme-dark text-ink-1 absolute bottom-4 left-4 right-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-brand-soft'>
                {member.role_label || t('roleFallback')}
              </p>
              <p className='text-2xl font-semibold'>{member.full_name}</p>
              <div className='flex flex-wrap gap-3 text-xs text-ink-2 mt-2'>
                {member.relationship && (
                  <span className='inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-line'>
                    <Heart className='w-3 h-3 text-brand-soft-2' />
                    {member.relationship}
                  </span>
                )}
                {member.dob && (
                  <span className='inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-line'>
                    <Calendar className='w-3 h-3' />
                    {member.dob}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='p-6 sm:p-8 space-y-4'>
            <div className='flex items-center gap-3 text-sm text-brand-soft'>
              <Flame className='w-4 h-4' />
              <span>{member.highlight || t('modal.highlightFallback')}</span>
            </div>

            <div className='text-ink-2 text-sm leading-relaxed space-y-3'>
              <p>{member.bio || t('modal.bioFallback')}</p>
            </div>

            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-brand-soft'>
                {t('modal.strengthsHeading')}
              </p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(member.strengths && member.strengths.length > 0
                  ? member.strengths
                  : (t.raw('modal.strengthsFallback') as string[])
                ).map((item) => (
                  <span
                    key={item}
                    className='inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-2'
                  >
                    <Camera className='w-3 h-3 text-brand-soft-2' />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 text-sm text-ink-3'>
              <div className='rounded-2xl border border-line/60 bg-surface px-3 py-3'>
                <p className='text-xs uppercase tracking-[0.2em] text-brand-soft'>
                  {t('modal.emailHeading')}
                </p>
                <p className='font-medium mt-1'>
                  {member.email || t('modal.emailFallback')}
                </p>
              </div>
              <div className='rounded-2xl border border-line/60 bg-surface px-3 py-3'>
                <p className='text-xs uppercase tracking-[0.2em] text-brand-soft'>
                  {t('modal.joinedHeading')}
                </p>
                <p className='font-medium mt-1'>
                  {member.date_joined
                    ? format.dateTime(new Date(member.date_joined), 'date')
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
    <div className='relative w-14 h-14 rounded-2xl overflow-hidden border border-line bg-gradient-to-br from-brand to-brand-strong text-center flex items-center justify-center text-lg font-semibold text-white shadow-[var(--shadow-brand)]'>
      {src ? (
        <Image src={src} alt={name} fill sizes='56px' className='object-cover' unoptimized />
      ) : (
        initials
      )}
    </div>
  );
}
