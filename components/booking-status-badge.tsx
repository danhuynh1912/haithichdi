'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  getBookingStatusTone,
  isBookingStatus,
  type BookingStatusTone,
} from '@/lib/services/booking';

const STATUS_BADGE_CLASS: Record<BookingStatusTone, string> = {
  warning:
    'border-amber-500/45 bg-amber-500/12 text-amber-700 dark:text-amber-200 shadow-[inset_0_0_0_1px_var(--brand-tint)]',
  success:
    'border-success-line bg-success-tint text-success-soft shadow-[inset_0_0_0_1px_var(--success-tint)]',
  danger:
    'border-brand/45 bg-brand/12 text-brand-soft shadow-[inset_0_0_0_1px_var(--brand-line)]',
  action:
    'border-sky-500/45 bg-sky-500/12 text-sky-700 dark:text-sky-200 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.12)]',
};

interface BookingStatusBadgeProps {
  status: string;
  /** Prefix the label, e.g. "Status: Confirmed". */
  withPrefix?: boolean;
  className?: string;
}

export default function BookingStatusBadge({
  status,
  withPrefix,
  className,
}: BookingStatusBadgeProps) {
  const t = useTranslations('bookingStatus');

  // An unknown status from the API degrades to its raw code rather than a
  // missing-translation placeholder.
  const label = isBookingStatus(status) ? t(status) : status;
  const content = withPrefix ? `${t('prefix')}: ${label}` : label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border',
        STATUS_BADGE_CLASS[getBookingStatusTone(status)],
        className,
      )}
    >
      <span className='h-2 w-2 rounded-full bg-current opacity-80' />
      {content}
    </span>
  );
}
