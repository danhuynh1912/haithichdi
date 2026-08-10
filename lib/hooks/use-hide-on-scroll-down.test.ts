import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHideOnScrollDown } from './use-hide-on-scroll-down';

/** Move the page and run the frame the listener schedules. */
function scrollTo(y: number) {
  act(() => {
    window.scrollY = y;
    window.dispatchEvent(new Event('scroll'));
    vi.runOnlyPendingTimers();
  });
}

describe('useHideOnScrollDown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // jsdom has no rAF loop tied to a real frame, so drive it off the timers
    // the fake clock already controls.
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
      setTimeout(() => cb(0), 0) as unknown as number,
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('stays visible near the top of the page', () => {
    const { result } = renderHook(() => useHideOnScrollDown());

    scrollTo(40);

    expect(result.current.hidden).toBe(false);
  });

  it('hides once a downward scroll passes the threshold', () => {
    const { result } = renderHook(() => useHideOnScrollDown());

    scrollTo(400);

    expect(result.current.hidden).toBe(true);
  });

  it('comes back on the way up', () => {
    const { result } = renderHook(() => useHideOnScrollDown());

    scrollTo(400);
    scrollTo(300);

    expect(result.current.hidden).toBe(false);
  });

  it('ignores movement too small to be a direction', () => {
    const { result } = renderHook(() => useHideOnScrollDown());

    scrollTo(400);
    scrollTo(397);

    expect(result.current.hidden).toBe(true);
  });

  it('treats rubber-banding past the top as being at the top', () => {
    const { result } = renderHook(() => useHideOnScrollDown());

    scrollTo(400);
    // iOS reports a negative offset while the page bounces.
    scrollTo(-60);

    expect(result.current.hidden).toBe(false);
  });

  it('reveals on request, for focus landing in hidden chrome', () => {
    const { result } = renderHook(() => useHideOnScrollDown());

    scrollTo(400);
    act(() => result.current.reveal());

    expect(result.current.hidden).toBe(false);
  });
});
