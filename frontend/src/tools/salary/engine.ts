import { InputError, round, round2 } from '@/utils/number';
import { CURRENT_RULES, type RegimeId } from '../tax/rules';
import { computeIncomeTax } from '../tax/engine';

const EPF = CURRENT_RULES.epf;
const ESI = CURRENT_RULES.esi;

export type PfMode = 'capped' | 'full' | 'none';

/** Monthly PF contributions on basic + DA. EPS is always on wages capped at ₹15,000. */
export function pfContribution(basicDa: number, mode: PfMode = 'capped', vpfPct = 0) {
  if (basicDa < 0) throw new InputError('Basic salary cannot be negative.', 'basic');
  if (mode === 'none')
    return {
      wageBase: 0,
      employee: 0,
      vpf: 0,
      employerEpf: 0,
      eps: 0,
      employerTotal: 0,
      edli: 0,
      admin: 0,
      employerCost: 0,
    };
  const wageBase = mode === 'capped' ? Math.min(basicDa, EPF.wageCeiling) : basicDa;
  const employee = round((wageBase * EPF.employeePct) / 100, 0);
  const vpf = round((basicDa * vpfPct) / 100, 0);
  const employerTotal = round((wageBase * EPF.employerPct) / 100, 0);
  const eps = round((Math.min(basicDa, EPF.wageCeiling) * EPF.epsPct) / 100, 0);
  const employerEpf = employerTotal - eps;
  const edli = round((Math.min(basicDa, EPF.wageCeiling) * EPF.edliPct) / 100, 0);
  const admin = round((wageBase * EPF.adminPct) / 100, 0);
  return {
    wageBase,
    employee,
    vpf,
    employerEpf,
    eps,
    employerTotal,
    edli,
    admin,
    employerCost: employerTotal + edli + admin,
  };
}

/** ESI applies when monthly gross wages are at or below the ceiling. */
export function esiContribution(monthlyGross: number) {
  if (monthlyGross > ESI.wageCeiling) return { applicable: false, employee: 0, employer: 0 };
  return {
    applicable: true,
    employee: Math.ceil((monthlyGross * ESI.employeePct) / 100),
    employer: Math.ceil((monthlyGross * ESI.employerPct) / 100),
  };
}

export interface GratuityResult {
  amount: number;
  countedYears: number;
  eligible: boolean;
  exempt: number;
  taxable: number;
}

/** Payment of Gratuity Act: 15/26 × last salary × years (6+ months rounds up). */
export function gratuity(
  lastMonthlyBasicDa: number,
  years: number,
  months: number,
  covered: boolean,
): GratuityResult {
  if (!(lastMonthlyBasicDa > 0))
    throw new InputError('Salary must be greater than zero.', 'salary');
  if (years < 0 || months < 0 || months > 11)
    throw new InputError('Enter a valid service period.', 'months');
  const countedYears = covered ? years + (months >= 6 ? 1 : 0) : years;
  const factor = covered ? 15 / 26 : 15 / 30;
  const amount = round(lastMonthlyBasicDa * factor * countedYears, 0);
  const exempt = Math.min(amount, CURRENT_RULES.gratuity.exemptionCap);
  return {
    amount,
    countedYears,
    eligible: years >= 5 || (years === 4 && months >= 8),
    exempt,
    taxable: amount - exempt,
  };
}

export interface EpfYear {
  year: number;
  age: number;
  contribution: number;
  interest: number;
  balance: number;
}

/** EPF corpus projection. Interest is computed monthly on the running balance and credited yearly. */
export function epfCorpus(i: {
  basicDa: number;
  age: number;
  retireAge: number;
  growthPct: number;
  ratePct: number;
  balance: number;
  vpfPct: number;
  mode: PfMode;
}) {
  if (i.retireAge <= i.age)
    throw new InputError('Retirement age must be greater than current age.', 'retireAge');
  const years = i.retireAge - i.age;
  let balance = i.balance;
  let basic = i.basicDa;
  let totalEmployee = 0;
  let totalEmployer = 0;
  let totalInterest = 0;
  const rows: EpfYear[] = [];
  for (let y = 1; y <= years; y++) {
    const c = pfContribution(basic, i.mode, i.vpfPct);
    const monthly = c.employee + c.vpf + c.employerEpf;
    let interest = 0;
    for (let m = 0; m < 12; m++) {
      balance += monthly;
      interest += (balance * i.ratePct) / 1200;
    }
    balance += interest;
    totalEmployee += (c.employee + c.vpf) * 12;
    totalEmployer += c.employerEpf * 12;
    totalInterest += interest;
    rows.push({
      year: y,
      age: i.age + y,
      contribution: monthly * 12,
      interest: round2(interest),
      balance: round2(balance),
    });
    basic *= 1 + i.growthPct / 100;
  }
  return {
    corpus: round2(balance),
    totalEmployee,
    totalEmployer,
    totalInterest: round2(totalInterest),
    rows,
  };
}

export interface CtcInput {
  ctc: number;
  basicPct: number;
  hraPctOfBasic: number;
  pfMode: PfMode;
  includeGratuity: boolean;
  variablePay: number;
  professionalTax: number;
  regime: RegimeId;
  fy?: string;
  /** Old-regime extras */
  deductions80C?: number;
  otherDeductions?: number;
  rentPaidMonthly?: number;
  metro?: boolean;
}

export interface CtcBreakup {
  basic: number;
  hra: number;
  special: number;
  employerPf: number;
  gratuity: number;
  variable: number;
  grossSalary: number;
  employeePf: number;
  professionalTax: number;
  incomeTax: number;
  hraExempt: number;
  annualInHand: number;
  monthlyInHand: number;
  monthlyFixedInHand: number;
}

/** Split CTC into salary components and compute take-home after PF, PT and income tax. */
export function ctcToInHand(i: CtcInput): CtcBreakup {
  if (!(i.ctc > 0)) throw new InputError('CTC must be greater than zero.', 'ctc');
  if (i.variablePay >= i.ctc)
    throw new InputError('Variable pay must be less than CTC.', 'variable');
  const fixed = i.ctc - i.variablePay;
  const basic = (fixed * i.basicPct) / 100;
  const monthlyBasic = basic / 12;
  const pf = pfContribution(monthlyBasic, i.pfMode);
  const employerPf = pf.employerTotal * 12;
  const gratuityAmt = i.includeGratuity ? round((basic * 4.81) / 100, 0) : 0;
  const hra = (basic * i.hraPctOfBasic) / 100;
  const special = fixed - basic - hra - employerPf - gratuityAmt;
  if (special < 0)
    throw new InputError(
      'Basic, HRA and PF exceed the fixed CTC. Lower the basic or HRA percentage.',
      'basicPct',
    );
  const grossSalary = basic + hra + special + i.variablePay;
  const employeePf = pf.employee * 12;
  let hraExempt = 0;
  if (i.regime === 'old' && (i.rentPaidMonthly ?? 0) > 0) {
    const rent = (i.rentPaidMonthly ?? 0) * 12;
    hraExempt = Math.max(0, Math.min(hra, rent - basic * 0.1, basic * (i.metro ? 0.5 : 0.4)));
  }
  const tax = computeIncomeTax({
    fy: i.fy,
    regime: i.regime,
    salaryIncome: grossSalary,
    professionalTax: i.professionalTax,
    deductions: {
      sec80C: (i.deductions80C ?? 0) + employeePf,
      hraExemption: hraExempt,
      other: i.otherDeductions ?? 0,
    },
  }).totalTax;
  const annualInHand = grossSalary - employeePf - i.professionalTax - tax;
  const variableShareOfTax = grossSalary > 0 ? (tax * i.variablePay) / grossSalary : 0;
  return {
    basic,
    hra,
    special,
    employerPf,
    gratuity: gratuityAmt,
    variable: i.variablePay,
    grossSalary,
    employeePf,
    professionalTax: i.professionalTax,
    incomeTax: tax,
    hraExempt,
    annualInHand,
    monthlyInHand: annualInHand / 12,
    monthlyFixedInHand: (annualInHand - (i.variablePay - variableShareOfTax)) / 12,
  };
}

export type PayPeriod = 'hour' | 'day' | 'week' | 'month' | 'year';

/** Convert any pay amount to an annual figure. */
export function toAnnual(
  amount: number,
  period: PayPeriod,
  hoursPerWeek = 40,
  daysPerWeek = 5,
): number {
  switch (period) {
    case 'hour':
      return amount * hoursPerWeek * 52;
    case 'day':
      return amount * daysPerWeek * 52;
    case 'week':
      return amount * 52;
    case 'month':
      return amount * 12;
    case 'year':
      return amount;
  }
}

export function fromAnnual(annual: number, hoursPerWeek = 40, daysPerWeek = 5) {
  return {
    year: annual,
    month: annual / 12,
    week: annual / 52,
    day: annual / (daysPerWeek * 52),
    hour: annual / (hoursPerWeek * 52),
  };
}

export interface Interval {
  start: Date;
  end: Date;
}

/** Merge overlapping employment intervals and return total days. */
export function mergedDays(intervals: Interval[]): number {
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  let total = 0;
  let cur: Interval | null = null;
  for (const iv of sorted) {
    if (!cur) cur = { ...iv };
    else if (iv.start.getTime() <= cur.end.getTime() + 86_400_000) {
      if (iv.end > cur.end) cur.end = iv.end;
    } else {
      total += Math.round((cur.end.getTime() - cur.start.getTime()) / 86_400_000) + 1;
      cur = { ...iv };
    }
  }
  if (cur) total += Math.round((cur.end.getTime() - cur.start.getTime()) / 86_400_000) + 1;
  return total;
}
