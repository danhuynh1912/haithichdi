'use client';

import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * What staff wrote about a booking's status, shown to the customer.
 *
 * A status alone can leave someone stuck: "we could not reach you" is only
 * useful with the reason attached. When staff wrote nothing, a status that
 * asks for action still explains itself through the generic line — never a
 * bare badge with no way to act on it.
 */
export function BookingStatusNote({
  status,
  note,
  className,
}: {
  status: string;
  note: string;
  className?: string;
}) {
  const t = useTranslations('bookingStatusNote');
  const needsContact = status === 'needs_contact_check';
  const text = note.trim() || (needsContact ? t('needsContactHint') : '');

  if (!text) return null;

  return (
    <div
      className={cn(
        'flex gap-2.5 rounded-2xl border border-sky-500/40 bg-sky-500/8 p-3 text-left',
        className,
      )}
    >
      <Info size={16} className='mt-0.5 shrink-0 text-sky-600 dark:text-sky-300' />
      <div className='min-w-0'>
        <p className='text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300'>
          {t('heading')}
        </p>
        {/* whitespace-pre-line: staff type these by hand, and a note with two
            phone numbers on two lines should stay on two lines. */}
        <p className='mt-0.5 text-sm text-ink-2 whitespace-pre-line break-words'>{text}</p>
      </div>
    </div>
  );
}
