import { SITE } from '@/config/site';
import type { CategoryDefinition, Faq, ToolMeta } from '@/types/tool';

export type JsonLd = Record<string, unknown>;

export const absoluteUrl = (path: string) =>
  `${SITE.url}${path.startsWith('/') ? path : `/${path}`}`;

export function toolPath(slug: string) {
  return `/tools/${slug}`;
}
export function categoryPath(id: string) {
  return `/category/${id}`;
}

export function organizationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.brand,
    url: SITE.url,
    logo: absoluteUrl('/icons/icon-512.png'),
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
