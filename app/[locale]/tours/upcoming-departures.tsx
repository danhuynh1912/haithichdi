import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { tourService } from '@/lib/services/tour';
import { formatDateDdMm } from '@/lib/utils';

/** Enough to cover a season without turning the page into a wall of links. */
const MAX_ROWS = 40;

/**
 * Tour titles are entered with their departure date on the end — "Chinh phục
 * Tà Chì Nhù (30/08)" — which this list already prints in its own column.
 */
const stripTrailingDate = (title: string) =>
  title.replace(/\s*\(\d{1,2}\/\d{1,2}(\/\d{2,4})?\)\s*$/, '');

/**
 * Every upcoming departure as a plain link, rendered on the server.
 *
 * The screen above defaults to the calendar view, so the served HTML carried
 * links to only the four tours falling in the current month — the other thirty
 * existed for a crawler only as rows in the sitemap. This is also the one view
 * that answers "what is running and when" without clicking through months.
 */
export default async function UpcomingDepartures({ locale }: { locale: Locale }) {
  const [tours, t] = await Promise.all([
    tourService.getTours(locale).catch(() => []),
    getTranslations({ locale, namespace: 'tours.departures' }),
  ]);

  // Compared as `YYYY-MM-DD` strings in the business timezone rather than as
  // Date objects: a tour leaving today should still be listed, and parsing to
  // UTC midnight would drop it from the evening of the day before.
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  const upcoming = tours
    .filter((tour) => tour.start_date && tour.start_date >= today)
    .slice(0, MAX_ROWS);

  if (upcoming.length === 0) return null;

  return (
    <section className='border-t border-line/60 bg-elev-1 py-14 sm:py-16'>
      <div className='container mx-auto px-4'>
        <h2 className='text-ink-1 text-xl md:text-3xl font-black uppercase tracking-tight'>
          {t('heading')}
        </h2>
        <p className='mt-2 max-w-2xl text-sm md:text-base text-ink-3'>
          {t('subheading')}
        </p>

        <ul className='mt-8 grid gap-2 sm:grid-cols-2'>
          {upcoming.map((tour) => (
            <li key={tour.id}>
              <Link
                href={`/tour-booking/${tour.id}`}
                className='group flex items-baseline gap-3 rounded-xl border border-line/60 bg-elev-0 px-4 py-3 transition-colors hover:border-brand/60'
              >
                <span className='shrink-0 text-sm font-bold tabular-nums text-brand'>
                  {formatDateDdMm(tour.start_date!)}
                  {tour.end_date ? `–${formatDateDdMm(tour.end_date)}` : ''}
                </span>
                <span className='min-w-0 flex-1 truncate text-sm text-ink-1 group-hover:text-brand'>
                  {stripTrailingDate(tour.title)}
                </span>
                {tour.slots_left > 0 && (
                  <span className='shrink-0 text-xs text-ink-4'>
                    {t('slotsLeft', { count: tour.slots_left })}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
