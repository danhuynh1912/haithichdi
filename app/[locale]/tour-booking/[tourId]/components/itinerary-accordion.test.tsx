import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderIntl } from '@/test-utils';
import { describe, expect, it } from 'vitest';
import type { TourItineraryDay } from '@/lib/services/tour';
import { ItineraryAccordion } from './itinerary-accordion';
import viMessages from '@/messages/vi.json';

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
  it('opens the first day by default', () => {
    renderIntl(<ItineraryAccordion days={days} />);

    expect(screen.getByText('Nội dung day zero')).toBeInTheDocument();
    expect(screen.queryByText('Nội dung day one')).not.toBeInTheDocument();
  });

  it('keeps a day open when another is opened', () => {
    renderIntl(<ItineraryAccordion days={days} />);

    fireEvent.click(screen.getByText('Day 1 - Khởi hành'));

    // Both, not one: comparing two days is the whole reason for opening a
    // second, and the old accordion closed the first on the way.
    expect(screen.getByText('Nội dung day one')).toBeInTheDocument();
    expect(screen.getByText('Nội dung day zero')).toBeInTheDocument();
  });

  it('closes a day when its title is clicked again', () => {
    renderIntl(<ItineraryAccordion days={days} />);

    fireEvent.click(screen.getByText('Day 1 - Khởi hành'));
    fireEvent.click(screen.getByText('Day 1 - Khởi hành'));

    expect(screen.queryByText('Nội dung day one')).not.toBeInTheDocument();
    expect(screen.getByText('Nội dung day zero')).toBeInTheDocument();
  });

  it('can close every day', () => {
    renderIntl(<ItineraryAccordion days={days} />);

    fireEvent.click(screen.getByText('Day 0 - Chuẩn bị'));

    expect(screen.queryByText('Nội dung day zero')).not.toBeInTheDocument();
    expect(screen.queryByText('Nội dung day one')).not.toBeInTheDocument();
  });

  it('renders empty placeholder when days are missing', () => {
    renderIntl(<ItineraryAccordion days={[]} />);

    expect(screen.getByText(viMessages.booking.itineraryEmpty)).toBeInTheDocument();
  });
});
