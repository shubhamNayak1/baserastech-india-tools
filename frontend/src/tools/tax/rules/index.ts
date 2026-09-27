import { FY_2025_26 } from './fy2025-26';
import { FY_2026_27 } from './fy2026-27';
import type { TaxRuleSet } from './types';

export * from './types';

/** Newest first. Add a new file per financial year and register it here. */
export const TAX_YEARS: TaxRuleSet[] = [FY_2026_27, FY_2025_26];

export const DEFAULT_FY = TAX_YEARS[0].fy;

export function getTaxRules(fy: string = DEFAULT_FY): TaxRuleSet {
  return TAX_YEARS.find((t) => t.fy === fy) ?? TAX_YEARS[0];
}

export const FY_OPTIONS = TAX_YEARS.map((t) => ({ value: t.fy, label: t.label }));

/** Current rules for non-year-specific payroll parameters (EPF, ESI, gratuity cap…). */
export const CURRENT_RULES = TAX_YEARS[0];
