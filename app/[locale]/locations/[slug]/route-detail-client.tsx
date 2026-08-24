'use client';

import { useTranslations } from 'next-intl';
import { Mountain, CalendarDays, WalletCards, Gauge } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { MarkdownContent } from '@/components/markdown-content';
import { Expandable } from '@/components/expandable';
import { PriceInclusions } from '@/components/price-inclusions';
import { TourImageCollage } from '@/app/[locale]/tour-booking/[tourId]/components/tour-image-collage';
import { ItineraryAccordion } from '@/app/[locale]/tour-booking/[tourId]/components/itinerary-accordion';
import { TourCard } from '@/app/[locale]/tours/components/tour-card';
import { useLocationToursQuery } from '@/lib/services/queries';
import type { LocationDetail } from '@/lib/services/location';
import { formatDifficulty, slugify } from '@/lib/utils';

/** Departures listed inline before the reader is sent to the full list. */
const DEPARTURES_SHOWN = 5;

/**
 * A route on its own page, for sharing with someone who has not picked a
 * departure yet.
 *
 * It is the tour page with the two departure-specific blocks swapped out: the
 * booking form becomes the list of departures for this route, and the itinerary
 * keeps its days but loses the dates, which only a departure can supply.
 */
export function RouteDetailClient({ location }: { location: LocationDetail }) {
  const t = useTranslations('routeDetail');
  const tCommon = useTranslations('common');
  const { data: departures = [] } = useLocationToursQuery(location.id);
  const upcoming = departures.slice(0, DEPARTURES_SHOWN);

  const nights = location.default_trek_days;
  const price = location.default_price;

  return (
    <main className='min-h-screen bg-elev-1 text-ink-1 flex flex-col pt-24 px-4 md:px-8'>
      <div className='w-full max-w-[1400px] mx-auto flex flex-col gap-6 lg:gap-8 pb-16'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl md:text-4xl font-black uppercase tracking-tight'>
            {location.name}
            {location.elevation_m > 0 && (
              <span className='text-ink-3'> {location.elevation_m}m</span>
            )}
          </h1>
          {location.summary && (
            <p className='text-sm md:text-base text-ink-3 max-w-4xl'>{location.summary}</p>
          )}
        </div>

        <section className='w-full'>
          <TourImageCollage
            title={location.name}
            images={location.images}
            fallbackImageUrl={location.full_image_url}
          />
        </section>

        <section className='grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_420px] items-start'>
          <div className='rounded-3xl border border-line bg-well p-5 md:p-8 space-y-6'>
            <div className='flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-ink-3'>
              <Chip icon={<Mountain size={14} className='text-brand' />}>
                {t('elevationLabel')}: {location.elevation_m}m
              </Chip>
              {nights > 0 && (
                <Chip icon={<CalendarDays size={14} className='text-brand' />}>
                  {t('durationLabel')}: {t('duration', { days: nights, nights })}
                </Chip>
              )}
              {location.difficulty != null && (
                <Chip icon={<Gauge size={14} className='text-brand' />}>
                  {tCommon('difficulty')}: {formatDifficulty(location.difficulty)}/10
                </Chip>
              )}
            </div>

            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
              <h2 className='text-2xl md:text-3xl font-black'>{t('descriptionHeading')}</h2>

              <div className='rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3 min-w-[210px]'>
                <p className='text-[11px] uppercase tracking-[0.12em] text-ink-3 flex items-center gap-2'>
                  <WalletCards size={14} className='text-brand' />
                  {t('priceLabel')}
                </p>
                <p className='text-xl md:text-2xl font-black text-ink-1 mt-1'>
                  {price
                    ? `${price.toLocaleString('vi-VN')}₫`
                    : t('priceOnRequest')}
                </p>
              </div>
            </div>

            <Expandable>
              <MarkdownContent
                markdown={location.description_md || location.summary || ''}
                emptyMessage={tCommon('updating')}
              />
            </Expandable>

            {/* Under the write-up but inside the same card as the price box:
                the reader who scrolls past the description is still asking what
                the number above buys. */}
            <PriceInclusions
              includes={location.price_includes}
              excludes={location.price_excludes}
            />
          </div>

          {/* Where the booking form sits on a tour page. A route cannot be
              booked directly — picking a departure is the next step. */}
          <aside className='lg:sticky lg:top-28 rounded-3xl border border-line bg-elev-2 p-5 md:p-6 flex flex-col gap-4'>
            <div>
              <h2 className='text-lg font-black'>{t('departuresHeading')}</h2>
              <p className='mt-1 text-xs text-ink-4'>{t('departuresHint')}</p>
            </div>

            {upcoming.length ? (
              <ul className='flex flex-col gap-3'>
                {upcoming.map((tour) => (
                  <li key={tour.id}>
                    <TourCard tour={tour} showImage={false} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className='rounded-2xl border border-line bg-well p-4 text-sm text-ink-4'>
                {t('departuresEmpty')}
              </p>
            )}

            {/* Straight to the tours list with this route already ticked, so
                the reader lands on its departures rather than on everything. */}
            <Link
              href={{ pathname: '/tours', query: { location: slugify(location.name) } }}
              className='mt-auto inline-flex items-center justify-center rounded-2xl border border-line-3 px-4 py-2.5 text-sm font-semibold text-ink-2 transition-colors hover:border-brand hover:text-brand'
            >
              {departures.length > DEPARTURES_SHOWN
                ? t('departuresSeeAll', { count: departures.length })
                : t('backToTours')}
            </Link>
          </aside>
        </section>

        {location.itinerary_days.length > 0 && (
          <section className='space-y-4'>
            <div className='space-y-2'>
              <h2 className='text-2xl md:text-3xl font-black'>{t('itineraryHeading')}</h2>
              <p className='text-xs md:text-sm text-ink-4'>{t('itineraryHint')}</p>
            </div>
            <ItineraryAccordion days={location.itinerary_days} />
          </section>
        )}
      </div>
    </main>
  );
}

function Chip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5'>
      {icon}
      {children}
    </span>
  );
}
