import { InputError, round2 } from '@/utils/number';

export type Compounding = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'simple';
const PER_YEAR: Record<Exclude<Compounding, 'simple'>, number> = {
  monthly: 12,
  quarterly: 4,
  'half-yearly': 2,
  yearly: 1,
};

/** Fixed deposit maturity. Tenure in days is converted with a 365-day year. */
export function fixedDeposit(
  principal: number,
  ratePct: number,
  years: number,
  compounding: Compounding,
) {
  if (!(principal > 0)) throw new InputError('Deposit amount must be greater than zero.', 'amount');
  if (!(years > 0)) throw new InputError('Tenure must be greater than zero.', 'tenure');
  const r = ratePct / 100;
  const maturity =
    compounding === 'simple'
      ? principal * (1 + r * years)
      : principal * (1 + r / PER_YEAR[compounding]) ** (PER_YEAR[compounding] * years);
  const effectiveAnnual =
    compounding === 'simple'
      ? ratePct
      : ((1 + r / PER_YEAR[compounding]) ** PER_YEAR[compounding] - 1) * 100;
  return { maturity: round2(maturity), interest: round2(maturity - principal), effectiveAnnual };
}

/**
 * Periodic interest payout for non-cumulative FDs (simple interest per period).
 * Some banks pay a slightly discounted amount for monthly payouts.
 */
export function fdPayout(
  principal: number,
  ratePct: number,
  frequency: 'monthly' | 'quarterly' | 'yearly',
) {
  const n = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1;
  return round2((principal * ratePct) / 100 / n);
}

/**
 * Recurring deposit with quarterly compounding (Indian bank practice): each monthly
 * instalment earns interest for the months it stays invested.
 */
export function recurringDeposit(monthly: number, ratePct: number, months: number) {
  if (!(monthly > 0)) throw new InputError('Monthly deposit must be greater than zero.', 'monthly');
  if (!Number.isInteger(months) || months < 1)
    throw new InputError('Tenure must be at least 1 month.', 'months');
  if (months > 600) throw new InputError('Tenure cannot exceed 50 years.', 'months');
  const q = ratePct / 400;
  let maturity = 0;
  for (let k = 0; k < months; k++) {
    const remaining = months - k;
    maturity += monthly * (1 + q) ** (remaining / 3);
  }
  const invested = monthly * months;
  return { maturity: round2(maturity), invested, interest: round2(maturity - invested) };
}

export interface PpfRow {
  year: number;
  deposit: number;
  interest: number;
  balance: number;
}

/** PPF: yearly deposit before 5 April earns full-year interest, compounded annually. */
export function ppf(yearlyDeposit: number, ratePct: number, years: number) {
  if (yearlyDeposit < 500)
    throw new InputError('PPF requires a minimum deposit of ₹500 per year.', 'deposit');
  if (yearlyDeposit > 150000)
    throw new InputError('PPF deposits are capped at ₹1,50,000 per financial year.', 'deposit');
  if (years < 15 || (years - 15) % 5 !== 0)
    throw new InputError(
      'PPF runs for 15 years and can be extended in blocks of 5 years.',
      'years',
    );
  let balance = 0;
  const rows: PpfRow[] = [];
  for (let y = 1; y <= years; y++) {
    const interest = round2((balance + yearlyDeposit) * (ratePct / 100));
    balance = round2(balance + yearlyDeposit + interest);
    rows.push({ year: y, deposit: yearlyDeposit, interest, balance });
  }
  const invested = yearlyDeposit * years;
  return { maturity: balance, invested, interest: round2(balance - invested), rows };
}

export interface NpsInput {
  currentAge: number;
  monthly: number;
  returnPct: number;
  annuityPct: number;
  annuityRatePct: number;
  retireAge?: number;
}

export function nps(i: NpsInput) {
  const retireAge = i.retireAge ?? 60;
  if (i.currentAge < 18 || i.currentAge >= retireAge)
    throw new InputError(`Age must be between 18 and ${retireAge - 1}.`, 'age');
  if (i.annuityPct < 40 || i.annuityPct > 100)
    throw new InputError(
      'At least 40% of the corpus must be used to buy an annuity.',
      'annuityPct',
    );
  const months = (retireAge - i.currentAge) * 12;
  const r = i.returnPct / 1200;
  const corpus = r === 0 ? i.monthly * months : i.monthly * (((1 + r) ** months - 1) / r) * (1 + r);
  const invested = i.monthly * months;
  const annuityCorpus = (corpus * i.annuityPct) / 100;
  const lumpSum = corpus - annuityCorpus;
  const monthlyPension = (annuityCorpus * i.annuityRatePct) / 100 / 12;
  return {
    corpus,
    invested,
    gains: corpus - invested,
    annuityCorpus,
    lumpSum,
    monthlyPension,
    years: retireAge - i.currentAge,
  };
}

export function simpleInterest(principal: number, ratePct: number, years: number) {
  const interest = (principal * ratePct * years) / 100;
  return { interest: round2(interest), amount: round2(principal + interest) };
}

export function compoundInterest(
  principal: number,
  ratePct: number,
  years: number,
  perYear: number,
  monthlyAddition = 0,
) {
  const r = ratePct / 100 / perYear;
  const periods = perYear * years;
  const base = principal * (1 + r) ** periods;
  // Monthly additions compounded at the equivalent monthly rate.
  const monthlyRate = (1 + r) ** (perYear / 12) - 1;
  const months = Math.round(years * 12);
  const additions =
    monthlyAddition > 0
      ? monthlyRate === 0
        ? monthlyAddition * months
        : monthlyAddition * (((1 + monthlyRate) ** months - 1) / monthlyRate)
      : 0;
  const amount = base + additions;
  const invested = principal + monthlyAddition * months;
  return { amount: round2(amount), interest: round2(amount - invested), invested };
}
