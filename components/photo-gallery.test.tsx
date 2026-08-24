import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderIntl } from '@/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { PhotoGallery, stepIndex, type GalleryPhoto } from './photo-gallery';

function photos(count: number): GalleryPhoto[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    url: `https://example.com/${index + 1}.jpg`,
    caption: `Ảnh ${index + 1}`,
  }));
}

describe('stepIndex', () => {
  it('wraps past the end and before the start', () => {
    expect(stepIndex(2, 1, 3)).toBe(0);
    expect(stepIndex(0, -1, 3)).toBe(2);
    expect(stepIndex(0, 1, 3)).toBe(1);
  });

  it('stays at zero when there is nothing to step through', () => {
    expect(stepIndex(0, 1, 0)).toBe(0);
  });
});

describe('PhotoGallery', () => {
  it('shows every photo in the grid, not just the four the collage renders', () => {
    renderIntl(
      <PhotoGallery open onClose={vi.fn()} photos={photos(7)} title='Tour test' />,
    );

    expect(screen.getAllByRole('button', { name: /Ảnh \d/ })).toHaveLength(7);
    expect(screen.getByText('7 ảnh')).toBeTruthy();
  });

  it('opens one photo from the grid and can go back to it', () => {
    renderIntl(
      <PhotoGallery open onClose={vi.fn()} photos={photos(3)} title='Tour test' />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Ảnh 2' }));
    expect(screen.getByText('2/3')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Tất cả ảnh' }));
    expect(screen.getByText('3 ảnh')).toBeTruthy();
  });

  it('wraps around when stepping past the last photo', () => {
    renderIntl(
      <PhotoGallery open onClose={vi.fn()} photos={photos(3)} title='Tour test' initialIndex={2} />,
    );

    expect(screen.getByText('3/3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }));
    expect(screen.getByText('1/3')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh trước' }));
    expect(screen.getByText('3/3')).toBeTruthy();
  });

  it('escape backs out of the photo first and only then closes', () => {
    const onClose = vi.fn();
    renderIntl(
      <PhotoGallery open onClose={onClose} photos={photos(3)} title='Tour test' initialIndex={1} />,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.getByText('3 ảnh')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('spins until the photo loads, and not again when stepping back to it', () => {
    renderIntl(
      <PhotoGallery open onClose={vi.fn()} photos={photos(2)} title='Tour test' initialIndex={0} />,
    );

    expect(screen.getByRole('status', { name: 'Đang tải ảnh' })).toBeTruthy();
    fireEvent.load(screen.getByAltText('Ảnh 1'));
    expect(screen.queryByRole('status')).toBeNull();

    // The next picture has not been fetched yet, so it spins again...
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }));
    expect(screen.getByRole('status', { name: 'Đang tải ảnh' })).toBeTruthy();

    // ...but the first one is in hand, and must not flash a spinner.
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh trước' }));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('stops spinning when the photo fails to load', () => {
    renderIntl(
      <PhotoGallery open onClose={vi.fn()} photos={photos(1)} title='Tour test' initialIndex={0} />,
    );

    fireEvent.error(screen.getByAltText('Ảnh 1'));
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('hides the arrows when there is only one photo', () => {
    renderIntl(
      <PhotoGallery open onClose={vi.fn()} photos={photos(1)} title='Tour test' initialIndex={0} />,
    );

    expect(screen.queryByRole('button', { name: 'Ảnh tiếp theo' })).toBeNull();
  });
});
