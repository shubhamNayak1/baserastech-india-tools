/**
 * Post-build step: writes a static HTML shell per route with correct <head> tags and a
 * <noscript> content summary, plus sitemap.xml, robots.txt and (when AdSense is configured) ads.txt.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderHeadHtml } from '../src/seo/head';
import { buildStaticPages, robotsTxt, sitemapXml } from './seo-pages';
import { loadEnv } from 'vite';
import { readAdsConfig } from '../src/config/ads';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const template = readFileSync(join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo-->') || !template.includes('<!--app-->'))
  throw new Error('index.html is missing the <!--seo--> or <!--app--> markers');

const pages = await buildStaticPages();
for (const page of pages) {
  const html = template
    .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, renderHeadHtml(page.seo))
    .replace(
      '<noscript>BASERASTECH India Tools needs JavaScript to run its calculators.</noscript>',
      `<noscript><div style="max-width:72rem;margin:0 auto;padding:1rem;font-family:sans-serif">${page.body}<p>Enable JavaScript to use this calculator.</p></div></noscript>`,
    );
  const out =
    page.path === '/' ? join(dist, 'index.html') : join(dist, page.path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(join(dist, 'sitemap.xml'), sitemapXml(pages, today));
writeFileSync(join(dist, 'robots.txt'), robotsTxt());
// ads.txt authorises Google to sell ads on this domain. Only written for a real, configured publisher ID.
const ads = readAdsConfig({ ...loadEnv('production', root, 'VITE_'), ...process.env });
if (ads.enabled) {
  writeFileSync(
    join(dist, 'ads.txt'),
    `google.com, ${ads.publisherId.replace(/^ca-/, '')}, DIRECT, f08c47fec0942fa0\n`,
  );
}
// Fallback for unknown routes (served with 404 status by Nginx).
writeFileSync(
  join(dist, '404.html'),
  template.replace(
    /<!--seo-->[\s\S]*?<!--\/seo-->/,
    renderHeadHtml({
      title: 'Page not found',
      description: 'The page you are looking for does not exist.',
      path: '/404',
      noindex: true,
    }),
  ),
);
console.info(`Prerendered ${pages.length} pages, sitemap with ${pages.length} URLs.`);
