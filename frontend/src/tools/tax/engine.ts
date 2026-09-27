import { InputError, round } from '@/utils/number';
import { getTaxRules, type AgeGroup, type RegimeId, type Slab, type TaxRuleSet } from './rules';

export interface SlabLine {
  from: number;
  to: number | null;
  ratePct: number;
  taxable: number;
  tax: number;
}

export function slabTax(income: number, slabs: Slab[]): { tax: number; lines: SlabLine[] } {
  let prev = 0;
  let tax = 0;
  const lines: SlabLine[] = [];
  for (const s of slabs) {
    const upper = s.upTo ?? Infinity;
    const taxable = Math.max(0, Math.min(income, upper) - prev);
    const t = (taxable * s.ratePct) / 100;
    lines.push({ from: prev, to: s.upTo, ratePct: s.ratePct, taxable, tax: t });
    tax += t;
    prev = upper;
    if (income <= upper) break;
  }
  return { tax, lines };
}

export interface Deductions {
  sec80C?: number;
  sec80D?: number;
  sec80CCD1B?: number;
  sec24b?: number;
  sec80TTA?: number;
  hraExemption?: number;
  other?: number;
}

export interface TaxInput {
  fy?: string;
  regime: RegimeId;
  age?: AgeGroup;
  salaryIncome: number;
  otherIncome?: number;
  deductions?: Deductions;
  /** Employer NPS contribution, deductible under 80CCD(2) in both regimes. */
  employerNps?: number;
  /** Professional tax paid (deductible under Sec 16(iii) in the old regime). */
  professionalTax?: number;
}

export interface TaxResult {
  rules: TaxRuleSet;
  regime: RegimeId;
  grossIncome: number;
  standardDeduction: number;
  deductions: number;
  taxableIncome: number;
  lines: SlabLine[];
  slabTax: number;
  rebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveRatePct: number;
}

/** Cap each Chapter VI-A deduction at its configured limit. */
export function allowedDeductions(d: Deductions, rules: TaxRuleSet, age: AgeGroup): number {
  const L = rules.deductionLimits;
  const cap = (v: number | undefined, max: number) => Math.min(Math.max(0, v ?? 0), max);
  const d80D = cap(
    d.sec80D,
    (age === 'below60' ? L.sec80D.self : L.sec80D.selfSenior) + L.sec80D.parentsSenior,
  );
  const interestCap = age === 'below60' ? L.sec80TTA : L.sec80TTB;
  return (
    cap(d.sec80C, L.sec80C) +
    d80D +
    cap(d.sec80CCD1B, L.sec80CCD1B) +
    cap(d.sec24b, L.sec24b) +
    cap(d.sec80TTA, interestCap) +
    Math.max(0, d.hraExemption ?? 0) +
    Math.max(0, d.other ?? 0)
  );
}

function surchargeRate(
  income: number,
  rules: TaxRuleSet,
  capPct: number,
): { ratePct: number; threshold: number } {
  let best = { ratePct: 0, threshold: 0 };
  for (const b of rules.surcharge)
    if (income > b.above) best = { ratePct: Math.min(b.ratePct, capPct), threshold: b.above };
  return best;
}

export function computeIncomeTax(input: TaxInput): TaxResult {
  const rules = getTaxRules(input.fy);
  const regime = rules.regimes[input.regime];
  const age = input.age ?? 'below60';
  if (input.salaryIncome < 0 || (input.otherIncome ?? 0) < 0)
    throw new InputError('Income cannot be negative.');
  const grossIncome = input.salaryIncome + (input.otherIncome ?? 0);
  const standardDeduction = Math.min(regime.standardDeduction, input.salaryIncome);
  let deductions = Math.max(0, input.employerNps ?? 0);
  if (regime.allowsChapterVIA) {
    deductions +=
      allowedDeductions(input.deductions ?? {}, rules, age) +
      Math.max(0, input.professionalTax ?? 0);
  }
  // Section 288A: taxable income rounded to the nearest ₹10.
  const taxableIncome = Math.max(
    0,
    round((grossIncome - standardDeduction - deductions) / 10, 0) * 10,
  );
  const slabs = regime.slabs[age];
  const { tax: baseTax, lines } = slabTax(taxableIncome, slabs);

  // Section 87A rebate, with marginal relief just above the limit (new regime).
  let rebate = 0;
  if (taxableIncome <= regime.rebate87A.incomeLimit)
    rebate = Math.min(baseTax, regime.rebate87A.maxRebate);
  else if (regime.rebate87A.marginalRelief) {
    const excess = taxableIncome - regime.rebate87A.incomeLimit;
    if (baseTax > excess) rebate = baseTax - excess;
  }
  const taxAfterRebate = baseTax - rebate;

  // Surcharge with marginal relief at each threshold.
  const { ratePct, threshold } = surchargeRate(taxableIncome, rules, regime.surchargeCapPct);
  let surcharge = (taxAfterRebate * ratePct) / 100;
  if (ratePct > 0) {
    const atThreshold = slabTax(threshold, slabs).tax;
    const prevRate = surchargeRate(threshold, rules, regime.surchargeCapPct).ratePct;
    const taxAtThreshold = atThreshold * (1 + prevRate / 100);
    const maxTotal = taxAtThreshold + (taxableIncome - threshold);
    if (taxAfterRebate + surcharge > maxTotal) surcharge = Math.max(0, maxTotal - taxAfterRebate);
  }
  const cess = ((taxAfterRebate + surcharge) * rules.cessPct) / 100;
  // Section 288B: tax rounded to the nearest ₹10.
  const totalTax = round((taxAfterRebate + surcharge + cess) / 10, 0) * 10;
  return {
    rules,
    regime: input.regime,
    grossIncome,
    standardDeduction,
    deductions,
    taxableIncome,
    lines,
    slabTax: baseTax,
    rebate,
    surcharge,
    cess,
    totalTax,
    effectiveRatePct: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
  };
}

export function compareRegimes(input: Omit<TaxInput, 'regime'>) {
  const n = computeIncomeTax({ ...input, regime: 'new' });
  const o = computeIncomeTax({ ...input, regime: 'old' });
  return {
    new: n,
    old: o,
    better: n.totalTax <= o.totalTax ? ('new' as const) : ('old' as const),
    saving: Math.abs(n.totalTax - o.totalTax),
  };
}

/** HRA exemption under Sec 10(13A): least of the three limits (old regime only). */
export function hraExemption(input: {
  basicDa: number;
  hraReceived: number;
  rentPaid: number;
  metro: boolean;
  fy?: string;
}) {
  const rules = getTaxRules(input.fy);
  const actual = input.hraReceived;
  const rentMinus = Math.max(
    0,
    input.rentPaid - (input.basicDa * rules.hra.rentExcessOfSalaryPct) / 100,
  );
  const pctOfSalary =
    (input.basicDa * (input.metro ? rules.hra.metroPct : rules.hra.nonMetroPct)) / 100;
  const exempt = Math.max(0, Math.min(actual, rentMinus, pctOfSalary));
  return { actual, rentMinus, pctOfSalary, exempt, taxable: Math.max(0, actual - exempt) };
}
