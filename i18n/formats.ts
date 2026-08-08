import type { Formats } from 'next-intl';

/**
 * Shared formatter presets — the SSOT for how dates and prices are rendered.
 * Kept free of `next-intl/server` imports so tests and client code can pull it
 * in without dragging server-only modules into the bundle.
 */
export const formats = {
  dateTime: {
    /** `18/02` — the compact range format used across tour cards. */
    dayMonth: { day: '2-digit', month: '2-digit' },
    /** `18 thg 2, 2026` / `Feb 18, 2026`. */
    date: { dateStyle: 'medium' },
    /** Date plus wall-clock time, for booking timestamps. */
    dateTime: { dateStyle: 'medium', timeStyle: 'short' },
  },
  number: {
    /** Tour prices are always quoted in VND regardless of the reader's locale. */
    vnd: { style: 'currency', currency: 'VND', maximumFractionDigits: 0 },
  },
} satisfies Formats;

/** Server and client must agree on the clock, so it's pinned to the business TZ. */
export const TIME_ZONE = 'Asia/Ho_Chi_Minh';
