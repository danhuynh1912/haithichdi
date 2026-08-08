import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * Locale-aware replacements for `next/link` and `next/navigation`.
 * Always import `Link`, `useRouter`, `usePathname` and `redirect` from here —
 * they keep the active locale prefix without any call site knowing about it.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
