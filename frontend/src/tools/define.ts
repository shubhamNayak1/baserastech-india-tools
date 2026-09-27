import { SITE } from '@/config/site';
import type { CategoryId, ToolContent, ToolDefinition, ToolInput } from '@/types/tool';

/** Fill defaults for a tool definition. Keeps every category manifest terse and consistent. */
export function defineTool(category: CategoryId, input: ToolInput): ToolDefinition {
  const { name } = input;
  return {
    ...input,
    category,
    id: input.id ?? input.slug,
    h1: input.h1 ?? name,
    seoTitle: input.seoTitle ?? `${name} – Free Online | ${SITE.name}`,
    seoDescription: input.seoDescription ?? input.shortDescription,
    aliases: input.aliases ?? [],
    relatedTools: input.relatedTools ?? [],
    isPopular: input.isPopular ?? false,
    isFeatured: input.isFeatured ?? false,
    isActive: input.isActive ?? true,
    addedAt: input.addedAt ?? SITE.launchDate,
  };
}

export function defineCategory(category: CategoryId, tools: ToolInput[]): ToolDefinition[] {
  return tools.map((t) => defineTool(category, t));
}

export type ContentMap = Record<string, ToolContent>;
