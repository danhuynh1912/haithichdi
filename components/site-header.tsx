'use client';

import Image from 'next/image';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { TicketCheck } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
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

/** Tallest the bar gets (lg breakpoint), in px — used for the hero overlap test. */
const HEADER_HEIGHT = 112;

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
  const isAboutActive = pathname === '/about' || pathname.startsWith('/about/');
  const isContactActive = pathname === '/contact' || pathname.startsWith('/contact/');
  const isBookingsActive = pathname === '/my-bookings' || pathname.startsWith('/my-bookings/');

  return (
    <header
      onFocusCapture={reveal}
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] text-ink-1 flex items-center justify-between px-6 py-4 lg:px-8 lg:py-6 bg-gradient-to-b from-elev-2 to-transparent',
        // One declaration for both, so neither overrides the other: they are
        // the same CSS property and the last rule in the sheet would win.
        'transition-[transform,background-color] duration-300 motion-reduce:transition-none',
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
          width={2366}
          height={2366}
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
          width={2366}
          height={2366}
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
            {t('home')}
          </Link>
          <Link href='/locations' className={navItemClass(isLocationsActive)}>
            {t('locations')}
          </Link>
          <Link href='/tours' className={navItemClass(isToursActive)}>
            {t('tours')}
          </Link>
          <Link href='/blog' className={navItemClass(isBlogActive)}>
            {t('blog')}
          </Link>
          <Link href='/#about-us' className={navItemClass(isAboutActive)}>
            {t('about')}
          </Link>
          <Link href='/#site-footer' className={navItemClass(isContactActive)}>
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
