'use client';

import Image from 'next/image';
import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { resolveMediaUrl } from '@/lib/media';
import { cn } from '@/lib/utils';

/** Intrinsic size of one uploaded image, keyed by its S3 key. */
export interface MarkdownImageSize {
  image_path: string;
  width: number | null;
  height: number | null;
}

/**
 * The one place that decides how article markdown looks.
 *
 * Raw HTML inside the source is ignored — `rehype-raw` is deliberately absent,
 * so a pasted `<script>` renders as text rather than executing. Anything that
 * needs richer output belongs in this component, not in the stored content.
 */
export function MarkdownContent({
  markdown,
  imageSizes = [],
  className,
}: {
  markdown: string;
  imageSizes?: MarkdownImageSize[];
  className?: string;
}) {
  const sizeByPath = new Map(imageSizes.map((image) => [image.image_path, image]));

  const components: Components = {
    h1: ({ children }) => (
      <h2 className='mt-10 mb-4 text-2xl md:text-3xl font-black text-ink-1'>{children}</h2>
    ),
    h2: ({ children }) => (
      <h3 className='mt-9 mb-3 text-xl md:text-2xl font-bold text-ink-1'>{children}</h3>
    ),
    h3: ({ children }) => (
      <h4 className='mt-7 mb-2 text-lg font-semibold text-ink-1'>{children}</h4>
    ),
    p: ({ children }) => (
      <p className='my-4 text-base leading-[1.8] text-ink-2'>{children}</p>
    ),
    ul: ({ children }) => (
      <ul className='my-4 space-y-2 pl-6 list-disc text-base text-ink-2'>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className='my-4 space-y-2 pl-6 list-decimal text-base text-ink-2'>{children}</ol>
    ),
    li: ({ children }) => <li className='leading-[1.8]'>{children}</li>,
    strong: ({ children }) => <strong className='font-semibold text-ink-1'>{children}</strong>,
    em: ({ children }) => <em className='italic'>{children}</em>,
    blockquote: ({ children }) => (
      <blockquote className='my-6 border-l-4 border-brand/60 bg-surface pl-4 py-2 text-ink-3 italic'>
        {children}
      </blockquote>
    ),
    hr: () => <hr className='my-10 border-line' />,
    code: ({ children, className: codeClass }) => {
      // react-markdown gives fenced blocks a `language-*` class; bare inline
      // code has none, and the two want very different styling.
      const isBlock = Boolean(codeClass);
      if (isBlock) {
        return (
          <code className='block overflow-x-auto rounded-xl bg-elev-3 p-4 font-mono text-sm text-ink-2'>
            {children}
          </code>
        );
      }
      return (
        <code className='rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink-1'>
          {children}
        </code>
      );
    },
    pre: ({ children }) => <pre className='my-6'>{children}</pre>,
    a: ({ href, children }) => {
      const isExternal = Boolean(href && /^https?:\/\//.test(href));
      return (
        <a
          href={href}
          className='font-medium text-brand-soft underline underline-offset-4 hover:text-brand'
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {children}
        </a>
      );
    },
    table: ({ children }) => (
      <div className='my-6 overflow-x-auto'>
        <table className='w-full border-collapse text-sm text-ink-2'>{children}</table>
      </div>
    ),
    th: ({ children }) => (
      <th className='border border-line bg-surface px-3 py-2 text-left font-semibold text-ink-1'>
        {children}
      </th>
    ),
    td: ({ children }) => <td className='border border-line px-3 py-2'>{children}</td>,
    img: ({ src, alt }) => {
      const key = typeof src === 'string' ? src : '';
      // The editor stores a CDN key, not an absolute URL, so swapping CDN never
      // means rewriting every post. External URLs pass through untouched.
      const resolved = /^https?:\/\//.test(key) ? key : resolveMediaUrl(key, null);
      if (!resolved) return null;

      const size = sizeByPath.get(key);
      return (
        <figure className='my-8'>
          <Image
            src={resolved}
            alt={alt ?? ''}
            width={size?.width ?? 1600}
            height={size?.height ?? 1000}
            unoptimized
            sizes='(max-width: 768px) 100vw, 768px'
            className='h-auto w-full rounded-2xl border border-line'
          />
          {alt ? (
            <figcaption className='mt-2 text-center text-sm text-ink-4'>{alt}</figcaption>
          ) : null}
        </figure>
      );
    },
  };

  return (
    <div className={cn('max-w-none', className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </Markdown>
    </div>
  );
}
