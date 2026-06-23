import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tourService } from '@/lib/services/tour';

export type ToursFilter = {
  locationIds: number[];
  search: string;
  sortUpcoming: boolean;
};

export function useTours(filter: ToursFilter) {
  const query = useQuery({
    queryKey: ['tours', filter.locationIds.sort(), filter.search, filter.sortUpcoming],
    queryFn: () => tourService.getTours(filter),
  });

  const data = useMemo(() => query.data ?? [], [query.data]);
  return { ...query, data };
}
