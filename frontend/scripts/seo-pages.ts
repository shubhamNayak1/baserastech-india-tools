import { CATEGORIES } from '../src/data/categories';
import { SITE } from '../src/config/site';
import { STATIC_PAGES } from '../src/data/staticPages';
import {
  ACTIVE_TOOLS,
  loadToolContent,
  relatedTools,
  toolsInCategory,
} from '../src/tools/registry';
import { escapeAttr, type SeoData } from '../src/seo/head';
import {
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
    body: `<h1>Free Online Calculators &amp; Tools</h1><p>Calculate, convert and generate useful results instantly.</p><ul>${CATEGORIES.map((c) => `<li>${link(`/category/${c.id}`, c.name)}</li>`).join('')}</ul>`,
    priority: 1,
    changefreq: 'daily',
  });
  pages.push({
    path: '/tools',
    seo: {
      title: `All ${ACTIVE_TOOLS.length} Free Online Calculators & Tools`,
      description: `Browse all ${ACTIVE_TOOLS.length} free calculators, converters and generators.`,
      path: '/tools',
      jsonLd: [
        breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'All tools', path: '/tools' },
        ]),
      ],
    },
    body: `<h1>All tools</h1><ul>${ACTIVE_TOOLS.map((t) => `<li>${link(`/tools/${t.slug}`, t.name)} – ${esc(t.shortDescription)}</li>`).join('')}</ul>`,
    priority: 0.9,
    changefreq: 'weekly',
  });
  for (const c of CATEGORIES) {
    const tools = toolsInCategory(c.id);
    pages.push({
      path: `/category/${c.id}`,
      seo: {
        title: c.seoTitle,
        description: c.seoDescription,
        path: `/category/${c.id}`,
        jsonLd: [
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: c.name, path: `/category/${c.id}` },
          ]),
          itemListSchema(c, tools),
        ],
      },
      body: `<h1>${esc(c.h1)}</h1><p>${esc(c.description)}</p><ul>${tools.map((t) => `<li>${link(`/tools/${t.slug}`, t.name)} – ${esc(t.shortDescription)}</li>`).join('')}</ul>`,
      priority: 0.8,
      changefreq: 'weekly',
    });
  }
  for (const t of ACTIVE_TOOLS) {
    const content = await loadToolContent(t);
    const cat = CATEGORIES.find((c) => c.id === t.category)!;
    const crumbs = [
      { name: 'Home', path: '/' },
      { name: cat.shortName, path: `/category/${cat.id}` },
      { name: t.name, path: `/tools/${t.slug}` },
    ];
    const faq = content?.faq ?? [];
    const sections = content
      ? [
          `<h2>What is the ${esc(t.name)}?</h2><p>${esc(content.whatIs)}</p>`,
          `<h2>How does it work?</h2><p>${esc(content.howItWorks)}</p>`,
          content.formula ? `<h2>Formula</h2><pre>${esc(content.formula)}</pre>` : '',
          content.example ? `<h2>Example</h2><p>${esc(content.example)}</p>` : '',
          faq.length
            ? `<h2>Frequently asked questions</h2>${faq.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join('')}`
            : '',
        ].join('')
      : '';
    pages.push({
      path: `/tools/${t.slug}`,
      seo: {
        title: t.seoTitle,
        description: t.seoDescription,
        path: `/tools/${t.slug}`,
        jsonLd: [
          webApplicationSchema(t, content?.description),
          breadcrumbSchema(crumbs),
          faqSchema(faq),
        ],
      },
      body: `<nav>${crumbs.map((c) => link(c.path, c.name)).join(' › ')}</nav><h1>${esc(t.h1)}</h1><p>${esc(content?.description ?? t.shortDescription)}</p>${sections}<h2>Related tools</h2><ul>${relatedTools(
        t,
      )
        .map((r) => `<li>${link(`/tools/${r.slug}`, r.name)}</li>`)
        .join('')}</ul>`,
      priority: t.isPopular || t.isFeatured ? 0.9 : 0.7,
      changefreq: 'monthly',
    });
  }
  for (const p of Object.values(STATIC_PAGES)) {
    const body = p.sections
      .map(
        (sec) =>
          `${sec.heading ? `<h2>${esc(sec.heading)}</h2>` : ''}${sec.paragraphs.map((x) => `<p>${esc(x)}</p>`).join('')}`,
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
