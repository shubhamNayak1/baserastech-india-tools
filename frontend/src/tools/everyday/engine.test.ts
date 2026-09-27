import {
  bedtimesFor,
  convertCooking,
  electricityCost,
  fuelCost,
  mileage,
  pickRandom,
  splitProportional,
  tipSplit,
  wakeTimesFor,
} from './engine';

describe('everyday engines', () => {
  it('tips and splits', () => {
    expect(tipSplit(2400, 10, 4, false)).toEqual({ tip: 240, total: 2640, perPerson: 660 });
    const r = tipSplit(1000, 10, 3, true);
    expect(r.perPerson).toBe(367);
    expect(r.total).toBe(1101);
    expect(() => tipSplit(0, 10, 2, false)).toThrow();
  });
  it('fuel and mileage', () => {
    const f = fuelCost(300, 15, 105, true, 3);
    expect(f.distance).toBe(600);
    expect(f.litres).toBe(40);
    expect(f.cost).toBe(4200);
    expect(f.perPerson).toBe(1400);
    const m = mileage(450, 30, 100);
    expect(m.kmpl).toBe(15);
    expect(m.l100).toBeCloseTo(6.667, 3);
    expect(m.costPerKm).toBeCloseTo(6.667, 3);
  });
  it('electricity', () => {
    const e = electricityCost(1500, 8, 30, 7);
    expect(e.units).toBe(360);
    expect(e.cost).toBe(2520);
  });
  it('sleep cycles', () => {
    const b = bedtimesFor(7 * 3600, 15);
    // Wake 07:00, 6 cycles (9 h) + 15 min to fall asleep → bed at 21:45.
    expect(b[0]).toEqual({ cycles: 6, hours: 9, time: (21 * 60 + 45) * 60 });
    expect(b[3].time).toBe((2 * 60 + 15) * 60);
    const w = wakeTimesFor(23 * 3600, 15);
    expect(w[3].time).toBe(((23 * 60 + 15 + 540) % 1440) * 60);
  });
  it('cooking conversions', () => {
    expect(convertCooking(1, 'cup', 'ml', 'water')).toBe(250);
    expect(convertCooking(1, 'uscup', 'g', 'sugar')).toBeCloseTo(199.9, 1);
    expect(convertCooking(100, 'g', 'tbsp', 'ghee')).toBeCloseTo(7.326, 3);
  });
  it('random picks and proportional split', () => {
    let i = 0;
    const seq = [0.1, 0.9, 0.5, 0.3];
    const picks = pickRandom(['a', 'b', 'c', 'd'], 2, () => seq[i++ % seq.length]);
    expect(picks).toHaveLength(2);
    expect(new Set(picks).size).toBe(2);
    expect(() => pickRandom(['a'], 2, Math.random)).toThrow();
    const s = splitProportional(
      [
        { name: 'A', amount: 600 },
        { name: 'B', amount: 400 },
      ],
      10,
      100,
    );
    expect(s.grand).toBe(1200);
    expect(s.shares).toEqual([
      { name: 'A', amount: 720 },
      { name: 'B', amount: 480 },
    ]);
  });
});
