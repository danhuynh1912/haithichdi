'use client';

import { useTranslations } from 'next-intl';
import { Home, Mountain, TicketCheck, Users } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

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
    key: 'about',
    href: '/about',
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

  return (
    <nav className='md:hidden fixed inset-x-0 bottom-0 z-[1200] border-t border-line bg-elev-0/90 backdrop-blur-xl'>
      <div className='mx-auto max-w-lg px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] grid grid-cols-4 gap-1'>
        {MOBILE_TABS.map(({ key, href, labelKey, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={key}
              href={href}
              aria-label={t(labelKey)}
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
