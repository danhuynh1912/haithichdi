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
 * Every route, linked, rendered on the server.
 *
 * Two shapes of the same list, switched by CSS rather than by `useIsMobile` —
 * that resolves only after hydration, and a phone would paint one and then
 * swap it. On a desktop this is a band of text cards under the carousel; on a
 * phone, where the carousel is hidden and this is the whole screen, each row
 * opens out to put the photo beside the summary.
 *
 * Rendering it on the server is the point of it existing at all: the carousel
 * paints nothing until its query resolves in the browser, so this screen used
 * to reach a crawler as a spinner, with no link to any of the thirteen route
 * pages. Google's URL inspector confirmed it, reporting "no referring page
 * detected" for a route that had been in the sitemap for days and had never
 * been crawled.
 */
export default async function AllRoutes({ locale }: { locale: Locale }) {
  const [locations, t, tCommon] = await Promise.all([
    getCachedLocations(locale),
    getTranslations({ locale, namespace: 'locations.index' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  if (locations.length === 0) return null;

  return (
    // A screen of its own on a phone; a band under the carousel on a desktop.
    <section className='min-h-screen bg-elev-0 px-4 pt-24 pb-16 md:min-h-0 md:border-t md:border-line/60 md:bg-elev-1 md:px-0 md:pt-14 md:pb-16'>
      <div className='md:container md:mx-auto md:px-4'>
        <p className='text-brand mb-1 text-[10px] font-bold tracking-[0.14em] uppercase md:hidden'>
          {t('eyebrow')}
        </p>
        <h2 className='text-ink-1 text-2xl font-black tracking-tight uppercase md:text-3xl'>
          {t('heading')}
        </h2>
        <p className='text-ink-3 mt-2 max-w-2xl text-sm md:text-base'>
          {t('subheading')}
        </p>

        <ul className='mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3'>
          {locations.map((location) => (
            <li key={location.id}>
              <Link
                href={`/locations/${slugify(location.name)}`}
                className='group border-line/60 bg-surface flex h-full overflow-hidden rounded-2xl border transition-colors hover:border-brand/60 md:block md:bg-elev-0 md:p-4'
              >
                {/* The photo is the phone's affordance: with the carousel gone
                    there, a wall of text rows gives nothing to recognise a
                    route by. The desktop band sits under the carousel, which
                    is already thirteen photographs. */}
                <span className='relative block w-32 shrink-0 self-stretch overflow-hidden sm:w-40 md:hidden'>
                  <Image
                    src={location.full_image_url || FALLBACK_IMAGE}
                    alt={location.name}
                    fill
                    sizes='160px'
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                  />
                  {location.difficulty != null && (
                    <span className='absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm'>
                      <Gauge className='size-3.5' />
                      <span className='sr-only'>{tCommon('difficulty')}: </span>
                      {formatDifficulty(location.difficulty)}/10
                    </span>
                  )}
                </span>

                <span className='flex min-w-0 flex-1 flex-col gap-1.5 px-3 py-3 md:block md:p-0'>
                  <span className='md:flex md:items-baseline md:gap-2'>
                    <span className='text-ink-1 block text-sm leading-tight font-bold group-hover:text-brand md:text-base'>
                      {location.name}
                    </span>
                    {location.elevation_m > 0 && (
                      <span className='text-ink-4 block text-xs font-medium'>
                        {t('elevation', { value: location.elevation_m })}
                      </span>
                    )}
                    {/* No photo to sit on at this width, so the badge joins the
                        heading line instead. */}
                    {location.difficulty != null && (
                      <span className='text-ink-3 bg-muted/60 hidden items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium md:inline-flex'>
                        <Gauge className='size-3' />
                        <span className='sr-only'>{tCommon('difficulty')}: </span>
                        {formatDifficulty(location.difficulty)}/10
                      </span>
                    )}
                  </span>

                  {location.description && (
                    <span // `md:block` would undo the clamp: line-clamp works by setting
                    // `display: -webkit-box`, and any later `display` wins.
                    className='text-ink-3 line-clamp-2 text-xs leading-relaxed md:mt-1.5 md:text-sm'>
                      {location.description}
                    </span>
                  )}

                  <span className='text-brand inline-flex items-center gap-1 text-xs font-semibold md:mt-2 md:text-sm'>
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
    </section>
  );
}
