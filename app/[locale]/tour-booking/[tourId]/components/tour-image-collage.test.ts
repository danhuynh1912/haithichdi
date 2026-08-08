import { describe, expect, it } from 'vitest';
import type { TourImageItem } from '@/lib/services/tour';
import { resolveCollageSlots } from './tour-image-collage';

function createImage(index: number, imageUrl: string | null): TourImageItem {
  return {
    id: index,
    image_url: imageUrl,
    caption: '',
    sort_order: index,
  };
}

describe('resolveCollageSlots', () => {
  it('keeps exactly four slots and only the first four images when source has more than four', () => {
    const slots = resolveCollageSlots({
      title: 'Tour test',
      images: [
        createImage(1, 'https://example.com/1.jpg'),
        createImage(2, 'https://example.com/2.jpg'),
        createImage(3, 'https://example.com/3.jpg'),
        createImage(4, 'https://example.com/4.jpg'),
        createImage(5, 'https://example.com/5.jpg'),
      ],
      fallbackImageUrl: null,
    });

    expect(slots).toHaveLength(4);
    expect(slots.map((item) => item.src)).toEqual([
      'https://example.com/1.jpg',
      'https://example.com/2.jpg',
      'https://example.com/3.jpg',
      'https://example.com/4.jpg',
    ]);
  });

  it('fills missing slots with null when source has fewer than four images', () => {
    const slots = resolveCollageSlots({
      title: 'Tour test',
      images: [createImage(1, 'https://example.com/1.jpg'), createImage(2, 'https://example.com/2.jpg')],
      fallbackImageUrl: null,
    });

    expect(slots.map((item) => item.src)).toEqual([
      'https://example.com/1.jpg',
      'https://example.com/2.jpg',
      null,
      null,
    ]);
  });

  it('uses fallback image when there is no valid source image', () => {
    const slots = resolveCollageSlots({
      title: 'Tour test',
      images: [createImage(1, null)],
      fallbackImageUrl: 'https://example.com/fallback.jpg',
    });

    expect(slots[0].src).toBe('https://example.com/fallback.jpg');
    expect(slots.slice(1).every((slot) => slot.src === null)).toBe(true);
  });
});
