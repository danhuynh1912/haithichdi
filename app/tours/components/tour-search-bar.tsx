'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TourSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function TourSearchBar({ value, onChange, className }: TourSearchBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 w-full px-4 py-3 rounded-3xl border border-white/10 bg-white/5 text-white',
        className,
      )}
    >
      <Search size={18} className='text-red-500' />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='Tìm tour theo tên...'
        className='bg-transparent flex-1 outline-none text-base md:text-sm placeholder:text-neutral-500'
      />
    </div>
  );
}
