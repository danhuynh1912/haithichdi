'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Gift, MapPin, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { CampaignCard } from '@/lib/services/campaign';
import { ANIMATION_EASE } from '@/lib/constants';
import { formatDateDdMm } from '@/lib/utils';
import { CountUp } from './count-up';

/**
 * The campaigns as one trail down the page.
 *
 * A trekking company's charity work is a sequence — one season after another,
 * the same two mountains, different children — so the page is drawn as the
 * route profile it actually is: a single line, a milestone per campaign, and
 * the line drawing itself as the reader descends. The open campaign sits at
 * the head of the trail and is the only one given its full width; everything
 * below it is a season already walked.
 *
 * Every animation here is gated on `useReducedMotion`, which resolves from the
 * reader's OS setting. Motion this heavy is genuinely unpleasant for someone
 * who has asked for less of it.
 */
/**
 * The seasons already given, as one trail down the page.
 *
 * The open campaign is not here: it gets the whole screen above, as a
 * billboard. What is left is a history, and a history reads as a line — one
 * milestone per season, the line drawing itself as the reader descends.
 */
export function CampaignTrail({ campaigns }: { campaigns: CampaignCard[] }) {
  const t = useTranslations('campaigns');
  const past = campaigns.filter((campaign) => !campaign.is_open);

  if (past.length === 0) return null;

  return (
    <div className='mx-auto max-w-6xl px-4 pb-24 md:px-8'>
      <PastTrail campaigns={past} />
    </div>
  );
}

/** Shown in the billboard's place when nothing is being raised for. */
export function QuietSeasonHero() {
  const t = useTranslations('campaigns');
  return <QuietSeason message={t('emptyOpen')} />;
}

/**
 * The seasons already walked, strung along a line that draws itself.
 *
 * A component of its own so the scroll hook below only ever exists when there
 * is something to measure: `useScroll` on a ref that never gets attached — the
 * case when no campaign has closed yet — throws "target ref is defined but not
 * hydrated" on every render.
 */
function PastTrail({ campaigns }: { campaigns: CampaignCard[] }) {
  const t = useTranslations('campaigns');
  const trailRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: trailRef,
    // Starts drawing when the trail's top reaches three quarters down the
    // screen and finishes as its end leaves the bottom — so the line is always
    // a little ahead of the milestone being read.
    offset: ['start 0.75', 'end 0.6'],
  });
  const drawn = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.4 });
  const glowY = useTransform(drawn, (value) => `${value * 100}%`);

  return (
    <div ref={trailRef} className='relative'>
      {/* The trail: a hairline the milestones hang off, at the far left on a
          phone and down the middle on a desktop, where the cards step to
          alternating sides of it and never cross it. */}
      <div
        aria-hidden
        className='bg-line/70 pointer-events-none absolute top-32 bottom-16 left-[19px] w-px md:left-1/2 md:-translate-x-1/2'
      >
        <motion.div
          className='from-brand/30 via-brand to-brand absolute inset-x-0 top-0 h-full origin-top bg-linear-to-b'
          style={{ scaleY: reduceMotion ? 1 : drawn }}
        />
        {!reduceMotion && (
          // The head of the line, where the reader's attention is.
          <motion.span
            className='bg-brand shadow-brand/50 absolute -left-[3px] size-[7px] -translate-y-1/2 rounded-full shadow-[0_0_14px_4px]'
            style={{ top: glowY }}
          />
        )}
      </div>

      <TrailHeading label={t('pastHeading')} note={t('pastNote')} />
      {campaigns.map((campaign, index) => (
        <Milestone key={campaign.id} campaign={campaign} index={index} />
      ))}
    </div>
  );
}

/** A label pinned to the trail, marking where one stretch of it becomes another. */
function TrailHeading({ label, note }: { label: string; note: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.6, ease: ANIMATION_EASE }}
      className='relative pt-16 pb-8 pl-12 md:pt-24 md:pl-0 md:text-center'
    >
      <span className='bg-brand/10 text-brand ring-brand/20 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold tracking-[0.18em] uppercase ring-1'>
        {label}
      </span>
      <p className='text-ink-3 mt-3 text-sm md:mx-auto md:max-w-xl md:text-base'>{note}</p>
    </motion.div>
  );
}

/** What the trail says when nothing is being raised for right now. */
function QuietSeason({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className='text-ink-4 relative py-14 pl-12 text-sm md:pl-0 md:text-center md:text-base'
    >
      {message}
    </motion.p>
  );
}

function Milestone({ campaign, index = 0 }: { campaign: CampaignCard; index?: number }) {
  const t = useTranslations('campaigns');
  // Past milestones alternate sides of the line on a desktop, which is what
  // makes a column of them read as a route rather than a list. The open one
  // always sits on the right, so the eye starts in the same place.
  const onLeft = index % 2 === 1;
  // A campaign always has a picture available even before anyone uploads a
  // poster: it is hanging off treks, and every trek has a photograph of the
  // mountain it climbs.
  const cover = campaign.poster_url ?? campaign.tours.find((tour) => tour.image_url)?.image_url ?? null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.7, ease: ANIMATION_EASE }}
      className={[
        'relative pb-14 pl-12 md:pb-20 md:pl-0',
        onLeft ? 'md:pr-[52%]' : 'md:pl-[52%]',
      ].join(' ')}
    >
      <Dot />

      <div
        className={[
          'border-line/70 bg-surface overflow-hidden rounded-3xl border shadow-sm transition-shadow',
          'hover:shadow-md',
        ].join(' ')}
      >
        {cover && (
          <div className='relative aspect-[16/9] w-full overflow-hidden'>
            <motion.div
              className='absolute inset-0'
              initial={{ scale: 1.12 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: ANIMATION_EASE }}
            >
              <Image
                src={cover}
                alt={campaign.poster_alt || campaign.title}
                fill
                sizes='(min-width: 768px) 480px, 100vw'
                className='object-cover'
              />
            </motion.div>
            {/* The title sits on the picture on the open campaign, so the foot
                of it has to be dark enough to read white type against. */}
            <div className='absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent' />

            <div className='absolute inset-x-0 bottom-0 p-5 md:p-7'>
              <div className='theme-dark text-ink-1'>
                <h3
                  className='text-xl font-black tracking-tight md:text-2xl'
                >
                  {campaign.title}
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className='p-5 md:p-7'>
          {!cover && (
            <h3 className='text-ink-1 mb-2 text-xl font-black tracking-tight md:text-2xl'>
              {campaign.title}
            </h3>
          )}

          {campaign.summary && (
            <p className='text-ink-3 text-sm leading-relaxed md:text-base'>{campaign.summary}</p>
          )}

          {campaign.result_stats.length > 0 && <Stats stats={campaign.result_stats} />}

          {campaign.tours.length > 0 && <TourList tours={campaign.tours} label={t('toursLabel')} />}

          <Link
            href={`/thien-nguyen/${campaign.slug}`}
            className='group text-brand mt-6 inline-flex items-center gap-2 text-sm font-bold md:text-base'
          >
            {campaign.has_result ? t('readResult') : t('readMore')}
            <ArrowRight className='size-4 transition-transform group-hover:translate-x-1' />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/** The marker on the line. The open campaign's pulses; the rest are settled. */
/** The marker where a milestone meets the line. */
function Dot() {
  return (
    <span
      aria-hidden
      className='absolute top-8 left-[13px] flex size-3.5 items-center justify-center md:top-10 md:left-1/2 md:-translate-x-1/2'
    >
      <span className='border-brand/70 bg-elev-0 relative size-3.5 rounded-full border-2' />
    </span>
  );
}

function Stats({ stats }: { stats: { label: string; value: string }[] }) {
  const shown = stats.slice(0, 3);
  // A money figure is several times longer than a count, so the type gives way
  // rather than the box.
  const long = shown.some((stat) => stat.value.length > 6);

  return (
    // Flex, not a grid: equal columns gave "50" and "35.488.000đ" the same
    // width, which left the long one filling its cell edge to edge while the
    // short one sat in a pool of space. Each figure takes the room it needs and
    // they share what is left.
    <dl className='border-line/60 mt-5 flex flex-wrap items-start justify-around gap-x-6 gap-y-4 rounded-2xl border border-dashed px-5 py-5'>
      {shown.map((stat) => (
        <div key={stat.label} className='text-center'>
          <dt className='sr-only'>{stat.label}</dt>
          <dd
            className={[
              'text-brand font-black whitespace-nowrap tabular-nums',
              long ? 'text-lg md:text-2xl' : 'text-xl md:text-3xl',
            ].join(' ')}
          >
            <CountUp value={stat.value} />
          </dd>
          <p className='text-ink-4 mt-0.5 text-[11px] leading-tight md:text-xs'>{stat.label}</p>
        </div>
      ))}
    </dl>
  );
}

function TourList({
  tours,
  label,
}: {
  tours: CampaignCard['tours'];
  label: string;
}) {
  return (
    <div className='mt-5'>
      <p className='text-ink-4 flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase'>
        <Gift className='size-3.5' />
        {label}
      </p>
      <ul className='mt-2 grid gap-2'>
        {tours.map((tour) => (
          <li key={tour.id}>
            <Link
              href={`/tour-booking/${tour.id}`}
              className='group border-line/60 bg-elev-0 hover:border-brand/60 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors'
            >
              <span className='text-brand shrink-0 text-xs font-bold tabular-nums'>
                {tour.start_date ? formatDateDdMm(tour.start_date) : ''}
                {tour.end_date ? `–${formatDateDdMm(tour.end_date)}` : ''}
              </span>
              <span className='text-ink-2 group-hover:text-brand min-w-0 flex-1 truncate text-sm'>
                {tour.location?.name ?? tour.title}
              </span>
              <span className='text-ink-4 hidden shrink-0 items-center gap-1 text-xs sm:flex'>
                <Users className='size-3' />
                {tour.slots_left}
              </span>
              <MapPin className='text-ink-5 size-3.5 shrink-0 sm:hidden' />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
