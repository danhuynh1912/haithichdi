'use client';

import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, CalendarDays, Facebook, MessageCircle, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { MarkdownContent } from '@/components/markdown-content';
import { ANIMATION_EASE } from '@/lib/constants';
import { FACEBOOK_URL, ZALO_URL } from '@/lib/contact';
import { formatDateDdMm } from '@/lib/utils';
import type { CampaignDetail } from '@/lib/services/campaign';
import { CampaignGallery } from './campaign-gallery';
import { CountUp } from './count-up';

/**
 * One campaign, in full.
 *
 * An appeal and its result are never both shown: `campaign_detail` blanks the
 * appeal as soon as a result is written, because asking for Trung Thu gifts in
 * December reads as an appeal nobody answered. The gallery is the part that
 * keeps working after the campaign is over — it is the evidence the money went
 * where it was promised.
 */
export function CampaignDetailView({ campaign }: { campaign: CampaignDetail }) {
  const t = useTranslations('campaigns');
  const posterRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: posterRef,
    offset: ['start start', 'end start'],
  });
  // The poster drifts slower than the page, so the title lifts off it.
  const posterY = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const posterScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const hasResult = campaign.result_md.trim().length > 0;

  return (
    <main className='bg-elev-0 min-h-screen'>
      {campaign.poster_url ? (
        <div ref={posterRef} className='relative h-[46vh] min-h-[300px] w-full overflow-hidden md:h-[62vh]'>
          <motion.div
            className='absolute inset-0'
            style={reduceMotion ? undefined : { y: posterY, scale: posterScale }}
          >
            <Image
              src={campaign.poster_url}
              alt={campaign.poster_alt || campaign.title}
              fill
              priority
              sizes='100vw'
              className='object-cover'
            />
          </motion.div>
          {/* Dark enough for white text at the bottom in either theme. */}
          <div className='absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10' />

          <div className='absolute inset-x-0 bottom-0 px-4 pb-8 md:px-8 md:pb-14'>
            <div className='theme-dark text-ink-1 mx-auto max-w-4xl'>
              <Header campaign={campaign} t={t} onDark />
            </div>
          </div>
        </div>
      ) : (
        <div className='px-4 pt-28 pb-6 md:px-8 md:pt-36'>
          <div className='mx-auto max-w-4xl'>
            <Header campaign={campaign} t={t} />
          </div>
        </div>
      )}

      <div className='mx-auto max-w-4xl px-4 py-10 md:px-8 md:py-16'>
        <Link
          href='/thien-nguyen'
          className='text-ink-4 hover:text-brand inline-flex items-center gap-1.5 text-sm font-medium transition-colors'
        >
          <ArrowLeft className='size-4' />
          {t('backToList')}
        </Link>

        {campaign.result_stats.length > 0 && (
          <motion.dl
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className='border-brand/25 bg-brand/5 mt-8 grid grid-cols-3 gap-4 rounded-3xl border p-5 md:p-8'
          >
            {campaign.result_stats.slice(0, 3).map((stat) => (
              <div key={stat.label} className='text-center'>
                <dt className='sr-only'>{stat.label}</dt>
                <dd className='text-brand text-2xl font-black tabular-nums md:text-5xl'>
                  <CountUp value={stat.value} />
                </dd>
                <p className='text-ink-3 mt-1 text-xs md:text-sm'>{stat.label}</p>
              </div>
            ))}
          </motion.dl>
        )}

        {hasResult && (
          <Section title={t('resultHeading')}>
            <MarkdownContent markdown={campaign.result_md} />
          </Section>
        )}

        {campaign.body_md.trim() && (
          <Section>
            <MarkdownContent markdown={campaign.body_md} />
          </Section>
        )}

        {!hasResult && !campaign.is_open && (
          <p className='text-ink-4 mt-8 text-sm md:text-base'>{t('closedNoResult')}</p>
        )}

        {campaign.tours.length > 0 && (
          <Section title={campaign.is_open ? t('joinTour') : t('toursLabel')}>
            <ul className='grid gap-3 sm:grid-cols-2'>
              {campaign.tours.map((tour) => (
                <li key={tour.id}>
                  <Link
                    href={`/tour-booking/${tour.id}`}
                    className='group border-line/70 bg-surface hover:border-brand/60 flex h-full flex-col overflow-hidden rounded-2xl border transition-colors'
                  >
                    {tour.image_url && (
                      <span className='relative block aspect-[16/9] w-full overflow-hidden'>
                        <Image
                          src={tour.image_url}
                          alt={tour.location?.name ?? tour.title}
                          fill
                          sizes='(min-width: 640px) 45vw, 90vw'
                          className='object-cover transition-transform duration-500 group-hover:scale-105'
                        />
                      </span>
                    )}
                    <span className='flex flex-1 flex-col gap-1 p-4'>
                      <span className='text-brand flex items-center gap-1.5 text-xs font-bold'>
                        <CalendarDays className='size-3.5' />
                        {tour.start_date ? formatDateDdMm(tour.start_date) : ''}
                        {tour.end_date ? ` – ${formatDateDdMm(tour.end_date)}` : ''}
                      </span>
                      <span className='text-ink-1 group-hover:text-brand font-bold'>
                        {tour.title}
                      </span>
                      <span className='text-ink-4 mt-auto flex items-center gap-1.5 pt-2 text-xs'>
                        <Users className='size-3.5' />
                        {tour.slots_left}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {campaign.is_open && (
          <Section title={t('donateHeading')}>
            <p className='text-ink-3 text-sm md:text-base'>{t('donateNote')}</p>
            {campaign.donate_md.trim() && (
              <div className='mt-3'>
                <MarkdownContent markdown={campaign.donate_md} />
              </div>
            )}
            <div className='mt-5 flex flex-wrap gap-3'>
              <a
                href={ZALO_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='bg-brand text-brand-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5 md:text-base'
              >
                <MessageCircle className='size-4' />
                {t('donateZalo')}
              </a>
              <a
                href={FACEBOOK_URL}
                target='_blank'
                rel='noopener noreferrer'
                className='border-line text-ink-1 hover:border-brand hover:text-brand inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold transition-colors md:text-base'
              >
                <Facebook className='size-4' />
                {t('donateFacebook')}
              </a>
            </div>
          </Section>
        )}

        {campaign.images.length > 0 && (
          <Section title={t('galleryHeading')}>
            <CampaignGallery images={campaign.images} title={campaign.title} />
          </Section>
        )}
      </div>
    </main>
  );
}

function Header({
  campaign,
  t,
  onDark = false,
}: {
  campaign: CampaignDetail;
  t: ReturnType<typeof useTranslations<'campaigns'>>;
  onDark?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: ANIMATION_EASE }}
    >
      <p className='flex flex-wrap items-center gap-3'>
        <span
          className={
            campaign.is_open
              ? 'rounded-full bg-success px-3 py-1 text-[11px] font-bold tracking-wide text-white uppercase'
              : 'rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold tracking-wide text-current uppercase'
          }
        >
          {campaign.is_open ? t('openHeading') : t('closedNote')}
        </span>
      </p>
      <h1 className='mt-3 text-3xl font-black tracking-tight md:text-5xl'>{campaign.title}</h1>
      {campaign.summary && (
        <p
          className={[
            'mt-3 max-w-2xl text-sm leading-relaxed md:text-lg',
            onDark ? 'text-ink-2' : 'text-ink-3',
          ].join(' ')}
        >
          {campaign.summary}
        </p>
      )}
    </motion.div>
  );
}

function Section({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, ease: ANIMATION_EASE }}
      className='mt-10 md:mt-14'
    >
      {title && (
        <h2 className='text-ink-1 mb-4 text-xl font-black tracking-tight uppercase md:text-2xl'>
          {title}
        </h2>
      )}
      {children}
    </motion.section>
  );
}
