import { useEffect, useRef } from 'react';
import { ADS, AD_SIZES, type AdPosition } from '@/config/ads';
import { AdPlaceholder } from './AdPlaceholder';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface Props {
  position: AdPosition;
  className?: string;
}

/** One responsive AdSense display unit. Renders a placeholder when AdSense is disabled. */
export function AdSense({ position, className = '' }: Props) {
  const ref = useRef<HTMLModElement>(null);
  const size = AD_SIZES[position];
  const slot = ADS.slots[position];

  useEffect(() => {
    if (!ADS.enabled || !slot || !ref.current) return;
    // Each <ins> must be pushed exactly once; the element is new on every mount.
    if (ref.current.dataset.adsbygoogleStatus) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* ad blockers or unfilled slots must never break the page */
    }
  }, [slot]);

  if (!ADS.enabled)
    return <AdPlaceholder minHeight={size.minHeight} width={size.width} className={className} />;
  // Enabled but no manual slot configured: leave the space to Auto Ads rather than showing an empty box.
  if (!slot) return null;

  return (
    <div
      className={`w-full overflow-hidden ${className}`}
      style={{ minHeight: size.minHeight, maxWidth: size.width }}
    >
      <ins
        ref={ref}
        className="adsbygoogle"
        style={{ display: 'block', minHeight: size.minHeight }}
        data-ad-client={ADS.publisherId}
        data-ad-slot={slot}
        data-ad-format={position === 'left' || position === 'right' ? 'vertical' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}
