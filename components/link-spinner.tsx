'use client';

import { useLinkStatus } from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A spinner that appears while the page behind its `<Link>` is being fetched.
 *
 * The tour pages read from the database before they can render, so a click can
 * sit for a few hundred milliseconds looking like nothing happened. Must be
 * rendered inside the Link it reports on — `useLinkStatus` reads the status of
 * the nearest one above it.
 *
 * Deliberately not a `loading.tsx`: a route-level loading file is a Suspense
 * boundary, and Next answers one by streaming the page's real content into a
 * hidden chunk that only appears once JS has run — the opposite of what these
 * pages are server-rendered for. This is client-side feedback only and leaves
 * the served HTML alone.
 */
export function LinkSpinner({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return (
    <LoaderCircle
      aria-hidden
      size={size}
      className={cn('animate-spin motion-reduce:animate-none', className)}
    />
  );
}
