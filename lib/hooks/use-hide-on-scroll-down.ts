'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface HideOnScrollOptions {
  /** Distance from the top of the page below which the chrome never hides. */
  threshold?: number;
  /** Movement that has to accumulate before the direction is believed. */
  delta?: number;
}

/**
 * Hides fixed chrome while the reader scrolls down and brings it back the
 * moment they scroll up — the phone screen is small enough that a header and a
 * tab bar together cost real reading room.
 *
 * `reveal` exists for focus: chrome translated off-screen still holds
 * focusable links, and a fixed element cannot be scrolled back into view, so
 * anything tabbing into it has to ask to be shown.
 */
export function useHideOnScrollDown({
  threshold = 80,
  delta = 6,
}: HideOnScrollOptions = {}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  const reveal = useCallback(() => setHidden(false), []);

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;

    const handleScroll = () => {
      // Scroll fires far more often than the screen repaints, and every read of
      // scrollY costs a layout — so at most one per frame.
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;
        // iOS reports a negative scrollY while the page is rubber-banding past
        // the top, which would otherwise read as a large upward flick.
        const y = Math.max(window.scrollY, 0);
        const moved = y - lastY.current;

        // Below the delta the direction is noise: a thumb resting on a moving
        // list would flip the bars back and forth.
        if (Math.abs(moved) < delta) return;

        lastY.current = y;
        setHidden(moved > 0 && y > threshold);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [threshold, delta]);

  return { hidden, reveal };
}
