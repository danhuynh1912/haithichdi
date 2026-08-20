'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * Height the content is clipped to while collapsed.
 *
 * Tuned to the booking form beside it on desktop: a description that stopped
 * well above the form left an odd shelf of empty space in the left column.
 */
const COLLAPSED_HEIGHT = 640;

/** Slack before the toggle appears, so a body barely over the line stays whole. */
const OVERFLOW_SLACK = 80;

/**
 * Clips long prose to a readable height and offers to open it.
 *
 * The toggle only appears when there is something to reveal: a route with a
 * three-line description would otherwise get a "Xem thêm" that expands to
 * nothing, which reads as a broken control.
 */
export function Expandable({
  children,
  className,
  collapsedHeight = COLLAPSED_HEIGHT,
}: {
  children: ReactNode;
  className?: string;
  /** Override when the block sits next to something of a different height. */
  collapsedHeight?: number;
}) {
  const t = useTranslations('common');
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const measure = () =>
      setOverflows(content.scrollHeight > collapsedHeight + OVERFLOW_SLACK);

    // Markdown pulls in images that change the height as they land, so this
    // re-checks rather than measuring once on mount.
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [collapsedHeight]);

  const clipped = overflows && !expanded;

  return (
    <div className={className}>
      <div
        ref={contentRef}
        style={
          clipped
            ? {
                maxHeight: collapsedHeight,
                overflow: 'hidden',
                // A mask rather than a gradient overlay: it fades the text
                // itself to transparent, so it stays correct on whichever
                // surface and theme the block happens to sit on.
                maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
              }
            : undefined
        }
      >
        {children}
      </div>

      {overflows && (
        <button
          type='button'
          onClick={() => setExpanded(current => !current)}
          aria-expanded={expanded}
          className='mt-4 inline-flex items-center gap-1.5 rounded-full border border-line-3 px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'
        >
          {expanded ? t('collapse') : t('seeMore')}
          <ChevronDown
            className={cn('size-4 transition-transform', expanded && 'rotate-180')}
          />
        </button>
      )}
    </div>
  );
}
