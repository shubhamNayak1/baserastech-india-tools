import type { ReactNode } from 'react';
import { BottomBannerAd } from './BottomBannerAd';
import { SideRailAd } from './SideRailAd';
import { TopBannerAd } from './TopBannerAd';

/**
 * Common page frame for advertising:
 *   desktop  – top banner, left rail | content | right rail, bottom banner
 *   tablet   – top banner, content, bottom banner
 *   mobile   – top banner, content (+ in-content unit on tool pages), bottom banner
 * `routeKey` remounts the units on navigation so AdSense requests fresh ads per page.
 */
export function AdLayout({ children, routeKey }: { children: ReactNode; routeKey: string }) {
  return (
    <>
      <TopBannerAd key={`top-${routeKey}`} />
      <div className="mx-auto w-full min-[1400px]:grid min-[1400px]:max-w-[1600px] min-[1400px]:grid-cols-[160px_minmax(0,1fr)_160px] min-[1400px]:gap-6 min-[1400px]:px-6">
        <SideRailAd key={`left-${routeKey}`} side="left" />
        <div className="min-w-0">{children}</div>
        <SideRailAd key={`right-${routeKey}`} side="right" />
      </div>
      <BottomBannerAd key={`bottom-${routeKey}`} />
    </>
  );
}
