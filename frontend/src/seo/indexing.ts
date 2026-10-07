import type { ToolContent, ToolGuide } from '@/types/tool';

/**
 * Tool pages with only a short explanation are kept out of search indexes (noindex, follow and
 * left out of the sitemap) so that what Google sees is the site's substantial pages. A page
 * becomes indexable automatically once it has an in-depth guide or enough explanatory text.
 */
export const MIN_INDEXABLE_WORDS = 150;

const words = (s: string | undefined) => (s ? s.split(/\s+/).filter(Boolean).length : 0);

export function contentWordCount(content: ToolContent | undefined): number {
  if (!content) return 0;
  return [
    content.description,
    content.whatIs,
    content.howItWorks,
    content.formula,
    content.example,
    ...content.faq.flatMap((f) => [f.q, f.a]),
  ].reduce((n, s) => n + words(s), 0);
}

export function isToolIndexable(
  content: ToolContent | undefined,
  guide: ToolGuide | undefined,
): boolean {
  return Boolean(guide) || contentWordCount(content) >= MIN_INDEXABLE_WORDS;
}
