'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Location, Tour } from '../types';
import { locationService } from '@/lib/services/location';
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
  const router = useRouter();
  const isMobile = useIsMobile();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) {
      setTours([]);
      return;
    }

    const fetchTours = async () => {
      setLoading(true);
      try {
        const data = await locationService.getToursByLocation(location.id);
        setTours(data);
      } catch (error) {
        console.error('Error fetching tours:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [location]);

  const pdfUrl = location?.quotation_file_url || null;

  return (
    <FullscreenModalShell
      open={Boolean(location)}
      onClose={onClose}
      closeAriaLabel='Đóng chi tiết cung'
      contentClassName='text-white h-full w-full overflow-y-auto'
      contentKey={location?.id}
    >
      {location && (
        isMobile ? (
          <div className='w-full min-h-full p-4'>
            <div className='w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 shadow-2xl'>
              <PdfPreviewCard
                pdfUrl={pdfUrl}
                title={`Quotation - ${location.name}`}
                className='w-full border-0 rounded-none shadow-none'
                emptyMessage='Chưa có file quotation cho địa điểm này.'
                thumbnailUrl={location.full_image_url}
                mobileCtaLabel='Xem lịch trình và báo giá'
              />

              <div className='p-4'>
                <p
                  className={`text-red-500 font-bold uppercase text-xs mb-2 ${
                    compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                  }`}
                >
                  Các cung
                </p>
                <h2 className='text-xl font-black uppercase tracking-tight text-white mb-2'>
                  {location.name}
                </h2>
                <p className='text-neutral-400 text-xs leading-relaxed mb-4'>
                  {location.description}
                </p>

                <div className='flex items-center justify-between mb-3 gap-3'>
                  <h3 className='text-white font-bold text-base flex items-center gap-2'>
                    Tours sắp tới
                    <span className='px-2 py-0.5 bg-red-600/20 text-red-500 text-[10px] rounded-full uppercase tracking-widest'>
                      {tours.length} tours
                    </span>
                  </h3>
                  <button
                    className={`text-neutral-500 hover:text-red-500 text-xs font-bold flex items-center gap-1 uppercase transition-colors cursor-pointer ${
                      compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                    }`}
                  >
                    Xem thêm <MoveRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <div className='space-y-3'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='h-20 bg-white/5 rounded-2xl animate-pulse' />
                    ))}
                  </div>
                ) : tours.length > 0 ? (
                  <div className='space-y-3'>
                    {tours.map((tour) => (
                      <div
                        key={tour.id}
                        className='group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 cursor-pointer flex justify-between items-center transition-colors'
                        onClick={() => router.push(`/tour-booking/${tour.id}`)}
                      >
                        <div className='flex flex-col gap-1.5'>
                          <h4 className='font-bold text-sm text-white group-hover:text-red-500 transition-colors uppercase tracking-wide'>
                            {tour.title}
                          </h4>
                          <div className='flex items-center gap-4 text-xs text-neutral-400'>
                            <span className='flex items-center gap-1.5'>
                              <Calendar size={14} className='text-red-600' />
                              {formatDateDdMm(tour.start_date)}
                            </span>
                            <span className='flex items-center gap-1.5'>
                              <Users size={14} className='text-red-600' />
                              Còn {tour.slots_left} chỗ
                            </span>
                          </div>
                        </div>
                        <div className='p-2 rounded-full bg-white/5 group-hover:bg-red-600 group-hover:text-white transition-colors text-neutral-500'>
                          <MoveRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='py-10 text-center'>
                    <p className='text-neutral-500 italic'>
                      Hiện chưa có tour cho cung đường này.
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
              title={`Quotation - ${location.name}`}
              className='w-full md:w-[70%] min-h-[50vh] md:min-h-[75vh]'
              frameClassName='w-full h-full min-h-[50vh] md:min-h-[75vh]'
              emptyMessage='Chưa có file quotation cho địa điểm này.'
            />

            {/* Right: Tours list */}
            <div className='w-full md:w-[30%] bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden md:max-h-[75vh]'>
              <div className='p-3 md:p-6 border-b border-white/5'>
                <p
                  className={`text-red-500 font-bold uppercase text-xs mb-2 ${
                    compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                  }`}
                >
                  Các cung
                </p>
                <h2 className='text-xl md:text-3xl font-black uppercase tracking-tight text-white mb-3'>
                  {location.name}
                </h2>
                <p className='text-neutral-400 text-xs md:text-sm leading-relaxed line-clamp-3'>
                  {location.description}
                </p>
              </div>

              <div className='flex-1 overflow-y-visible md:overflow-y-auto p-3 md:p-6 custom-scrollbar'>
                <div className='md:flex items-center justify-between mb-4 gap-3'>
                  <h3 className='text-white font-bold text-base md:text-lg flex items-center gap-2 mb-2 md:mb-0'>
                    Tours sắp tới
                    <span className='px-2 py-0.5 bg-red-600/20 text-red-500 text-[10px] rounded-full uppercase tracking-widest'>
                      {tours.length} tours
                    </span>
                  </h3>
                  <button
                    className={`text-neutral-500 hover:text-red-500 text-xs font-bold flex items-center gap-1 uppercase transition-colors cursor-pointer ${
                      compact ? 'tracking-[0.1em]' : 'tracking-[0.2em]'
                    }`}
                  >
                    Xem thêm <MoveRight size={14} />
                  </button>
                </div>

                {loading ? (
                  <div className='space-y-3'>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className='h-20 bg-white/5 rounded-2xl animate-pulse' />
                    ))}
                  </div>
                ) : tours.length > 0 ? (
                  <div className='space-y-3'>
                    {tours.map((tour) => (
                      <div
                        key={tour.id}
                        className='group bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 cursor-pointer flex justify-between items-center transition-colors'
                        onClick={() => router.push(`/tour-booking/${tour.id}`)}
                      >
                        <div className='flex flex-col gap-1.5'>
                          <h4 className='font-bold text-sm md:text-base text-white group-hover:text-red-500 transition-colors uppercase tracking-wide'>
                            {tour.title}
                          </h4>
                          <div className='flex items-center gap-4 text-xs text-neutral-400'>
                            <span className='flex items-center gap-1.5'>
                              <Calendar size={14} className='text-red-600' />
                              {formatDateDdMm(tour.start_date)}
                            </span>
                            <span className='flex items-center gap-1.5'>
                              <Users size={14} className='text-red-600' />
                              Còn {tour.slots_left} chỗ
                            </span>
                          </div>
                        </div>
                        <div className='p-2 rounded-full bg-white/5 group-hover:bg-red-600 group-hover:text-white transition-colors text-neutral-500'>
                          <MoveRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='py-10 text-center'>
                    <p className='text-neutral-500 italic'>
                      Hiện chưa có tour cho cung đường này.
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
