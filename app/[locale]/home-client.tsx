'use client';

import { Suspense, lazy } from 'react';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import RouteSuspenseFallback from '@/components/route-suspense-fallback';

const HomeDesktop = lazy(() => import('./home/home-desktop'));
const HomeMobile = lazy(() => import('./home/home-mobile'));

export default function HomeClient() {
  const isMobile = useIsMobile();

  return (
    <Suspense fallback={<RouteSuspenseFallback />}>
      {isMobile ? <HomeMobile /> : <HomeDesktop />}
    </Suspense>
  );
}
