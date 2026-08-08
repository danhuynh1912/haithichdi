'use client';

import { Suspense, lazy } from 'react';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import RouteSuspenseFallback from '@/components/route-suspense-fallback';

const ToursClient = lazy(() => import('./tours-client'));
const MobileToursClient = lazy(() => import('./mobile-tours-client'));

export default function ToursRouteClient() {
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      {isMobile ? <MobileToursClient /> : <ToursClient />}
    </Suspense>
  );
}
