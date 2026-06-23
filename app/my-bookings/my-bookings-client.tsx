'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  ChevronRight,
  CircleAlert,
  LayoutGrid,
  List,
  MapPin,
  RefreshCcw,
  TicketCheck,
} from 'lucide-react';
import BackgroundBlur from '@/app/locations/components/background-blur';
import BookingStatusBadge from '@/components/booking-status-badge';
import { BookingDetail, bookingService } from '@/lib/services/booking';
import {
  getStoredBookingIds,
  subscribeBookingIdsChanged,
} from '@/lib/services/booking-storage';
import { formatDateDdMm } from '@/lib/utils';
import BookingDetailModal from './components/booking-detail-modal';
import { BookingFlowHeader } from '../tour-booking/components/booking-flow-header';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

type ViewMode = 'card' | 'list';

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate) return 'Đang cập nhật lịch trình';
  const start = formatDateDdMm(startDate);
  if (!endDate) return start;
  return `${start} - ${formatDateDdMm(endDate)}`;
}

function formatCreatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
  }).format(date);
}

export default function MyBookingsClient() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(
    null,
  );
  const [bookingIds, setBookingIds] = useState<number[]>([]);
  const [isStorageReady, setIsStorageReady] = useState(false);

  useEffect(() => {
    const syncBookingIds = () => {
      setBookingIds(getStoredBookingIds());
    };

    syncBookingIds();
    setIsStorageReady(true);
    const unsubscribe = subscribeBookingIdsChanged(syncBookingIds);

    return unsubscribe;
  }, []);

  const {
    data: bookings = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['bookings-by-ids', bookingIds.join(',')],
    queryFn: () => bookingService.getBookingsByIds(bookingIds),
    enabled: isStorageReady && bookingIds.length > 0,
  });

  const orderedBookings = useMemo(() => {
    const bookingMap = new Map(bookings.map((booking) => [booking.id, booking]));
    return bookingIds
      .map((bookingId) => bookingMap.get(bookingId))
      .filter((booking): booking is BookingDetail => Boolean(booking));
  }, [bookings, bookingIds]);

  const missingCount = Math.max(bookingIds.length - orderedBookings.length, 0);
  const heroBackground = orderedBookings[0]?.tour.location.full_image_url || null;

  const hasBookings = bookingIds.length > 0;

  return (
    <main className='relative min-h-screen overflow-hidden text-white pt-24 px-4 md:px-8 pb-24 md:pb-12'>
      <BackgroundBlur imageUrl={heroBackground} />
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -top-24 -right-20 h-[300px] w-[300px] rounded-full bg-[#d00600]/18 blur-3xl' />
        <div className='absolute bottom-[-140px] left-[-80px] h-[380px] w-[380px] rounded-full bg-emerald-500/12 blur-3xl' />
      </div>

      <div className='w-full max-w-[1200px] mx-auto flex flex-col gap-6'>
        <BookingFlowHeader
          trail={['Tours bạn đã đặt']}
          backLabel='Quay về tours'
          onBack={() => router.push('/tours')}
        />

        <section className='rounded-[2rem] border border-white/15 bg-black/60 backdrop-blur-xl p-5 md:p-8 flex flex-col gap-6'>
          <div className='flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between'>
            <div className='flex flex-col gap-3'>
              <p className='text-xs uppercase tracking-[0.14em] md:tracking-[0.3em] text-[#d00600] font-semibold'>
                My Bookings
              </p>
              <h1 className='text-xl md:text-5xl font-black tracking-tight leading-tight'>
                Tour bạn đã đặt
              </h1>
              <p className='text-neutral-300 text-sm md:text-base max-w-2xl'>
                Theo dõi trạng thái từng booking và mở chi tiết đơn ngay trong
                một màn hình.
              </p>
            </div>

            {hasBookings && (
              <div className='flex flex-wrap items-center gap-3'>
                <button
                  onClick={() => setViewMode('card')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                    viewMode === 'card'
                      ? 'border-[#d00600]/60 bg-[#d00600]/15 text-[#ffd0ce]'
                      : 'border-white/20 bg-white/[0.03] text-neutral-300 hover:border-white/40'
                  }`}
                >
                  <LayoutGrid size={15} />
                  Card
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'border-[#d00600]/60 bg-[#d00600]/15 text-[#ffd0ce]'
                      : 'border-white/20 bg-white/[0.03] text-neutral-300 hover:border-white/40'
                  }`}
                >
                  <List size={15} />
                  List
                </button>
              </div>
            )}
          </div>

          {isMobile && (
            <div className='rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex items-start gap-2.5'>
              <CircleAlert size={16} className='mt-0.5 shrink-0' />
              <p>
                Thông tin ở đây đang được lưu tạm thời, hãy đăng nhập để luôn
                theo dõi lịch sử đặt tours.
              </p>
            </div>
          )}

          {isStorageReady && !hasBookings && (
            <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10 text-center flex flex-col items-center gap-4'>
              <div className='h-16 w-16 rounded-full border border-[#d00600]/40 bg-[#d00600]/10 text-[#ffb0ac] flex items-center justify-center'>
                <TicketCheck size={28} />
              </div>
              <h2 className='text-xl md:text-2xl font-black tracking-tight'>
                {isMobile
                  ? 'Bạn chưa đặt tour nào'
                  : 'Chưa có booking nào trên thiết bị này'}
              </h2>
              {!isMobile && (
                <p className='text-sm text-neutral-400 max-w-xl'>
                  Khi bạn đặt tour thành công, mã booking sẽ được lưu tự động để
                  theo dõi trạng thái ngay tại đây.
                </p>
              )}
              <Link
                href='/tours'
                className='inline-flex items-center gap-2 rounded-xl bg-[#d00600] px-4 py-2.5 text-white font-semibold hover:bg-[#a90500] transition-colors'
              >
                {isMobile ? 'Hãy đặt ngay' : 'Đi đến danh sách tours'}
                <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {hasBookings && isPending && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className='h-40 rounded-3xl border border-white/10 bg-white/[0.03] animate-pulse'
                />
              ))}
            </div>
          )}

          {hasBookings && isError && (
            <div className='rounded-3xl border border-red-500/35 bg-red-500/10 p-6 flex flex-col gap-4'>
              <p className='text-red-200 font-semibold'>
                Không thể tải danh sách booking. Vui lòng thử lại.
              </p>
              <button
                onClick={() => refetch()}
                className='w-fit inline-flex items-center gap-2 rounded-xl border border-white/25 px-4 py-2 text-sm hover:border-white/50 transition-colors'
              >
                <RefreshCcw size={14} />
                Tải lại
              </button>
            </div>
          )}

          {hasBookings && !isPending && !isError && orderedBookings.length > 0 && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-wrap items-center gap-3 text-sm text-neutral-300'>
                <span className='inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5'>
                  <TicketCheck size={15} className='text-[#d00600]' />
                  {orderedBookings.length} booking
                  {orderedBookings.length > 1 ? 's' : ''}
                </span>
                {missingCount > 0 && (
                  <span className='inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 text-amber-200 px-3 py-1.5'>
                    {missingCount} booking không còn khả dụng
                  </span>
                )}
              </div>

              {viewMode === 'card' ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {orderedBookings.map((booking, index) => (
                    <motion.button
                      key={booking.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.26, delay: index * 0.04 }}
                      onClick={() => setSelectedBooking(booking)}
                      className='group text-left rounded-3xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-5 flex flex-col gap-4 transition-colors'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex flex-col gap-2 min-w-0'>
                          <p className='text-xs uppercase tracking-[0.24em] text-[#d00600] font-semibold'>
                            Booking #{booking.id}
                          </p>
                          <h3 className='text-xl font-black leading-snug tracking-tight line-clamp-2'>
                            {booking.tour.title}
                          </h3>
                        </div>
                        <ChevronRight className='text-neutral-500 group-hover:text-[#d00600] transition-colors shrink-0' />
                      </div>

                      <div className='flex flex-col gap-2 text-sm text-neutral-300'>
                        <p className='inline-flex items-center gap-2'>
                          <MapPin size={15} className='text-[#d00600]' />
                          {booking.tour.location.name}
                        </p>
                        <p className='inline-flex items-center gap-2'>
                          <Calendar size={15} className='text-[#d00600]' />
                          {formatDateRange(
                            booking.tour.start_date,
                            booking.tour.end_date,
                          )}
                        </p>
                      </div>

                      <div className='flex flex-wrap gap-2 items-center'>
                        <BookingStatusBadge
                          status={booking.status}
                          label={booking.status_label}
                        />
                        <span className='text-xs text-neutral-500'>
                          Tạo ngày {formatCreatedAt(booking.created_at)}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className='rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden'>
                  {orderedBookings.map((booking, index) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`w-full text-left px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-white/[0.05] transition-colors ${
                        index !== orderedBookings.length - 1
                          ? 'border-b border-white/10'
                          : ''
                      }`}
                    >
                      <div className='flex flex-col gap-1 min-w-0'>
                        <p className='text-xs uppercase tracking-[0.22em] text-[#d00600] font-semibold'>
                          Booking #{booking.id}
                        </p>
                        <h3 className='font-bold text-white line-clamp-1'>
                          {booking.tour.title}
                        </h3>
                        <div className='flex flex-wrap gap-3 text-sm text-neutral-400'>
                          <span className='inline-flex items-center gap-1.5'>
                            <MapPin size={14} className='text-[#d00600]' />
                            {booking.tour.location.name}
                          </span>
                          <span className='inline-flex items-center gap-1.5'>
                            <Calendar size={14} className='text-[#d00600]' />
                            {formatDateRange(
                              booking.tour.start_date,
                              booking.tour.end_date,
                            )}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <BookingStatusBadge
                          status={booking.status}
                          label={booking.status_label}
                          className='text-xs md:text-sm'
                        />
                        <ChevronRight className='text-neutral-500' size={18} />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <BookingDetailModal
        booking={selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </main>
  );
}
