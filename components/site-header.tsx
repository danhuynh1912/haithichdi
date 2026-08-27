'use client';

import Image from 'next/image';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { TicketCheck } from 'lucide-react';
import { scrollToHash } from '@/lib/scroll-to-hash';
import { Link, usePathname } from '@/i18n/navigation';
import { useLinkStatus } from 'next/link';
import { cn } from '@/lib/utils';
import {
  hasStoredBookingIds,
  subscribeBookingIdsChanged,
} from '@/lib/services/booking-storage';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { useHideOnScrollDown } from '@/lib/hooks/use-hide-on-scroll-down';
import LanguageSwitcher from '@/components/language-switcher';
import ThemeToggle from '@/components/theme-toggle';
import { getSiteHeroElement, subscribeSiteHero } from '@/lib/site-hero';
import { LOGO_INTRINSIC_PX } from '@/lib/constants';

/** Tallest the bar gets (lg breakpoint), in px — used for the hero overlap test. */
const HEADER_HEIGHT = 112;

/**
 * A menu item's label, with a sliver that runs along it while the page behind
 * the link is being fetched.
 *
 * The tour pages read from the database before they can render, which is a few
 * hundred milliseconds where a click looks like it did nothing. `useLinkStatus`
 * reports that from inside the Link, so the feedback costs nothing but a class:
 * no `loading.tsx`, and so no Suspense boundary — one of those would push the
 * page's real content into a streamed chunk that only appears once JS has run,
 * which is exactly what the server-rendering work was for.
 *
 * Rides the same underline slot the active state uses, so nothing moves.
 */
function NavLabel({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();

  return (
    <>
      {children}
      {pending ? (
        <span
          aria-hidden
          className='absolute left-0 -bottom-1.5 h-[3px] w-full overflow-hidden rounded-full'
        >
          <span className='nav-pending-sweep block h-full w-1/2 rounded-full bg-brand [animation:nav-pending-sweep_0.9s_ease-in-out_infinite]' />
        </span>
      ) : null}
    </>
  );
}

export default function SiteHeader() {
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const pathname = usePathname() || '/';
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const { hidden, reveal } = useHideOnScrollDown();
  const [overHero, setOverHero] = useState(false);
  const [showBookedToursItem, setShowBookedToursItem] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Screens that open on full-bleed media register it via `useSiteHeroRef`.
  // While the header still overlaps that media it keeps white copy in both
  // themes — light-theme text would sit unreadably on the footage.
  const hero = useSyncExternalStore(
    subscribeSiteHero,
    getSiteHeroElement,
    () => null,
  );

  useEffect(() => {
    if (!hero) {
      setOverHero(false);
      return;
    }

    const syncOverHero = () =>
      setOverHero(hero.getBoundingClientRect().bottom > HEADER_HEIGHT);

    syncOverHero();
    window.addEventListener('scroll', syncOverHero, { passive: true });
    window.addEventListener('resize', syncOverHero);

    return () => {
      window.removeEventListener('scroll', syncOverHero);
      window.removeEventListener('resize', syncOverHero);
    };
  }, [hero]);

  useEffect(() => {
    const syncBookedToursItem = () => {
      setShowBookedToursItem(hasStoredBookingIds());
    };

    syncBookedToursItem();
    const unsubscribe = subscribeBookingIdsChanged(syncBookedToursItem);

    return unsubscribe;
  }, []);

  const navItemClass = (active: boolean) =>
    cn(
      'relative text-ink-3 hover:text-ink-1 transition-colors whitespace-nowrap',
      "after:absolute after:left-0 after:-bottom-1.5 after:h-[3px] after:w-full after:origin-left after:rounded-full after:bg-brand after:transition-transform",
      active ? 'text-ink-1 after:scale-x-100' : 'after:scale-x-0',
    );

  const isHomeActive = pathname === '/';
  const isLocationsActive = pathname === '/locations' || pathname.startsWith('/locations/');
  const isToursActive =
    pathname === '/tours' ||
    pathname.startsWith('/tours/') ||
    pathname.startsWith('/tour-booking/');
  const isBlogActive = pathname === '/blog' || pathname.startsWith('/blog/');
  const isCampaignsActive = pathname.startsWith('/thien-nguyen');
  const isAboutActive = pathname === '/about' || pathname.startsWith('/about/');
  const isContactActive = pathname === '/contact' || pathname.startsWith('/contact/');
  const isBookingsActive = pathname === '/my-bookings' || pathname.startsWith('/my-bookings/');

  return (
    <header
      onFocusCapture={reveal}
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] text-ink-1 flex items-center justify-between px-6 py-4 lg:px-8 lg:py-6 bg-gradient-to-b from-elev-2 to-transparent',
        // `translate`, not `transform`: the -translate-y utility compiles to the
        // translate property, and naming the wrong one here transitions nothing
        // — the bar jumps instead of sliding. One declaration covers both
        // properties, since a second would replace this one rather than add.
        'transition-[translate,background-color] duration-300 ease-out motion-reduce:transition-none',
        hidden && '-translate-y-full',
        // Over the hero the bar keeps the dark palette in both themes, so the
        // fade and every control inside it read against the footage.
        overHero && 'theme-dark',
        scrolled && 'backdrop-blur-md shadow-lg',
      )}
    >
      <Link
        href='/'
        aria-label={tCommon('brand')}
        className='inline-flex items-center shrink-0'
      >
        {/* Both marks ship so the light/dark swap is pure CSS — a JS-driven
            `src` would flash the wrong logo before the theme is known. The
            hero case is the one that has to be decided in JS. */}
        <Image
          src='/haithichdi-logo-red.png'
          alt={tCommon('brand')}
          width={LOGO_INTRINSIC_PX}
          height={LOGO_INTRINSIC_PX}
          priority
          className={cn(
            'h-11 md:h-16 w-auto hover:opacity-85 transition-opacity',
            overHero ? 'hidden' : 'dark:hidden',
          )}
        />
        <Image
          src='/haithichdi-logo-white.png'
          alt=''
          aria-hidden='true'
          width={LOGO_INTRINSIC_PX}
          height={LOGO_INTRINSIC_PX}
          priority
          className={cn(
            'h-11 md:h-16 w-auto hover:opacity-85 transition-opacity',
            overHero ? 'block' : 'hidden dark:block',
          )}
        />
      </Link>
      <div className='flex items-center gap-4'>
        {isMobile && (
          <p className='text-[11px] leading-tight text-right text-ink-3 md:hidden'>
            {t.rich('greeting', {
              name: (chunks) => (
                <span className='font-semibold text-ink-1'>{chunks}</span>
              ),
            })}
          </p>
        )}
        <nav className='hidden md:flex gap-8 lg:gap-12 text-sm lg:text-base'>
          <Link href='/' className={navItemClass(isHomeActive)}>
            <NavLabel>{t('home')}</NavLabel>
          </Link>
          <Link href='/locations' className={navItemClass(isLocationsActive)}>
            <NavLabel>{t('locations')}</NavLabel>
          </Link>
          <Link href='/tours' className={navItemClass(isToursActive)}>
            <NavLabel>{t('tours')}</NavLabel>
          </Link>
          <Link href='/blog' className={navItemClass(isBlogActive)}>
            <NavLabel>{t('blog')}</NavLabel>
          </Link>
          <Link href='/thien-nguyen' className={navItemClass(isCampaignsActive)}>
            {t('campaigns')}
          </Link>
          {/* Both point at sections of the home page. When the reader is
              already there, scroll instead of routing to where they are. */}
          <Link
            href='/#about-us'
            onClick={(event) => {
              if (pathname === '/' && scrollToHash('about-us')) event.preventDefault();
            }}
            className={navItemClass(isAboutActive)}
          >
            {t('about')}
          </Link>
          <Link
            href='/#site-footer'
            onClick={(event) => {
              if (scrollToHash('site-footer')) event.preventDefault();
            }}
            className={navItemClass(isContactActive)}
          >
            {t('contact')}
          </Link>
          {showBookedToursItem && (
            <Link
              href='/my-bookings'
              className={cn(navItemClass(isBookingsActive), 'inline-flex items-center gap-2')}
            >
              <TicketCheck size={16} />
              {t('myBookings')}
            </Link>
          )}
        </nav>
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
