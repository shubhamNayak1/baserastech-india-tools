/**
 * Static tool registry — the single source of truth for search, categories, the All Tools page,
 * related tools, navigation, SEO (titles, sitemap, prerendering) and popular/featured lists.
 *
 * Each category contributes its tools from `src/tools/<category>/index.ts` (metadata + a lazy
 * loader for the calculator module), so adding a tool never touches unrelated code.
 */
export {
  ACTIVE_TOOLS,
  ALL_TOOLS,
  FEATURED_TOOLS,
  POPULAR_TOOLS,
  TOOL_BY_SLUG,
  getTool,
  getTools,
  loadToolContent,
  recentlyAddedTools,
  relatedTools,
  toolsInCategory,
} from '@/tools/registry';
export { CATEGORIES, CATEGORY_MAP, getCategory } from './categories';
export type { ToolDefinition, ToolMeta, CategoryDefinition, CategoryId } from '@/types/tool';
