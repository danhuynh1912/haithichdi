'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useFormatter } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ANIMATION_EASE } from '@/lib/constants';
import type { BlogCard as BlogCardData } from '@/lib/services/blog';

export function BlogCard({ post, index }: { post: BlogCardData; index: number }) {
  const format = useFormatter();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: ANIMATION_EASE, delay: Math.min(index, 6) * 0.04 }}
      className='group flex flex-col overflow-hidden rounded-3xl border border-line bg-elev-1 transition-colors hover:border-brand/50'
    >
      <Link href={`/blog/${post.slug}`} className='flex h-full flex-col'>
        <div className='relative aspect-[16/10] overflow-hidden bg-elev-3'>
          {post.hero_url ? (
            <Image
              src={post.hero_url}
              alt={post.hero_alt || post.title}
              fill
              unoptimized
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
              className='object-cover transition-transform duration-500 group-hover:scale-105'
            />
          ) : null}
        </div>

        <div className='flex flex-1 flex-col gap-3 p-5'>
          {post.tags.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className='rounded-full border border-line bg-surface px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-brand-soft'
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h2 className='text-lg font-bold leading-snug text-ink-1 transition-colors group-hover:text-brand-soft'>
            {post.title}
          </h2>

          {post.excerpt ? (
            <p className='line-clamp-3 text-sm leading-relaxed text-ink-3'>{post.excerpt}</p>
          ) : null}

          {post.published_at ? (
            <time
              dateTime={post.published_at}
              className='mt-auto pt-2 text-xs text-ink-4'
            >
              {format.dateTime(new Date(post.published_at), 'date')}
            </time>
          ) : null}
        </div>
      </Link>
    </motion.article>
  );
}
