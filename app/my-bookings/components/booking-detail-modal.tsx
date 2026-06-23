'use client';

import { type ReactNode } from 'react';
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

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate) return 'Đang cập nhật lịch trình';
  const start = formatDateDdMm(startDate);
  if (!endDate) return start;
  return `${start} - ${formatDateDdMm(endDate)}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
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
    <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-3 flex items-start gap-3'>
      <div className='h-8 w-8 rounded-full border border-[#d00600]/40 bg-[#d00600]/10 text-[#ffb0ac] flex items-center justify-center shrink-0'>
        {icon}
      </div>
      <div className='flex flex-col gap-1 min-w-0'>
        <p className='text-[11px] uppercase tracking-[0.18em] text-neutral-500'>
          {label}
        </p>
        <p className='text-sm text-neutral-100 break-words'>{value}</p>
      </div>
    </div>
  );
}

export default function BookingDetailModal({
  booking,
  onClose,
}: BookingDetailModalProps) {
  return (
    <FullscreenModalShell
      open={Boolean(booking)}
      onClose={onClose}
      closeAriaLabel='Đóng chi tiết booking'
      containerClassName='h-full w-full md:flex md:items-center md:justify-center md:p-8'
      contentClassName='text-white bg-black/90 h-full w-full overflow-y-auto md:h-auto md:max-h-[92vh] md:max-w-5xl md:w-[92vw] md:rounded-[2rem] md:border md:border-white/15 md:bg-black/80'
      contentKey={booking?.id}
    >
      {booking && (
        <>
          <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(208,6,0,0.3),transparent_52%)]' />

          <div className='relative p-5 pt-16 md:p-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6'>
            <section className='flex flex-col gap-4'>
              <div className='flex flex-wrap items-center gap-3'>
                <p className='text-xs uppercase tracking-[0.32em] text-[#d00600] font-semibold'>
                  Booking detail
                </p>
                <BookingStatusBadge
                  status={booking.status}
                  label={booking.status_label}
                />
              </div>

              <h3 className='text-2xl md:text-4xl font-black tracking-tight leading-tight'>
                {booking.tour.title}
              </h3>

              <div className='flex flex-wrap gap-3 text-sm text-neutral-200'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5'>
                  <Ticket size={15} className='text-[#d00600]' />
                  Mã #{booking.id}
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5'>
                  <MapPin size={15} className='text-[#d00600]' />
                  {booking.tour.location.name}
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5'>
                  <Calendar size={15} className='text-[#d00600]' />
                  {formatDateRange(
                    booking.tour.start_date,
                    booking.tour.end_date,
                  )}
                </span>
              </div>

              <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-4 md:p-5'>
                <p className='text-xs uppercase tracking-[0.2em] text-neutral-500 mb-2'>
                  Thời điểm tạo booking
                </p>
                <p className='text-sm md:text-base text-neutral-100'>
                  {formatDateTime(booking.created_at)}
                </p>
              </div>
            </section>

            <section className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              <DetailRow
                icon={<UserRound size={15} />}
                label='Họ và tên'
                value={booking.full_name}
              />
              <DetailRow
                icon={<Phone size={15} />}
                label='Số điện thoại'
                value={booking.phone}
              />
              <DetailRow
                icon={<Mail size={15} />}
                label='Email'
                value={booking.email || 'Không có'}
              />
              <DetailRow
                icon={<Contact size={15} />}
                label='Tên in huy chương'
                value={booking.medal_name || 'Không có'}
              />
              <DetailRow
                icon={<IdCard size={15} />}
                label='CCCD'
                value={booking.citizen_id || 'Không có'}
              />
              <DetailRow
                icon={<Calendar size={15} />}
                label='Ngày sinh'
                value={booking.dob ? formatDateDdMm(booking.dob) : 'Không có'}
              />
              <div className='md:col-span-2'>
                <DetailRow
                  icon={<FileText size={15} />}
                  label='Ghi chú'
                  value={booking.note || 'Không có ghi chú'}
                />
              </div>
            </section>
          </div>
        </>
      )}
    </FullscreenModalShell>
  );
}
