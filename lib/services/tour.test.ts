import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { tourService } from './tour';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

const mockedRpc = vi.mocked(supabase.rpc);

describe('tourService', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  it('calls search_tours with normalized filter/search/sort params', async () => {
    mockedRpc.mockResolvedValueOnce({ data: [], error: null } as never);

    await tourService.getTours('en', {
      locationIds: [1, 2],
      search: '  ky quan san  ',
      sortUpcoming: true,
    });

    expect(mockedRpc).toHaveBeenCalledWith('search_tours', {
      p_search: 'ky quan san',
      p_location_ids: [1, 2],
      p_ordering: 'start_date',
      p_locale: 'en',
    });
  });

  it('passes nulls to search_tours when no filters are given', async () => {
    mockedRpc.mockResolvedValueOnce({ data: [], error: null } as never);

    await tourService.getTours('vi');

    expect(mockedRpc).toHaveBeenCalledWith('search_tours', {
      p_search: null,
      p_location_ids: null,
      p_ordering: 'start_date',
      p_locale: 'vi',
    });
  });

  it('calls related_tours with tour id and limit', async () => {
    mockedRpc.mockResolvedValueOnce({ data: [], error: null } as never);

    await tourService.getRelatedTours(11, 'en', 6);

    expect(mockedRpc).toHaveBeenCalledWith('related_tours', {
      p_tour_id: 11,
      p_limit: 6,
      p_locale: 'en',
    });
  });

  it('maps booking payload to create_booking rpc params', async () => {
    mockedRpc.mockResolvedValueOnce({
      data: { id: 99, status: 'pending' },
      error: null,
    } as never);

    const response = await tourService.createBooking({
      tour: 3,
      full_name: 'Nguyen Van A',
      phone: '0988888888',
      medal_name: 'NGUYEN VAN A',
      dob: '1998-05-23',
      citizen_id: '012345678901',
    });

    expect(mockedRpc).toHaveBeenCalledWith('create_booking', {
      p_tour_id: 3,
      p_full_name: 'Nguyen Van A',
      p_phone: '0988888888',
      p_email: '',
      p_note: '',
      p_medal_name: 'NGUYEN VAN A',
      p_dob: '1998-05-23',
      p_citizen_id: '012345678901',
    });
    expect(response).toEqual({ id: 99, status: 'pending' });
  });

  it.each([
    ['TOUR_FULL', 'TOUR_FULL'],
    ['duplicate key: PHONE_DUPLICATE', 'PHONE_DUPLICATE'],
    ['something unexpected', 'UNKNOWN'],
  ])('maps rpc error %s to the %s code', async (message, expectedCode) => {
    mockedRpc.mockResolvedValueOnce({
      data: null,
      error: { message },
    } as never);

    await expect(
      tourService.createBooking({
        tour: 3,
        full_name: 'A',
        phone: '0900000000',
        medal_name: 'A',
        dob: '1998-05-23',
        citizen_id: '012345678901',
      }),
    ).rejects.toMatchObject({ code: expectedCode });
  });
});
