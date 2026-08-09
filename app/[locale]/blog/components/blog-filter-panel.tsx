'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { BlogTag } from '@/lib/services/blog';

/**
 * Search box and tag chips. Purely presentational: it owns no filter state and
 * runs no query, so the same panel serves the list page and anything else that
 * wants to filter posts later.
 */
export function BlogFilterPanel({
  tags,
  selectedTags,
  onToggleTag,
  onClearTags,
  search,
  onSearchChange,
  loading = false,
}: {
  tags: BlogTag[];
  selectedTags: string[];
  onToggleTag: (slug: string) => void;
  onClearTags: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
}) {
  const t = useTranslations('blog');

  return (
    <aside className='flex flex-col gap-6 md:sticky md:top-28 md:self-start'>
      <div>
        <label htmlFor='blog-search' className='sr-only'>
          {t('searchLabel')}
        </label>
        <div className='relative'>
          <Search
            className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-4'
            aria-hidden='true'
          />
          <input
            id='blog-search'
            type='search'
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
            className='w-full rounded-full border border-line bg-elev-1 py-2.5 pl-10 pr-4 text-sm text-ink-1 placeholder:text-ink-5 focus:border-brand/60 focus:outline-none'
          />
        </div>
      </div>

      {tags.length > 0 && (
        <div className='flex flex-col gap-3'>
          <div className='flex items-center justify-between'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-ink-4'>
              {t('tagsHeading')}
            </p>
            {selectedTags.length > 0 && (
              <button
                type='button'
                onClick={onClearTags}
                className='inline-flex items-center gap-1 text-xs font-medium text-brand-soft hover:text-brand'
              >
                <X className='h-3 w-3' />
                {t('clearTags')}
              </button>
            )}
          </div>

          <div className='flex flex-wrap gap-2'>
            {tags.map((tag) => {
              const active = selectedTags.includes(tag.slug);
              return (
                <button
                  key={tag.id}
                  type='button'
                  aria-pressed={active}
                  onClick={() => onToggleTag(tag.slug)}
                  className={cn(
                    'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
                    active
                      ? 'border-brand bg-brand text-brand-ink font-semibold'
                      : 'border-line bg-elev-1 text-ink-2 hover:border-brand/50 hover:text-ink-1',
                  )}
                >
                  {tag.name}
                </button>
              );
            })}
          </div>

          {selectedTags.length > 1 && (
            <p className='text-xs text-ink-4'>{t('tagsAndHint')}</p>
          )}
        </div>
      )}

      {loading && <p className='text-xs text-ink-4'>{t('loading')}</p>}
    </aside>
  );
}
