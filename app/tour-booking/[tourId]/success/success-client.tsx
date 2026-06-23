'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  CircleAlert,
  Home,
  MailCheck,
  MapPin,
  PhoneCall,
  Ticket,
} from 'lucide-react';
import { bookingService } from '@/lib/services/booking';
import { getLatestStoredBookingId } from '@/lib/services/booking-storage';
import { formatDateDdMm } from '@/lib/utils';
import { BookingFlowHeader } from '../../components/booking-flow-header';
import BackgroundBlur from '@/app/locations/components/background-blur';
import BookingStatusBadge from '@/components/booking-status-badge';

export default function BookingSuccessClient({
  tourIdParam,
}: {
  tourIdParam: string;
}) {
  const router = useRouter();
  const fallbackTourId = Number(tourIdParam);
  const [latestBookingId, setLatestBookingId] = useState<number | null>(null);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    setLatestBookingId(getLatestStoredBookingId());
    setIsStorageReady(true);
  }, []);

  const {
    data: booking,
    isPending: bookingPending,
    isError: bookingError,
  } = useQuery({
    queryKey: ['booking-detail', latestBookingId],
    queryFn: () => bookingService.getBookingDetail(latestBookingId as number),
    enabled: latestBookingId !== null,
  });

  const statusMeta = useMemo(() => {
    if (!booking) return null;
    return { status: booking.status, label: booking.status_label };
  }, [booking]);

  const scheduleLabel = useMemo(() => {
    if (!booking?.tour.start_date) {
      return 'Lịch trình sẽ được gửi khi xác nhận booking';
    }
    const start = formatDateDdMm(booking.tour.start_date);
    if (!booking.tour.end_date) return start;
    return `${start} - ${formatDateDdMm(booking.tour.end_date)}`;
  }, [booking?.tour.start_date, booking?.tour.end_date]);

  const displayName = booking?.full_name || 'bạn';
  const resolvedTourId = booking?.tour.id ?? fallbackTourId;

  const mainContent = (
    <section className='relative rounded-[2rem] border border-white/15 bg-black/60 backdrop-blur-xl overflow-hidden'>
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(208,6,0,0.3),transparent_48%)]' />
      <div className='relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 p-6 md:p-10'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-4'>
            <motion.div
              className='relative h-20 w-20'
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <motion.div
                className='absolute inset-0 rounded-full border border-[#2ed37d]/70 shadow-[0_0_0_1px_rgba(208,6,0,0.25),0_0_36px_rgba(46,211,125,0.25)]'
                animate={{ scale: [1, 1.28, 1], opacity: [0.65, 0.15, 0.65] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className='absolute inset-[10px] rounded-full bg-gradient-to-br from-[#39dd88] via-[#1fbf69] to-[#149a55] ring-1 ring-[#d00600]/35 flex items-center justify-center shadow-[0_0_40px_rgba(46,211,125,0.45)]'>
                <CheckCircle2 size={28} className='text-white' />
              </div>
            </motion.div>

            <p className='text-xs uppercase tracking-[0.34em] font-semibold bg-gradient-to-r from-[#89f7bc] via-[#37d07d] to-[#d00600] bg-clip-text text-transparent'>
              Booking successful
            </p>
            <h1 className='text-3xl md:text-5xl font-black leading-[1.05] tracking-tight'>
              Cảm ơn {displayName}, bạn đã đặt tour thành công.
            </h1>
            <p className='text-neutral-300 text-sm md:text-base max-w-2xl'>
              Yêu cầu của bạn đã được ghi nhận. Đội ngũ vận hành sẽ xác nhận
              trong thời gian sớm nhất để chốt lịch trình.
            </p>
          </div>

          {isStorageReady && latestBookingId !== null && !bookingPending && (
            <div className='flex flex-wrap gap-3'>
              <StatusChip
                icon={<Ticket size={16} />}
                label={`Mã booking #${latestBookingId}`}
              />
              <StatusChip
                icon={<MapPin size={16} />}
                label={booking?.tour.location.name || 'Tour trekking'}
              />
              <StatusChip icon={<Calendar size={16} />} label={scheduleLabel} />
              {statusMeta && (
                <BookingStatusBadge
                  status={statusMeta.status}
                  label={statusMeta.label}
                  prefix='Trạng thái'
                />
              )}
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
            <NextStepCard
              icon={<PhoneCall size={16} />}
              title='Bước 1'
              description='Nhân viên tư vấn gọi điện xác nhận thông tin.'
            />
            <NextStepCard
              icon={<MailCheck size={16} />}
              title='Bước 2'
              description='Gửi lại lịch trình và thông tin cần chuẩn bị.'
            />
            <NextStepCard
              icon={<Ticket size={16} />}
              title='Bước 3'
              description='Hoàn tất giữ chỗ và nhận hướng dẫn trước chuyến đi.'
            />
          </div>
        </div>

        <aside className='rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 flex flex-col gap-4 self-start'>
          <p className='text-xs uppercase tracking-[0.28em] text-neutral-500'>
            Action
          </p>
          <h2 className='text-2xl font-black tracking-tight'>
            Sẵn sàng cho hành trình tiếp theo?
          </h2>
          <p className='text-sm text-neutral-400'>
            Bạn có thể tiếp tục khám phá thêm tour khác hoặc xem lại các booking
            đã tạo.
          </p>

          <div className='flex flex-col gap-3 pt-1'>
            <Link
              href='/my-bookings'
              className='inline-flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border border-emerald-400/45 bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/20 transition-colors'
            >
              Xem tours đã đặt
              <ArrowRight size={18} />
            </Link>
            <Link
              href='/tours'
              className='inline-flex items-center justify-between gap-3 rounded-2xl px-4 py-3 bg-[#d00600] text-white font-semibold hover:bg-[#a90500] transition-colors'
            >
              Khám phá thêm tours
              <ArrowRight size={18} />
            </Link>
            <Link
              href={`/tour-booking/${resolvedTourId}`}
              className='inline-flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border border-white/20 text-white hover:border-[#d00600]/60 hover:text-[#ffd0ce] transition-colors'
            >
              Đặt thêm cho tour này
              <Ticket size={18} />
            </Link>
            <Link
              href='/'
              className='inline-flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border border-white/20 text-white hover:border-white/40 transition-colors'
            >
              Về trang chủ
              <Home size={18} />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );

  return (
    <main className='relative min-h-screen overflow-hidden text-white pt-24 px-4 md:px-8 pb-12'>
      <BackgroundBlur imageUrl={booking?.tour.location.full_image_url || null} />
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -top-28 right-[-10%] h-[320px] w-[320px] rounded-full bg-[#d00600]/20 blur-3xl' />
        <div className='absolute bottom-[-120px] left-[-12%] h-[360px] w-[360px] rounded-full bg-white/5 blur-3xl' />
      </div>

      <div className='w-full max-w-[1120px] mx-auto flex flex-col gap-6'>
        <BookingFlowHeader
          trail={['Booking successful']}
          backLabel='Quay lại booking'
          onBack={() => router.push(`/tour-booking/${resolvedTourId}`)}
        />

        {!isStorageReady && (
          <div className='rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-neutral-300'>
            Đang đọc thông tin booking...
          </div>
        )}

        {isStorageReady && latestBookingId === null && (
          <div className='rounded-3xl border border-red-500/30 bg-red-500/10 px-6 py-8 flex flex-col gap-4'>
            <p className='inline-flex items-center gap-2 text-red-200 font-semibold'>
              <CircleAlert size={18} />
              Không tìm thấy booking trong trình duyệt của bạn.
            </p>
            <p className='text-sm text-neutral-300'>
              Hãy tạo booking mới hoặc truy cập lại từ thiết bị đã từng đặt tour.
            </p>
            <div className='flex flex-wrap gap-3'>
              <Link
                href='/tours'
                className='inline-flex items-center gap-2 rounded-xl bg-[#d00600] px-4 py-2 text-white hover:bg-[#a90500] transition-colors'
              >
                Đi đến danh sách tour
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {isStorageReady && latestBookingId !== null && bookingPending && (
          <div className='rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-10 text-center text-neutral-300'>
            Đang tải chi tiết booking #{latestBookingId}...
          </div>
        )}

        {isStorageReady && latestBookingId !== null && bookingError && (
          <div className='rounded-3xl border border-red-500/30 bg-red-500/10 px-6 py-8 flex flex-col gap-3'>
            <p className='text-red-200 font-semibold'>
              Không thể tải chi tiết booking #{latestBookingId}.
            </p>
            <p className='text-sm text-neutral-300'>
              Vui lòng thử tải lại trang hoặc vào mục Tours bạn đã đặt.
            </p>
          </div>
        )}

        {isStorageReady && latestBookingId !== null && !bookingPending && booking && (
          mainContent
        )}
      </div>
    </main>
  );
}

function StatusChip({
  icon,
  label,
}: {
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-neutral-200'>
      <span className='text-[#d00600]'>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

function NextStepCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2'>
      <div className='inline-flex w-fit items-center gap-2 rounded-full border border-[#d00600]/40 bg-[#d00600]/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase text-[#ffb0ac]'>
        {icon}
        {title}
      </div>
      <p className='text-sm text-neutral-300 leading-relaxed'>{description}</p>
    </div>
  );
}
