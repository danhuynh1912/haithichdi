'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { TicketCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    // scroll-mt on the target keeps the fixed header off the first field.
    targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        'fixed right-4 z-[1100] inline-flex items-center gap-2 rounded-full',
        'bg-brand px-5 py-3 text-sm font-semibold text-brand-ink',
        'shadow-[var(--shadow-soft)] hover:bg-brand-strong',
        // Clear of the mobile tab bar, which owns the bottom of the screen up
        // to the home indicator. Above md that bar is gone.
        'bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6',
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
