import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { loadAdSenseScript } from './components/ads/adsenseLoader';
import './index.css';

// Single, global AdSense script (also enables Auto Ads). No-op unless AdSense is configured.
loadAdSenseScript();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA: register the service worker in production only.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
