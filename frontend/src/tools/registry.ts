import type { CategoryId, ToolContent, ToolDefinition } from '@/types/tool';
import type { ContentMap } from './define';
import { financeTools } from './finance';
import { salaryTools } from './salary';
import { taxTools } from './tax';
import { businessTools } from './business';
import { mathTools } from './math';
import { dateTimeTools } from './date-time';
import { converterTools } from './converters';
import { healthTools } from './health';
import { educationTools } from './education';
import { developerTools } from './developer';
import { textTools } from './text';
import { everydayTools } from './everyday';

/**
 * The single source of truth for which tools exist. Each category contributes a manifest
 * (lightweight metadata + lazy component loader) and a lazily loaded content module.
 * Adding a tool = adding an entry to its category manifest and content file.
 */
export const ALL_TOOLS: ToolDefinition[] = [
  ...financeTools,
  ...salaryTools,
  ...taxTools,
  ...businessTools,
  ...mathTools,
  ...dateTimeTools,
  ...converterTools,
  ...healthTools,
  ...educationTools,
  ...developerTools,
  ...textTools,
  ...everydayTools,
];

const contentLoaders: Partial<Record<CategoryId, () => Promise<ContentMap>>> = {
  finance: () => import('./finance/content').then((m) => m.default),
  salary: () => import('./salary/content').then((m) => m.default),
  tax: () => import('./tax/content').then((m) => m.default),
  business: () => import('./business/content').then((m) => m.default),
  math: () => import('./math/content').then((m) => m.default),
  'date-time': () => import('./date-time/content').then((m) => m.default),
  converters: () => import('./converters/content').then((m) => m.default),
  health: () => import('./health/content').then((m) => m.default),
  education: () => import('./education/content').then((m) => m.default),
  developer: () => import('./developer/content').then((m) => m.default),
  text: () => import('./text/content').then((m) => m.default),
  everyday: () => import('./everyday/content').then((m) => m.default),
};

export const TOOL_BY_SLUG: ReadonlyMap<string, ToolDefinition> = new Map(
  ALL_TOOLS.map((t) => [t.slug, t]),
);

export const ACTIVE_TOOLS = ALL_TOOLS.filter((t) => t.isActive);

export function getTool(slug: string): ToolDefinition | undefined {
  const t = TOOL_BY_SLUG.get(slug);
  return t?.isActive ? t : undefined;
}

/** Tools in a category: tools whose primary category it is come first, then cross-listed ones. */
export function toolsInCategory(category: CategoryId): ToolDefinition[] {
  const primary = ACTIVE_TOOLS.filter((t) => t.category === category);
  const crossListed = ACTIVE_TOOLS.filter(
    (t) => t.category !== category && t.alsoIn?.includes(category),
  );
  return [...primary, ...crossListed];
}

export function getTools(slugs: readonly string[]): ToolDefinition[] {
  return slugs.map((s) => getTool(s)).filter((t): t is ToolDefinition => Boolean(t));
}

export async function loadToolContent(tool: ToolDefinition): Promise<ToolContent | undefined> {
  const loader = contentLoaders[tool.category];
  if (!loader) return undefined;
  const map = await loader();
  return map[tool.slug];
}

/** Related tools: curated first, then same-category popular tools to fill up to `limit`. */
export function relatedTools(tool: ToolDefinition, limit = 6): ToolDefinition[] {
  const curated = getTools([...new Set(tool.relatedTools)]).filter((t) => t.slug !== tool.slug);
  const seen = new Set([tool.slug, ...curated.map((t) => t.slug)]);
  const fill = toolsInCategory(tool.category)
    .filter((t) => !seen.has(t.slug))
    .sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
  return [...curated, ...fill].slice(0, limit);
}

export const POPULAR_TOOLS = ACTIVE_TOOLS.filter((t) => t.isPopular);
export const FEATURED_TOOLS = ACTIVE_TOOLS.filter((t) => t.isFeatured);

export function recentlyAddedTools(limit = 8): ToolDefinition[] {
  return ACTIVE_TOOLS.map((t, i) => ({ t, i }))
    .sort((a, b) => b.t.addedAt.localeCompare(a.t.addedAt) || b.i - a.i)
    .slice(0, limit)
    .map((x) => x.t);
}
