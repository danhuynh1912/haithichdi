'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, MessageCircle, Users } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { CampaignCard } from '@/lib/services/campaign';
import { ANIMATION_EASE } from '@/lib/constants';
import { ZALO_URL } from '@/lib/contact';
import { formatDateDdMm } from '@/lib/utils';

/**
 * The open campaign, as the whole screen.
 *
 * Built like a streaming service's billboard: one photograph filling the
 * viewport, the copy sitting low on it, and a gradient carrying the picture
 * down into the page. The gradient fades to `--elev-0` rather than to black,
 * which is what makes this work in both themes — by the time the text starts,
 * the backdrop *is* the page background, so the ordinary ink colours are
 * readable without a dark overlay fighting the light theme.
 */
export function CampaignBillboard({ campaigns }: { campaigns: CampaignCard[] }) {
  const carousel = useCarousel(campaigns.length);
  const campaign = campaigns[carousel.index] ?? campaigns[0];

  if (!campaign) return null;

  return (
    <>
      {/* A phone gets the card instead. A viewport-height billboard on a 375px
          screen is one line of a title and nothing else — the picture stops
          being a backdrop and becomes the entire first screen, with the copy
          pushed off it. */}
      <div className='md:hidden'>
        <OpenCampaignCard campaign={campaign} carousel={carousel} count={campaigns.length} />
      </div>
      <div className='hidden md:block'>
        <Billboard campaign={campaign} carousel={carousel} count={campaigns.length} />
      </div>
    </>
  );
}

/**
 * Which of several open campaigns is on screen.
 *
 * Two or three appeals running at once is normal in a busy season, and a
 * stack of full-screen billboards would bury everything under the first one.
 * They take turns instead — slowly, because this is a page to be read rather
 * than a slideshow to be watched, and never while the reader is hovering over
 * it or has asked for less motion.
 */
interface Carousel {
  index: number;
  go: (next: number) => void;
  step: (delta: number) => void;
  pause: () => void;
  resume: () => void;
}

function useCarousel(count: number, intervalMs = 8000): Carousel {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (count < 2 || paused || reduceMotion) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), intervalMs);
    return () => clearInterval(timer);
  }, [count, paused, reduceMotion, intervalMs]);

  // A campaign closing while the page is open would otherwise leave the index
  // pointing past the end of the list.
  useEffect(() => {
    if (index >= count) setIndex(0);
  }, [count, index]);

  const go = useCallback((next: number) => setIndex(next), []);
  // Wraps at both ends, so neither arrow is ever a dead end.
  const step = useCallback(
    (delta: number) => setIndex((current) => (current + delta + count) % count),
    [count],
  );
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  return { index, go, step, pause, resume };
}

/**
 * The dots, plus a pair of arrows for anyone who would rather not wait.
 *
 * Deliberately small and unfilled: this sits under a billboard that is already
 * asking for two clicks, and a third pair of solid buttons would compete with
 * them. The dots stay clickable in their own right — on a phone they are the
 * bigger target.
 */
function CarouselControls({
  count,
  index,
  carousel,
  className = '',
}: {
  count: number;
  index: number;
  carousel: Carousel;
  className?: string;
}) {
  const t = useTranslations('campaigns');
  if (count < 2) return null;

  const arrow =
    'text-ink-3 hover:text-brand hover:border-brand/50 border-ink-1/20 flex size-8 items-center justify-center rounded-full border transition-colors';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type='button'
        onClick={() => carousel.step(-1)}
        aria-label={t('previousCampaign')}
        className={arrow}
      >
        <ChevronLeft className='size-4' />
      </button>

      <div className='flex items-center gap-2'>
        {Array.from({ length: count }, (_, dot) => (
          <button
            key={dot}
            type='button'
            onClick={() => carousel.go(dot)}
            aria-label={t('goToCampaign', { number: dot + 1 })}
            aria-current={dot === index}
            className={[
              'h-1.5 rounded-full transition-all duration-500',
              dot === index ? 'bg-brand w-7' : 'bg-ink-1/25 hover:bg-ink-1/45 w-3',
            ].join(' ')}
          />
        ))}
      </div>

      <button
        type='button'
        onClick={() => carousel.step(1)}
        aria-label={t('nextCampaign')}
        className={arrow}
      >
        <ChevronRight className='size-4' />
      </button>
    </div>
  );
}

function Billboard({
  campaign,
  carousel,
  count,
}: {
  campaign: CampaignCard;
  carousel: Carousel;
  count: number;
}) {
  const t = useTranslations('campaigns');
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  // The picture leaves slower than the page, so the copy lifts off it.
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const cover =
    campaign.poster_url ?? campaign.tours.find((tour) => tour.image_url)?.image_url ?? null;
  const words = campaign.title.split(' ');

  return (
    <section
      ref={sectionRef}
      onMouseEnter={carousel.pause}
      onMouseLeave={carousel.resume}
      onFocusCapture={carousel.pause}
      onBlurCapture={carousel.resume}
      className='relative flex h-[100svh] min-h-[620px] w-full flex-col justify-end overflow-hidden'
    >
      <motion.div className='absolute inset-0' style={reduceMotion ? undefined : { y: imageY }}>
        <AnimatePresence mode='sync'>
          {cover && (
            <motion.div
              key={campaign.id}
              className='absolute inset-0'
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 0.9 }, scale: { duration: 8, ease: 'linear' } }}
            >
              <Image
                src={cover}
                alt={campaign.poster_alt || campaign.title}
                fill
                priority
                sizes='100vw'
                className='object-cover'
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Two gradients doing different jobs: the first lands the picture on the
          page background so the copy needs no overlay of its own, the second
          darkens the very top just enough for the site header to stay legible
          over a bright sky. */}
      <div className='from-elev-0 via-elev-0/92 absolute inset-0 bg-linear-to-t via-45% to-transparent' />
      <div className='absolute inset-x-0 top-0 h-40 bg-linear-to-b from-black/35 to-transparent' />

      <motion.div
        key={campaign.id}
        style={reduceMotion ? undefined : { y: copyY, opacity: copyOpacity }}
        className='relative mx-auto w-full max-w-5xl px-4 pb-16 md:px-8 md:pb-24'
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: ANIMATION_EASE }}
        >
          <span className='inline-flex items-center gap-2 rounded-full bg-success px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-white uppercase'>
            <span className='size-1.5 animate-pulse rounded-full bg-current' />
            {t('openHeading')}
          </span>
        </motion.p>

        <h2 className='text-ink-1 mt-4 text-4xl font-black tracking-tight md:text-7xl'>
          {words.map((word, index) => (
            <motion.span
              key={`${word}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 + index * 0.07, ease: ANIMATION_EASE }}
              className='mr-[0.22em] inline-block'
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {campaign.summary && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: ANIMATION_EASE }}
            className='text-ink-2 mt-4 max-w-2xl text-sm leading-relaxed md:text-lg'
          >
            {campaign.summary}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.58, ease: ANIMATION_EASE }}
          className='mt-7 flex flex-wrap items-center gap-3'
        >
          <Link
            href={`/thien-nguyen/${campaign.slug}`}
            className='bg-brand text-brand-foreground inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 md:text-base'
          >
            {t('readMore')}
            <ArrowRight className='size-4' />
          </Link>
          <a
            href={ZALO_URL}
            target='_blank'
            rel='noopener noreferrer'
            className='border-ink-1/25 text-ink-1 hover:border-brand hover:text-brand bg-elev-0/40 inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold backdrop-blur-sm transition-colors md:text-base'
          >
            <MessageCircle className='size-4' />
            {t('donateZalo')}
          </a>
        </motion.div>

        {campaign.tours.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className='mt-8 flex flex-wrap gap-2'
          >
            {campaign.tours.map((tour) => (
              <li key={tour.id}>
                <Link
                  href={`/tour-booking/${tour.id}`}
                  className='group border-ink-1/15 bg-elev-0/50 text-ink-2 hover:border-brand hover:text-brand inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs backdrop-blur-sm transition-colors md:text-sm'
                >
                  <span className='text-brand font-bold tabular-nums'>
                    {tour.start_date ? formatDateDdMm(tour.start_date) : ''}
                    {tour.end_date ? `–${formatDateDdMm(tour.end_date)}` : ''}
                  </span>
                  <span className='font-medium'>{tour.location?.name ?? tour.title}</span>
                  <span className='text-ink-4 inline-flex items-center gap-1'>
                    <Users className='size-3' />
                    {tour.slots_left}
                  </span>
                </Link>
              </li>
            ))}
          </motion.ul>
        )}

        <CarouselControls
          count={count}
          index={carousel.index}
          carousel={carousel}
          className='mt-8'
        />
      </motion.div>

      {!reduceMotion && (
        <motion.span
          aria-hidden
          className='text-ink-4 absolute inset-x-0 bottom-4 mx-auto w-fit'
          animate={{ y: [0, 7, 0], opacity: [0.35, 0.9, 0.35] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className='size-5' />
        </motion.span>
      )}
    </section>
  );
}

/** The open campaign on a phone: the same billboard, folded into a card. */
function OpenCampaignCard({
  campaign,
  carousel,
  count,
}: {
  campaign: CampaignCard;
  carousel: Carousel;
  count: number;
}) {
  const t = useTranslations('campaigns');
  const cover =
    campaign.poster_url ?? campaign.tours.find((tour) => tour.image_url)?.image_url ?? null;

  return (
    <section className='px-4 pt-2 pb-4'>
      <motion.div
        key={campaign.id}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: ANIMATION_EASE }}
        className='border-line/70 bg-elev-0 overflow-hidden rounded-3xl border shadow-sm'
      >
        {cover && (
          <div className='relative aspect-[4/3] w-full overflow-hidden'>
            <Image
              src={cover}
              alt={campaign.poster_alt || campaign.title}
              fill
              priority
              sizes='100vw'
              className='object-cover'
            />
            <div className='absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-transparent' />
            <div className='theme-dark text-ink-1 absolute inset-x-0 bottom-0 p-5'>
              <span className='inline-flex items-center gap-2 rounded-full bg-success px-3 py-1 text-[10px] font-bold tracking-[0.16em] text-white uppercase'>
                <span className='size-1.5 animate-pulse rounded-full bg-current' />
                {t('openHeading')}
              </span>
              <h2 className='mt-2 text-2xl font-black tracking-tight'>{campaign.title}</h2>
            </div>
          </div>
        )}

        <div className='p-5'>
          {campaign.summary && (
            <p className='text-ink-3 text-sm leading-relaxed'>{campaign.summary}</p>
          )}

          {campaign.tours.length > 0 && (
            <ul className='mt-4 grid gap-2'>
              {campaign.tours.map((tour) => (
                <li key={tour.id}>
                  <Link
                    href={`/tour-booking/${tour.id}`}
                    className='group border-line/60 bg-surface hover:border-brand/60 flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors'
                  >
                    <span className='text-brand shrink-0 text-xs font-bold tabular-nums'>
                      {tour.start_date ? formatDateDdMm(tour.start_date) : ''}
                      {tour.end_date ? `–${formatDateDdMm(tour.end_date)}` : ''}
                    </span>
                    <span className='text-ink-2 group-hover:text-brand min-w-0 flex-1 truncate text-sm'>
                      {tour.location?.name ?? tour.title}
                    </span>
                    <span className='text-ink-4 inline-flex shrink-0 items-center gap-1 text-xs'>
                      <Users className='size-3' />
                      {tour.slots_left}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className='mt-5 flex flex-wrap gap-2.5'>
            <Link
              href={`/thien-nguyen/${campaign.slug}`}
              className='bg-brand text-brand-foreground inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold'
            >
              {t('readMore')}
              <ArrowRight className='size-4' />
            </Link>
            <a
              href={ZALO_URL}
              target='_blank'
              rel='noopener noreferrer'
              className='border-line text-ink-1 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-bold'
            >
              <MessageCircle className='size-4' />
              {t('donateZalo')}
            </a>
          </div>
        </div>
      </motion.div>

      <CarouselControls
        count={count}
        index={carousel.index}
        carousel={carousel}
        className='mt-4 justify-center'
      />
    </section>
  );
}
