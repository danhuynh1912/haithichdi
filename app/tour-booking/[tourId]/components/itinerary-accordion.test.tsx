import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { TourItineraryDay } from '@/lib/services/tour';
import { ItineraryAccordion } from './itinerary-accordion';

const days: TourItineraryDay[] = [
  {
    day_number: 0,
    date: '2026-02-17',
    title: 'Day 0 - Chuẩn bị',
    content_md: 'Nội dung day zero',
  },
  {
    day_number: 1,
    date: '2026-02-18',
    title: 'Day 1 - Khởi hành',
    content_md: 'Nội dung day one',
  },
];

describe('ItineraryAccordion', () => {
  it('opens day 0 by default', () => {
    render(<ItineraryAccordion days={days} />);

    expect(screen.getByText('Nội dung day zero')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung day one')).not.toBeInTheDocument();
  });

  it('toggles selected day content when clicking another day', () => {
    render(<ItineraryAccordion days={days} />);

    fireEvent.click(screen.getByText('Day 1 - Khởi hành'));

    expect(screen.getByText('Nội dung day one')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung day zero')).not.toBeInTheDocument();
  });

  it('renders empty placeholder when days are missing', () => {
    render(<ItineraryAccordion days={[]} />);

    expect(screen.getByText('Lịch trình đang được cập nhật.')).toBeInTheDocument();
  });
});
