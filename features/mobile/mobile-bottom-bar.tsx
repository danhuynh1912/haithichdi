'use client';

import { useTranslations } from 'next-intl';
import { Home, Mountain, Newspaper, TicketCheck, Users } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { useHideOnScrollDown } from '@/lib/hooks/use-hide-on-scroll-down';
import { scrollToHash } from '@/lib/scroll-to-hash';

const MOBILE_TABS = [
  {
    key: 'home',
    href: '/',
    labelKey: 'home',
    Icon: Home,
    match: (pathname: string) => pathname === '/',
  },
  {
    key: 'tours',
    href: '/tours',
    labelKey: 'tours',
    Icon: Mountain,
    match: (pathname: string) =>
      pathname === '/tours' ||
      pathname.startsWith('/tours/') ||
      pathname === '/locations' ||
      pathname.startsWith('/locations'),
  },
  {
    key: 'blog',
    href: '/blog',
    labelKey: 'blog',
    Icon: Newspaper,
    match: (pathname: string) => pathname === '/blog' || pathname.startsWith('/blog/'),
  },
  {
    // The section on the home page, matching the desktop header. `/about` is a
    // separate page that says the same thing twice.
    key: 'about',
    href: '/#about-us',
    labelKey: 'about',
    Icon: Users,
    match: (pathname: string) => pathname === '/about' || pathname.startsWith('/about/'),
  },
  {
    key: 'bookings',
    href: '/my-bookings',
    labelKey: 'myBookingsShort',
    Icon: TicketCheck,
    match: (pathname: string) =>
      pathname === '/my-bookings' || pathname.startsWith('/my-bookings/'),
  },
] as const;

export default function MobileBottomBar() {
  const t = useTranslations('nav');
  const pathname = usePathname() || '/';
  const { hidden, reveal } = useHideOnScrollDown();

  // /chatbot là chat fullscreen — bar này sẽ đè lên ô nhập tin nhắn.
  if (pathname === '/chatbot') return null;

  return (
    <nav
      onFocusCapture={reveal}
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-[1200] border-t border-line bg-elev-0/90 backdrop-blur-xl',
        'transition-transform duration-300 motion-reduce:transition-none',
        // Full height covers the safe-area padding too, so nothing peeks out
        // below the home indicator.
        hidden && 'translate-y-full',
      )}
    >
      <div className='mx-auto max-w-lg px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] grid grid-cols-5 gap-1'>
        {MOBILE_TABS.map(({ key, href, labelKey, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={key}
              href={href}
              aria-label={t(labelKey)}
              onClick={(event) => {
                // Already on the page that owns the section: scroll to it
                // rather than asking the router to navigate to where we are.
                const [, hash] = href.split('#');
                if (hash && pathname === '/' && scrollToHash(hash)) event.preventDefault();
              }}
              className={cn(
                'h-12 rounded-2xl flex items-center justify-center transition-colors duration-150',
                active
                  ? 'bg-brand/18 text-brand-soft active:bg-brand/30'
                  : 'text-ink-4 hover:text-ink-1 hover:bg-surface active:bg-surface-3',
              )}
            >
              <Icon size={20} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
