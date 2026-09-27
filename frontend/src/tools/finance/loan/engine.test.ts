import {
  amortizationSchedule,
  emiExact,
  loanSummary,
  principalForEmi,
  tenureForEmi,
  totals,
  yearlySummary,
} from './engine';

describe('EMI engine', () => {
  it('matches the reference home loan example', () => {
    const s = loanSummary(5_000_000, 8.5, 240);
    expect(s.emi).toBe(43_391);
    expect(s.totalInterest).toBe(5_413_840);
    expect(s.totalPayment).toBe(10_413_840);
  });
  it('handles 0% interest', () => {
    const s = loanSummary(120_000, 0, 12);
    expect(s.emi).toBe(10_000);
    expect(s.totalInterest).toBe(0);
  });
  it('handles a one month tenure', () => {
    const s = loanSummary(100_000, 12, 1);
    expect(s.emi).toBe(101_000);
    expect(s.totalInterest).toBe(1_000);
  });
  it('handles very large loans and decimal rates', () => {
    const s = loanSummary(1_000_000_000, 7.35, 360);
    expect(Number.isFinite(s.emi)).toBe(true);
    expect(s.emi).toBe(6_889_721);
    expect(emiExact(1_000_000, 10.75, 60)).toBeCloseTo(21617.95, 2);
  });
  it('rejects invalid values', () => {
    expect(() => loanSummary(0, 8, 12)).toThrow('greater than zero');
    expect(() => loanSummary(1000, -1, 12)).toThrow('cannot be negative');
    expect(() => loanSummary(1000, 8, 0)).toThrow('at least 1 month');
    expect(() => loanSummary(1000, 8, 1.5)).toThrow();
  });
});

describe('amortization', () => {
  it('fully repays the loan and reconciles interest', () => {
    const rows = amortizationSchedule(1_000_000, 9, 120);
    expect(rows).toHaveLength(120);
    expect(rows.at(-1)!.closing).toBe(0);
    const t = totals(rows);
    const exact = emiExact(1_000_000, 9, 120) * 120 - 1_000_000;
    expect(Math.abs(t.interest - exact)).toBeLessThan(5);
    expect(yearlySummary(rows)).toHaveLength(10);
  });
  it('shortens tenure with prepayment', () => {
    const base = totals(amortizationSchedule(5_000_000, 8.5, 240));
    const rows = amortizationSchedule(5_000_000, 8.5, 240, {
      amount: 500_000,
      startMonth: 12,
      frequency: 'once',
      strategy: 'reduce-tenure',
    });
    expect(rows.length).toBeLessThan(240);
    expect(totals(rows).interest).toBeLessThan(base.interest);
  });
  it('reduces EMI with prepayment when requested', () => {
    const rows = amortizationSchedule(1_000_000, 10, 60, {
      amount: 200_000,
      startMonth: 6,
      frequency: 'once',
      strategy: 'reduce-emi',
    });
    expect(rows).toHaveLength(60);
    expect(rows[10].payment).toBeLessThan(rows[2].payment);
    expect(rows.at(-1)!.closing).toBe(0);
  });
});

describe('tenure and eligibility', () => {
  it('finds tenure from EMI', () => {
    expect(tenureForEmi(5_000_000, 8.5, 43_391.17)).toBe(240);
    expect(tenureForEmi(120_000, 0, 10_000)).toBe(12);
    expect(() => tenureForEmi(1_000_000, 12, 10_000)).toThrow('never gets repaid');
  });
  it('inverts EMI to principal', () => {
    expect(principalForEmi(emiExact(2_500_000, 9, 180), 9, 180)).toBeCloseTo(2_500_000, 4);
    expect(principalForEmi(1000, 0, 12)).toBe(12000);
  });
});
