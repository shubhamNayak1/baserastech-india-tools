import type { Faq, GuideSection } from '@/types/tool';

/** Lightweight article metadata, always in memory (lists, sitemap, routing). */
export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  /** ISO dates. */
  published: string;
  updated: string;
  /** Tools the article links to, in order of relevance. */
  relatedTools: string[];
}

export interface Article extends ArticleMeta {
  intro: string[];
  sections: GuideSection[];
  faq?: Faq[];
}

export const GUIDES_TITLE = 'Guides: tax, salary, loans and investing in India';
export const GUIDES_DESCRIPTION =
  'Plain-language guides to Indian income tax, salary structure, loans and savings, with worked examples and links to free calculators.';

type ArticleBody = Pick<Article, 'intro' | 'sections' | 'faq'>;

const loaders: Record<string, () => Promise<{ default: ArticleBody }>> = {
  'old-vs-new-tax-regime': () => import('./old-vs-new-tax-regime'),
  'ctc-vs-in-hand-salary': () => import('./ctc-vs-in-hand-salary'),
  'sip-vs-fd-vs-ppf': () => import('./sip-vs-fd-vs-ppf'),
  'home-loan-prepayment': () => import('./home-loan-prepayment'),
};

export const ARTICLES: ArticleMeta[] = [
  {
    slug: 'old-vs-new-tax-regime',
    title: 'Old vs new tax regime: which one should you choose?',
    description:
      'How the old and new income tax regimes compare for salaried people in India, with slab tables, break-even deductions and worked examples.',
    published: '2026-10-07',
    updated: '2026-10-07',
    relatedTools: [
      'income-tax-calculator',
      'hra-tax-exemption-calculator',
      'tax-saving-calculator',
    ],
  },
  {
    slug: 'ctc-vs-in-hand-salary',
    title: 'CTC vs in-hand salary: where does the money go?',
    description:
      'A line-by-line walk through a salary structure: basic, HRA, EPF, gratuity, professional tax and TDS, and how to estimate take-home pay from CTC.',
    published: '2026-10-07',
    updated: '2026-10-07',
    relatedTools: ['ctc-to-in-hand-salary-calculator', 'epf-calculator', 'gratuity-calculator'],
  },
  {
    slug: 'sip-vs-fd-vs-ppf',
    title: 'SIP vs FD vs PPF: comparing returns, risk and tax',
    description:
      'How mutual fund SIPs, bank fixed deposits and the Public Provident Fund differ in returns, lock-in, risk and taxation, with a 15-year comparison.',
    published: '2026-10-07',
    updated: '2026-10-07',
    relatedTools: ['sip-calculator', 'fd-calculator', 'ppf-calculator'],
  },
  {
    slug: 'home-loan-prepayment',
    title: 'Home loan prepayment: reduce EMI or reduce tenure?',
    description:
      'What happens to your interest bill when you prepay a home loan, why reducing tenure usually saves more, and when prepaying is not the best use of money.',
    published: '2026-10-07',
    updated: '2026-10-07',
    relatedTools: ['loan-prepayment-calculator', 'home-loan-emi-calculator', 'emi-calculator'],
  },
];

export const ARTICLE_BY_SLUG: ReadonlyMap<string, ArticleMeta> = new Map(
  ARTICLES.map((a) => [a.slug, a]),
);

export function articlePath(slug: string): string {
  return `/guides/${slug}/`;
}

export async function loadArticle(slug: string): Promise<Article | undefined> {
  const meta = ARTICLE_BY_SLUG.get(slug);
  const loader = loaders[slug];
  if (!meta || !loader) return undefined;
  return { ...meta, ...(await loader()).default };
}
