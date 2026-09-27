import { InputError } from '@/utils/number';
import { addMonths } from '@/utils/date';
import type { TaxRuleSet } from './rules';

/** Indian financial year label for a date, e.g. 15-Jun-2024 → "2024-25". */
export function financialYearOf(date: Date): string {
  const y = date.getUTCFullYear();
  const start = date.getUTCMonth() >= 3 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

export function monthsHeld(buy: Date, sell: Date): number {
  let m =
    (sell.getUTCFullYear() - buy.getUTCFullYear()) * 12 + (sell.getUTCMonth() - buy.getUTCMonth());
  if (sell.getUTCDate() < buy.getUTCDate()) m -= 1;
  return m;
}

export interface CapitalGainsInput {
  assetId: string;
  buyDate: Date;
  sellDate: Date;
  buyPrice: number;
  sellPrice: number;
  expenses: number;
  /** Marginal slab rate used for gains taxed at slab rates. */
  slabRatePct: number;
  /** Portion of the annual ₹1.25 lakh equity LTCG exemption still available. */
  exemptionAvailable?: number;
}

export interface CapitalGainsResult {
  term: 'short' | 'long';
  monthsHeld: number;
  gain: number;
  taxableGain: number;
  ratePct: number;
  tax: number;
  cess: number;
  totalTax: number;
  method: string;
  indexed?: { indexedCost: number; gain: number; tax: number };
}

const INDEXATION_CUTOFF = Date.UTC(2024, 6, 23);

export function capitalGains(i: CapitalGainsInput, rules: TaxRuleSet): CapitalGainsResult {
  const asset = rules.capitalGains.assets.find((a) => a.id === i.assetId);
  if (!asset) throw new InputError('Choose an asset type.', 'asset');
  if (i.sellDate < i.buyDate)
    throw new InputError('Sale date must be after purchase date.', 'sell');
  if (i.buyPrice < 0 || i.sellPrice < 0 || i.expenses < 0)
    throw new InputError('Prices cannot be negative.');
  const months = monthsHeld(i.buyDate, i.sellDate);
  // Long-term when held for MORE than the threshold (selling on the anniversary is still short-term).
  const term = addMonths(i.buyDate, asset.longTermAfterMonths) < i.sellDate ? 'long' : 'short';
  const gain = i.sellPrice - i.buyPrice - i.expenses;
  const rule = term === 'long' ? asset.ltcg : asset.stcg;
  let ratePct = rule.kind === 'flat' ? rule.ratePct : i.slabRatePct;
  let taxableGain = Math.max(0, gain);
  let method =
    rule.kind === 'flat' ? `${ratePct}% flat rate` : `your slab rate (${i.slabRatePct}%)`;
  if (term === 'long' && rule.kind === 'flat' && rule.exemption) {
    const available = Math.min(rule.exemption, i.exemptionAvailable ?? rule.exemption);
    taxableGain = Math.max(0, gain - available);
    method += ` on gains above ₹${available.toLocaleString('en-IN')}`;
  }
  // Legacy rule: equity STCG was 15% for transfers before 23 July 2024.
  if (
    asset.id === 'listed-equity' &&
    term === 'short' &&
    i.sellDate.getTime() < INDEXATION_CUTOFF
  ) {
    ratePct = 15;
    method = '15% (sale before 23 Jul 2024)';
  }
  let tax = (taxableGain * ratePct) / 100;
  let indexed: CapitalGainsResult['indexed'];
  if (
    term === 'long' &&
    rule.kind === 'flat' &&
    rule.indexationOptionPct &&
    i.buyDate.getTime() < INDEXATION_CUTOFF
  ) {
    const cii = rules.capitalGains.costInflationIndex;
    const buyFy = financialYearOf(i.buyDate) < '2001-02' ? '2001-02' : financialYearOf(i.buyDate);
    const sellFy = financialYearOf(i.sellDate);
    const buyIdx = cii[buyFy];
    const sellIdx = cii[sellFy] ?? Math.max(...Object.values(cii));
    if (buyIdx && sellIdx) {
      const indexedCost = (i.buyPrice * sellIdx) / buyIdx;
      const g = Math.max(0, i.sellPrice - indexedCost - i.expenses);
      const t = (g * rule.indexationOptionPct) / 100;
      indexed = { indexedCost, gain: g, tax: t };
      if (t < tax) {
        tax = t;
        ratePct = rule.indexationOptionPct;
        taxableGain = g;
        method = `${rule.indexationOptionPct}% with indexation (lower than 12.5% without)`;
      }
    }
  }
  const cess = (tax * rules.cessPct) / 100;
  return {
    term,
    monthsHeld: months,
    gain,
    taxableGain,
    ratePct,
    tax,
    cess,
    totalTax: tax + cess,
    method,
    indexed,
  };
}
