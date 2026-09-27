import { ADS, type AdsConfig } from '@/config/ads';

import { ADSENSE_SCRIPT_ID, adsenseScriptSrc } from './adsenseHead';

export { ADSENSE_SCRIPT_ID };

/**
 * Runtime fallback for the AdSense script. Production builds already include the script tag in
 * every page's HTML (see adsenseHead.ts), in which case this finds it and does nothing. It is loaded once, globally, which is
 * also what Google Auto Ads requires — enable Auto Ads in the AdSense dashboard and it will use
 * this same script. Does nothing unless AdSense is enabled with a valid publisher ID.
 */
export function loadAdSenseScript(
  config: AdsConfig = ADS,
  doc: Document | undefined = globalThis.document,
): boolean {
  if (!config.enabled || !doc) return false;
  if (doc.getElementById(ADSENSE_SCRIPT_ID)) return true;
  const s = doc.createElement('script');
  s.id = ADSENSE_SCRIPT_ID;
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = adsenseScriptSrc(config.publisherId);
  doc.head.appendChild(s);
  return true;
}
