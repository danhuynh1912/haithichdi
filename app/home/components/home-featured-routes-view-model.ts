import type {
  HomeFeaturedRoute,
  HomeFeaturedRoutesResponse,
} from '@/lib/services/home';

export function buildHomeFeaturedRoutesViewModel(
  data: HomeFeaturedRoutesResponse | null | undefined,
) {
  const routes = data?.routes ?? [];

  return {
    mainRoute: routes[0] ?? null,
    sideRoutes: routes.slice(1, 4),
    highlightAudience: data?.highlight_audience ?? null,
  };
}

export function formatSuitableAudiences(audiences: HomeFeaturedRoute['suitable_audiences']) {
  return audiences.map((audience) => audience.title).join(' + ');
}
