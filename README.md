# BASERASTECH India Tools

Free online calculators and tools for India — a **static, frontend-only** website. All 205 tools
(covering the 212-entry catalogue; 7 entries are the same tool listed in two categories) run
entirely in the browser. There is no backend, database, login or paid plan. The site is funded by
Google AdSense.

```
USER → static website (React + TypeScript) → tools · search · SEO → Google AdSense
```

## Run locally

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

Other scripts: `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`.

## Production build

```bash
cd frontend
npm run build        # → frontend/dist/
```

`dist/` is self-contained: upload it to any static host (Nginx, Cloudflare Pages, Netlify, S3 +
CloudFront…). The build prerenders an HTML file for every indexable route (home, `/tools`, all 12
categories, all 205 tools, and the legal pages) with titles, meta descriptions, canonical URLs,
OpenGraph/Twitter tags and JSON-LD (WebApplication, BreadcrumbList, FAQPage), and writes
`sitemap.xml` and `robots.txt`.

Optional container: `docker compose up --build` builds the site and serves it with Nginx on
http://localhost:8081 (`frontend/nginx/default.conf`: caching, gzip, security headers, real 404s).

## Configuration (`frontend/.env`, build-time)

Copy `frontend/.env.example` to `frontend/.env`. Every variable is optional.

| Variable | Purpose |
| --- | --- |
| `VITE_SITE_URL` | Public origin used for canonical URLs, sitemap and OpenGraph |
| `VITE_CONTACT_EMAIL` | Shown on `/contact` |
| `VITE_ADSENSE_ENABLED` | `true` to serve real ads; default `false` shows placeholders |
| `VITE_ADSENSE_PUBLISHER_ID` | `ca-pub-…` from your AdSense account |
| `VITE_ADSENSE_TOP_SLOT` / `_BOTTOM_SLOT` / `_LEFT_SLOT` / `_RIGHT_SLOT` | Display ad unit slot IDs |
| `VITE_GOOGLE_ANALYTICS_ID` | GA4 measurement ID (`G-…`); empty = analytics off |

### Enabling Google AdSense

1. Get approved and create four **display** ad units in AdSense (top banner, bottom banner, left and
   right skyscrapers). Note the publisher ID and each unit's slot ID.
2. Set in `frontend/.env`:
   ```
   VITE_ADSENSE_ENABLED=true
   VITE_ADSENSE_PUBLISHER_ID=ca-pub-your-id
   VITE_ADSENSE_TOP_SLOT=…
   VITE_ADSENSE_BOTTOM_SLOT=…
   VITE_ADSENSE_LEFT_SLOT=…
   VITE_ADSENSE_RIGHT_SLOT=…
   ```
3. `npm run build`. The build also writes `dist/ads.txt` for your publisher ID.
4. **Auto Ads:** the AdSense script is loaded once, globally (`src/components/ads/adsenseLoader.ts`),
   which is exactly what Auto Ads needs — just switch Auto Ads on in the AdSense dashboard. Slots
   left empty collapse, so Auto Ads can fill the page instead.

With AdSense disabled or misconfigured (missing/invalid publisher ID) no Google script is loaded and
every position shows an "Advertisement" placeholder of the same size.

Ad layout (`src/components/ads/AdLayout.tsx`, applied to every page by the root layout):

- **Desktop ≥ 1400 px:** top banner · left rail | content | right rail · bottom banner
- **Tablet:** top banner · content · bottom banner
- **Mobile:** top banner · content (tool pages add one in-content unit *after* the tool) · bottom banner

Ads live in their own layout regions and never sit inside calculators, results, navigation or search.

## Architecture

- **Tool registry** — `src/data/tools.ts` (re-exporting `src/tools/registry.ts`) is the single source
  of truth for search, categories, the All Tools page, related tools, navigation, SEO and popular
  lists. Each category folder (`src/tools/<category>/`) contributes `index.ts` (metadata + lazy
  loader), `content.ts` (explanations, formula, example, FAQ; lazy-loaded), calculation engines with
  unit tests, and UI modules. New tool = new entry + module; nothing else changes.
- **Calculators** — pure TypeScript engines (`engine.ts`) rendered by a schema-driven `FormTool`,
  a text-transform `TextTool`, or a custom component. No calculation leaves the browser.
- **Tax rules** — versioned per financial year in `src/tools/tax/rules/`.
- **Guides and articles** — in-depth guides for key tools live in `src/tools/guides/<slug>.ts`
  (one lazy chunk each, registered in `src/tools/guides/index.ts`); long-form articles live in
  `src/data/articles/` and are served at `/guides/<slug>/`.
- **Indexing** — tool pages with fewer than 150 words of explanation and no guide are marked
  `noindex, follow` and left out of the sitemap (`src/seo/indexing.ts`). Adding a guide or more
  content makes a page indexable automatically. All page URLs end in `/` to match GitHub Pages.
- **Search** — client-side index with exact, prefix, keyword, alias, category and typo-tolerant
  matching (`src/search/`). Ctrl/⌘ + K opens it anywhere.
- **Favourites / recently used / recent searches** — `localStorage` only
  (`baserastech_favorite_tools`, `baserastech_recent_tools`, `baserastech_recent_searches`).
- **Analytics** — `src/analytics/AnalyticsService.ts`; GA4 is loaded only when a measurement ID is
  set and Do Not Track / Global Privacy Control are not on. Events never include tool inputs.

## Known limitations

- Personalised ads for visitors in the EEA/UK/Switzerland require a Google-certified consent
  management platform (CMP). Configure one in AdSense (Privacy & messaging) before serving ads there.
- The CSP in `frontend/nginx/default.conf` allows the Google AdSense / Analytics domains. If Google
  adds new ad-serving domains, update it.
- The IP Address Information Tool analyses addresses you enter; it no longer looks up the visitor's
  own public IP, because that needs a server.
