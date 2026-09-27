import { SITE } from '@/config/site';
import { absoluteUrl, type JsonLd } from './schema';

export interface SeoData {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  jsonLd?: (JsonLd | null)[];
  image?: string;
}

/** Build a full document title, avoiding duplicate brand suffixes. */
export function fullTitle(title: string): string {
  return title.includes(SITE.name) ? title : `${title} | ${SITE.name}`;
}

export interface HeadTag {
  tag: 'meta' | 'link' | 'script';
  attrs: Record<string, string>;
  content?: string;
}

/** Pure description of the head tags for a page; shared by the SPA and the prerender script. */
export function headTags(seo: SeoData): { title: string; tags: HeadTag[] } {
  const url = absoluteUrl(seo.path);
  const image = seo.image ?? absoluteUrl('/og-image.png');
  const title = fullTitle(seo.title);
  const tags: HeadTag[] = [
    { tag: 'meta', attrs: { name: 'description', content: seo.description } },
    { tag: 'link', attrs: { rel: 'canonical', href: url } },
    {
      tag: 'meta',
      attrs: {
        name: 'robots',
        content: seo.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
      },
    },
    { tag: 'meta', attrs: { property: 'og:type', content: seo.type ?? 'website' } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: SITE.name } },
    { tag: 'meta', attrs: { property: 'og:locale', content: SITE.locale } },
    { tag: 'meta', attrs: { property: 'og:title', content: title } },
    { tag: 'meta', attrs: { property: 'og:description', content: seo.description } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { property: 'og:image', content: image } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
    { tag: 'meta', attrs: { name: 'twitter:site', content: SITE.twitter } },
    { tag: 'meta', attrs: { name: 'twitter:title', content: title } },
    { tag: 'meta', attrs: { name: 'twitter:description', content: seo.description } },
    { tag: 'meta', attrs: { name: 'twitter:image', content: image } },
  ];
  (seo.jsonLd ?? []).forEach((ld) => {
    if (ld)
      tags.push({
        tag: 'script',
        attrs: { type: 'application/ld+json' },
        content: JSON.stringify(ld).replace(/</g, '\\u003c'),
      });
  });
  return { title, tags };
}

export function escapeAttr(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Serialize tags to HTML (used at build time for prerendered pages). */
export function renderHeadHtml(seo: SeoData): string {
  const { title, tags } = headTags(seo);
  const parts = [`<title>${escapeAttr(title)}</title>`];
  for (const t of tags) {
    const attrs = Object.entries({ ...t.attrs, 'data-seo': '' })
      .map(([k, v]) => (v === '' ? k : `${k}="${escapeAttr(v)}"`))
      .join(' ');
    parts.push(
      t.tag === 'script' ? `<script ${attrs}>${t.content ?? ''}</script>` : `<${t.tag} ${attrs}>`,
    );
  }
  return parts.join('\n    ');
}

/** Apply tags to the live document (client-side navigation). */
export function applyHead(seo: SeoData): void {
  const { title, tags } = headTags(seo);
  document.title = title;
  document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove());
  // Also remove static defaults from index.html that would otherwise duplicate.
  document.head
    .querySelectorAll('meta[name="description"], link[rel="canonical"]')
    .forEach((el) => el.remove());
  for (const t of tags) {
    const el = document.createElement(t.tag);
    Object.entries(t.attrs).forEach(([k, v]) => el.setAttribute(k, v));
    el.setAttribute('data-seo', '');
    if (t.content) el.textContent = t.content;
    document.head.appendChild(el);
  }
}
