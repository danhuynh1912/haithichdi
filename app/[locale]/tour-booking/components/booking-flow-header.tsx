'use client';

import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

interface BookingFlowHeaderProps {
  trail: string[];
  backLabel?: string;
  className?: string;
  onBack?: () => void;
}

export function BookingFlowHeader({
  trail,
  backLabel,
  className,
  onBack,
}: BookingFlowHeaderProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const handleBack = () => {
    if (onBack) return onBack();
    router.back();
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 text-sm text-neutral-400 uppercase tracking-normal md:tracking-[0.2em]',
        className,
      )}
    >
      <button
        onClick={handleBack}
        className='flex items-center gap-2 text-neutral-500 hover:text-white transition-colors'
      >
        <ChevronLeft size={18} />
        {backLabel ?? t('back')}
      </button>
      {trail.map((item, idx) => (
        <div key={idx} className='flex items-center gap-3'>
          <span className='text-neutral-600'>/</span>
          <span className='text-[#d00600] font-semibold'>{item}</span>
        </div>
      ))}
    </div>
  );
}
