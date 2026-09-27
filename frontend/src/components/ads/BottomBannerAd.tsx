import { AdSense } from './AdSense';

/** Full-width banner after the page content, above the footer, on every viewport. */
export function BottomBannerAd() {
  return (
    <aside aria-label="Advertisement" className="container-page pb-2 pt-8" data-ad="bottom">
      <AdSense position="bottom" />
    </aside>
  );
}
