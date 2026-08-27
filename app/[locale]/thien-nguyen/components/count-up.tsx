'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

/**
 * A number that climbs to its value the first time it is looked at.
 *
 * Values are stored as free text ("120", "2 bản", "43") because what is worth
 * counting changes with the campaign. Anything with digits in it counts up on
 * the digits and keeps whatever is wrapped around them; anything without them
 * simply appears.
 */
export function CountUp({ value, durationMs = 1400 }: { value: string; durationMs?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduceMotion = useReducedMotion();

  const match = value.match(/^(\D*)(\d[\d.,]*)(.*)$/);
  const target = match ? Number(match[2].replace(/[.,]/g, '')) : null;

  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || target === null || reduceMotion) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      // Ease-out: fast at first, then settling — a linear count reads like a
      // loading spinner rather than an arrival.
      setShown(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, target, durationMs, reduceMotion]);

  if (target === null || reduceMotion) return <span ref={ref}>{value}</span>;

  return (
    <span ref={ref}>
      {match![1]}
      {(inView ? shown : 0).toLocaleString('vi-VN')}
      {match![3]}
    </span>
  );
}
