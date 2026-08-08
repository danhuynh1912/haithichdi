'use client';

import { cn } from '@/lib/utils';

interface HomeMobileSectionSkeletonProps {
  variant: 'location' | 'tour';
  count?: number;
  className?: string;
}

export default function HomeMobileSectionSkeleton({
  variant,
  count = 3,
  className,
}: HomeMobileSectionSkeletonProps) {
  if (variant === 'location') {
    return (
      <div
        className={cn(
          'flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          className,
        )}
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={`location-skeleton-${index}`}
            className='h-44 w-40 shrink-0 rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse'
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`tour-skeleton-${index}`}
          className='h-40 w-full rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse'
        />
      ))}
    </div>
  );
}
