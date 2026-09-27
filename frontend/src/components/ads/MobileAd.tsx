import { AdSense } from './AdSense';

/** In-content unit for phones only (hidden from md upwards), placed between sections — never inside a tool. */
export function MobileAd({ className = '' }: { className?: string }) {
  return (
    <aside aria-label="Advertisement" className={`md:hidden ${className}`} data-ad="mobile">
      <AdSense position="mobile" />
    </aside>
  );
}
