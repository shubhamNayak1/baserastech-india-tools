import { env } from './site';

/**
 * Google AdSense configuration. Values come only from environment variables — no publisher or
 * slot IDs are hard-coded. With VITE_ADSENSE_ENABLED=false (the default) every ad position
 * renders a clearly labelled placeholder of the same size, so layouts can be reviewed.
 */
export type AdPosition = 'top' | 'bottom' | 'left' | 'right' | 'mobile';

export interface AdsConfig {
  enabled: boolean;
  publisherId: string;
  slots: Record<AdPosition, string>;
}

const PUBLISHER_ID = /^ca-pub-\d{10,20}$/;

export function readAdsConfig(source: Record<string, string | undefined> = env): AdsConfig {
  const publisherId = source.VITE_ADSENSE_PUBLISHER_ID?.trim() ?? '';
  const enabled = source.VITE_ADSENSE_ENABLED === 'true' && PUBLISHER_ID.test(publisherId);
  const top = source.VITE_ADSENSE_TOP_SLOT?.trim() ?? '';
  return {
    enabled,
    publisherId,
    slots: {
      top,
      bottom: source.VITE_ADSENSE_BOTTOM_SLOT?.trim() ?? '',
      left: source.VITE_ADSENSE_LEFT_SLOT?.trim() ?? '',
      right: source.VITE_ADSENSE_RIGHT_SLOT?.trim() ?? '',
      // The mobile in-content unit reuses the top slot unless a dedicated one is configured later.
      mobile: top,
    },
  };
}

export const ADS = readAdsConfig();

/** Reserved space per position (px) so ads never shift content (CLS). */
export const AD_SIZES: Record<AdPosition, { minHeight: number; width?: number }> = {
  top: { minHeight: 90 },
  bottom: { minHeight: 90 },
  left: { minHeight: 600, width: 160 },
  right: { minHeight: 600, width: 160 },
  mobile: { minHeight: 250 },
};
