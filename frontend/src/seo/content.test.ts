import { ARTICLES, loadArticle } from '@/data/articles';
import { GUIDE_SLUGS, loadToolGuide } from '@/tools/guides';
import { getTool, loadToolContent } from '@/tools/registry';
import { contentWordCount, isToolIndexable, MIN_INDEXABLE_WORDS } from './indexing';
import { absoluteUrl, categoryPath, toolPath, withSlash } from './schema';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

describe('trailing-slash URLs', () => {
  it('adds a slash to page paths and keeps files, queries and the root intact', () => {
    expect(withSlash('/tools/emi-calculator')).toBe('/tools/emi-calculator/');
    expect(withSlash('/tools/emi-calculator/')).toBe('/tools/emi-calculator/');
    expect(withSlash('/')).toBe('/');
    expect(withSlash('/sitemap.xml')).toBe('/sitemap.xml');
    expect(withSlash('/tools?sort=new')).toBe('/tools/?sort=new');
    expect(withSlash('about')).toBe('/about/');
    expect(toolPath('x')).toBe('/tools/x/');
    expect(categoryPath('finance')).toBe('/category/finance/');
    expect(absoluteUrl('/about')).toMatch(/\/about\/$/);
  });
});

describe('tool guides', () => {
  it('belong to active tools and are substantial', async () => {
    expect(GUIDE_SLUGS.length).toBeGreaterThanOrEqual(20);
    for (const slug of GUIDE_SLUGS) {
      expect(getTool(slug), slug).toBeDefined();
      const g = (await loadToolGuide(slug))!;
      expect(g.reviewed, slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const text = g.sections
        .flatMap((s) => [
          s.heading,
          ...(s.paragraphs ?? []),
          ...(s.list ?? []),
          ...(s.table?.rows.flat() ?? []),
        ])
        .join(' ');
      expect(words(text), slug).toBeGreaterThan(300);
    }
  });

  it('make their tool indexable', async () => {
    for (const slug of GUIDE_SLUGS) {
      const tool = getTool(slug)!;
      expect(isToolIndexable(await loadToolContent(tool), await loadToolGuide(slug))).toBe(true);
    }
  });
});

describe('indexing rule', () => {
  it('keeps short pages out of the index unless they have a guide', () => {
    const short = { whatIs: 'a b c', howItWorks: 'd e f', faq: [] };
    expect(contentWordCount(short)).toBe(6);
    expect(isToolIndexable(short, undefined)).toBe(false);
    expect(isToolIndexable(short, { reviewed: '2026-10-07', sections: [] })).toBe(true);
    const long = { ...short, whatIs: Array(MIN_INDEXABLE_WORDS).fill('w').join(' ') };
    expect(isToolIndexable(long, undefined)).toBe(true);
  });
});

describe('articles', () => {
  it('have unique slugs, valid related tools and real content', async () => {
    expect(new Set(ARTICLES.map((a) => a.slug)).size).toBe(ARTICLES.length);
    for (const meta of ARTICLES) {
      for (const slug of meta.relatedTools)
        expect(getTool(slug), `${meta.slug}: ${slug}`).toBeDefined();
      const a = (await loadArticle(meta.slug))!;
      const text = [
        ...a.intro,
        ...a.sections.flatMap((s) => [
          ...(s.paragraphs ?? []),
          ...(s.list ?? []),
          ...(s.table?.rows.flat() ?? []),
        ]),
      ].join(' ');
      expect(words(text), meta.slug).toBeGreaterThan(600);
    }
  });
});
