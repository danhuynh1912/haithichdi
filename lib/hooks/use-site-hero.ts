'use client';

import { useCallback } from 'react';
import { setSiteHeroElement } from '@/lib/site-hero';

/**
 * Attach the returned ref to the element that fills the top of the screen with
 * media (a hero video or photo). While the header overlaps it, the header
 * switches to its dark palette in both themes.
 */
export function useSiteHeroRef<T extends HTMLElement>() {
  return useCallback((node: T | null) => {
    setSiteHeroElement(node);
    return () => setSiteHeroElement(null);
  }, []);
}
