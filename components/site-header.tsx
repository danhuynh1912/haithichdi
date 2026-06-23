'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TicketCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  hasStoredBookingIds,
  subscribeBookingIdsChanged,
} from '@/lib/services/booking-storage';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

export default function SiteHeader() {
  const pathname = usePathname() || '/';
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);
  const [showBookedToursItem, setShowBookedToursItem] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 0);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      'relative text-neutral-300 hover:text-white transition-colors whitespace-nowrap',
      "after:absolute after:left-0 after:-bottom-1.5 after:h-[3px] after:w-full after:origin-left after:rounded-full after:bg-[#d00600] after:transition-transform",
      active ? 'text-white after:scale-x-100' : 'after:scale-x-0',
    );

  const isHomeActive = pathname === '/';
  const isLocationsActive = pathname === '/locations' || pathname.startsWith('/locations/');
  const isToursActive =
    pathname === '/tours' ||
    pathname.startsWith('/tours/') ||
    pathname.startsWith('/tour-booking/');
  const isAboutActive = pathname === '/about' || pathname.startsWith('/about/');
  const isContactActive = pathname === '/contact' || pathname.startsWith('/contact/');
  const isBookingsActive = pathname === '/my-bookings' || pathname.startsWith('/my-bookings/');

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[1000] text-white flex items-center justify-between px-6 py-4 lg:px-8 lg:py-6 bg-gradient-to-b from-[#111111] to-black/0 transition-colors',
        scrolled && 'backdrop-blur-md shadow-lg',
      )}
    >
      <Link
        href='/'
        aria-label='Hải Thích Đi'
        className='inline-flex items-center shrink-0'
      >
        <Image
          src='/haithichdi-logo-white.png'
          alt='Hải Thích Đi'
          width={2366}
          height={2366}
          priority
          className='h-11 md:h-16 w-auto hover:opacity-85 transition-opacity'
        />
      </Link>
      <div className='flex items-center gap-4'>
        {isMobile && (
          <p className='text-[11px] leading-tight text-right text-neutral-300 md:hidden'>
            Xin chào, <span className='font-semibold text-white'>Trekker</span>
          </p>
        )}
        <nav className='hidden md:flex gap-8 lg:gap-12 text-sm lg:text-base'>
          <Link href='/' className={navItemClass(isHomeActive)}>
            Trang chủ
          </Link>
          <Link href='/locations' className={navItemClass(isLocationsActive)}>
            Cung nổi bật
          </Link>
          <Link href='/tours' className={navItemClass(isToursActive)}>
            Tours
          </Link>
          <Link href='/#about-us' className={navItemClass(isAboutActive)}>
            Về chúng tôi
          </Link>
          <Link href='/#site-footer' className={navItemClass(isContactActive)}>
            Liên hệ
          </Link>
          {showBookedToursItem && (
            <Link
              href='/my-bookings'
              className={cn(navItemClass(isBookingsActive), 'inline-flex items-center gap-2')}
            >
              <TicketCheck size={16} />
              Tours bạn đã đặt
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
