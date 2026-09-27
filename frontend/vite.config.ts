/// <reference types="vitest" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { readAdsConfig } from './src/config/ads';
import { adsenseHeadHtml } from './src/components/ads/adsenseHead';

/** Writes the AdSense script + account meta tag into index.html (and so every prerendered page). */
function adsenseHead(env: Record<string, string | undefined>): Plugin {
  return {
    name: 'adsense-head',
    transformIndexHtml(html) {
      const tags = adsenseHeadHtml(readAdsConfig(env));
      return tags ? html.replace('</head>', `    ${tags}\n  </head>`) : html;
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), adsenseHead({ ...loadEnv(mode, process.cwd(), 'VITE_'), ...process.env })],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/content.ts', 'src/test/**', 'src/main.tsx'],
    },
  },
}));
