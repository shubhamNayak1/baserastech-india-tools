import { ADS, type AdsConfig } from '@/config/ads';

export const ADSENSE_SCRIPT_ID = 'adsbygoogle-js';

/**
 * The ONLY place the AdSense script is added to the page. It is loaded once, globally, which is
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
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.publisherId)}`;
  doc.head.appendChild(s);
  return true;
}
