import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderIntl } from '@/test-utils';
import { describe, expect, it, vi } from 'vitest';
import type { TourListItem } from '@/lib/types';
import { RelatedToursCarousel } from './related-tours-carousel';
import viMessages from '@/messages/vi.json';

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
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

  it('navigates to booking page when clicking CTA button', () => {
    pushMock.mockClear();

    renderIntl(<RelatedToursCarousel tours={[createTour(3)]} />);

    fireEvent.click(
      screen.getByRole('button', { name: viMessages.booking.relatedCta }),
    );

    expect(pushMock).toHaveBeenCalledWith('/tour-booking/3');
  });
});
