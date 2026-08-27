'use client';

import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import type { CampaignCard } from '@/lib/services/campaign';
import HomeDesktop from './home/home-desktop';
import HomeMobile from './home/home-mobile';

// Not lazy-loaded on purpose: `lazy()` forces Next's streaming SSR to defer
// this whole tree into a `hidden` chunk that only becomes visible once
// client JS hydrates — invisible to any crawler that doesn't run JS. A plain
// import renders inline in the server HTML instead. Since `useIsMobile()`
// always resolves `false` during SSR, that server HTML is always the desktop
// variant; a real mobile visitor swaps to the mobile variant on hydration.
export default function HomeClient({ campaigns }: { campaigns: CampaignCard[] }) {
  const isMobile = useIsMobile();

  return isMobile ? <HomeMobile campaigns={campaigns} /> : <HomeDesktop campaigns={campaigns} />;
}
