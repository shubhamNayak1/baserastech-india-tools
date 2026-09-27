/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_ADSENSE_ENABLED?: string;
  readonly VITE_ADSENSE_PUBLISHER_ID?: string;
  readonly VITE_ADSENSE_TOP_SLOT?: string;
  readonly VITE_ADSENSE_BOTTOM_SLOT?: string;
  readonly VITE_ADSENSE_LEFT_SLOT?: string;
  readonly VITE_ADSENSE_RIGHT_SLOT?: string;
  readonly VITE_GOOGLE_ANALYTICS_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
