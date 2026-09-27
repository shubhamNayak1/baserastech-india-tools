import { compareRegimes, computeIncomeTax, hraExemption, slabTax } from './engine';
import { getTaxRules, TAX_YEARS } from './rules';

const fy = '2025-26';

describe('income tax – new regime FY 2025-26', () => {
  it('is nil up to ₹12.75 lakh salary thanks to rebate and standard deduction', () => {
    const r = computeIncomeTax({ fy, regime: 'new', salaryIncome: 1_275_000 });
    expect(r.taxableIncome).toBe(1_200_000);
    expect(r.slabTax).toBe(60_000);
    expect(r.rebate).toBe(60_000);
    expect(r.totalTax).toBe(0);
  });
  it('applies marginal relief just above ₹12 lakh', () => {
    const r = computeIncomeTax({ fy, regime: 'new', salaryIncome: 1_285_000 });
    expect(r.taxableIncome).toBe(1_210_000);
    expect(r.slabTax).toBe(61_500);
    expect(r.totalTax).toBe(10_400);
  });
  it('computes tax across all slabs', () => {
    const r = computeIncomeTax({ fy, regime: 'new', salaryIncome: 0, otherIncome: 2_400_000 });
    expect(r.slabTax).toBe(300_000);
    expect(r.totalTax).toBe(312_000);
  });
  it('adds surcharge above ₹50 lakh', () => {
    const r = computeIncomeTax({ fy, regime: 'new', salaryIncome: 0, otherIncome: 6_000_000 });
    expect(r.slabTax).toBe(1_380_000);
    expect(r.surcharge).toBe(138_000);
    expect(r.totalTax).toBe(1_578_720);
  });
  it('applies surcharge marginal relief near the threshold', () => {
    const r = computeIncomeTax({ fy, regime: 'new', salaryIncome: 0, otherIncome: 5_010_000 });
    expect(r.slabTax).toBe(1_083_000);
    expect(r.surcharge).toBeCloseTo(7_000, 6);
    expect(r.totalTax).toBe(1_133_600);
  });
  it('caps new-regime surcharge at 25%', () => {
    const r = computeIncomeTax({ fy, regime: 'new', salaryIncome: 0, otherIncome: 60_000_000 });
    expect(r.surcharge / (r.slabTax - r.rebate)).toBeCloseTo(0.25, 6);
  });
});

describe('income tax – old regime', () => {
  it('computes slab tax with cess', () => {
    const r = computeIncomeTax({ fy, regime: 'old', salaryIncome: 0, otherIncome: 1_000_000 });
    expect(r.slabTax).toBe(112_500);
    expect(r.totalTax).toBe(117_000);
  });
  it('gives full rebate up to ₹5 lakh taxable income', () => {
    expect(computeIncomeTax({ fy, regime: 'old', salaryIncome: 550_000 }).totalTax).toBe(0);
  });
  it('caps deductions at their limits', () => {
    const r = computeIncomeTax({
      fy,
      regime: 'old',
      salaryIncome: 1_500_000,
      deductions: { sec80C: 300_000, sec80CCD1B: 100_000 },
    });
    expect(r.deductions).toBe(200_000);
    expect(r.taxableIncome).toBe(1_250_000);
  });
  it('uses higher exemption for senior and super senior citizens', () => {
    const rules = getTaxRules(fy);
    expect(slabTax(500_000, rules.regimes.old.slabs.senior).tax).toBe(10_000);
    expect(slabTax(500_000, rules.regimes.old.slabs.superSenior).tax).toBe(0);
  });
  it('ignores deductions in the new regime except employer NPS', () => {
    const r = computeIncomeTax({
      fy,
      regime: 'new',
      salaryIncome: 2_000_000,
      deductions: { sec80C: 150_000 },
      employerNps: 100_000,
    });
    expect(r.deductions).toBe(100_000);
  });
});

describe('regime comparison and HRA', () => {
  it('recommends the cheaper regime', () => {
    const c = compareRegimes({ fy, salaryIncome: 1_500_000, deductions: { sec80C: 150_000 } });
    expect(c.better).toBe('new');
    expect(c.saving).toBe(c.old.totalTax - c.new.totalTax);
  });
  it('computes HRA exemption as the least of three limits', () => {
    const h = hraExemption({
      basicDa: 600_000,
      hraReceived: 300_000,
      rentPaid: 240_000,
      metro: true,
      fy,
    });
    expect(h.rentMinus).toBe(180_000);
    expect(h.pctOfSalary).toBe(300_000);
    expect(h.exempt).toBe(180_000);
    expect(h.taxable).toBe(120_000);
  });
  it('has well-formed rules for every financial year', () => {
    for (const y of TAX_YEARS) {
      for (const reg of Object.values(y.regimes)) {
        for (const slabs of Object.values(reg.slabs)) {
          expect(slabs.at(-1)!.upTo).toBeNull();
          for (let i = 1; i < slabs.length - 1; i++)
            expect(slabs[i].upTo!).toBeGreaterThan(slabs[i - 1].upTo!);
        }
      }
    }
  });
});
