import {
  applyDiscounts,
  breakEven,
  invoiceTotals,
  loanApr,
  margin,
  marginToMarkup,
  markupToMargin,
  percentChange,
  priceFromMargin,
  roas,
  roi,
  tieredCommission,
} from './engine';

describe('margins and markup', () => {
  it('computes margin and markup', () => {
    const m = margin(60, 100);
    expect(m.profit).toBe(40);
    expect(m.marginPct).toBe(40);
    expect(m.markupPct).toBeCloseTo(66.6667, 3);
    expect(() => margin(10, 0)).toThrow();
  });
  it('converts between margin and markup', () => {
    expect(markupToMargin(25)).toBe(20);
    expect(marginToMarkup(20)).toBe(25);
    expect(priceFromMargin(80, 20)).toBe(100);
    expect(() => priceFromMargin(80, 100)).toThrow();
  });
});

describe('discounts', () => {
  it('stacks successive discounts', () => {
    const d = applyDiscounts(1000, [20, 10]);
    expect(d.final).toBe(720);
    expect(d.effectivePct).toBe(28);
    expect(() => applyDiscounts(100, [120])).toThrow();
  });
});

describe('break-even, ROI and ROAS', () => {
  it('finds break-even units', () => {
    const b = breakEven(100_000, 500, 300);
    expect(b.units).toBe(500);
    expect(b.unitsRounded).toBe(500);
    expect(breakEven(100_000, 500, 300, 20_000).unitsRounded).toBe(600);
    expect(() => breakEven(1, 10, 10)).toThrow();
  });
  it('computes ROI', () => {
    const r = roi(100_000, 150_000, 2);
    expect(r.roiPct).toBe(50);
    expect(r.annualised).toBeCloseTo(22.4745, 3);
  });
  it('computes ROAS', () => {
    const r = roas(10_000, 40_000, 30);
    expect(r.roas).toBe(4);
    expect(r.breakEvenRoas).toBeCloseTo(3.3333, 3);
    expect(r.profit).toBe(2000);
  });
});

describe('loan APR and commission', () => {
  it('APR exceeds nominal rate when there is a fee', () => {
    const a = loanApr(1_000_000, 12, 36, 2);
    expect(a.aprPct).toBeGreaterThan(12);
    expect(loanApr(1_000_000, 12, 36, 0).aprPct).toBeCloseTo(12, 4);
  });
  it('computes tiered commission', () => {
    expect(
      tieredCommission(150_000, [
        { upTo: 100_000, ratePct: 5 },
        { upTo: null, ratePct: 10 },
      ]),
    ).toBe(10_000);
  });
  it('percentage change', () => {
    expect(percentChange(80, 100)).toBe(25);
    expect(percentChange(100, 80)).toBe(-20);
    expect(percentChange(-50, -25)).toBe(50);
    expect(() => percentChange(0, 5)).toThrow();
  });
});

describe('invoice', () => {
  it('totals lines with multiple GST rates', () => {
    const r = invoiceTotals(
      [
        { description: 'A', qty: 2, rate: 499.5, gstPct: 18 },
        { description: 'B', qty: 1, rate: 1000, gstPct: 5, discountPct: 10 },
      ],
      false,
    );
    expect(r.taxable).toBe(1899);
    expect(r.tax).toBe(224.82);
    expect(r.total).toBe(2123.82);
    expect(r.grandTotal).toBe(2124);
    expect(r.roundOff).toBe(0.18);
    expect(r.summary.map((s) => s.rate)).toEqual([5, 18]);
    expect(r.summary[1].cgst + r.summary[1].sgst).toBeCloseTo(179.82, 10);
  });
});
