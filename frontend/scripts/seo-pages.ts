import { CATEGORIES } from '../src/data/categories';
import { SITE } from '../src/config/site';
import { STATIC_PAGES } from '../src/data/staticPages';
import {
  ARTICLES,
  articlePath,
  GUIDES_DESCRIPTION,
  GUIDES_TITLE,
  loadArticle,
} from '../src/data/articles';
import {
  ACTIVE_TOOLS,
  getTools,
  loadToolContent,
  relatedTools,
  toolsInCategory,
} from '../src/tools/registry';
import { escapeAttr, type SeoData } from '../src/seo/head';
import { isToolIndexable } from '../src/seo/indexing';
import { loadToolGuide } from '../src/tools/guides';
import { guideSectionsHtml } from '../src/components/content/guideHtml';
import {
  articleSchema,
  breadcrumbSchema,
  faqSchema,
  itemListSchema,
  organizationSchema,
  webApplicationSchema,
  websiteSchema,
} from '../src/seo/schema';

export interface StaticPage {
  path: string;
  seo: SeoData;
  body: string;
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly';
  /** Kept out of the sitemap and marked noindex. */
  noindex?: boolean;
  /** Page hosts a calculator that needs JavaScript (adds a note to the <noscript> copy). */
  interactive?: boolean;
}

const esc = escapeAttr;
const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`;

/** Every indexable route with its SEO metadata and a crawler-friendly HTML summary. */
export async function buildStaticPages(): Promise<StaticPage[]> {
  const pages: StaticPage[] = [];
  pages.push({
    path: '/',
    seo: {
      title: `${SITE.name} – Free Online Calculators & Tools for India`,
      description: `${ACTIVE_TOOLS.length}+ free online calculators and tools for India: EMI, SIP, GST, income tax, salary, BMI, age, unit converters, JSON formatter and more. Instant results, no sign-up.`,
      path: '/',
      jsonLd: [websiteSchema(), organizationSchema()],
    },
    body: `<h1>Free Online Calculators &amp; Tools</h1><p>Calculate, convert and generate useful results instantly.</p><ul>${CATEGORIES.map((c) => `<li>${link(`/category/${c.id}/`, c.name)}</li>`).join('')}</ul><h2>Guides</h2><ul>${ARTICLES.map((a) => `<li>${link(articlePath(a.slug), a.title)}</li>`).join('')}</ul>`,
    priority: 1,
    changefreq: 'daily',
  });
  pages.push({
    path: '/tools/',
    seo: {
      title: `All ${ACTIVE_TOOLS.length} Free Online Calculators & Tools`,
      description: `Browse all ${ACTIVE_TOOLS.length} free calculators, converters and generators.`,
      path: '/tools/',
      jsonLd: [
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'All tools', path: '/tools/' },
        ]),
      ],
    },
    body: `<h1>All tools</h1><ul>${ACTIVE_TOOLS.map((t) => `<li>${link(`/tools/${t.slug}/`, t.name)} – ${esc(t.shortDescription)}</li>`).join('')}</ul>`,
    priority: 0.9,
    changefreq: 'weekly',
  });
  for (const c of CATEGORIES) {
    const tools = toolsInCategory(c.id);
    pages.push({
      path: `/category/${c.id}/`,
      seo: {
        title: c.seoTitle,
        description: c.seoDescription,
        path: `/category/${c.id}/`,
        jsonLd: [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: c.name, path: `/category/${c.id}/` },
          ]),
          itemListSchema(c, tools),
        ],
      },
      body: `<h1>${esc(c.h1)}</h1><p>${esc(c.description)}</p><ul>${tools.map((t) => `<li>${link(`/tools/${t.slug}/`, t.name)} – ${esc(t.shortDescription)}</li>`).join('')}</ul>`,
      priority: 0.8,
      changefreq: 'weekly',
    });
  }
  for (const t of ACTIVE_TOOLS) {
    const content = await loadToolContent(t);
    const guide = await loadToolGuide(t.slug);
    const noindex = !isToolIndexable(content, guide);
    const cat = CATEGORIES.find((c) => c.id === t.category)!;
    const crumbs = [
      { name: 'Home', path: '/' },
      { name: cat.shortName, path: `/category/${cat.id}/` },
      { name: t.name, path: `/tools/${t.slug}/` },
    ];
    const faq = [...(content?.faq ?? []), ...(guide?.faq ?? [])];
    const sections = content
      ? [
          `<h2>What is the ${esc(t.name)}?</h2><p>${esc(content.whatIs)}</p>`,
          `<h2>How does it work?</h2><p>${esc(content.howItWorks)}</p>`,
          content.formula ? `<h2>Formula</h2><pre>${esc(content.formula)}</pre>` : '',
          content.example ? `<h2>Example</h2><p>${esc(content.example)}</p>` : '',
          guide ? guideSectionsHtml(guide.sections, esc) : '',
          faq.length
            ? `<h2>Frequently asked questions</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
            : '',
        ].join('')
      : '';
    pages.push({
      path: `/tools/${t.slug}/`,
      seo: {
        title: t.seoTitle,
        description: t.seoDescription,
        path: `/tools/${t.slug}/`,
        noindex,
        jsonLd: [
          webApplicationSchema(t, content?.description),
          breadcrumbSchema(crumbs),
          faqSchema(faq),
        ],
      },
      body: `<nav>${crumbs.map((c) => link(c.path, c.name)).join(' › ')}</nav><h1>${esc(t.h1)}</h1><p>${esc(content?.description ?? t.shortDescription)}</p>${sections}<h2>Related tools</h2><ul>${relatedTools(
        t,
      )
        .map((r) => `<li>${link(`/tools/${r.slug}/`, r.name)}</li>`)
        .join('')}</ul>`,
      priority: guide ? 0.9 : 0.7,
      changefreq: 'monthly',
      noindex,
      interactive: true,
    });
  }
  pages.push({
    path: '/guides/',
    seo: {
      title: GUIDES_TITLE,
      description: GUIDES_DESCRIPTION,
      path: '/guides/',
      jsonLd: [
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Guides', path: '/guides/' },
        ]),
      ],
    },
    body: `<h1>Guides</h1><p>${esc(GUIDES_DESCRIPTION)}</p><ul>${ARTICLES.map((a) => `<li>${link(articlePath(a.slug), a.title)} – ${esc(a.description)}</li>`).join('')}</ul>`,
    priority: 0.8,
    changefreq: 'weekly',
  });
  for (const meta of ARTICLES) {
    const a = (await loadArticle(meta.slug))!;
    const path = articlePath(a.slug);
    const crumbs = [
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides/' },
      { name: a.title, path },
    ];
    const faq = a.faq ?? [];
    pages.push({
      path,
      seo: {
        title: a.title,
        description: a.description,
        path,
        type: 'article',
        jsonLd: [articleSchema({ ...a, path }), breadcrumbSchema(crumbs), faqSchema(faq)],
      },
      body: `<nav>${crumbs.map((c) => link(c.path, c.name)).join(' › ')}</nav><h1>${esc(a.title)}</h1>${a.intro.map((p) => `<p>${esc(p)}</p>`).join('')}${guideSectionsHtml(a.sections, esc)}${
        faq.length
          ? `<h2>Frequently asked questions</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
          : ''
      }<h2>Calculators for this guide</h2><ul>${getTools(a.relatedTools)
        .map((t) => `<li>${link(`/tools/${t.slug}/`, t.name)}</li>`)
        .join('')}</ul>`,
      priority: 0.8,
      changefreq: 'monthly',
    });
  }
  for (const p of Object.values(STATIC_PAGES)) {
    const body = p.sections
      .map(
        (sec) =>
          `${sec.heading ? `<h2>${esc(sec.heading)}</h2>` : ''}${sec.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}${sec.links ? `<ul>${sec.links.map((l) => `<li><a href="${esc(l.href)}" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul>` : ''}`,
      )
      .join('');
    pages.push({
      path: p.path,
      seo: { title: p.title, description: p.description, path: p.path },
      body: `<h1>${esc(p.title)}</h1>${body}`,
      priority: 0.3,
      changefreq: 'monthly',
    });
  }
  return pages;
}

export function sitemapXml(pages: StaticPage[], lastmod: string): string {
  const urls = pages
    .filter((p) => !p.noindex)
    .map(
      (p) =>
        `  <url>\n    <loc>${SITE.url}${p.path === '/' ? '/' : p.path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority.toFixed(1)}</priority>\n  </url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /favorites',
    'Disallow: /search',
    '',
    `Sitemap: ${SITE.url}/sitemap.xml`,
    '',
  ].join('\n');
}
