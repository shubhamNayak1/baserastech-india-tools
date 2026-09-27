import {
  cagr,
  corpusNeeded,
  futureValue,
  inflationAdjusted,
  lumpsum,
  presentValue,
  presentValueOfAnnuity,
  retirementPlan,
  ruleOf72,
  sip,
  sipClosedForm,
  stp,
  swp,
} from './engine';

describe('SIP', () => {
  it('matches the closed-form annuity-due formula', () => {
    const r = sip(5000, 12, 10);
    expect(r.invested).toBe(600_000);
    expect(r.value).toBeCloseTo(sipClosedForm(5000, 12, 120), 1);
    expect(Math.round(r.value)).toBe(1_161_695);
    expect(r.points).toHaveLength(10);
  });
  it('supports annual step-up', () => {
    const flat = sip(10_000, 12, 5);
    const up = sip(10_000, 12, 5, 10);
    expect(up.invested).toBeCloseTo(10_000 * 12 * (1 + 1.1 + 1.21 + 1.331 + 1.4641), 2);
    expect(up.value).toBeGreaterThan(flat.value);
  });
  it('handles 0% return and rejects bad input', () => {
    expect(sip(1000, 0, 1).value).toBe(12_000);
    expect(() => sip(0, 12, 10)).toThrow();
  });
});

describe('lump sum & CAGR', () => {
  it('compounds annually', () => {
    expect(Math.round(lumpsum(100_000, 12, 10).value)).toBe(310_585);
  });
  it('computes CAGR', () => {
    expect(cagr(100_000, 200_000, 5)).toBeCloseTo(14.8698, 3);
    expect(cagr(100, 100, 3)).toBe(0);
    expect(() => cagr(0, 100, 1)).toThrow();
  });
});

describe('SWP & STP', () => {
  it('depletes when withdrawals are too high', () => {
    const r = swp(1_000_000, 50_000, 8, 10);
    expect(r.depletedAt).not.toBeNull();
    expect(r.finalBalance).toBe(0);
  });
  it('preserves corpus when withdrawals are below returns', () => {
    const r = swp(1_000_000, 5_000, 8, 10);
    expect(r.depletedAt).toBeNull();
    expect(r.totalWithdrawn).toBe(600_000);
    expect(r.finalBalance).toBeGreaterThan(1_000_000);
  });
  it('transfers from source to target', () => {
    const r = stp(1_200_000, 100_000, 0, 0, 12);
    expect(r.transferred).toBe(1_200_000);
    expect(r.sourceBalance).toBe(0);
    expect(r.totalValue).toBe(1_200_000);
    expect(() => stp(1000, 2000, 6, 12, 12)).toThrow();
  });
});

describe('time value of money', () => {
  it('computes FV and PV', () => {
    expect(futureValue(1000, 10, 2)).toBeCloseTo(1210, 6);
    expect(futureValue(0, 10, 2, 100)).toBeCloseTo(210, 6);
    expect(futureValue(0, 10, 2, 100, true)).toBeCloseTo(231, 6);
    expect(presentValue(1210, 10, 2)).toBeCloseTo(1000, 6);
    expect(presentValueOfAnnuity(100, 0, 5)).toBe(500);
  });
  it('rule of 72', () => {
    const r = ruleOf72(8);
    expect(r.rule72).toBe(9);
    expect(r.exact).toBeCloseTo(9.006, 3);
    expect(() => ruleOf72(0)).toThrow();
  });
  it('inflation', () => {
    const r = inflationAdjusted(100_000, 6, 10);
    expect(Math.round(r.futureCost)).toBe(179_085);
    expect(Math.round(r.purchasingPower)).toBe(55_839);
  });
});

describe('retirement', () => {
  it('computes a growing-annuity corpus', () => {
    expect(corpusNeeded(120_000, 6, 6, 25)).toBe(3_000_000);
    const p = retirementPlan({
      currentAge: 30,
      retireAge: 60,
      lifeExpectancy: 85,
      monthlyExpense: 50_000,
      inflationPct: 6,
      preReturnPct: 12,
      postReturnPct: 7,
      currentSavings: 500_000,
    });
    expect(p.yearsToRetire).toBe(30);
    expect(Math.round(p.expenseAtRetirement)).toBe(287_175);
    expect(p.corpus).toBeGreaterThan(70_000_000);
    expect(p.monthlySip).toBeGreaterThan(0);
  });
  it('validates ages', () => {
    expect(() =>
      retirementPlan({
        currentAge: 60,
        retireAge: 60,
        lifeExpectancy: 85,
        monthlyExpense: 1,
        inflationPct: 6,
        preReturnPct: 12,
        postReturnPct: 7,
        currentSavings: 0,
      }),
    ).toThrow();
  });
});
