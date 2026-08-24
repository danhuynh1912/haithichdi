import React from 'react';
import { screen } from '@testing-library/react';
import { renderIntl } from '@/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { TourListItem } from '@/lib/types';
import { RelatedToursCarousel } from './related-tours-carousel';
import viMessages from '@/messages/vi.json';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...rest }, children),
}));

function createTour(id: number): TourListItem {
  return {
    id,
    title: `Tour ${id}`,
    start_date: '2026-02-18',
    end_date: '2026-02-19',
    image_url: 'https://example.com/tour.jpg',
    slots_left: 10,
    booked_count: 0,
    location: {
      id: id + 10,
      name: `Location ${id}`,
      elevation_m: 2500,
      difficulty: null,
      description: '',
      full_image_url: null,
      quotation_file_url: null,
    },
  };
}

describe('RelatedToursCarousel', () => {
  it('renders empty state when there are no related tours', () => {
    renderIntl(<RelatedToursCarousel tours={[]} />);

    expect(screen.getByText(viMessages.booking.relatedEmpty)).toBeInTheDocument();
  });

  // A real anchor rather than a click handler: this is the link a crawler
  // follows to the tour, so the href is the thing worth asserting.
  it('links to the booking page', () => {
    renderIntl(<RelatedToursCarousel tours={[createTour(3)]} />);

    expect(
      screen.getByRole('link', { name: viMessages.booking.relatedCta }),
    ).toHaveAttribute('href', '/tour-booking/3');
  });
});
