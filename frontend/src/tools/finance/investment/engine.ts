import { InputError, round2 } from '@/utils/number';

export interface YearPoint {
  year: number;
  invested: number;
  value: number;
}

/**
 * Monthly SIP future value with optional annual step-up. Contributions are made at the
 * start of each month (annuity-due), the convention used by Indian AMCs and SEBI examples.
 */
export function sip(monthly: number, annualReturnPct: number, years: number, stepUpPct = 0) {
  if (!(monthly > 0))
    throw new InputError('Monthly investment must be greater than zero.', 'monthly');
  if (!(years > 0)) throw new InputError('Investment period must be greater than zero.', 'years');
  const r = annualReturnPct / 12 / 100;
  const months = Math.round(years * 12);
  let value = 0;
  let invested = 0;
  let instalment = monthly;
  const points: YearPoint[] = [];
  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m - 1) % 12 === 0) instalment *= 1 + stepUpPct / 100;
    value = (value + instalment) * (1 + r);
    invested += instalment;
    if (m % 12 === 0 || m === months)
      points.push({ year: Math.ceil(m / 12), invested: round2(invested), value: round2(value) });
  }
  return {
    invested: round2(invested),
    value: round2(value),
    gains: round2(value - invested),
    points,
  };
}

/** Closed-form SIP (no step-up): FV = P × [((1+i)^n − 1) / i] × (1+i). */
export function sipClosedForm(monthly: number, annualReturnPct: number, months: number): number {
  const i = annualReturnPct / 12 / 100;
  if (i === 0) return monthly * months;
  return monthly * (((1 + i) ** months - 1) / i) * (1 + i);
}

export function lumpsum(principal: number, annualReturnPct: number, years: number) {
  if (!(principal > 0))
    throw new InputError('Investment amount must be greater than zero.', 'amount');
  const value = principal * (1 + annualReturnPct / 100) ** years;
  const points: YearPoint[] = [];
  for (let y = 1; y <= Math.ceil(years); y++) {
    points.push({
      year: y,
      invested: principal,
      value: round2(principal * (1 + annualReturnPct / 100) ** Math.min(y, years)),
    });
  }
  return { invested: principal, value: round2(value), gains: round2(value - principal), points };
}

export function cagr(start: number, end: number, years: number): number {
  if (!(start > 0)) throw new InputError('Initial value must be greater than zero.', 'start');
  if (!(end >= 0)) throw new InputError('Final value cannot be negative.', 'end');
  if (!(years > 0)) throw new InputError('Duration must be greater than zero.', 'years');
  return ((end / start) ** (1 / years) - 1) * 100;
}

export interface SwpRow {
  year: number;
  opening: number;
  withdrawn: number;
  returns: number;
  closing: number;
}

/** Systematic withdrawal: withdraw at the start of each month, remainder grows monthly. */
export function swp(
  corpus: number,
  monthlyWithdrawal: number,
  annualReturnPct: number,
  years: number,
  withdrawalStepUpPct = 0,
) {
  if (!(corpus > 0)) throw new InputError('Investment amount must be greater than zero.', 'corpus');
  if (!(monthlyWithdrawal > 0))
    throw new InputError('Withdrawal must be greater than zero.', 'withdrawal');
  const r = annualReturnPct / 12 / 100;
  const months = Math.round(years * 12);
  let bal = corpus;
  let w = monthlyWithdrawal;
  let totalWithdrawn = 0;
  let depletedAt: number | null = null;
  const rows: SwpRow[] = [];
  let yr: SwpRow = { year: 1, opening: corpus, withdrawn: 0, returns: 0, closing: 0 };
  for (let m = 1; m <= months; m++) {
    if (m > 1 && (m - 1) % 12 === 0) {
      w *= 1 + withdrawalStepUpPct / 100;
    }
    const take = Math.min(w, bal);
    bal -= take;
    totalWithdrawn += take;
    const gain = bal * r;
    bal += gain;
    yr.withdrawn += take;
    yr.returns += gain;
    if (bal <= 0.005 && depletedAt === null) depletedAt = m;
    if (m % 12 === 0 || m === months) {
      yr.closing = bal;
      rows.push({
        ...yr,
        withdrawn: round2(yr.withdrawn),
        returns: round2(yr.returns),
        closing: round2(bal),
        opening: round2(yr.opening),
      });
      yr = { year: yr.year + 1, opening: bal, withdrawn: 0, returns: 0, closing: 0 };
    }
    if (bal <= 0.005) break;
  }
  return {
    totalWithdrawn: round2(totalWithdrawn),
    finalBalance: round2(Math.max(0, bal)),
    depletedAt,
    rows,
  };
}

/**
 * Systematic transfer: a lump sum parked in a source fund (e.g. liquid) transfers a fixed
 * amount monthly into a target fund (e.g. equity) until the source is exhausted or the period ends.
 */
export function stp(
  total: number,
  monthlyTransfer: number,
  sourceReturnPct: number,
  targetReturnPct: number,
  months: number,
) {
  if (!(total > 0)) throw new InputError('Investment amount must be greater than zero.', 'amount');
  if (!(monthlyTransfer > 0))
    throw new InputError('Transfer amount must be greater than zero.', 'transfer');
  if (monthlyTransfer > total)
    throw new InputError('Monthly transfer cannot exceed the lump sum.', 'transfer');
  const rs = sourceReturnPct / 12 / 100;
  const rt = targetReturnPct / 12 / 100;
  let src = total;
  let tgt = 0;
  let transferred = 0;
  let transfers = 0;
  for (let m = 1; m <= months; m++) {
    const t = Math.min(monthlyTransfer, src);
    src -= t;
    tgt += t;
    transferred += t;
    if (t > 0) transfers++;
    src *= 1 + rs;
    tgt *= 1 + rt;
  }
  return {
    sourceBalance: round2(src),
    targetValue: round2(tgt),
    totalValue: round2(src + tgt),
    transferred: round2(transferred),
    transfers,
    gains: round2(src + tgt - total),
  };
}

export function futureValue(
  pv: number,
  ratePct: number,
  periods: number,
  payment = 0,
  paymentAtStart = false,
): number {
  const r = ratePct / 100;
  const growth = (1 + r) ** periods;
  const annuity =
    r === 0 ? payment * periods : payment * ((growth - 1) / r) * (paymentAtStart ? 1 + r : 1);
  return pv * growth + annuity;
}

export function presentValue(fv: number, ratePct: number, periods: number): number {
  return fv / (1 + ratePct / 100) ** periods;
}

export function presentValueOfAnnuity(
  payment: number,
  ratePct: number,
  periods: number,
  paymentAtStart = false,
): number {
  const r = ratePct / 100;
  if (r === 0) return payment * periods;
  return payment * ((1 - (1 + r) ** -periods) / r) * (paymentAtStart ? 1 + r : 1);
}

export function ruleOf72(ratePct: number) {
  if (!(ratePct > 0)) throw new InputError('Rate must be greater than zero.', 'rate');
  return {
    rule72: 72 / ratePct,
    exact: Math.log(2) / Math.log(1 + ratePct / 100),
    rule114: 114 / ratePct,
    rule144: 144 / ratePct,
  };
}

export function inflationAdjusted(amount: number, inflationPct: number, years: number) {
  const factor = (1 + inflationPct / 100) ** years;
  return { futureCost: amount * factor, purchasingPower: amount / factor };
}

export interface RetirementInput {
  currentAge: number;
  retireAge: number;
  lifeExpectancy: number;
  monthlyExpense: number;
  inflationPct: number;
  preReturnPct: number;
  postReturnPct: number;
  currentSavings: number;
}

/**
 * Corpus needed at retirement to fund inflation-rising expenses (paid monthly in advance)
 * until life expectancy — the present value of a growing annuity at the post-retirement return.
 */
export function retirementPlan(i: RetirementInput) {
  if (i.retireAge <= i.currentAge)
    throw new InputError('Retirement age must be greater than current age.', 'retireAge');
  if (i.lifeExpectancy <= i.retireAge)
    throw new InputError('Life expectancy must be greater than retirement age.', 'lifeExpectancy');
  const yearsToRetire = i.retireAge - i.currentAge;
  const retiredYears = i.lifeExpectancy - i.retireAge;
  const expenseAtRetirement = i.monthlyExpense * (1 + i.inflationPct / 100) ** yearsToRetire;
  const corpus = corpusNeeded(
    expenseAtRetirement * 12,
    i.inflationPct,
    i.postReturnPct,
    retiredYears,
  );
  const savingsFV = i.currentSavings * (1 + i.preReturnPct / 100) ** yearsToRetire;
  const gap = Math.max(0, corpus - savingsFV);
  const months = yearsToRetire * 12;
  const unit = sipClosedForm(1, i.preReturnPct, months);
  const monthlySip = gap > 0 ? gap / unit : 0;
  return { yearsToRetire, retiredYears, expenseAtRetirement, corpus, savingsFV, gap, monthlySip };
}

/** Present value, at retirement, of annual expenses growing with inflation (paid at start of each year). */
export function corpusNeeded(
  annualExpense: number,
  inflationPct: number,
  returnPct: number,
  years: number,
): number {
  const g = inflationPct / 100;
  const r = returnPct / 100;
  if (Math.abs(r - g) < 1e-12) return annualExpense * years;
  const realFactor = (1 + g) / (1 + r);
  return (annualExpense * (1 - realFactor ** years)) / (1 - realFactor);
}
