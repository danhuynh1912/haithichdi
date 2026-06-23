import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { homeService } from './home';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockedRpc = vi.mocked(supabase.rpc);

describe('homeService', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  it('loads featured routes via the home_featured_routes rpc', async () => {
    mockedRpc.mockResolvedValueOnce({
      data: { routes: [], highlight_audience: null },
      error: null,
    } as never);

    const response = await homeService.getFeaturedRoutes();

    expect(mockedRpc).toHaveBeenCalledWith('home_featured_routes');
    expect(response).toEqual({ routes: [], highlight_audience: null });
  });

  it('resolves the CDN url for a featured route image_path', async () => {
    mockedRpc.mockResolvedValueOnce({
      data: {
        routes: [
          {
            id: 1,
            name: 'Fansipan',
            display_name: 'Fansipan',
            subtitle: '',
            summary: '',
            image_path: 'locations/images/fan.jpg',
            image_url: '',
            suitable_audiences: [],
          },
        ],
        highlight_audience: null,
      },
      error: null,
    } as never);

    const response = await homeService.getFeaturedRoutes();

    // CDN base is unset in tests → falls back to a root-relative path
    expect(response.routes[0].image_url).toBe('/locations/images/fan.jpg');
  });

  it('loads the moments gallery via the home_moments_gallery rpc', async () => {
    mockedRpc.mockResolvedValueOnce({
      data: { images: [] },
      error: null,
    } as never);

    const response = await homeService.getMomentsGallery();

    expect(mockedRpc).toHaveBeenCalledWith('home_moments_gallery');
    expect(response).toEqual({ images: [] });
  });
});
