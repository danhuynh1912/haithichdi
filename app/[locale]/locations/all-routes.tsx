import Image from 'next/image';
import { ChevronRight, Gauge } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCachedLocations } from '@/lib/services/locations-cached';
import { formatDifficulty, slugify } from '@/lib/utils';

/** Same stand-in the home page uses when a route has no photo of its own. */
const FALLBACK_IMAGE = '/images/tachinhu1.jpg';

/**
 * Every route, as a card, rendered on the server.
 *
 * This replaced a carousel that painted nothing until its query resolved in
 * the browser: what reached a crawler was a spinner — no heading, no text, and
 * not one link to any of the thirteen route pages, which were left to be found
 * through the sitemap alone. Google's own URL inspector confirmed it, reporting
 * "no referring page detected" for a route that had been in the sitemap for
 * days and had never been crawled.
 *
 * Readers get the better end of the same deal: the whole list at a glance
 * rather than dragging a carousel thirteen times to see what is on offer.
 */
export default async function AllRoutes({ locale }: { locale: Locale }) {
  const [locations, t, tCommon] = await Promise.all([
    getCachedLocations(locale),
    getTranslations({ locale, namespace: 'locations.index' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  return (
    <main className='min-h-screen bg-elev-0 px-4 pt-24 pb-16 md:px-8'>
      <div className='mx-auto max-w-[1400px]'>
        <p className='text-brand mb-1 text-[10px] font-bold tracking-[0.14em] uppercase md:text-sm md:tracking-[0.3em]'>
          {t('eyebrow')}
        </p>
        <h1 className='text-ink-1 text-2xl font-black tracking-tight uppercase md:text-4xl'>
          {t('heading')}
        </h1>
        <p className='text-ink-3 mt-3 max-w-2xl text-sm md:text-base'>
          {t('subheading')}
        </p>

        {/* One flat row per route on a phone, where a grid of cards would make
            both the photo and the summary too small to be worth showing; the
            card grid returns once there is width for it. */}
        <ul className='mt-8 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-3 md:gap-5 xl:grid-cols-4'>
          {locations.map((location) => (
            <li key={location.id}>
              <Link
                href={`/locations/${slugify(location.name)}`}
                className='group border-line bg-surface flex h-full overflow-hidden rounded-2xl border transition-colors hover:border-brand/60 md:flex-col md:rounded-3xl'
              >
                <span className='relative block w-32 shrink-0 self-stretch overflow-hidden sm:w-40 md:aspect-4/3 md:w-auto md:self-auto'>
                  <Image
                    src={location.full_image_url || FALLBACK_IMAGE}
                    alt={location.name}
                    fill
                    sizes='(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 160px'
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                  {location.difficulty != null && (
                    // Same pill the route cards on the home page wear, and it
                    // stays on the photo at every width: the icon and "7/10"
                    // fit even the 128px thumbnail a phone gets.
                    <span className='absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm md:gap-1.5 md:px-2.5 md:text-xs'>
                      <Gauge className='size-3.5' />
                      <span className='sr-only'>{tCommon('difficulty')}: </span>
                      {formatDifficulty(location.difficulty)}/10
                    </span>
                  )}

                  {/* The name sits over the photo only where the photo is wide
                      enough to hold it; on a phone it moves beside it, below. */}
                  <span className='absolute inset-0 hidden bg-linear-to-t from-black/80 via-black/25 to-black/5 md:block' />
                  <span className='theme-dark text-ink-1 absolute right-3 bottom-3 left-3 hidden flex-col gap-0.5 md:flex'>
                    <span className='text-sm leading-tight font-semibold md:text-base'>
                      {location.name}
                    </span>
                    {location.elevation_m > 0 && (
                      <span className='text-ink-3 text-xs'>
                        {t('elevation', { value: location.elevation_m })}
                      </span>
                    )}
                  </span>
                </span>

                <span className='flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-3 md:gap-2 md:px-4'>
                  <span className='md:hidden'>
                    <span className='text-ink-1 block text-sm leading-tight font-bold'>
                      {location.name}
                    </span>
                    {location.elevation_m > 0 && (
                      <span className='text-ink-4 block text-xs'>
                        {t('elevation', { value: location.elevation_m })}
                      </span>
                    )}
                  </span>
                  {location.description && (
                    <span className='text-ink-3 line-clamp-2 text-xs leading-relaxed md:text-sm'>
                      {location.description}
                    </span>
                  )}
                  {/* A span, not a button: the whole card is already the link,
                      and a control nested inside one is invalid markup that
                      screen readers announce twice. */}
                  <span className='text-brand mt-auto inline-flex items-center gap-1 text-xs font-semibold md:text-sm'>
                    {t('viewMore')}
                    <ChevronRight
                      size={14}
                      strokeWidth={2.5}
                      className='transition-transform group-hover:translate-x-0.5'
                    />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
