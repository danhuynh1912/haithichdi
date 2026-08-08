import { useMemo } from 'react';
import { useToursQuery } from '@/lib/services/queries';

export type ToursFilter = {
  locationIds: number[];
  search: string;
  sortUpcoming: boolean;
};

export function useTours(filter: ToursFilter) {
  const query = useToursQuery({
    locationIds: [...filter.locationIds].sort((a, b) => a - b),
    search: filter.search,
    sortUpcoming: filter.sortUpcoming,
  });

  const data = useMemo(() => query.data ?? [], [query.data]);
  return { ...query, data };
}
