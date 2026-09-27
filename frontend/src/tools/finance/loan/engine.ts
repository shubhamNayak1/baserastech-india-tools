import { InputError, round, round2 } from '@/utils/number';

export function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 12 / 100;
}

function validateLoan(principal: number, annualRatePct: number, months: number) {
  if (!(principal > 0)) throw new InputError('Loan amount must be greater than zero.', 'amount');
  if (annualRatePct < 0) throw new InputError('Interest rate cannot be negative.', 'rate');
  if (annualRatePct > 100) throw new InputError('Interest rate must be 100% or less.', 'rate');
  if (!Number.isInteger(months) || months < 1)
    throw new InputError('Tenure must be at least 1 month.', 'tenure');
  if (months > 600) throw new InputError('Tenure cannot exceed 50 years.', 'tenure');
}

/** Exact (unrounded) EMI using the reducing-balance formula. */
export function emiExact(principal: number, annualRatePct: number, months: number): number {
  validateLoan(principal, annualRatePct, months);
  const r = monthlyRate(annualRatePct);
  if (r === 0) return principal / months;
  const f = (1 + r) ** months;
  return (principal * r * f) / (f - 1);
}

export interface LoanSummary {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  months: number;
}

/**
 * Lender convention: EMI is rounded to the nearest rupee and the totals are EMI × months.
 * (50,00,000 @ 8.5% for 20 years → EMI ₹43,391, interest ₹54,13,840, total ₹1,04,13,840.)
 */
export function loanSummary(principal: number, annualRatePct: number, months: number): LoanSummary {
  const emi = round(emiExact(principal, annualRatePct, months), 0);
  const totalPayment = emi * months;
  return { emi, totalPayment, totalInterest: Math.max(0, totalPayment - principal), months };
}

export interface ScheduleRow {
  period: number;
  opening: number;
  payment: number;
  principal: number;
  interest: number;
  prepayment: number;
  closing: number;
}

export interface PrepaymentPlan {
  amount: number;
  /** month number (1-based) of the first prepayment */
  startMonth: number;
  frequency: 'once' | 'monthly' | 'yearly';
  strategy: 'reduce-tenure' | 'reduce-emi';
}

/** Month-by-month schedule. Supports optional prepayments. Values rounded to paise. */
export function amortizationSchedule(
  principal: number,
  annualRatePct: number,
  months: number,
  prepay?: PrepaymentPlan,
): ScheduleRow[] {
  const r = monthlyRate(annualRatePct);
  let emi = emiExact(principal, annualRatePct, months);
  let balance = principal;
  const rows: ScheduleRow[] = [];
  for (let m = 1; balance > 0.005 && m <= 1200; m++) {
    const interest = round2(balance * r);
    let payment = Math.min(round2(emi), round2(balance + interest));
    let princ = round2(payment - interest);
    if (m === months && prepay?.strategy !== 'reduce-tenure') {
      // close out rounding residue on the final scheduled instalment
      princ = round2(balance);
      payment = round2(princ + interest);
    }
    let extra = 0;
    if (prepay && prepay.amount > 0 && m >= prepay.startMonth) {
      const due =
        prepay.frequency === 'monthly' ||
        (prepay.frequency === 'once' && m === prepay.startMonth) ||
        (prepay.frequency === 'yearly' && (m - prepay.startMonth) % 12 === 0);
      if (due) extra = Math.min(prepay.amount, round2(balance - princ));
    }
    const closing = round2(balance - princ - extra);
    rows.push({
      period: m,
      opening: round2(balance),
      payment,
      principal: princ,
      interest,
      prepayment: extra,
      closing: Math.max(0, closing),
    });
    balance = Math.max(0, closing);
    if (extra > 0 && prepay?.strategy === 'reduce-emi' && balance > 0 && m < months) {
      emi = emiExact(balance, annualRatePct, months - m);
    }
  }
  return rows;
}

export interface YearRow {
  year: number;
  principal: number;
  interest: number;
  prepayment: number;
  closing: number;
}

export function yearlySummary(rows: ScheduleRow[]): YearRow[] {
  const years: YearRow[] = [];
  rows.forEach((row) => {
    const y = Math.ceil(row.period / 12);
    let cur = years[y - 1];
    if (!cur) {
      cur = { year: y, principal: 0, interest: 0, prepayment: 0, closing: 0 };
      years[y - 1] = cur;
    }
    cur.principal = round2(cur.principal + row.principal);
    cur.interest = round2(cur.interest + row.interest);
    cur.prepayment = round2(cur.prepayment + row.prepayment);
    cur.closing = row.closing;
  });
  return years;
}

export function totals(rows: ScheduleRow[]) {
  return rows.reduce(
    (a, r) => ({
      interest: round2(a.interest + r.interest),
      paid: round2(a.paid + r.payment + r.prepayment),
    }),
    { interest: 0, paid: 0 },
  );
}

/** Months required to repay `principal` with a given EMI. */
export function tenureForEmi(principal: number, annualRatePct: number, emi: number): number {
  if (!(principal > 0)) throw new InputError('Loan amount must be greater than zero.', 'amount');
  if (!(emi > 0)) throw new InputError('EMI must be greater than zero.', 'emi');
  const r = monthlyRate(annualRatePct);
  if (r === 0) return Math.ceil(principal / emi);
  const minEmi = principal * r;
  if (emi <= minEmi) {
    throw new InputError(
      `EMI must be more than the monthly interest of ₹${Math.ceil(minEmi).toLocaleString('en-IN')}, otherwise the loan never gets repaid.`,
      'emi',
    );
  }
  const n = -Math.log(1 - (principal * r) / emi) / Math.log(1 + r);
  return Math.ceil(n - 1e-9);
}

/** Largest principal serviceable by an EMI over n months. */
export function principalForEmi(emi: number, annualRatePct: number, months: number): number {
  const r = monthlyRate(annualRatePct);
  if (r === 0) return emi * months;
  return (emi * (1 - (1 + r) ** -months)) / r;
}

export function tenureMonths(value: number, unit: string): number {
  const m = unit === 'years' ? value * 12 : value;
  return Math.round(m);
}
