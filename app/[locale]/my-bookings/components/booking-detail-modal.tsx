'use client';

import { type ReactNode } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import {
  Calendar,
  Contact,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Ticket,
  UserRound,
} from 'lucide-react';
import BookingStatusBadge from '@/components/booking-status-badge';
import FullscreenModalShell from '@/components/fullscreen-modal-shell';
import { BookingDetail } from '@/lib/services/booking';
import { formatDateDdMm } from '@/lib/utils';

interface BookingDetailModalProps {
  booking: BookingDetail | null;
  onClose: () => void;
}

function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  tbdLabel: string,
) {
  if (!startDate) return tbdLabel;
  const start = formatDateDdMm(startDate);
  if (!endDate) return start;
  return `${start} - ${formatDateDdMm(endDate)}`;
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className='rounded-2xl border border-line bg-surface p-3 flex items-start gap-3'>
      <div className='h-8 w-8 rounded-full border border-brand/40 bg-brand/10 text-brand-soft-2 flex items-center justify-center shrink-0'>
        {icon}
      </div>
      <div className='flex flex-col gap-1 min-w-0'>
        <p className='text-[11px] uppercase tracking-[0.18em] text-ink-5'>
          {label}
        </p>
        <p className='text-sm text-ink-2 break-words'>{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailModal({
  booking,
  onClose,
}: BookingDetailModalProps) {
  const t = useTranslations('myBookings.modal');
  const tSchedule = useTranslations('myBookings');
  const tCommon = useTranslations('common');
  const format = useFormatter();

  return (
    <FullscreenModalShell
      open={Boolean(booking)}
      onClose={onClose}
      closeAriaLabel={t('closeAria')}
      containerClassName='h-full w-full md:flex md:items-center md:justify-center md:p-8'
      contentClassName='text-ink-1 bg-elev-1 h-full w-full overflow-y-auto md:h-auto md:max-h-[92vh] md:max-w-5xl md:w-[92vw] md:rounded-[2rem] md:border md:border-line-2 md:bg-elev-1/95 md:backdrop-blur-xl'
      contentKey={booking?.id}
    >
      {booking && (
        <>
          <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(208,6,0,0.3),transparent_52%)]' />

          <div className='relative p-5 pt-16 md:p-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6'>
            <section className='flex flex-col gap-4'>
              <div className='flex flex-wrap items-center gap-3'>
                <p className='text-xs uppercase tracking-[0.32em] text-brand font-semibold'>
                  {t('eyebrow')}
                </p>
                <BookingStatusBadge status={booking.status} />
              </div>

              <h3 className='text-2xl md:text-4xl font-black tracking-tight leading-tight'>
                {booking.tour.title}
              </h3>

              <div className='flex flex-wrap gap-3 text-sm text-ink-2'>
                <span className='inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5'>
                  <Ticket size={15} className='text-brand' />
                  {t('code', { id: booking.id })}
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5'>
                  <MapPin size={15} className='text-brand' />
                  {booking.tour.location.name}
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5'>
                  <Calendar size={15} className='text-brand' />
                  {formatDateRange(
                    booking.tour.start_date,
                    booking.tour.end_date,
                    tSchedule('scheduleTbd'),
                  )}
                </span>
              </div>

              <div className='rounded-3xl border border-line bg-surface p-4 md:p-5'>
                <p className='text-xs uppercase tracking-[0.2em] text-ink-5 mb-2'>
                  {t('createdHeading')}
                </p>
                <p className='text-sm md:text-base text-ink-2'>
                  {format.dateTime(new Date(booking.created_at), 'dateTime')}
                </p>
              </div>
            </section>

            <section className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <DetailRow
                icon={<UserRound size={15} />}
                label={t('fullName')}
                value={booking.full_name}
              />
              <DetailRow
                icon={<Phone size={15} />}
                label={t('phone')}
                value={booking.phone}
              />
              <DetailRow
                icon={<Mail size={15} />}
                label={t('email')}
                value={booking.email || tCommon('notAvailable')}
              />
              <DetailRow
                icon={<Contact size={15} />}
                label={t('medalName')}
                value={booking.medal_name || tCommon('notAvailable')}
              />
              <DetailRow
                icon={<IdCard size={15} />}
                label={t('citizenId')}
                value={booking.citizen_id || tCommon('notAvailable')}
              />
              <DetailRow
                icon={<Calendar size={15} />}
                label={t('dob')}
                value={booking.dob ? formatDateDdMm(booking.dob) : tCommon('notAvailable')}
              />
              <div className='md:col-span-2'>
                <DetailRow
                  icon={<FileText size={15} />}
                  label={t('note')}
                  value={booking.note || t('noteEmpty')}
                />
              </div>
            </section>
          </div>
        </>
      )}
    </FullscreenModalShell>
  );
}
