import {
  compoundInterest,
  fdPayout,
  fixedDeposit,
  nps,
  ppf,
  recurringDeposit,
  simpleInterest,
} from './engine';

describe('FD', () => {
  it('compounds quarterly', () => {
    const r = fixedDeposit(100_000, 7, 5, 'quarterly');
    expect(r.maturity).toBeCloseTo(141_478.3, 0);
    expect(r.effectiveAnnual).toBeCloseTo(7.1859, 3);
  });
  it('supports simple interest and payouts', () => {
    expect(fixedDeposit(100_000, 6, 0.5, 'simple').maturity).toBe(103_000);
    expect(fdPayout(1_200_000, 7, 'monthly')).toBe(7000);
    expect(() => fixedDeposit(0, 7, 1, 'yearly')).toThrow();
  });
});

describe('RD', () => {
  it('compounds each instalment quarterly', () => {
    const r = recurringDeposit(10_000, 7, 12);
    expect(r.invested).toBe(120_000);
    expect(r.maturity).toBeGreaterThan(124_000);
    expect(r.maturity).toBeLessThan(125_000);
    expect(recurringDeposit(1000, 0, 12).maturity).toBe(12000);
    expect(() => recurringDeposit(1000, 7, 0)).toThrow();
  });
});

describe('PPF', () => {
  it('matches the well-known 15-year maximum deposit maturity', () => {
    const r = ppf(150_000, 7.1, 15);
    expect(Math.round(r.maturity)).toBe(4_068_209);
    expect(r.invested).toBe(2_250_000);
  });
  it('enforces PPF limits', () => {
    expect(() => ppf(200_000, 7.1, 15)).toThrow('capped');
    expect(() => ppf(100, 7.1, 15)).toThrow('minimum');
    expect(() => ppf(1000, 7.1, 16)).toThrow('blocks of 5');
    expect(ppf(1000, 7.1, 20).rows).toHaveLength(20);
  });
});

describe('NPS', () => {
  it('splits corpus into annuity and lump sum', () => {
    const r = nps({
      currentAge: 30,
      monthly: 5000,
      returnPct: 10,
      annuityPct: 40,
      annuityRatePct: 6,
    });
    expect(r.years).toBe(30);
    expect(r.invested).toBe(1_800_000);
    expect(r.annuityCorpus).toBeCloseTo(r.corpus * 0.4, 6);
    expect(r.monthlyPension).toBeCloseTo((r.annuityCorpus * 0.06) / 12, 6);
    expect(() =>
      nps({ currentAge: 30, monthly: 5000, returnPct: 10, annuityPct: 30, annuityRatePct: 6 }),
    ).toThrow();
  });
});

describe('interest', () => {
  it('simple interest', () => {
    expect(simpleInterest(10_000, 8, 3)).toEqual({ interest: 2400, amount: 12400 });
  });
  it('compound interest with additions', () => {
    expect(compoundInterest(10_000, 10, 2, 1).amount).toBe(12_100);
    const r = compoundInterest(0, 0, 1, 12, 1000);
    expect(r.amount).toBe(12_000);
  });
});
