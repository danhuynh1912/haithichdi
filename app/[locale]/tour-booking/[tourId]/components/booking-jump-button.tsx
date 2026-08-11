'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { TicketCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The one way anything on this page moves to the booking form, so the two
 * buttons that do it cannot drift into scrolling differently.
 *
 * `scroll-mt` on the target is what keeps the fixed header off the first
 * field — the offset lives with the element, not with each caller.
 */
export function scrollToBookingForm(target: HTMLElement | null) {
  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Takes the reader back to the booking form once they have scrolled past it.
 *
 * The form is the point of the page, but it sits near the top: by the time
 * someone has read the itinerary and the related tours they are several
 * screens below the only thing they can act on.
 */
export function BookingJumpButton({
  targetRef,
}: {
  targetRef: RefObject<HTMLElement | null>;
}) {
  const t = useTranslations('booking');
  const [visible, setVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Only when the form has gone off the *top*. Off the bottom means the
        // reader has not reached it yet and a "go back" button would be a lie.
        setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
      },
      { threshold: 0 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [targetRef]);

  const handleClick = () => {
    scrollToBookingForm(targetRef.current);
    // Scrolling up reveals the header, which would otherwise leave focus on a
    // button that has just slid out from under the reader's finger.
    buttonRef.current?.blur();
  };

  return (
    <button
      ref={buttonRef}
      type='button'
      onClick={handleClick}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        // Desktop only. On a phone the form is reached from the CTA under the
        // title instead, and this would land on top of the tab bar.
        'hidden md:inline-flex',
        'fixed right-4 z-[1100] items-center gap-2 rounded-full',
        'bg-brand px-5 py-3 text-sm font-semibold text-brand-ink',
        'shadow-[var(--shadow-soft)] hover:bg-brand-strong',
        'bottom-6',
        'transition-[opacity,translate,background-color] duration-300 ease-out',
        'motion-reduce:transition-none',
        visible
          ? 'opacity-100 translate-y-0'
          : 'pointer-events-none opacity-0 translate-y-4',
      )}
    >
      <TicketCheck size={18} />
      {t('jumpToForm')}
    </button>
  );
}
