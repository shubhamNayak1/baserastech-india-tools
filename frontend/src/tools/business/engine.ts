import { InputError, round, round2, sumMoney } from '@/utils/number';
import { irr } from '@/utils/solve';
import { emiExact } from '../finance/loan/engine';

export function margin(cost: number, revenue: number) {
  if (!(revenue > 0))
    throw new InputError('Selling price / revenue must be greater than zero.', 'revenue');
  if (cost < 0) throw new InputError('Cost cannot be negative.', 'cost');
  const profit = revenue - cost;
  return {
    profit,
    marginPct: (profit / revenue) * 100,
    markupPct: cost > 0 ? (profit / cost) * 100 : NaN,
  };
}

export function priceFromMarkup(cost: number, markupPct: number) {
  return cost * (1 + markupPct / 100);
}

/** Price that yields the desired margin on the selling price. */
export function priceFromMargin(cost: number, marginPct: number) {
  if (marginPct >= 100) throw new InputError('Margin must be below 100%.', 'margin');
  return cost / (1 - marginPct / 100);
}

export function markupToMargin(markupPct: number) {
  return (markupPct / (100 + markupPct)) * 100;
}
export function marginToMarkup(marginPct: number) {
  if (marginPct >= 100) throw new InputError('Margin must be below 100%.', 'margin');
  return (marginPct / (100 - marginPct)) * 100;
}

/** Successive discounts: 20% + 10% = 28% effective. */
export function applyDiscounts(price: number, discountsPct: number[]) {
  let final = price;
  for (const d of discountsPct) {
    if (d < 0 || d > 100) throw new InputError('Discount must be between 0% and 100%.', 'discount');
    final *= 1 - d / 100;
  }
  final = round2(final);
  return {
    final,
    saved: round2(price - final),
    effectivePct: price > 0 ? round(((price - final) / price) * 100, 10) : 0,
  };
}

export function breakEven(fixed: number, price: number, variable: number, targetProfit = 0) {
  const contribution = price - variable;
  if (!(contribution > 0))
    throw new InputError('Selling price must be higher than variable cost per unit.', 'price');
  const units = (fixed + targetProfit) / contribution;
  return {
    contribution,
    contributionRatioPct: (contribution / price) * 100,
    units,
    unitsRounded: Math.ceil(units - 1e-9),
    revenue: Math.ceil(units - 1e-9) * price,
  };
}

export function roi(invested: number, returned: number, years?: number) {
  if (!(invested > 0))
    throw new InputError('Amount invested must be greater than zero.', 'invested');
  const gain = returned - invested;
  const roiPct = (gain / invested) * 100;
  const annualised =
    years && years > 0 && returned >= 0
      ? ((returned / invested) ** (1 / years) - 1) * 100
      : undefined;
  return { gain, roiPct, annualised };
}

export function roas(spend: number, revenue: number, marginPct?: number) {
  if (!(spend > 0)) throw new InputError('Ad spend must be greater than zero.', 'spend');
  const r = revenue / spend;
  const breakEvenRoas = marginPct && marginPct > 0 ? 100 / marginPct : undefined;
  const profit = marginPct !== undefined ? (revenue * marginPct) / 100 - spend : undefined;
  return { roas: r, roasPct: r * 100, breakEvenRoas, profit };
}

/** Effective annual cost of a loan including an upfront fee, via monthly IRR. */
export function loanApr(amount: number, ratePct: number, months: number, feePct: number) {
  const emi = emiExact(amount, ratePct, months);
  const fee = (amount * feePct) / 100;
  const flows = [-(amount - fee), ...Array.from({ length: months }, () => emi)];
  const monthly = irr(flows);
  return {
    emi,
    fee,
    aprPct: monthly === null ? ratePct : monthly * 12 * 100,
    effectiveAnnualPct: monthly === null ? ratePct : ((1 + monthly) ** 12 - 1) * 100,
  };
}

export interface Tier {
  upTo: number | null;
  ratePct: number;
}

/** Slab-wise (tiered) commission. */
export function tieredCommission(sales: number, tiers: Tier[]) {
  let prev = 0;
  let total = 0;
  for (const t of tiers) {
    const upper = t.upTo ?? Infinity;
    const slice = Math.max(0, Math.min(sales, upper) - prev);
    total += (slice * t.ratePct) / 100;
    prev = upper;
    if (sales <= upper) break;
  }
  return total;
}

export function percentChange(from: number, to: number) {
  if (from === 0)
    throw new InputError('The original value cannot be zero for a percentage change.', 'from');
  return ((to - from) / Math.abs(from)) * 100;
}

export interface InvoiceLine {
  description: string;
  qty: number;
  rate: number;
  gstPct: number;
  discountPct?: number;
}

export function invoiceTotals(lines: InvoiceLine[], interState: boolean) {
  const byRate = new Map<number, { taxable: number; tax: number }>();
  const computed = lines.map((l) => {
    const gross = round2(l.qty * l.rate);
    const discount = round2((gross * (l.discountPct ?? 0)) / 100);
    const taxable = round2(gross - discount);
    const tax = round2((taxable * l.gstPct) / 100);
    const cur = byRate.get(l.gstPct) ?? { taxable: 0, tax: 0 };
    byRate.set(l.gstPct, {
      taxable: sumMoney([cur.taxable, taxable]),
      tax: sumMoney([cur.tax, tax]),
    });
    return { ...l, gross, discount, taxable, tax, total: sumMoney([taxable, tax]) };
  });
  const taxable = sumMoney(computed.map((c) => c.taxable));
  const tax = sumMoney(computed.map((c) => c.tax));
  const exact = sumMoney([taxable, tax]);
  const rounded = Math.round(exact);
  const summary = [...byRate.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([rate, v]) => {
      const half = round2(v.tax / 2);
      return {
        rate,
        taxable: v.taxable,
        tax: v.tax,
        cgst: interState ? 0 : half,
        sgst: interState ? 0 : round2(v.tax - half),
        igst: interState ? v.tax : 0,
      };
    });
  return {
    lines: computed,
    taxable,
    tax,
    total: exact,
    roundOff: round2(rounded - exact),
    grandTotal: rounded,
    summary,
  };
}
