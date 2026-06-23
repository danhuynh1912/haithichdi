'use client';

import { cn } from '@/lib/utils';
import { getBookingStatusMeta } from '@/lib/services/booking';

const STATUS_BADGE_CLASS = {
  warning:
    'border-amber-400/45 bg-amber-500/12 text-amber-200 shadow-[inset_0_0_0_1px_rgba(208,6,0,0.16)]',
  success:
    'border-emerald-400/45 bg-emerald-500/12 text-emerald-200 shadow-[inset_0_0_0_1px_rgba(46,211,125,0.2)]',
  danger:
    'border-red-400/45 bg-red-500/12 text-red-200 shadow-[inset_0_0_0_1px_rgba(208,6,0,0.25)]',
} as const;

interface BookingStatusBadgeProps {
  status: string;
  label?: string;
  prefix?: string;
  className?: string;
}

export default function BookingStatusBadge({
  status,
  label,
  prefix,
  className,
}: BookingStatusBadgeProps) {
  const meta = getBookingStatusMeta(status, label);
  const content = prefix ? `${prefix}: ${meta.label}` : meta.label;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border',
        STATUS_BADGE_CLASS[meta.tone],
        className,
      )}
    >
      <span className='h-2 w-2 rounded-full bg-current opacity-80' />
      {content}
    </span>
  );
}
