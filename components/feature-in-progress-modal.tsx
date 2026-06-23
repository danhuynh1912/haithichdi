'use client';

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
  title = 'Đang phát triển',
  message = 'Tính năng này đang phát triển',
}: FeatureInProgressModalProps) {
  return (
    <FullscreenModalShell
      open={open}
      onClose={onClose}
      closeAriaLabel='Đóng thông báo'
      containerClassName='h-full w-full flex items-center justify-center p-4'
      contentClassName='h-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-black/90 text-white'
    >
      <div className='p-6 pt-14 text-center'>
        <h3 className='text-xl font-black tracking-tight'>{title}</h3>
        <p className='mt-2 text-sm text-neutral-300'>{message}</p>
      </div>
    </FullscreenModalShell>
  );
}
