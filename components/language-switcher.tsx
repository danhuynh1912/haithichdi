'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { LOCALE_LABEL, routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

/**
 * Swaps the locale while staying on the current page — the path and query
 * string are preserved, only the locale prefix changes.
 */
export default function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('nav');
  const activeLocale = useLocale();
  // Locale-aware: already stripped of the `/en` prefix.
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Read at click time rather than via `useSearchParams`, which would opt every
  // page containing the header out of static prerendering.
  const currentHref = () => `${pathname}${window.location.search}`;

  return (
    <div
      role='group'
      aria-label={t('language')}
      className={cn(
        'inline-flex items-center rounded-full border border-line-2 bg-surface p-0.5 text-[11px] font-semibold',
        isPending && 'opacity-60',
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;

        return (
          <button
            key={locale}
            type='button'
            lang={locale}
            aria-current={isActive ? 'true' : undefined}
            aria-label={t('switchTo', { language: LOCALE_LABEL[locale] })}
            disabled={isActive || isPending}
            onClick={() =>
              startTransition(() => {
                router.replace(currentHref(), { locale, scroll: false });
              })
            }
            className={cn(
              'rounded-full px-2.5 py-1 transition-colors',
              isActive
                ? 'bg-brand text-brand-ink'
                : 'text-ink-3 hover:text-ink-1 hover:bg-surface-2',
            )}
          >
            {LOCALE_LABEL[locale]}
          </button>
        );
      })}
    </div>
  );
}
