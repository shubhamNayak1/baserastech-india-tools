import type { ComponentType } from 'react';
import type { IconName } from '@/components/ui/icons';

export type CategoryId =
  | 'finance'
  | 'salary'
  | 'tax'
  | 'business'
  | 'math'
  | 'date-time'
  | 'converters'
  | 'health'
  | 'education'
  | 'developer'
  | 'text'
  | 'everyday';

export type DisclaimerKind = 'finance' | 'tax' | 'health';

export interface Faq {
  q: string;
  a: string;
}

/** Long-form, human-readable page content. Loaded lazily per category to keep the main bundle small. */
export interface ToolContent {
  /** Longer description shown under the H1 and used as SEO copy. */
  description?: string;
  whatIs: string;
  howItWorks: string;
  formula?: string;
  example?: string;
  howToUse?: string[];
  faq: Faq[];
}

/** Lightweight metadata that is always in memory (search index, cards, routing). */
export interface ToolMeta {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  /** Additional categories this tool is listed under. */
  alsoIn?: CategoryId[];
  shortDescription: string;
  keywords: string[];
  aliases: string[];
  icon: IconName;
  seoTitle: string;
  seoDescription: string;
  h1: string;
  relatedTools: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  addedAt: string;
  disclaimer?: DisclaimerKind;
  /** Short phrase used in share text: "I calculated my {shareSubject} using ..." */
  shareSubject?: string;
  /** Processing happens only in the browser; input never leaves the device. */
  localOnly?: boolean;
  /** Analytics grouping */
  analyticsGroup?: string;
}

export type ToolComponent = ComponentType;

export interface ToolDefinition extends ToolMeta {
  load: () => Promise<ToolComponent>;
}

/** Authoring shape: optional fields receive sensible defaults via defineTool(). */
export type ToolInput = Omit<
  ToolDefinition,
  | 'id'
  | 'seoTitle'
  | 'seoDescription'
  | 'h1'
  | 'isPopular'
  | 'isFeatured'
  | 'isActive'
  | 'addedAt'
  | 'aliases'
  | 'relatedTools'
  | 'category'
> & {
  id?: string;
  seoTitle?: string;
  seoDescription?: string;
  h1?: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  addedAt?: string;
  aliases?: string[];
  relatedTools?: string[];
};

export interface CategoryDefinition {
  id: CategoryId;
  name: string;
  shortName: string;
  h1: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  icon: IconName;
  keywords: string[];
  related: CategoryId[];
  disclaimer?: DisclaimerKind;
}
