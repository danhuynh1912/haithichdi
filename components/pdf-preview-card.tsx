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
          'bg-elev-2 border border-line rounded-3xl overflow-hidden shadow-[var(--shadow-strong)] flex flex-col',
          className,
        )}
      >
        {inlinePdfSrc ? (
          isMobile ? (
            thumbSrc ? (
              <div className='relative w-full aspect-[16/9] bg-elev-4'>
                <Image
                  src={thumbSrc}
                  alt={t('thumbnailAlt', { title })}
                  fill
                  unoptimized={thumbIsRemote}
                  className='object-cover'
                />
              </div>
            ) : (
              <div className='flex-1 min-h-[220px] px-6 py-8 flex flex-col items-center justify-center gap-3 text-center text-ink-4'>
                <FileText className='text-brand' size={32} />
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
          <div className='w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-3 text-ink-4 px-6 py-8 text-center'>
            <FileText className='text-brand' size={32} />
            <p>{emptyMessage ?? t('empty')}</p>
          </div>
        )}

        {viewerUrl && (
          <div className='px-4 py-3 border-t border-line flex justify-end'>
            {isMobile ? (
              <button
                onClick={() => setIsViewerOpen(true)}
                className='inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink-1 transition-colors'
              >
                {mobileCtaLabel ?? t('cta')}
              </button>
            ) : (
              <a
                href={viewerUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 text-xs text-ink-3 hover:text-ink-1 transition-colors'
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
        contentClassName='bg-elev-0 text-ink-1'
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
                className='absolute left-3 bottom-3 rounded-full border border-line-3 bg-elev-0/70 backdrop-blur-sm px-3 py-1.5 text-[11px] text-ink-1'
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
