import { CATEGORIES } from '@/data/categories';
import { ICONS } from '@/components/ui/icons';
import {
  ALL_TOOLS,
  loadToolContent,
  relatedTools,
  toolsInCategory,
  TOOL_BY_SLUG,
} from './registry';

describe('tool registry', () => {
  it('has unique ids and URL-safe slugs', () => {
    const slugs = ALL_TOOLS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(ALL_TOOLS.map((t) => t.id)).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every tool complete metadata', () => {
    for (const t of ALL_TOOLS) {
      expect(t.name.length, t.slug).toBeGreaterThan(2);
      expect(t.shortDescription.length, t.slug).toBeGreaterThan(20);
      expect(t.shortDescription.length, t.slug).toBeLessThanOrEqual(160);
      expect(t.keywords.length, t.slug).toBeGreaterThanOrEqual(2);
      expect(ICONS[t.icon], `${t.slug} icon`).toBeDefined();
      expect(t.seoTitle, t.slug).toContain(t.name);
      expect(typeof t.load, t.slug).toBe('function');
    }
  });

  it('only references existing related tools', () => {
    for (const t of ALL_TOOLS) {
      for (const r of t.relatedTools) expect(TOOL_BY_SLUG.has(r), `${t.slug} → ${r}`).toBe(true);
      expect(new Set(t.relatedTools).size, `${t.slug} has duplicate related tools`).toBe(
        t.relatedTools.length,
      );
      expect(t.relatedTools, `${t.slug} lists itself`).not.toContain(t.slug);
      expect(relatedTools(t).length, t.slug).toBeGreaterThan(0);
    }
  });

  it('has page content with explanation and FAQ for every tool', async () => {
    for (const t of ALL_TOOLS) {
      const c = await loadToolContent(t);
      expect(c, `content for ${t.slug}`).toBeDefined();
      expect(c!.whatIs.length, t.slug).toBeGreaterThan(40);
      expect(c!.howItWorks.length, t.slug).toBeGreaterThan(40);
      expect(c!.faq.length, t.slug).toBeGreaterThanOrEqual(1);
    }
  });

  it('assigns every category at least one tool', () => {
    const used = new Set(ALL_TOOLS.flatMap((t) => [t.category, ...(t.alsoIn ?? [])]));
    for (const c of CATEGORIES)
      if (used.has(c.id)) expect(toolsInCategory(c.id).length).toBeGreaterThan(0);
  });
});
