import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { TourListItem } from '@/app/tours/types';
import { RelatedToursCarousel } from './related-tours-carousel';

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock('next/navigation', () => ({
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
    render(<RelatedToursCarousel tours={[]} />);

    expect(screen.getByText('Chưa có tour liên quan để gợi ý.')).toBeInTheDocument();
  });

  it('navigates to booking page when clicking CTA button', () => {
    pushMock.mockClear();

    render(<RelatedToursCarousel tours={[createTour(3)]} />);

    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký tour này' }));

    expect(pushMock).toHaveBeenCalledWith('/tour-booking/3');
  });
});
