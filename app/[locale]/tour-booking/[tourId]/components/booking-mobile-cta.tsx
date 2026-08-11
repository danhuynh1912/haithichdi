'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { TicketCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHideOnScrollDown } from '@/lib/hooks/use-hide-on-scroll-down';
import { scrollToBookingForm } from './booking-jump-button';

/**
 * Height of the site header on a phone: the 44px logo plus its 16px of
 * padding top and bottom. The pinned bar sits directly under it rather than
 * at the top of the screen, so the two never cover each other.
 */
const MOBILE_HEADER_HEIGHT = 76;

/**
 * The booking call to action on a phone, in two places at once.
 *
 * Inline under the summary, where it answers "how do I book this" at the
 * moment the reader first wonders. Then pinned to the top once that copy
 * scrolls away, so the answer stays reachable through the itinerary and
 * everything below it.
 */
export function BookingMobileCta({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const t = useTranslations('booking');
  const inlineRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);

  // The same signal the header uses, so the bar tracks it instead of guessing:
  // when the header slides away the bar takes the top of the screen, and it
  // steps back down as the header returns.
  const { hidden: headerHidden } = useHideOnScrollDown();

  useEffect(() => {
    const inline = inlineRef.current;
    if (!inline) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Above the viewport only. Below it means the reader has not reached
        // the inline button yet and there is nothing to stand in for.
        setPinned(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 },
    );

    observer.observe(inline);
    return () => observer.disconnect();
  }, []);

  const button = (className?: string) => (
    <button
      type='button'
      onClick={() => scrollToBookingForm(targetRef.current)}
      className={cn(
        'inline-flex w-full items-center justify-center gap-2 rounded-full',
        'bg-brand px-6 py-3.5 text-sm font-semibold text-brand-ink',
        'shadow-[var(--shadow-soft)] transition-colors active:bg-brand-strong',
        className,
      )}
    >
      <TicketCheck size={18} />
      {t('registerNow')}
    </button>
  );

  return (
    <>
      {/* Phones stack the form below the description, the itinerary and the
          related tours. On a wide screen it already sits beside this text. */}
      <div ref={inlineRef} className='md:hidden mt-2'>
        {button()}
      </div>

      <div
        aria-hidden={!pinned}
        style={{ top: headerHidden ? 0 : MOBILE_HEADER_HEIGHT }}
        className={cn(
          'md:hidden fixed inset-x-0 z-[900] px-4 pb-2',
          'transition-[top,opacity,translate] duration-300 ease-out',
          'motion-reduce:transition-none',
          pinned
            ? 'opacity-100 translate-y-0'
            : 'pointer-events-none opacity-0 -translate-y-3',
        )}
      >
        {button('shadow-lg')}
      </div>
    </>
  );
}
