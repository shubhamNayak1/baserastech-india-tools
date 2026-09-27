import { AdSense } from './AdSense';

/**
 * 160px skyscraper beside the content on wide desktops only (≥1400px). Hidden on tablet and
 * mobile. It sits in its own grid column, so it can never overlap tools or results.
 */
export function SideRailAd({ side }: { side: 'left' | 'right' }) {
  return (
    <aside aria-label="Advertisement" className="hidden min-[1400px]:block" data-ad={side}>
      <div className="sticky top-24 pt-6">
        <AdSense position={side} />
      </div>
    </aside>
  );
}
