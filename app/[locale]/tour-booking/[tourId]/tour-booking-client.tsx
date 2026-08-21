'use client';

import {
  memo,
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useFormatter, useTranslations } from 'next-intl';
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

import { useRouter } from '@/i18n/navigation';
import BackgroundBlur from '@/components/background-blur';
import {
  BookingError,
  tourService,
  type BookingPayload,
} from '@/lib/services/tour';
import {
  useRelatedToursQuery,
  useTourDetailQuery,
} from '@/lib/services/queries';
import { saveBookingId } from '@/lib/services/booking-storage';
import { cn, formatDateDdMm } from '@/lib/utils';
import { BookingFlowHeader } from '../components/booking-flow-header';
import { ItineraryAccordion } from './components/itinerary-accordion';
import { MarkdownContent } from '@/components/markdown-content';
import { Expandable } from '@/components/expandable';
import { PriceInclusions } from '@/components/price-inclusions';
import { BookingJumpButton } from './components/booking-jump-button';
import { BookingMobileCta } from './components/booking-mobile-cta';
import { BookingFormModal } from './components/booking-form-modal';
import { RelatedToursCarousel } from './components/related-tours-carousel';
import { TourImageCollage } from './components/tour-image-collage';
import {
  getDurationDays,
  normalizeItineraryDays,
  parseTourPrice,
} from './booking-view-model';

type BookingFormState =
  | { status: 'idle'; message?: string; redirectTo?: undefined; bookingId?: undefined }
  | { status: 'success'; message: string; redirectTo: string; bookingId: number }
  | { status: 'error'; message: string; redirectTo?: undefined; bookingId?: undefined };

const initialFormState: BookingFormState = { status: 'idle', message: '' };

function SubmitButton({ label }: { label: string }) {
  const t = useTranslations('booking.form');
  const { pending } = useFormStatus();

  return (
    <button
      type='submit'
      disabled={pending}
      className='w-full py-3.5 rounded-2xl font-bold uppercase tracking-[0.12em] text-sm bg-surface-inverse text-surface-inverse-foreground hover:bg-brand hover:text-brand-ink active:bg-brand-strong transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
    >
      {pending ? t('submitting') : label}
    </button>
  );
}

export default function TourBookingClient({
  tourIdParam,
}: {
  tourIdParam: string;
}) {
  const router = useRouter();
  const t = useTranslations('booking');
  const tCommon = useTranslations('common');
  const format = useFormatter();
  const tourId = Number(tourIdParam);
  const bookingFormRef = useRef<HTMLDivElement>(null);
  const [formExpanded, setFormExpanded] = useState(false);

  // Desktop only, and only the first focus: a phone screen is already the
  // width of the form, so there is nothing to expand into.
  const handleFormFocus = useCallback(() => {
    if (window.matchMedia('(min-width: 768px)').matches) setFormExpanded(true);
  }, []);
  const collapseForm = useCallback(() => setFormExpanded(false), []);

  const { data: tour, isPending, isError } = useTourDetailQuery(tourId);
  const { data: relatedTours = [] } = useRelatedToursQuery(tourId);

  if (isPending) {
    return (
      <main className='min-h-screen bg-elev-1 text-ink-1 flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin' />
      </main>
    );
  }

  if (isError || !tour) {
    return (
      <main className='min-h-screen bg-elev-1 text-ink-1 flex flex-col items-center justify-center gap-4 px-6 text-center'>
        <AlertTriangle className='text-brand' size={36} />
        <p className='text-lg'>{t('notFound')}</p>
        <button
          onClick={() => router.back()}
          className='px-4 py-2 rounded-full border border-line-3 text-sm hover:border-ink-1 transition-colors flex items-center gap-2 active:bg-surface'
        >
          <ChevronLeft size={16} />
          {tCommon('back')}
        </button>
      </main>
    );
  }

  const durationDays = getDurationDays(tour.start_date, tour.end_date);
  const itineraryDays = normalizeItineraryDays(tour);
  const price = parseTourPrice(tour.price);
  const formattedPrice =
    price === null ? t('priceOnRequest') : format.number(price, 'vnd');
  const toursYouMayLike = relatedTours.filter((item) => item.id !== tour.id);

  return (
    <main className='min-h-screen bg-elev-1 text-ink-1 flex flex-col pt-24 px-4 md:px-8'>
      <BackgroundBlur imageUrl={tour.location.full_image_url} />

      <div className='w-full max-w-[1600px] mx-auto pb-12 flex flex-col gap-8 md:gap-10'>
        <header className='flex flex-col gap-3'>
          <BookingFlowHeader
            trail={[t('trail', { location: tour.location.name })]}
          />

          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl md:text-4xl font-black uppercase tracking-tight'>
              {tour.title}
            </h1>
            <p className='text-sm md:text-base text-ink-3 max-w-4xl'>
              {tour.summary?.trim() || t('summaryFallback')}
            </p>

            <BookingMobileCta targetRef={bookingFormRef} />
          </div>
        </header>

        <section className='w-full'>
          <TourImageCollage title={tour.title} images={tour.images} fallbackImageUrl={tour.location.full_image_url} />
        </section>

        <section className='grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1fr)_420px] items-start'>
          <div className='rounded-3xl border border-line bg-well p-5 md:p-8 space-y-6'>
            <div className='flex flex-wrap gap-2 md:gap-3 text-xs md:text-sm text-ink-3'>
              {durationDays && (
                <InfoChip icon={<Clock3 size={14} className='text-brand' />}>
                  {t('durationDays', { count: durationDays })}
                </InfoChip>
              )}
              <InfoChip icon={<MapPin size={14} className='text-brand' />}>
                {tour.location.name}
              </InfoChip>
              {tour.start_date && (
                <InfoChip icon={<Calendar size={14} className='text-brand' />}>
                  {formatDateDdMm(tour.start_date)}
                  {tour.end_date ? ` - ${formatDateDdMm(tour.end_date)}` : ''}
                </InfoChip>
              )}
              <InfoChip icon={<UsersIcon />}>
                {tCommon('slotsLeft', { count: tour.slots_left })}
              </InfoChip>
            </div>

            <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
              <div className='space-y-2'>
                <h2 className='text-2xl md:text-3xl font-black'>
                  {t('descriptionHeading')}
                </h2>
              </div>

              <div className='rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3 min-w-[210px]'>
                <p className='text-[11px] uppercase tracking-[0.12em] text-ink-3 flex items-center gap-2'>
                  <WalletCards size={14} className='text-brand' />
                  {t('priceLabel')}
                </p>
                {/* The tint behind this is brand-coloured, not the canvas, but
                    the number still has to read against whichever canvas the
                    tint sits on — white only ever worked on the dark one. */}
                <p className='text-xl md:text-2xl font-black text-ink-1 mt-1'>
                  {formattedPrice}
                </p>
              </div>
            </div>

            <Expandable>
              <MarkdownContent
                markdown={tour.description_md || tour.summary || ''}
                emptyMessage={t('markdownEmpty')}
              />
            </Expandable>

            {/* Inherited from the route — see PriceInclusions. */}
            <PriceInclusions
              includes={tour.price_includes}
              excludes={tour.price_excludes}
            />
          </div>

          {/* scroll-mt keeps the fixed header off the first field when the
              jump button brings the reader back here. */}
          <div ref={bookingFormRef} className='lg:sticky lg:top-28 scroll-mt-24 lg:scroll-mt-32'>
            <BookingFormModal
              open={formExpanded}
              onClose={collapseForm}
              onFocusCapture={handleFormFocus}
            >
              <BookingForm
                tourId={tour.id}
                locationName={tour.location.name}
                expanded={formExpanded}
              />
            </BookingFormModal>
          </div>
        </section>

        <section className='space-y-4'>
          <div className='flex items-end justify-between gap-3'>
            <div className='space-y-1'>
              <h2 className='text-2xl md:text-3xl font-black'>
                {t('itineraryHeading')}
              </h2>
              <p className='text-xs md:text-sm text-ink-4'>
                {t('itineraryHint')}
              </p>
            </div>
          </div>
          <ItineraryAccordion days={itineraryDays} />
        </section>

        <section className='space-y-4'>
          <div className='space-y-1'>
            <h2 className='text-2xl md:text-3xl font-black'>
              {t('relatedHeading')}
            </h2>
            <p className='text-xs md:text-sm text-ink-4'>
              {t('relatedHint')}
            </p>
          </div>
          <RelatedToursCarousel tours={toursYouMayLike} />
        </section>
      </div>

      <BookingJumpButton targetRef={bookingFormRef} />
    </main>
  );
}

const BookingForm = memo(function BookingForm({
  tourId,
  locationName,
  expanded,
}: {
  tourId: number;
  locationName: string;
  /** True while the form is shown as a modal, where it owns a fixed height. */
  expanded: boolean;
}) {
  const router = useRouter();
  const t = useTranslations('booking.form');
  const tErrors = useTranslations('bookingErrors');

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
        return { status: 'error', message: t('missingFields') };
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
          message: t('success'),
          redirectTo: `/tour-booking/${tourId}/success`,
          bookingId: booking.id,
        };
      } catch (err: unknown) {
        console.error(err);
        return {
          status: 'error',
          message: tErrors(err instanceof BookingError ? err.code : 'UNKNOWN'),
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
    <div
      className={cn(
        'w-full bg-elev-2 border border-line rounded-3xl shadow-[var(--shadow-strong)] p-5 md:p-6 flex flex-col gap-6',
        // As a modal the card is given a height, and min-h-0 is what lets the
        // field list inside it shrink far enough to scroll on its own.
        expanded && 'h-full min-h-0',
      )}
    >
      <div className='flex flex-col gap-1'>
        <h2 className='text-2xl font-black text-ink-1'>{t('title')}</h2>
        <p className='text-ink-4 text-sm'>
          {t('subtitle', { location: locationName })}
        </p>
      </div>

      {formState.status === 'success' && (
        <div className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand/15 border border-brand/40 text-brand-soft-2 text-sm'>
          <LoaderCircle size={18} className='animate-spin' />
          <span>{formState.message}</span>
        </div>
      )}
      {formState.status === 'error' && (
        <div className='flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand/10 border border-brand/40 text-brand-soft-2 text-sm'>
          <AlertTriangle size={18} />
          <span>{formState.message}</span>
        </div>
      )}

      <form
        action={formAction}
        className={cn('flex flex-col gap-4', expanded && 'flex-1 min-h-0')}
      >
        <input type='hidden' name='tour' value={tourId} />

        {/* Only the fields scroll. The heading above and the submit below stay
            put, so the reader never loses sight of what they are filling in or
            of the way to send it. */}
        <div
          className={cn(
            'flex flex-col gap-4',
            expanded && 'flex-1 min-h-0 overflow-y-auto pr-1',
          )}
        >
            <Field
            name='full_name'
            label={t('fullName')}
            placeholder={t('fullNamePlaceholder')}
            icon={<User size={16} />}
            required
          />
          <Field
            name='medal_name'
            label={t('medalName')}
            placeholder={t('medalNamePlaceholder')}
            required
          />
          <Field
            name='phone'
            label={t('phone')}
            placeholder={t('phonePlaceholder')}
            icon={<Phone size={16} />}
            required
          />
          <Field name='dob' label={t('dob')} type='date' required />
          <Field
            name='email'
            label={t('email')}
            placeholder={t('emailPlaceholder')}
            icon={<Mail size={16} />}
            type='email'
          />
          <Field
            name='citizen_id'
            label={t('citizenId')}
            placeholder={t('citizenIdPlaceholder')}
            required
          />
          <Field
            name='note'
            label={t('note')}
            placeholder={t('notePlaceholder')}
            textarea
          />
        </div>

        <SubmitButton label={t('submit')} />
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
    'w-full min-w-0 max-w-full bg-surface border border-line rounded-2xl px-4 py-3 text-base md:text-sm text-ink-1 placeholder:text-ink-5 focus:outline-none focus:border-brand transition-colors';

  return (
    <label className='flex flex-col gap-2 text-sm text-ink-3 min-w-0'>
      <span className='flex items-center gap-2'>
        {icon}
        <span>
          {label} {required && <span className='text-brand'>*</span>}
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
    <span className='inline-flex items-center gap-2 rounded-full border border-line bg-well px-3 py-1.5'>
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
      className='text-brand'
    >
      <path
        d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v1h16v-1c0-2.66-5.33-4-8-4Z'
        fill='currentColor'
      />
    </svg>
  );
}
