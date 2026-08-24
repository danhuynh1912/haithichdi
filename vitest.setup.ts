import React from 'react';
import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// jsdom ships no ResizeObserver. Components that re-measure on resize only
// need it to exist and never fire — nothing here asserts on a resize.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
}

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...rest
  }: {
    src: string | { src: string };
    alt?: string;
    [key: string]: unknown;
  }) => {
    const props = { src: typeof src === 'string' ? src : src.src, alt, ...rest } as Record<string, unknown>;
    delete props.fill;
    return React.createElement('img', props);
  },
}));
