'use client';

import { memo, useActionState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  Clock3,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  User,
  WalletCards,
} from 'lucide-react';
import { useFormStatus } from 'react-dom';

import BackgroundBlur from '@/app/locations/components/background-blur';
import type { TourListItem } from '@/app/tours/types';
import { tourService, type BookingPayload, type TourDetail } from '@/lib/services/tour';
import { saveBookingId } from '@/lib/services/booking-storage';
import { formatDateDdMm } from '@/lib/utils';
import { BookingFlowHeader } from '../components/booking-flow-header';
import { ItineraryAccordion } from './components/itinerary-accordion';
import { MarkdownArticle } from './components/markdown-article';
import { RelatedToursCarousel } from './components/related-tours-carousel';
import { TourImageCollage } from './components/tour-image-collage';
import {
  formatTourPriceVnd,
  getDurationDays,
  normalizeItineraryDays,
} from './booking-view-model';

type BookingFormState =
  | { status: 'idle'; message?: string; redirectTo?: undefined; bookingId?: undefined }
  | { status: 'success'; message: string; redirectTo: string; bookingId: number }
  | { status: 'error'; message: string; redirectTo?: undefined; bookingId?: undefined };

const initialFormState: BookingFormState = { status: 'idle', message: '' };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='w-full py-3.5 rounded-2xl font-bold uppercase tracking-[0.12em] text-sm bg-white text-black hover:bg-[#d00600] hover:text-white active:bg-[#a80500] transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
    >
      {pending ? 'Đang gửi...' : label}
    </button>
  );
}

export default function TourBookingClient({
  tourIdParam,
}: {
  tourIdParam: string;
}) {
  const router = useRouter();
  const tourId = Number(tourIdParam);

  const {
    data: tour,
    isPending,
    isError,
  } = useQuery<TourDetail, Error>({
    queryKey: ['tour-detail', tourId],
    queryFn: () => tourService.getTourDetail(tourId),
    enabled: Number.isFinite(tourId),
    staleTime: 30_000,
  });

  const { data: relatedTours = [] } = useQuery<TourListItem[], Error>({
    queryKey: ['tour-related', tourId],
    queryFn: () => tourService.getRelatedTours(tourId, 12),
    enabled: Number.isFinite(tourId),
    staleTime: 60_000,
  });

  if (isPending) {
    return (
      <main className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-[#d00600] border-t-transparent rounded-full animate-spin' />
      </main>
    );
  }

  if (isError || !tour) {
    return (
      <main className='min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-6 text-center'>
        <AlertTriangle className='text-[#d00600]' size={36} />
        <p className='text-lg'>
          Không tìm thấy tour hoặc tour đã ngừng hoạt động.
        </p>
        <button
          onClick={() => router.back()}
          className='px-4 py-2 rounded-full border border-white/20 text-sm hover:border-white transition-colors flex items-center gap-2 active:bg-white/5'
        >
          <ChevronLeft size={16} />
          Quay lại
        </button>
      </main>
    );
  }

  const durationDays = getDurationDays(tour.start_date, tour.end_date);
  const itineraryDays = normalizeItineraryDays(tour);
  const formattedPrice = formatTourPriceVnd(tour.price);
  const toursYouMayLike = relatedTours.filter((item) => item.id !== tour.id);

  return (
    <main className='min-h-screen text-white flex flex-col pt-24 px-4 md:px-8'>
      <BackgroundBlur imageUrl={tour.location.full_image_url} />

      <div className='w-full max-w-[1600px] mx-auto pb-12 flex flex-col gap-8 md:gap-10'>
        <header className='flex flex-col gap-3'>
          <BookingFlowHeader trail={[`Booking tour ${tour.location.name}`]} />

          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl md:text-4xl font-black uppercase tracking-tight'>
              {tour.title}
            </h1>
            <p className='text-sm md:text-base text-neutral-300 max-w-4xl'>
              {tour.summary?.trim() || 'Hành trình chinh phục cung đường trekking đầy thử thách và đáng nhớ.'}
            </p>
          </div>
        </header>

        <section className='w-full'>
          <TourImageCollage title={tour.title} images={tour.images} fallbackImageUrl={tour.location.full_image_url} />
        </section>

        <section className='grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_420px] items-start'>
          <div className='rounded-3xl border border-white/10 bg-neutral-900/60 p-5 md:p-8 space-y-6'>
            <div className='flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-neutral-300'>
              {durationDays && (
                <InfoChip icon={<Clock3 size={14} className='text-[#d00600]' />}>
                  {durationDays} ngày
                </InfoChip>
              )}
              <InfoChip icon={<MapPin size={14} className='text-[#d00600]' />}>
                {tour.location.name}
              </InfoChip>
              {tour.start_date && (
                <InfoChip icon={<Calendar size={14} className='text-[#d00600]' />}>
                  {formatDateDdMm(tour.start_date)}
                  {tour.end_date ? ` - ${formatDateDdMm(tour.end_date)}` : ''}
                </InfoChip>
              )}
              <InfoChip icon={<UsersIcon />}>
                Còn {tour.slots_left} chỗ
              </InfoChip>
            </div>

            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
              <div className='space-y-2'>
                <h2 className='text-2xl md:text-3xl font-black'>Description</h2>
                <p className='text-xs md:text-sm text-neutral-400'>
                  Thông tin chi tiết hành trình ở dạng markdown.
                </p>
              </div>

              <div className='rounded-2xl border border-[#d00600]/40 bg-[#d00600]/10 px-4 py-3 min-w-[210px]'>
                <p className='text-[11px] uppercase tracking-[0.12em] text-neutral-300 flex items-center gap-2'>
                  <WalletCards size={14} className='text-[#d00600]' />
                  Giá tour
                </p>
                <p className='text-xl md:text-2xl font-black text-white mt-1'>
                  {formattedPrice}
                </p>
              </div>
            </div>

            <MarkdownArticle markdown={tour.description_md || tour.summary || ''} />
          </div>

          <div className='lg:sticky lg:top-28'>
            <BookingForm tourId={tour.id} locationName={tour.location.name} />
          </div>
        </section>

        <section className='space-y-4'>
          <div className='flex items-end justify-between gap-3'>
            <div className='space-y-1'>
              <h2 className='text-2xl md:text-3xl font-black'>Itinerary</h2>
              <p className='text-xs md:text-sm text-neutral-400'>
                Mặc định mở Day 0, bấm vào tiêu đề để xem chi tiết từng ngày.
              </p>
            </div>
          </div>
          <ItineraryAccordion days={itineraryDays} />
        </section>

        <section className='space-y-4'>
          <div className='space-y-1'>
            <h2 className='text-2xl md:text-3xl font-black'>Các tours bạn có thể thích</h2>
            <p className='text-xs md:text-sm text-neutral-400'>
              Gợi ý thêm các hành trình đang mở đăng ký.
            </p>
          </div>
          <RelatedToursCarousel tours={toursYouMayLike} />
        </section>
      </div>
    </main>
  );
}

const BookingForm = memo(function BookingForm({
  tourId,
  locationName,
}: {
  tourId: number;
  locationName: string;
}) {
  const router = useRouter();
  const [formState, formAction] = useActionState<BookingFormState, FormData>(
    async (_prev, formData) => {
      const full_name = (formData.get('full_name') || '').toString().trim();
      const phone = (formData.get('phone') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const note = (formData.get('note') || '').toString().trim();
      const medal_name = (formData.get('medal_name') || '').toString().trim();
      const dob = (formData.get('dob') || '').toString().trim();
      const citizen_id = (formData.get('citizen_id') || '').toString().trim();

      if (!full_name || !phone || !medal_name || !dob || !citizen_id) {
        return {
          status: 'error',
          message:
            'Vui lòng điền đủ Họ tên, SĐT, Tên in huy chương, Ngày sinh, CCCD.',
        };
      }

      const payload: BookingPayload = {
        tour: tourId,
        full_name,
        phone,
        email: email || undefined,
        note: note || undefined,
        medal_name,
        dob,
        citizen_id,
      };

      try {
        const booking = await tourService.createBooking(payload);
        return {
          status: 'success',
          message: 'Đăng ký thành công! Đang chuyển sang màn hình xác nhận...',
          redirectTo: `/tour-booking/${tourId}/success`,
          bookingId: booking.id,
        };
      } catch (err: unknown) {
        console.error(err);
        let apiMessage: string | undefined;
        if (isAxiosError(err)) {
          const data = err.response?.data as
            | { phone?: string[]; detail?: string; message?: string }
            | undefined;
          apiMessage = data?.phone?.[0] || data?.detail || data?.message;
        }
        return {
          status: 'error',
          message: apiMessage || 'Đăng ký thất bại, vui lòng thử lại.',
        };
      }
    },
    initialFormState,
  );

  useEffect(() => {
    if (formState.status !== 'success') return;
    saveBookingId(formState.bookingId);
    router.push(formState.redirectTo);
  }, [formState, router]);

  return (
    <div className='w-full bg-neutral-900 border border-white/10 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.55)] p-5 md:p-6 flex flex-col gap-6'>
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-black text-white'>Đăng ký ngay</h2>
        <p className='text-neutral-400 text-sm'>
          Để lại thông tin, đội ngũ {locationName} sẽ liên hệ xác nhận.
        </p>
      </div>

      {formState.status === 'success' && (
        <div className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#d00600]/15 border border-[#d00600]/40 text-[#ff847f] text-sm'>
          <LoaderCircle size={18} className='animate-spin' />
          <span>{formState.message}</span>
        </div>
      )}
      {formState.status === 'error' && (
        <div className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm'>
          <AlertTriangle size={18} />
          <span>{formState.message}</span>
        </div>
      )}

      <form action={formAction} className='flex flex-col gap-4'>
        <input type='hidden' name='tour' value={tourId} />

        <Field
          name='full_name'
          label='Họ và tên'
          placeholder='Nguyễn Văn A'
          icon={<User size={16} />}
          required
        />
        <Field
          name='medal_name'
          label='Tên in trên huy chương'
          placeholder='VD: NGUYEN VAN A'
          required
        />
        <Field
          name='phone'
          label='Số điện thoại'
          placeholder='09xx xxx xxx'
          icon={<Phone size={16} />}
          required
        />
        <Field name='dob' label='Ngày tháng năm sinh' type='date' required />
        <Field
          name='email'
          label='Email (tuỳ chọn)'
          placeholder='you@example.com'
          icon={<Mail size={16} />}
          type='email'
        />
        <Field
          name='citizen_id'
          label='Căn cước công dân'
          placeholder='012345678901'
          required
        />
        <Field
          name='note'
          label='Ghi chú'
          placeholder='Yêu cầu đặc biệt...'
          textarea
        />
        <SubmitButton label='Đăng ký ngay' />
      </form>
    </div>
  );
});

function Field({
  name,
  label,
  placeholder,
  icon,
  required,
  textarea,
  type = 'text',
}: {
  name: string;
  label: string;
  placeholder?: string;
  icon?: ReactNode;
  required?: boolean;
  textarea?: boolean;
  type?: string;
}) {
  const inputClasses =
    'w-full min-w-0 max-w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-base md:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#d00600] transition-colors';

  return (
    <label className='flex flex-col gap-2 text-sm text-neutral-300 min-w-0'>
      <span className='flex items-center gap-2'>
        {icon}
        <span>
          {label} {required && <span className='text-[#d00600]'>*</span>}
        </span>
      </span>
      {textarea ? (
        <textarea
          name={name}
          placeholder={placeholder}
          rows={4}
          className={`${inputClasses} resize-none`}
          required={required}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`${inputClasses} ${type === 'date' ? 'appearance-none' : ''}`}
        />
      )}
    </label>
  );
}

function InfoChip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5'>
      {icon}
      <span>{children}</span>
    </span>
  );
}

function UsersIcon() {
  return (
    <svg
      width='14'
      height='14'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className='text-[#d00600]'
    >
      <path
        d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4Z'
        fill='currentColor'
      />
    </svg>
  );
}
