'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FileText } from 'lucide-react';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import {
  buildGoogleViewerUrl,
  buildInlinePdfPreviewSrc,
  cn,
} from '@/lib/utils';
import FullscreenModalShell from './fullscreen-modal-shell';

interface PdfPreviewCardProps {
  pdfUrl: string | null;
  title: string;
  className?: string;
  frameClassName?: string;
  emptyMessage?: string;
  thumbnailUrl?: string | null;
  mobileCtaLabel?: string;
}

export default function PdfPreviewCard({
  pdfUrl,
  title,
  className,
  frameClassName,
  emptyMessage,
  thumbnailUrl,
  mobileCtaLabel,
}: PdfPreviewCardProps) {
  const t = useTranslations('pdf');
  const isMobile = useIsMobile();
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const inlinePdfSrc = useMemo(
    () => (pdfUrl ? buildInlinePdfPreviewSrc(pdfUrl) : null),
    [pdfUrl],
  );
  const viewerUrl = useMemo(
    () => (pdfUrl ? buildGoogleViewerUrl(pdfUrl) : null),
    [pdfUrl],
  );
  const mobileViewerUrl = useMemo(() => (pdfUrl ? pdfUrl : null), [pdfUrl]);
  const thumbSrc = thumbnailUrl && thumbnailUrl.trim() ? thumbnailUrl : null;
  const thumbIsRemote = Boolean(thumbSrc?.startsWith('http'));

  return (
    <>
      <div
        className={cn(
          'bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col',
          className,
        )}
      >
        {inlinePdfSrc ? (
          isMobile ? (
            thumbSrc ? (
              <div className='relative w-full aspect-[16/9] bg-black'>
                <Image
                  src={thumbSrc}
                  alt={t('thumbnailAlt', { title })}
                  fill
                  unoptimized={thumbIsRemote}
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='flex-1 min-h-[220px] px-6 py-8 flex flex-col items-center justify-center gap-3 text-center text-neutral-400'>
                <FileText className='text-[#d00600]' size={32} />
                <p className='text-sm'>{t('mobileHint')}</p>
              </div>
            )
          ) : (
            <iframe
              src={inlinePdfSrc}
              title={title}
              className={cn('w-full flex-1 min-h-[420px]', frameClassName)}
            />
          )
        ) : (
          <div className='w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-3 text-neutral-400 px-6 py-8 text-center'>
            <FileText className='text-[#d00600]' size={32} />
            <p>{emptyMessage ?? t('empty')}</p>
          </div>
        )}

        {viewerUrl && (
          <div className='px-4 py-3 border-t border-white/10 flex justify-end'>
            {isMobile ? (
              <button
                onClick={() => setIsViewerOpen(true)}
                className='inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors'
              >
                {mobileCtaLabel ?? t('cta')}
              </button>
            ) : (
              <a
                href={viewerUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 text-xs text-neutral-300 hover:text-white transition-colors'
              >
                {t('cta')}
              </a>
            )}
          </div>
        )}
      </div>

      <FullscreenModalShell
        open={Boolean(isMobile && isViewerOpen && mobileViewerUrl)}
        onClose={() => setIsViewerOpen(false)}
        closeAriaLabel={t('closeAria')}
        contentClassName='bg-black text-white'
      >
        {mobileViewerUrl && (
          <div className='relative h-full w-full'>
            <iframe
              src={mobileViewerUrl}
              title={t('detailTitle', { title })}
              className='w-full h-full border-0'
            />
            {viewerUrl && (
              <a
                href={viewerUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='absolute left-3 bottom-3 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-[11px] text-white'
              >
                {t('openNewTab')}
              </a>
            )}
          </div>
        )}
      </FullscreenModalShell>
    </>
  );
}
