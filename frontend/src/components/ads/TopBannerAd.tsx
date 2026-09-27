import { AdSense } from './AdSense';

/** Full-width banner below the header on every viewport. */
export function TopBannerAd() {
  return (
    <aside aria-label="Advertisement" className="container-page pt-4" data-ad="top">
      <AdSense position="top" />
    </aside>
  );
}
