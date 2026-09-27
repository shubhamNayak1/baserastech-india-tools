import { parseISODate, toISODate } from '@/utils/date';
import {
  bmi,
  bmiCategoryAsianIndian,
  bmiCategoryWHO,
  bmr,
  bodyFatCategory,
  deficitPlan,
  dueDate,
  gestationalAge,
  idealWeights,
  macros,
  navyBodyFat,
  waterIntake,
  weightForBmi,
} from './engine';

describe('BMI', () => {
  it('computes and classifies', () => {
    expect(bmi(70, 175)).toBeCloseTo(22.857, 3);
    expect(bmiCategoryWHO(22.9).label).toBe('Normal weight');
    expect(bmiCategoryAsianIndian(23.5).label).toBe('Overweight');
    expect(bmiCategoryAsianIndian(26).label).toBe('Obese');
    expect(weightForBmi(25, 180)).toBeCloseTo(81, 6);
    expect(() => bmi(0, 170)).toThrow();
  });
});

describe('BMR', () => {
  it('Mifflin-St Jeor', () => {
    expect(bmr({ sex: 'male', weightKg: 70, heightCm: 175, age: 30 })).toBeCloseTo(1648.75, 2);
    expect(bmr({ sex: 'female', weightKg: 60, heightCm: 160, age: 30 })).toBeCloseTo(1289, 2);
  });
  it('Harris-Benedict and Katch-McArdle', () => {
    expect(
      bmr({ sex: 'male', weightKg: 70, heightCm: 175, age: 30, formula: 'harris' }),
    ).toBeCloseTo(1695.667, 2);
    expect(
      bmr({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, formula: 'katch', bodyFatPct: 20 }),
    ).toBeCloseTo(1752.4, 2);
    expect(() =>
      bmr({ sex: 'male', weightKg: 80, heightCm: 180, age: 30, formula: 'katch' }),
    ).toThrow();
  });
});

describe('body composition', () => {
  it('ideal weight formulas', () => {
    const w = idealWeights('male', 182.88);
    expect(w.devine).toBeCloseTo(77.6, 1);
    expect(w.robinson).toBeCloseTo(74.8, 1);
  });
  it('US Navy body fat', () => {
    const m = navyBodyFat({ sex: 'male', heightCm: 178, neckCm: 38, waistCm: 86 });
    expect(m).toBeGreaterThan(14);
    expect(m).toBeLessThan(19);
    const f = navyBodyFat({ sex: 'female', heightCm: 165, neckCm: 33, waistCm: 75, hipCm: 97 });
    expect(f).toBeGreaterThan(25);
    expect(f).toBeLessThan(32);
    expect(bodyFatCategory('male', 16)).toBe('Fitness');
    expect(() => navyBodyFat({ sex: 'female', heightCm: 165, neckCm: 33, waistCm: 75 })).toThrow();
  });
});

describe('nutrition', () => {
  it('water, macros and deficits', () => {
    expect(waterIntake(70, 30, false).ml).toBe(2800);
    const m = macros(2000, 30, 40, 30);
    expect(m.protein).toBe(150);
    expect(m.carbs).toBe(200);
    expect(m.fat).toBeCloseTo(66.667, 3);
    expect(() => macros(2000, 30, 30, 30)).toThrow();
    const d = deficitPlan(80, 75, 2400, 500);
    expect(d.days).toBe(77);
    expect(d.dailyIntake).toBe(1900);
  });
});

describe('pregnancy', () => {
  it("applies Naegele's rule with cycle adjustment", () => {
    expect(toISODate(dueDate('lmp', parseISODate('2026-01-01')))).toBe('2026-10-08');
    expect(toISODate(dueDate('lmp', parseISODate('2026-01-01'), 32))).toBe('2026-10-12');
    expect(toISODate(dueDate('conception', parseISODate('2026-01-15')))).toBe('2026-10-08');
    expect(toISODate(dueDate('ivf5', parseISODate('2026-01-20')))).toBe('2026-10-08');
    const g = gestationalAge(parseISODate('2026-10-08'), parseISODate('2026-04-01'));
    expect(g.weeks).toBe(12);
    expect(g.trimester).toBe(1);
  });
});
