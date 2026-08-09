'use client';

import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

/**
 * Flips between the light and dark theme. Rendered inside the header, which
 * sits on top of the hero video, so it uses the same translucent chrome
 * treatment as the language switcher.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const { theme, ready, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type='button'
      onClick={toggleTheme}
      aria-label={isDark ? t('switchToLight') : t('switchToDark')}
      title={isDark ? t('switchToLight') : t('switchToDark')}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-2 bg-surface text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink-1',
        // Until the stored preference is known the icon would be a guess —
        // fade it in instead of flashing the wrong one.
        !ready && 'opacity-0',
        className,
      )}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
