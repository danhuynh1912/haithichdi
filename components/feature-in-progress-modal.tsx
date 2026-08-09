'use client';

import { useTranslations } from 'next-intl';
import FullscreenModalShell from '@/components/fullscreen-modal-shell';

interface FeatureInProgressModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function FeatureInProgressModal({
  open,
  onClose,
  title,
  message,
}: FeatureInProgressModalProps) {
  const t = useTranslations('featureInProgress');

  return (
    <FullscreenModalShell
      open={open}
      onClose={onClose}
      closeAriaLabel={t('closeAria')}
      containerClassName='h-full w-full flex items-center justify-center p-4'
      contentClassName='h-auto w-full max-w-md overflow-hidden rounded-3xl border border-line-2 bg-elev-0/95 text-ink-1'
    >
      <div className='p-6 pt-14 text-center'>
        <h3 className='text-xl font-black tracking-tight'>{title ?? t('title')}</h3>
        <p className='mt-2 text-sm text-ink-3'>{message ?? t('message')}</p>
      </div>
    </FullscreenModalShell>
  );
}
