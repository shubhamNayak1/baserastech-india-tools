import { FY_2025_26, CII } from './fy2025-26';
import type { TaxRuleSet } from './types';

/**
 * Tax Year 2026-27. The Income-tax Act, 2025 applies from 1 April 2026; slab rates,
 * rebate and standard deduction carry forward from FY 2025-26. Marked provisional so
 * the UI reminds users to verify against the latest notifications.
 */
export const FY_2026_27: TaxRuleSet = {
  ...FY_2025_26,
  fy: '2026-27',
  ay: '2027-28',
  label: 'Tax Year 2026-27',
  status: 'provisional',
  note: 'Rates for 2026-27 carry forward the 2025-26 slabs under the Income-tax Act, 2025. Please verify against the latest notified rates.',
  capitalGains: { ...FY_2025_26.capitalGains, costInflationIndex: { ...CII } },
};
