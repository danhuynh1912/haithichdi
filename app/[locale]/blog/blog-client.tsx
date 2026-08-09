'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { useBlogPostsQuery, useBlogTagsQuery } from '@/lib/services/queries';
import { ANIMATION_EASE } from '@/lib/constants';
import { BlogCard } from './components/blog-card';
import { BlogFilterPanel } from './components/blog-filter-panel';

export default function BlogClient() {
  const t = useTranslations('blog');

  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Every keystroke would otherwise be a round trip; 300ms matches the tours
  // search so the two screens feel the same.
  const debouncedSearch = useDebounce(search, 300);

  const { data: tags = [] } = useBlogTagsQuery();
  const {
    data: posts = [],
    isPending,
    isFetching,
    isError,
    refetch,
  } = useBlogPostsQuery({ search: debouncedSearch, tagSlugs: selectedTags });

  const toggleTag = useCallback((slug: string) => {
    setSelectedTags((previous) =>
      previous.includes(slug)
        ? previous.filter((item) => item !== slug)
        : [...previous, slug],
    );
  }, []);

  const clearTags = useCallback(() => setSelectedTags([]), []);

  return (
    <main className='min-h-screen bg-elev-0 text-ink-1 px-4 pt-24 pb-16 md:px-8'>
      <div className='mx-auto max-w-[1400px]'>
        <header className='mb-10'>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            className='text-[11px] font-bold uppercase tracking-[0.3em] text-brand md:text-sm'
          >
            {t('eyebrow')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.6, ease: ANIMATION_EASE }}
            className='mt-2 text-3xl font-black uppercase tracking-tight md:text-5xl'
          >
            {t('title')}
          </motion.h1>
          <p className='mt-3 max-w-2xl text-sm text-ink-3 md:text-base'>
            {t('description')}
          </p>
        </header>

        <div className='grid grid-cols-1 gap-8 md:grid-cols-[260px_1fr]'>
          <BlogFilterPanel
            tags={tags}
            selectedTags={selectedTags}
            onToggleTag={toggleTag}
            onClearTags={clearTags}
            search={search}
            onSearchChange={setSearch}
            loading={isFetching && !isPending}
          />

          <section aria-live='polite'>
            {isPending ? (
              <BlogGridSkeleton />
            ) : isError ? (
              // Distinct from the empty state on purpose: "no posts match" and
              // "the request failed" look identical to a reader otherwise, and
              // only one of them is worth retrying.
              <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line px-6 py-16 text-center'>
                <p className='text-sm text-ink-3'>{t('error')}</p>
                <button
                  type='button'
                  onClick={() => refetch()}
                  className='rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink-1 transition-colors hover:border-brand hover:text-brand'
                >
                  {t('retry')}
                </button>
              </div>
            ) : posts.length === 0 ? (
              <p className='rounded-2xl border border-dashed border-line px-6 py-16 text-center text-sm text-ink-4'>
                {t('empty')}
              </p>
            ) : (
              <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
                {posts.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function BlogGridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className='overflow-hidden rounded-3xl border border-line bg-elev-1'
        >
          <div className='aspect-[16/10] animate-pulse bg-elev-3' />
          <div className='flex flex-col gap-3 p-5'>
            <div className='h-3 w-20 animate-pulse rounded bg-elev-3' />
            <div className='h-5 w-3/4 animate-pulse rounded bg-elev-3' />
            <div className='h-3 w-full animate-pulse rounded bg-elev-3' />
            <div className='h-3 w-2/3 animate-pulse rounded bg-elev-3' />
          </div>
        </div>
      ))}
    </div>
  );
}
