import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { getCachedLocations } from '@/lib/services/locations-cached';
import { slugify } from '@/lib/utils';

/**
 * Every route, as plain links, rendered on the server.
 *
 * The carousel above this navigates with `router.push` and paints nothing
 * until its query resolves in the browser, so what reached a crawler was a
 * spinner: no heading, no text, and not one link to any of the twelve route
 * pages. They were left to be found through the sitemap alone, with nothing on
 * the site itself pointing at them — and a page nothing links to is a page the
 * rest of the site is not vouching for.
 *
 * Readers get the same thing the crawler does: the whole list at a glance,
 * instead of dragging a carousel twelve times to see what is on offer.
 */
export default async function AllRoutes({ locale }: { locale: Locale }) {
  const [locations, t] = await Promise.all([
    getCachedLocations(locale),
    getTranslations({ locale, namespace: 'locations.index' }),
  ]);

  if (locations.length === 0) return null;

  return (
    <section className='border-t border-line/60 bg-elev-1 py-14 sm:py-16'>
      <div className='container mx-auto px-4'>
        <h2 className='text-ink-1 text-xl md:text-3xl font-black uppercase tracking-tight'>
          {t('heading')}
        </h2>
        <p className='mt-2 max-w-2xl text-sm md:text-base text-ink-3'>
          {t('subheading')}
        </p>

        <ul className='mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          {locations.map((location) => (
            <li key={location.id}>
              <Link
                href={`/locations/${slugify(location.name)}`}
                className='group flex h-full flex-col rounded-2xl border border-line/60 bg-elev-0 p-4 transition-colors hover:border-brand/60'
              >
                <span className='flex items-baseline gap-2'>
                  <span className='font-bold text-ink-1 group-hover:text-brand'>
                    {location.name}
                  </span>
                  {location.elevation_m > 0 && (
                    <span className='text-xs font-medium text-ink-4'>
                      {t('elevation', { value: location.elevation_m })}
                    </span>
                  )}
                </span>
                {location.description && (
                  <span className='mt-1.5 line-clamp-2 text-sm text-ink-3'>
                    {location.description}
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
