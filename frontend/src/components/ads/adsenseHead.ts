import type { AdsConfig } from '../../config/ads';

export const ADSENSE_SCRIPT_ID = 'adsbygoogle-js';

export function adsenseScriptSrc(publisherId: string): string {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(publisherId)}`;
}

/**
 * Static <head> tags written into every HTML page at build time, so Google's crawler sees the
 * AdSense code and account meta tag without running JavaScript. Empty when AdSense is disabled.
 */
export function adsenseHeadHtml(config: AdsConfig): string {
  if (!config.enabled) return '';
  return [
    `<meta name="google-adsense-account" content="${config.publisherId}" />`,
    `<script id="${ADSENSE_SCRIPT_ID}" async src="${adsenseScriptSrc(config.publisherId)}" crossorigin="anonymous"></script>`,
  ].join('\n    ');
}
