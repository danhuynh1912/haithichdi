'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { type ComponentType } from 'react';
import {
  ArrowRight,
  Compass,
  HandHeart,
  HeartHandshake,
  Mountain,
  ShieldCheck,
  Sparkles,
  Stars,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ANIMATION_EASE } from '@/lib/constants';
import { useFeaturedRoutesQuery } from '@/lib/services/queries';
import { cn, slugify } from '@/lib/utils';
import {
  buildHomeFeaturedRoutesViewModel,
  formatSuitableAudiences,
} from './home-featured-routes-view-model';

/**
 * Layout-only config; every string comes from `home.intro` / `home.values`.
 * `key` doubles as the message sub-namespace.
 */
const KEYWORD_ICONS: ComponentType<{ className?: string }>[] = [
  Mountain,
  HeartHandshake,
  HandHeart,
];

const VALUE_SECTIONS = [
  { key: 'trekking', image: '/images/tachinhu1.jpg', locationName: 'Ta Xua' },
  { key: 'connection', image: '/images/haithichdi1.jpg', locationName: 'Ky Quan San' },
  { key: 'charity', image: '/images/thien-nguyen.jpg', locationName: 'Nhiu Co San' },
] as const;

type KeywordCard = { title: string; body: string };
type Stat = { label: string; value: string };

const sectionRevealInitial = {
  opacity: 0,
  y: 92,
} as const;

const sectionRevealTransition = {
  duration: 1.5,
  delay: 0.5,
  ease: ANIMATION_EASE,
} as const;

export function HomeAboutJourneySection() {
  const t = useTranslations('home.intro');
  const tValues = useTranslations('home.values');

  const listItems = t.raw('listItems') as string[];
  const stats = t.raw('stats') as Stat[];
  const keywords = t.raw('keywords') as KeywordCard[];

  return (
    <>
      <section
        id='about-us'
        className='relative bg-gradient-to-b from-elev-2 via-elev-3 to-elev-4 py-14 sm:py-16 lg:py-24 scroll-mt-28'
      >
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute inset-0 bg-[radial-gradient(120%_88%_at_50%_62%,var(--brand-wash)_0%,transparent_58%)]' />
          <div className='absolute inset-0 bg-[radial-gradient(86%_72%_at_100%_100%,var(--brand-wash-soft)_0%,transparent_62%)]' />
        </div>

        <motion.div
          initial={sectionRevealInitial}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionRevealTransition}
          className='relative mx-auto grid w-full max-w-[1400px] gap-8 px-4 sm:px-8 lg:grid-cols-[1.08fr_0.92fr]'
        >
          <div className='space-y-7'>
            <div className='inline-flex items-center gap-2 rounded-full border border-brand/35 bg-brand/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-brand-soft'>
              <Sparkles className='h-4 w-4 text-brand-soft-2' />
              {t('eyebrow')}
            </div>

            <h2 className='text-2xl sm:text-3xl md:text-5xl font-black leading-tight'>
              {t('title')}
            </h2>

            <div className='space-y-4 text-ink-2 leading-relaxed text-base'>
              <p>{t('lead')}</p>
              <p className='font-semibold text-brand-soft'>{t('highlight')}</p>
              <p>{t('listIntro')}</p>
              <ul className='space-y-1 text-ink-2'>
                {listItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{t('outro')}</p>

              <div className='mt-5 rounded-2xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm font-semibold text-brand-soft'>
                {t('quote')}
              </div>

              <div className='mt-5 grid gap-3 sm:grid-cols-3'>
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className='rounded-2xl border border-line bg-well px-4 py-3'
                  >
                    <p className='text-xl font-black text-ink-1'>{stat.value}</p>
                    <p className='mt-1 text-[11px] uppercase tracking-[0.14em] text-ink-4'>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            {keywords.map(({ title, body }, index) => {
              const Icon = KEYWORD_ICONS[index] ?? Mountain;
              return (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, ease: ANIMATION_EASE, delay: index * 0.06 }}
                >
                  <div className='h-full rounded-3xl bg-surface p-6 backdrop-blur-md'>
                    <div className='mb-4 inline-flex rounded-2xl border border-brand/35 bg-brand/15 p-3 text-brand-soft'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <h3 className='text-xl sm:text-2xl font-bold'>{title}</h3>
                    <p className='mt-3 text-sm leading-relaxed text-ink-3'>{body}</p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </section>

      {VALUE_SECTIONS.map((section, index) => {
        const bullets = tValues.raw(`${section.key}.bullets`) as string[];

        return (
          <section
            key={section.key}
            className='relative border-t border-line/60 bg-gradient-to-b from-elev-2 via-elev-2 to-elev-4 py-14 sm:py-16 lg:py-20 scroll-mt-28'
          >
            <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--sheen)_0%,transparent_28%)]' />
            <div className='pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(88%_72%_at_90%_18%,var(--brand-glow)_0%,transparent_52%)]' />
            <p className='pointer-events-none absolute right-4 top-5 text-[36px] sm:right-6 sm:top-6 sm:text-[56px] font-black uppercase tracking-[0.12em] text-ink-1/[0.05] lg:right-10 lg:text-[90px]'>
              {tValues(`${section.key}.eyebrow`)}
            </p>

            <motion.div
              initial={sectionRevealInitial}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={sectionRevealTransition}
              className={cn(
                'relative mx-auto grid w-full max-w-[1400px] items-center gap-8 px-4 sm:px-8 lg:grid-cols-2',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
              )}
            >
              <div className='relative'>
                <div className='inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-brand-soft'>
                  <Compass className='h-3.5 w-3.5' />
                  {tValues(`${section.key}.eyebrow`)}
                </div>
                <h3 className='mt-4 text-2xl sm:text-3xl md:text-4xl font-black leading-tight'>
                  {tValues(`${section.key}.title`)}
                </h3>
                <p className='mt-4 text-base leading-relaxed text-ink-2'>
                  {tValues(`${section.key}.intro`)}
                </p>

                <div className='mt-5 rounded-2xl border border-line bg-well p-4'>
                  <p className='text-[11px] uppercase tracking-[0.16em] text-brand-soft'>
                    {tValues('evidenceLabel')}
                  </p>
                  <ul className='mt-3 space-y-2 text-sm text-ink-2 leading-relaxed'>
                    {bullets.map((bullet, bulletIndex) => (
                      <li key={bullet} className='flex gap-2.5'>
                        <span className='mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand/50 bg-brand/18 text-[10px] font-semibold text-brand-soft'>
                          {bulletIndex + 1}
                        </span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className='mt-5 text-brand-soft font-semibold'>
                  {tValues(`${section.key}.outro`)}
                </p>
                <div className='mt-5 flex flex-wrap items-center gap-3'>
                  <Link
                    href={`/tours?mode=location&name=${slugify(section.locationName)}`}
                    className='inline-flex items-center gap-2 rounded-full border border-brand/45 bg-brand/15 px-5 py-2.5 text-sm font-semibold text-brand-soft hover:bg-brand/25 transition-colors'
                  >
                    {tValues(`${section.key}.ctaLabel`)}
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                  <span className='rounded-full border border-line-2 bg-surface px-4 py-2 text-xs text-ink-2'>
                    {tValues(`${section.key}.difficulty`)}
                  </span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 18 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: ANIMATION_EASE }}
                className='relative overflow-hidden rounded-[30px] border border-line shadow-[var(--shadow-brand)]'
              >
                <Image
                  src={section.image}
                  alt={tValues(`${section.key}.imageAlt`)}
                  width={1500}
                  height={980}
                  className='h-[300px] sm:h-[380px] lg:h-[450px] w-full object-cover'
                  unoptimized={section.image.startsWith('http')}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent' />
                <div className='theme-dark text-ink-1 absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-line-3 bg-black/45 px-3 py-1.5 text-xs backdrop-blur-md'>
                  <Stars className='h-3.5 w-3.5 text-brand-soft' />
                  {tValues('journeyBadge')}
                </div>
                <div className='theme-dark text-ink-1 absolute bottom-5 left-5 right-5 rounded-2xl border border-line-2 bg-black/45 p-4 backdrop-blur-md'>
                  <p className='text-xs uppercase tracking-[0.2em] text-brand-soft'>
                    {tValues('keywordHighlight')}
                  </p>
                  <p className='mt-1 text-lg font-semibold'>
                    {tValues(`${section.key}.title`)}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </section>
        );
      })}
    </>
  );
}

export function HomeFeaturedRoutesSection() {
  const t = useTranslations('home.featuredRoutes');
  const { data, isPending, isError } = useFeaturedRoutesQuery();
  const { mainRoute, sideRoutes, highlightAudience } =
    buildHomeFeaturedRoutesViewModel(data);

  const mainRouteAudienceLabel = mainRoute
    ? formatSuitableAudiences(mainRoute.suitable_audiences)
    : '';

  return (
    <section className='relative border-t border-line/60 bg-gradient-to-b from-elev-2 via-elev-3 to-elev-4 py-14 sm:py-16 lg:py-20'>
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,var(--sheen)_0%,transparent_28%)]' />
      <div className='pointer-events-none absolute inset-0 opacity-65 bg-[radial-gradient(100%_86%_at_14%_10%,var(--brand-glow)_0%,transparent_58%)]' />
      <motion.div
        initial={sectionRevealInitial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionRevealTransition}
        className='relative mx-auto w-full max-w-[1400px] space-y-10 px-4 sm:px-8'
      >
        <div className='space-y-4 max-w-4xl'>
          <p className='inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-brand-soft'>
            <ShieldCheck className='h-4 w-4 text-brand-soft-2' />
            {t('eyebrow')}
          </p>
          <h2 className='text-2xl sm:text-3xl md:text-5xl font-black leading-tight'>
            {t('title')}
          </h2>
        </div>

        {isPending ? (
          <HomeFeaturedRoutesLoadingState />
        ) : mainRoute ? (
          <>
            <div className='grid gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
              <article className='group max-h-[600px] h-[600px] relative overflow-hidden rounded-[32px] border border-line'>
                <Image
                  src={mainRoute.image_url || '/images/haithichdi1.jpg'}
                  alt={mainRoute.display_name}
                  width={1600}
                  height={1200}
                  className='h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]'
                  unoptimized={Boolean(mainRoute.image_url?.startsWith('http'))}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/78 via-black/25 to-transparent' />
                <div className='theme-dark text-ink-1 absolute inset-x-0 bottom-0 p-7'>
                  <p className='text-xs uppercase tracking-[0.22em] text-brand-soft'>
                    {t('mainRouteLabel')}
                  </p>
                  <h3 className='mt-2 text-2xl sm:text-3xl font-black'>
                    {mainRoute.display_name}
                  </h3>
                  {mainRoute.summary ? (
                    <p className='mt-3 max-w-2xl text-sm text-ink-2'>
                      {mainRoute.summary}
                    </p>
                  ) : null}
                  {mainRouteAudienceLabel ? (
                    <p className='mt-2 text-sm font-semibold text-brand-soft'>
                      {t('suitableFor', { audience: mainRouteAudienceLabel })}
                    </p>
                  ) : null}
                  <Link
                    href={`/tours?mode=location&name=${slugify(mainRoute.name)}`}
                    className='mt-4 inline-flex items-center gap-2 rounded-full border border-brand/45 bg-brand/18 px-5 py-2 text-sm font-semibold text-brand-soft hover:bg-brand/28 transition-colors'
                  >
                    {t('viewSchedule', { route: mainRoute.name })}
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                </div>
              </article>

              <div className='grid gap-4 sm:grid-cols-2 lg:h-[600px] lg:grid-cols-1 lg:grid-rows-3'>
                {sideRoutes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    className='h-full'
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: ANIMATION_EASE, delay: index * 0.06 }}
                  >
                    <Link
                      href={`/tours?mode=location&name=${slugify(route.name)}`}
                      className='group relative block h-40 overflow-hidden rounded-3xl border border-line sm:h-52 lg:h-full'
                    >
                      <Image
                        src={route.image_url || '/images/tachinhu1.jpg'}
                        alt={route.display_name}
                        width={1200}
                        height={780}
                        className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                        unoptimized={Boolean(route.image_url?.startsWith('http'))}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/72 to-black/15' />
                      <div className='theme-dark text-ink-1 absolute inset-x-0 bottom-0 p-4'>
                        <p className='text-lg font-bold'>{route.display_name}</p>
                        {route.subtitle ? (
                          <p className='text-sm text-ink-2'>{route.subtitle}</p>
                        ) : null}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className='rounded-[30px] border border-line bg-gradient-to-br from-surface-2 via-well to-well-2 p-6 backdrop-blur-sm'>
              <p className='text-sm text-ink-2'>
                {highlightAudience?.description || t('noAudienceDescription')}
              </p>
              <p className='mt-2 text-sm font-semibold text-brand-soft'>
                {highlightAudience
                  ? t('suitableFor', { audience: highlightAudience.title })
                  : t('suitableForUpdating')}
              </p>
              <div className='mt-5 flex flex-wrap gap-2.5'>
                {highlightAudience?.locations.length ? (
                  highlightAudience.locations.map((route) => (
                    <Link
                      key={route.id}
                      href={`/tours?mode=location&name=${slugify(route.name)}`}
                      className='rounded-full border border-line bg-well px-4 py-2 text-sm text-ink-2 transition-colors hover:border-brand/60 hover:text-ink-1'
                    >
                      {route.name}
                    </Link>
                  ))
                ) : (
                  <span className='text-sm text-ink-4'>
                    {t('noRoutesForAudience')}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <HomeFeaturedRoutesEmptyState isError={isError} />
        )}
      </motion.div>
    </section>
  );
}

function HomeFeaturedRoutesLoadingState() {
  return (
    <>
      <div className='grid gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
        <div className='min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] rounded-[32px] border border-line bg-surface animate-pulse' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`home-featured-route-skeleton-${index}`}
              className='h-40 rounded-3xl border border-line bg-surface animate-pulse'
            />
          ))}
        </div>
      </div>

      <div className='h-48 rounded-[30px] border border-line bg-surface animate-pulse' />
    </>
  );
}

function HomeFeaturedRoutesEmptyState({ isError }: { isError: boolean }) {
  const t = useTranslations('home.featuredRoutes');

  return (
    <div className='rounded-[30px] border border-line bg-gradient-to-br from-surface via-well to-well-2 p-6 backdrop-blur-sm'>
      <p className='text-sm text-ink-2'>
        {isError ? t('loadError') : t('empty')}
      </p>
    </div>
  );
}
