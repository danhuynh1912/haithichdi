import React from 'react';
import { screen } from '@testing-library/react';
import { renderIntl } from '@/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { Location } from '@/lib/types';
import LocationDetailModal from './location-detail-modal';

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/lib/services/queries', () => ({
  useLocationToursQuery: () => ({ data: [], isPending: false }),
}));

// The modal picks a layout from a media query jsdom does not evaluate.
vi.mock('@/lib/hooks/use-is-mobile', () => ({ useIsMobile: () => false }));

const WRITE_UP = [
  '## Lịch trình',
  '',
  '| Ngày | Chặng |',
  '| --- | --- |',
  '| 00 | Hà Nội – Trạm Tấu |',
  '| 01 | Trekking 7km |',
  '',
  '> Mang đủ nước.',
].join('\n');

function route(overrides: Partial<Location> = {}): Location {
  return {
    id: 11,
    name: 'Phu Sa Phìn',
    elevation_m: 2800,
    description: 'Cung trek Tây Bắc',
    full_image_url: null,
    quotation_file_url: null,
    description_md: null,
    ...overrides,
  };
}

describe('LocationDetailModal', () => {
  it('falls back to the route write-up when there is no quotation file', () => {
    renderIntl(
      <LocationDetailModal
        location={route({ description_md: WRITE_UP })}
        onClose={vi.fn()}
      />,
    );

    // Rendered as markdown, not printed as pipes.
    const table = document.querySelector('table');
    expect(table).not.toBeNull();
    expect(table!.querySelectorAll('tr')).toHaveLength(3);
    expect(document.querySelector('blockquote')).not.toBeNull();
    expect(screen.queryByText(/Chưa có file quotation/)).toBeNull();
  });

  it('keeps showing the quotation when the route has one', () => {
    renderIntl(
      <LocationDetailModal
        location={route({
          quotation_file_url: 'https://example.com/bao-gia.pdf',
          description_md: WRITE_UP,
        })}
        onClose={vi.fn()}
      />,
    );

    expect(document.querySelector('iframe')).not.toBeNull();
    expect(document.querySelector('table')).toBeNull();
  });

  it('still explains itself when the route has neither', () => {
    renderIntl(<LocationDetailModal location={route()} onClose={vi.fn()} />);

    expect(screen.getByText(/Chưa có file quotation/)).toBeTruthy();
  });

  it('treats a blank write-up as nothing to show', () => {
    renderIntl(
      <LocationDetailModal
        location={route({ description_md: '   \n  ' })}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByText(/Chưa có file quotation/)).toBeTruthy();
    expect(document.querySelector('table')).toBeNull();
  });
});
