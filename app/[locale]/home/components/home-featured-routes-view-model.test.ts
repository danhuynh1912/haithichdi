import { describe, expect, it } from 'vitest';
import {
  buildHomeFeaturedRoutesViewModel,
  formatSuitableAudiences,
} from './home-featured-routes-view-model';

describe('home featured routes view model', () => {
  it('splits main route, side routes and highlight audience from payload', () => {
    const payload = {
      routes: [
        {
          id: 1,
          name: 'Ta Xua',
          display_name: 'Tà Xùa - Sống lưng khủng long',
          subtitle: 'Main route',
          summary: 'Summary 1',
          image_url: null,
          suitable_audiences: [],
        },
        {
          id: 2,
          name: 'Phu Sa Phin',
          display_name: 'Phu Sa Phin',
          subtitle: 'Subtitle 2',
          summary: 'Summary 2',
          image_url: null,
          suitable_audiences: [],
        },
        {
          id: 3,
          name: 'Rung reu Samu',
          display_name: 'Rừng rêu Samu',
          subtitle: 'Subtitle 3',
          summary: 'Summary 3',
          image_url: null,
          suitable_audiences: [],
        },
      ],
      highlight_audience: {
        id: 9,
        code: 'push_limit',
        title: 'Người muốn vượt giới hạn',
        description: 'Description',
        locations: [],
      },
    };

    const viewModel = buildHomeFeaturedRoutesViewModel(payload);

    expect(viewModel.mainRoute?.id).toBe(1);
    expect(viewModel.sideRoutes.map((route) => route.id)).toEqual([2, 3]);
    expect(viewModel.highlightAudience?.code).toBe('push_limit');
  });

  it('formats suitable audiences for the featured main route', () => {
    const label = formatSuitableAudiences([
      {
        id: 1,
        code: 'beginner',
        title: 'Người mới',
        description: '',
      },
      {
        id: 2,
        code: 'intermediate',
        title: 'Trung cấp',
        description: '',
      },
    ]);

    expect(label).toBe('Người mới + Trung cấp');
  });

  it('handles empty payload without throwing', () => {
    const viewModel = buildHomeFeaturedRoutesViewModel(null);

    expect(viewModel.mainRoute).toBeNull();
    expect(viewModel.sideRoutes).toEqual([]);
    expect(viewModel.highlightAudience).toBeNull();
  });
});
