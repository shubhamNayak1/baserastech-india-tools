import { parseISODate } from '@/utils/date';
import {
  ctcToInHand,
  epfCorpus,
  esiContribution,
  fromAnnual,
  gratuity,
  mergedDays,
  pfContribution,
  toAnnual,
} from './engine';

describe('PF contribution', () => {
  it('splits employer share into EPF and EPS at the wage ceiling', () => {
    const c = pfContribution(50_000, 'capped');
    expect(c.employee).toBe(1800);
    expect(c.eps).toBe(1250);
    expect(c.employerEpf).toBe(550);
    expect(c.edli).toBe(75);
  });
  it('contributes on full basic when not capped', () => {
    const c = pfContribution(50_000, 'full', 5);
    expect(c.employee).toBe(6000);
    expect(c.vpf).toBe(2500);
    expect(c.eps).toBe(1250);
    expect(c.employerEpf).toBe(4750);
  });
  it('handles basic below the ceiling and opt-out', () => {
    expect(pfContribution(10_000).eps).toBe(833);
    expect(pfContribution(10_000, 'none').employee).toBe(0);
  });
});

describe('ESI', () => {
  it('applies only up to ₹21,000 gross', () => {
    expect(esiContribution(20_000)).toEqual({ applicable: true, employee: 150, employer: 650 });
    expect(esiContribution(25_000).applicable).toBe(false);
  });
});

describe('gratuity', () => {
  it('uses 15/26 and rounds 6+ months up for covered employees', () => {
    const g = gratuity(60_000, 10, 7, true);
    expect(g.countedYears).toBe(11);
    expect(g.amount).toBe(380_769);
    expect(g.eligible).toBe(true);
  });
  it('uses 15/30 and completed years when not covered', () => {
    expect(gratuity(60_000, 10, 7, false).amount).toBe(300_000);
  });
  it('caps exemption at ₹20 lakh and flags ineligibility', () => {
    const g = gratuity(500_000, 20, 0, true);
    expect(g.exempt).toBe(2_000_000);
    expect(g.taxable).toBe(g.amount - 2_000_000);
    expect(gratuity(50_000, 3, 0, true).eligible).toBe(false);
  });
});

describe('EPF corpus', () => {
  it('grows with contributions and interest', () => {
    const r = epfCorpus({
      basicDa: 30_000,
      age: 30,
      retireAge: 31,
      growthPct: 0,
      ratePct: 8.25,
      balance: 0,
      vpfPct: 0,
      mode: 'capped',
    });
    // employee 1800 + employer EPF 550 = 2350 per month
    expect(r.rows[0].contribution).toBe(28_200);
    expect(r.corpus).toBeGreaterThan(28_200);
    expect(r.corpus).toBeLessThan(29_600);
  });
});

describe('CTC to in-hand', () => {
  it('reconciles components back to CTC', () => {
    const b = ctcToInHand({
      ctc: 1_200_000,
      basicPct: 50,
      hraPctOfBasic: 40,
      pfMode: 'capped',
      includeGratuity: true,
      variablePay: 0,
      professionalTax: 2500,
      regime: 'new',
      fy: '2025-26',
    });
    expect(b.basic + b.hra + b.special + b.employerPf + b.gratuity).toBeCloseTo(1_200_000, 6);
    expect(b.employerPf).toBe(21_600);
    expect(b.incomeTax).toBe(0);
    expect(b.monthlyInHand).toBeCloseTo((b.grossSalary - 21_600 - 2500) / 12, 6);
  });
  it('computes tax for higher CTC', () => {
    const b = ctcToInHand({
      ctc: 2_500_000,
      basicPct: 40,
      hraPctOfBasic: 50,
      pfMode: 'capped',
      includeGratuity: false,
      variablePay: 200_000,
      professionalTax: 2500,
      regime: 'new',
      fy: '2025-26',
    });
    expect(b.incomeTax).toBeGreaterThan(0);
    expect(b.monthlyFixedInHand).toBeLessThan(b.monthlyInHand);
  });
  it('rejects impossible structures', () => {
    expect(() =>
      ctcToInHand({
        ctc: 100_000,
        basicPct: 90,
        hraPctOfBasic: 50,
        pfMode: 'full',
        includeGratuity: true,
        variablePay: 0,
        professionalTax: 0,
        regime: 'new',
      }),
    ).toThrow();
  });
});

describe('pay conversions and experience', () => {
  it('converts between periods', () => {
    expect(toAnnual(50_000, 'month')).toBe(600_000);
    expect(toAnnual(500, 'hour', 40)).toBe(1_040_000);
    expect(fromAnnual(1_040_000, 40).hour).toBe(500);
  });
  it('merges overlapping intervals', () => {
    const d = (s: string) => parseISODate(s);
    expect(
      mergedDays([
        { start: d('2020-01-01'), end: d('2020-12-31') },
        { start: d('2020-06-01'), end: d('2021-01-31') },
      ]),
    ).toBe(397);
    expect(
      mergedDays([
        { start: d('2020-01-01'), end: d('2020-01-10') },
        { start: d('2020-02-01'), end: d('2020-02-10') },
      ]),
    ).toBe(20);
  });
});
