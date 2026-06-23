'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Mountain, TicketCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOBILE_TABS = [
  {
    key: 'home',
    href: '/',
    label: 'Trang chủ',
    Icon: Home,
    match: (pathname: string) => pathname === '/',
  },
  {
    key: 'tours',
    href: '/tours',
    label: 'Tours',
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
    label: 'Về chúng tôi',
    Icon: Users,
    match: (pathname: string) => pathname === '/about' || pathname.startsWith('/about/'),
  },
  {
    key: 'bookings',
    href: '/my-bookings',
    label: 'Tours đã đặt',
    Icon: TicketCheck,
    match: (pathname: string) =>
      pathname === '/my-bookings' || pathname.startsWith('/my-bookings/'),
  },
];

export default function MobileBottomBar() {
  const pathname = usePathname() || '/';

  return (
    <nav className='md:hidden fixed inset-x-0 bottom-0 z-[1200] border-t border-white/10 bg-black/90 backdrop-blur-xl'>
      <div className='mx-auto max-w-lg px-3 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] grid grid-cols-4 gap-1'>
        {MOBILE_TABS.map(({ key, href, label, Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={key}
              href={href}
              aria-label={label}
              className={cn(
                'h-12 rounded-2xl flex items-center justify-center transition-colors duration-150',
                active
                  ? 'bg-[#d00600]/18 text-[#ffd0ce] active:bg-[#d00600]/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5 active:bg-white/12',
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
