'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Location } from '@/lib/types';
import { useLocationToursQuery } from '@/lib/services/queries';
import { Calendar, Users, MoveRight } from 'lucide-react';
import FullscreenModalShell from '@/components/fullscreen-modal-shell';
import PdfPreviewCard from '@/components/pdf-preview-card';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import { formatDateDdMm } from '@/lib/utils';

interface LocationDetailModalProps {
  location: Location | null;
  compact?: boolean;
  onClose: () => void;
}

export default function LocationDetailModal({
  location,
  compact = false,
  onClose,
}: LocationDetailModalProps) {
  const t = useTranslations('locations.modal');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data: tours = [], isPending } = useLocationToursQuery(
    location?.id ?? null,
  );
  const loading = Boolean(location) && isPending;

  const pdfUrl = location?.quotation_file_url || null;

  return (
    <FullscreenModalShell
      open={Boolean(location)}
      onClose={onClose}
      closeAriaLabel={t('closeAria')}
      contentClassName='text-ink-1 h-full w-full overflow-y-auto'
      contentKey={location?.id}
    >
      {location && (
        isMobile ? (
          <div className='w-full min-h-full p-4'>
            <div className='w-full overflow-hidden rounded-3xl border border-line bg-elev-2 shadow-[var(--shadow-strong)]'>
              <PdfPreviewCard
                pdfUrl={pdfUrl}
                title={t('quotationTitle', { name: location.name })}
                className='w-full border-0 rounded-none shadow-none'
                emptyMessage={t('quotationEmpty')}
                thumbnailUrl={location.full_image_url}
                mobileCtaLabel={t('quotationMobileCta')}
              />

              <div className='p-4'>
                <p
                  className={`text-brand font-bold uppercase text-xs mb-2 ${
                    compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                  }`}
                >
                  {t('sectionLabel')}
                </p>
                <h2 className='text-xl font-black uppercase tracking-tight text-ink-1 mb-2'>
                  {location.name}
                </h2>
                <p className='text-ink-4 text-xs leading-relaxed mb-4'>
                  {location.description}
                </p>

                <div className='flex items-center justify-between mb-3 gap-3'>
                  <h3 className='text-ink-1 font-bold text-base flex items-center gap-2'>
                    {t('upcomingTours')}
                    <span className='px-2 py-0.5 bg-brand/20 text-brand text-[10px] rounded-full uppercase tracking-widest'>
                      {tCommon('tourCount', { count: tours.length })}
                    </span>
                  </h3>
                  <button
                    className={`text-ink-5 hover:text-brand text-xs font-bold flex items-center gap-1 uppercase transition-colors cursor-pointer ${
                      compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                    }`}
                  >
                    {tCommon('seeMore')} <MoveRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <div className='space-y-3'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='h-20 bg-surface rounded-2xl animate-pulse' />
                    ))}
                  </div>
                ) : tours.length > 0 ? (
                  <div className='space-y-3'>
                    {tours.map((tour) => (
                      <div
                        key={tour.id}
                        className='group bg-surface hover:bg-surface-2 p-4 rounded-2xl border border-line/60 cursor-pointer flex justify-between items-center transition-colors'
                        onClick={() => router.push(`/tour-booking/${tour.id}`)}
                      >
                        <div className='flex flex-col gap-1.5'>
                          <h4 className='font-bold text-sm text-ink-1 group-hover:text-brand transition-colors uppercase tracking-wide'>
                            {tour.title}
                          </h4>
                          <div className='flex items-center gap-4 text-xs text-ink-4'>
                            <span className='flex items-center gap-1.5'>
                              <Calendar size={14} className='text-brand' />
                              {formatDateDdMm(tour.start_date)}
                            </span>
                            <span className='flex items-center gap-1.5'>
                              <Users size={14} className='text-brand' />
                              {tCommon('slotsLeft', { count: tour.slots_left })}
                            </span>
                          </div>
                        </div>
                        <div className='p-2 rounded-full bg-surface group-hover:bg-brand group-hover:text-brand-ink transition-colors text-ink-5'>
                          <MoveRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='py-10 text-center'>
                    <p className='text-ink-5 italic'>
                      {t('noTours')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='w-full min-h-full flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-8 max-w-screen-2xl mx-auto'>
            <PdfPreviewCard
              pdfUrl={pdfUrl}
              title={t('quotationTitle', { name: location.name })}
              className='w-full md:w-[70%] min-h-[50vh] md:min-h-[75vh]'
              frameClassName='w-full h-full min-h-[50vh] md:min-h-[75vh]'
              emptyMessage={t('quotationEmpty')}
            />

            {/* Right: Tours list */}
            <div className='w-full md:w-[30%] bg-elev-2 border border-line rounded-3xl shadow-[var(--shadow-strong)] flex flex-col overflow-hidden md:max-h-[75vh]'>
              <div className='p-3 md:p-6 border-b border-line/60'>
                <p
                  className={`text-brand font-bold uppercase text-xs mb-2 ${
                    compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                  }`}
                >
                  {t('sectionLabel')}
                </p>
                <h2 className='text-xl md:text-3xl font-black uppercase tracking-tight text-ink-1 mb-3'>
                  {location.name}
                </h2>
                <p className='text-ink-4 text-xs md:text-sm leading-relaxed line-clamp-3'>
                  {location.description}
                </p>
              </div>

              <div className='flex-1 overflow-y-visible md:overflow-y-auto p-3 md:p-6 custom-scrollbar'>
                <div className='md:flex items-center justify-between mb-4 gap-3'>
                  <h3 className='text-ink-1 font-bold text-base md:text-lg flex items-center gap-2 mb-2 md:mb-0'>
                    {t('upcomingTours')}
                    <span className='px-2 py-0.5 bg-brand/20 text-brand text-[10px] rounded-full uppercase tracking-widest'>
                      {tCommon('tourCount', { count: tours.length })}
                    </span>
                  </h3>
                  <button
                    className={`text-ink-5 hover:text-brand text-xs font-bold flex items-center gap-1 uppercase transition-colors cursor-pointer ${
                      compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                    }`}
                  >
                    {tCommon('seeMore')} <MoveRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <div className='space-y-3'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='h-20 bg-surface rounded-2xl animate-pulse' />
                    ))}
                  </div>
                ) : tours.length > 0 ? (
                  <div className='space-y-3'>
                    {tours.map((tour) => (
                      <div
                        key={tour.id}
                        className='group bg-surface hover:bg-surface-2 p-4 rounded-2xl border border-line/60 cursor-pointer flex justify-between items-center transition-colors'
                        onClick={() => router.push(`/tour-booking/${tour.id}`)}
                      >
                        <div className='flex flex-col gap-1.5'>
                          <h4 className='font-bold text-sm md:text-base text-ink-1 group-hover:text-brand transition-colors uppercase tracking-wide'>
                            {tour.title}
                          </h4>
                          <div className='flex items-center gap-4 text-xs text-ink-4'>
                            <span className='flex items-center gap-1.5'>
                              <Calendar size={14} className='text-brand' />
                              {formatDateDdMm(tour.start_date)}
                            </span>
                            <span className='flex items-center gap-1.5'>
                              <Users size={14} className='text-brand' />
                              {tCommon('slotsLeft', { count: tour.slots_left })}
                            </span>
                          </div>
                        </div>
                        <div className='p-2 rounded-full bg-surface group-hover:bg-brand group-hover:text-brand-ink transition-colors text-ink-5'>
                          <MoveRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='py-10 text-center'>
                    <p className='text-ink-5 italic'>
                      {t('noTours')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </FullscreenModalShell>
  );
}
