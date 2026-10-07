import { SITE } from '@/config/site';
import type { CategoryDefinition, Faq, ToolMeta } from '@/types/tool';

export type JsonLd = Record<string, unknown>;

/**
 * Page URLs end in a slash: GitHub Pages serves `/tools/x/index.html` at `/tools/x/` and
 * 301-redirects `/tools/x`, so canonical links, the sitemap and internal links all use the slash form.
 * Paths with a file extension (`/sitemap.xml`) are left alone; a query string is preserved.
 */
export function withSlash(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  const i = p.search(/[?#]/);
  const [pathname, rest] = i === -1 ? [p, ''] : [p.slice(0, i), p.slice(i)];
  if (pathname.endsWith('/') || /\.[a-z0-9]+$/i.test(pathname)) return p;
  return `${pathname}/${rest}`;
}

export const absoluteUrl = (path: string) => `${SITE.url}${withSlash(path)}`;

export function toolPath(slug: string) {
  return `/tools/${slug}/`;
}
export function categoryPath(id: string) {
  return `/category/${id}/`;
}

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.brand,
    url: SITE.url,
    logo: absoluteUrl('/icons/icon-512.png'),
    email: SITE.contactEmail,
    sameAs: [SITE.companyUrl],
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webApplicationSchema(tool: ToolMeta, description?: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: tool.name,
    url: absoluteUrl(toolPath(tool.slug)),
    description: description ?? tool.seoDescription,
    applicationCategory:
      tool.category === 'developer'
        ? 'DeveloperApplication'
        : tool.category === 'finance' || tool.category === 'tax' || tool.category === 'salary'
          ? 'FinanceApplication'
          : 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    publisher: { '@type': 'Organization', name: SITE.brand, url: SITE.url },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqSchema(faqs: Faq[]): JsonLd | null {
  if (!faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function itemListSchema(category: CategoryDefinition, tools: ToolMeta[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.h1,
    description: category.description,
    url: absoluteUrl(categoryPath(category.id)),
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: tools.length,
      itemListElement: tools.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: absoluteUrl(toolPath(t.slug)),
        name: t.name,
      })),
    },
  };
}

export function articleSchema(a: {
  title: string;
  description: string;
  path: string;
  published: string;
  updated: string;
}): JsonLd {
  const org = { '@type': 'Organization', name: SITE.brand, url: SITE.url };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    url: absoluteUrl(a.path),
    mainEntityOfPage: absoluteUrl(a.path),
    datePublished: a.published,
    dateModified: a.updated,
    inLanguage: 'en-IN',
    author: org,
    publisher: org,
  };
}
