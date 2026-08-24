import { cache } from 'react';
import { QueryClient } from '@tanstack/react-query';

/**
 * `cache()` scopes this to a single request's render tree — a plain
 * module-level `new QueryClient()` would be shared across every concurrent
 * request handled by the same server process, leaking one visitor's
 * prefetched data into another's response.
 */
export const getQueryClient = cache(() => new QueryClient());
