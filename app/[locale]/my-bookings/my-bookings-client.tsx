'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { useFormatter, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
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
import BackgroundBlur from '@/components/background-blur';
import BookingStatusBadge from '@/components/booking-status-badge';
import { BookingStatusNote } from '@/components/booking-status-note';
import { BookingDetail } from '@/lib/services/booking';
import { useBookingsByIdsQuery } from '@/lib/services/queries';
import {
  getStoredBookingIds,
  subscribeBookingIdsChanged,
} from '@/lib/services/booking-storage';
import { formatDateDdMm } from '@/lib/utils';
import BookingDetailModal from './components/booking-detail-modal';
import { BookingFlowHeader } from '../tour-booking/components/booking-flow-header';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';

type ViewMode = 'card' | 'list';

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

export default function MyBookingsClient() {
  const t = useTranslations('myBookings');
  const tCommon = useTranslations('common');
  const format = useFormatter();
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
  } = useBookingsByIdsQuery(bookingIds, isStorageReady);

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
    <main className='relative min-h-screen overflow-hidden bg-elev-1 text-ink-1 pt-24 px-4 md:px-8 pb-24 md:pb-12'>
      <BackgroundBlur imageUrl={heroBackground} />
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -top-24 -right-20 h-[300px] w-[300px] rounded-full bg-brand/18 blur-3xl' />
        <div className='absolute bottom-[-140px] left-[-80px] h-[380px] w-[380px] rounded-full bg-success-tint blur-3xl' />
      </div>

      <div className='w-full max-w-[1200px] mx-auto flex flex-col gap-6'>
        <BookingFlowHeader
          trail={[t('trail')]}
          backLabel={t('back')}
          onBack={() => router.push('/tours')}
        />

        <section className='rounded-[2rem] border border-line-2 bg-well-2 backdrop-blur-xl p-5 md:p-8 flex flex-col gap-6'>
          <div className='flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between'>
            <div className='flex flex-col gap-3'>
              <p className='text-xs uppercase tracking-[0.14em] md:tracking-[0.3em] text-brand font-semibold'>
                {t('eyebrow')}
              </p>
              <h1 className='text-xl md:text-5xl font-black tracking-tight leading-tight'>
                {t('title')}
              </h1>
              <p className='text-ink-3 text-sm md:text-base max-w-2xl'>
                {t('description')}
              </p>
            </div>

            {hasBookings && (
              <div className='flex flex-wrap items-center gap-3'>
                <button
                  onClick={() => setViewMode('card')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                    viewMode === 'card'
                      ? 'border-brand/60 bg-brand/15 text-brand-soft'
                      : 'border-line-3 bg-surface text-ink-3 hover:border-line-4'
                  }`}
                >
                  <LayoutGrid size={15} />
                  {t('viewCard')}
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                    viewMode === 'list'
                      ? 'border-brand/60 bg-brand/15 text-brand-soft'
                      : 'border-line-3 bg-surface text-ink-3 hover:border-line-4'
                  }`}
                >
                  <List size={15} />
                  {t('viewList')}
                </button>
              </div>
            )}
          </div>

          {isMobile && (
            <div className='rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex items-start gap-2.5'>
              <CircleAlert size={16} className='mt-0.5 shrink-0' />
              <p>{t('temporaryNotice')}</p>
            </div>
          )}

          {isStorageReady && !hasBookings && (
            <div className='rounded-3xl border border-line bg-surface p-8 md:p-10 text-center flex flex-col items-center gap-4'>
              <div className='h-16 w-16 rounded-full border border-brand/40 bg-brand/10 text-brand-soft-2 flex items-center justify-center'>
                <TicketCheck size={28} />
              </div>
              <h2 className='text-xl md:text-2xl font-black tracking-tight'>
                {isMobile ? t('emptyTitleMobile') : t('emptyTitle')}
              </h2>
              {!isMobile && (
                <p className='text-sm text-ink-4 max-w-xl'>
                  {t('emptyDescription')}
                </p>
              )}
              <Link
                href='/tours'
                className='inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-brand-ink font-semibold hover:bg-brand-strong transition-colors'
              >
                {isMobile ? t('emptyCtaMobile') : t('emptyCta')}
                <ChevronRight size={16} />
              </Link>
            </div>
          )}

          {hasBookings && isPending && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className='h-40 rounded-3xl border border-line bg-surface animate-pulse'
                />
              ))}
            </div>
          )}

          {hasBookings && isError && (
            <div className='rounded-3xl border border-brand/35 bg-brand/10 p-6 flex flex-col gap-4'>
              <p className='text-brand-soft font-semibold'>{t('loadError')}</p>
              <button
                onClick={() => refetch()}
                className='w-fit inline-flex items-center gap-2 rounded-xl border border-line-3 px-4 py-2 text-sm hover:border-white/50 transition-colors'
              >
                <RefreshCcw size={14} />
                {tCommon('retry')}
              </button>
            </div>
          )}

          {hasBookings && !isPending && !isError && orderedBookings.length > 0 && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-wrap items-center gap-3 text-sm text-ink-3'>
                <span className='inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface px-3 py-1.5'>
                  <TicketCheck size={15} className='text-brand' />
                  {t('count', { count: orderedBookings.length })}
                </span>
                {missingCount > 0 && (
                  <span className='inline-flex items-center gap-2 rounded-full border border-amber-400/35 bg-amber-500/10 text-amber-200 px-3 py-1.5'>
                    {t('missingCount', { count: missingCount })}
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
                      className='group text-left rounded-3xl border border-line bg-surface hover:bg-surface-2 p-5 flex flex-col gap-4 transition-colors'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex flex-col gap-2 min-w-0'>
                          <p className='text-xs uppercase tracking-[0.24em] text-brand font-semibold'>
                            {t('bookingCode', { id: booking.id })}
                          </p>
                          <h3 className='text-xl font-black leading-snug tracking-tight line-clamp-2'>
                            {booking.tour.title}
                          </h3>
                        </div>
                        <ChevronRight className='text-ink-5 group-hover:text-brand transition-colors shrink-0' />
                      </div>

                      <div className='flex flex-col gap-2 text-sm text-ink-3'>
                        <p className='inline-flex items-center gap-2'>
                          <MapPin size={15} className='text-brand' />
                          {booking.tour.location.name}
                        </p>
                        <p className='inline-flex items-center gap-2'>
                          <Calendar size={15} className='text-brand' />
                          {formatDateRange(
                            booking.tour.start_date,
                            booking.tour.end_date,
                            t('scheduleTbd'),
                          )}
                        </p>
                      </div>

                      <BookingStatusNote
                        status={booking.status}
                        note={booking.status_note}
                        className='w-full'
                      />

                      <div className='flex flex-wrap gap-2 items-center'>
                        <BookingStatusBadge status={booking.status} />
                        <span className='text-xs text-ink-5'>
                          {t('createdAt', {
                            date: format.dateTime(
                              new Date(booking.created_at),
                              'date',
                            ),
                          })}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className='rounded-3xl border border-line bg-surface overflow-hidden'>
                  {orderedBookings.map((booking, index) => (
                    <button
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={`w-full text-left px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-surface-2 transition-colors ${
                        index !== orderedBookings.length - 1
                          ? 'border-b border-line'
                          : ''
                      }`}
                    >
                      <div className='flex flex-col gap-1 min-w-0'>
                        <p className='text-xs uppercase tracking-[0.22em] text-brand font-semibold'>
                          {t('bookingCode', { id: booking.id })}
                        </p>
                        <h3 className='font-bold text-ink-1 line-clamp-1'>
                          {booking.tour.title}
                        </h3>
                        <div className='flex flex-wrap gap-3 text-sm text-ink-4'>
                          <span className='inline-flex items-center gap-1.5'>
                            <MapPin size={14} className='text-brand' />
                            {booking.tour.location.name}
                          </span>
                          <span className='inline-flex items-center gap-1.5'>
                            <Calendar size={14} className='text-brand' />
                            {formatDateRange(
                              booking.tour.start_date,
                              booking.tour.end_date,
                              t('scheduleTbd'),
                            )}
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-3'>
                        <BookingStatusNote
                          status={booking.status}
                          note={booking.status_note}
                          className='hidden md:flex max-w-xs'
                        />
                        <BookingStatusBadge
                          status={booking.status}
                          className='text-xs md:text-sm'
                        />
                        <ChevronRight className='text-ink-5' size={18} />
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
