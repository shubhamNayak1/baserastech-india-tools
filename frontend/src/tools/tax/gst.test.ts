import { addGst, fromGstAmount, impliedRate, removeGst, splitGst } from './gst';
import { capitalGains, financialYearOf, monthsHeld } from './capitalGains';
import { getTaxRules } from './rules';
import { parseISODate } from '@/utils/date';

describe('GST', () => {
  it('adds GST exclusive of tax', () => {
    expect(addGst(1000, 18)).toEqual({
      base: 1000,
      gst: 180,
      total: 1180,
      cgst: 90,
      sgst: 90,
      igst: 0,
    });
    expect(addGst(1000, 18, true).igst).toBe(180);
  });
  it('removes GST from inclusive prices', () => {
    const r = removeGst(1180, 18);
    expect(r.base).toBe(1000);
    expect(r.gst).toBe(180);
    const odd = removeGst(999, 5);
    expect(odd.base + odd.gst).toBeCloseTo(999, 10);
    expect(odd.base).toBe(951.43);
  });
  it('splits odd paise without losing money', () => {
    const s = splitGst(0.05, false);
    expect(s.cgst + s.sgst).toBeCloseTo(0.05, 10);
  });
  it('reverses from a GST amount and implies a rate', () => {
    expect(fromGstAmount(180, 18)).toEqual({ base: 1000, total: 1180 });
    expect(impliedRate(1000, 1050)).toBeCloseTo(5, 10);
    expect(() => fromGstAmount(10, 0)).toThrow();
    expect(() => addGst(-1, 18)).toThrow();
  });
});

describe('capital gains', () => {
  const rules = getTaxRules('2025-26');
  const d = parseISODate;
  it('derives financial year and months held', () => {
    expect(financialYearOf(d('2024-03-31'))).toBe('2023-24');
    expect(financialYearOf(d('2024-04-01'))).toBe('2024-25');
    expect(monthsHeld(d('2023-05-10'), d('2024-05-09'))).toBe(11);
    expect(monthsHeld(d('2023-05-10'), d('2024-05-10'))).toBe(12);
  });
  it('taxes long-term equity gains above ₹1.25 lakh at 12.5%', () => {
    const r = capitalGains(
      {
        assetId: 'listed-equity',
        buyDate: d('2022-01-01'),
        sellDate: d('2025-06-01'),
        buyPrice: 500_000,
        sellPrice: 900_000,
        expenses: 0,
        slabRatePct: 30,
      },
      rules,
    );
    expect(r.term).toBe('long');
    expect(r.taxableGain).toBe(275_000);
    expect(r.tax).toBe(34_375);
  });
  it('treats a sale exactly on the anniversary as short-term', () => {
    const r = capitalGains(
      {
        assetId: 'listed-equity',
        buyDate: d('2024-08-01'),
        sellDate: d('2025-08-01'),
        buyPrice: 100,
        sellPrice: 200,
        expenses: 0,
        slabRatePct: 0,
      },
      rules,
    );
    expect(r.term).toBe('short');
    expect(
      capitalGains(
        {
          assetId: 'listed-equity',
          buyDate: d('2024-08-01'),
          sellDate: d('2025-08-02'),
          buyPrice: 100,
          sellPrice: 200,
          expenses: 0,
          slabRatePct: 0,
        },
        rules,
      ).term,
    ).toBe('long');
  });
  it('taxes short-term equity at 20%', () => {
    const r = capitalGains(
      {
        assetId: 'listed-equity',
        buyDate: d('2025-01-01'),
        sellDate: d('2025-06-01'),
        buyPrice: 100_000,
        sellPrice: 150_000,
        expenses: 0,
        slabRatePct: 30,
      },
      rules,
    );
    expect(r.term).toBe('short');
    expect(r.tax).toBe(10_000);
  });
  it('picks the lower of indexed and non-indexed tax for older property', () => {
    const r = capitalGains(
      {
        assetId: 'property',
        buyDate: d('2010-06-01'),
        sellDate: d('2025-06-01'),
        buyPrice: 3_000_000,
        sellPrice: 9_000_000,
        expenses: 0,
        slabRatePct: 30,
      },
      rules,
    );
    expect(r.term).toBe('long');
    expect(r.indexed!.indexedCost).toBeCloseTo((3_000_000 * 376) / 167, 4);
    expect(r.tax).toBe(Math.min(750_000, r.indexed!.tax));
  });
  it('taxes debt funds at slab rate regardless of holding', () => {
    const r = capitalGains(
      {
        assetId: 'debt-mf',
        buyDate: d('2023-06-01'),
        sellDate: d('2026-06-01'),
        buyPrice: 100_000,
        sellPrice: 120_000,
        expenses: 0,
        slabRatePct: 20,
      },
      rules,
    );
    expect(r.term).toBe('short');
    expect(r.tax).toBe(4000);
  });
});
