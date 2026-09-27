import { InputError } from '@/utils/number';
import { addDays, daysBetween } from '@/utils/date';

export type Sex = 'male' | 'female';

export function validateBody(weightKg: number, heightCm: number) {
  if (!(weightKg >= 2 && weightKg <= 500))
    throw new InputError('Weight must be between 2 and 500 kg.', 'weight');
  if (!(heightCm >= 40 && heightCm <= 272))
    throw new InputError('Height must be between 40 and 272 cm.', 'height');
}

export function bmi(weightKg: number, heightCm: number) {
  validateBody(weightKg, heightCm);
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export interface BmiCategory {
  label: string;
  tone: 'blue' | 'green' | 'amber' | 'red';
}

/** WHO international classification. */
export function bmiCategoryWHO(b: number): BmiCategory {
  if (b < 18.5) return { label: 'Underweight', tone: 'blue' };
  if (b < 25) return { label: 'Normal weight', tone: 'green' };
  if (b < 30) return { label: 'Overweight', tone: 'amber' };
  return { label: 'Obese', tone: 'red' };
}

/** Consensus guidelines for Asian Indians (lower thresholds reflect higher metabolic risk). */
export function bmiCategoryAsianIndian(b: number): BmiCategory {
  if (b < 18.5) return { label: 'Underweight', tone: 'blue' };
  if (b < 23) return { label: 'Normal weight', tone: 'green' };
  if (b < 25) return { label: 'Overweight', tone: 'amber' };
  return { label: 'Obese', tone: 'red' };
}

export function weightForBmi(targetBmi: number, heightCm: number) {
  const m = heightCm / 100;
  return targetBmi * m * m;
}

export type BmrFormula = 'mifflin' | 'harris' | 'katch';

export function bmr(i: {
  sex: Sex;
  weightKg: number;
  heightCm: number;
  age: number;
  formula?: BmrFormula;
  bodyFatPct?: number;
}): number {
  validateBody(i.weightKg, i.heightCm);
  if (!(i.age >= 15 && i.age <= 100))
    throw new InputError('Age must be between 15 and 100 for these formulas.', 'age');
  const { weightKg: w, heightCm: h, age: a } = i;
  switch (i.formula ?? 'mifflin') {
    case 'harris':
      return i.sex === 'male'
        ? 88.362 + 13.397 * w + 4.799 * h - 5.677 * a
        : 447.593 + 9.247 * w + 3.098 * h - 4.33 * a;
    case 'katch': {
      if (i.bodyFatPct === undefined || !(i.bodyFatPct > 2 && i.bodyFatPct < 70))
        throw new InputError(
          'Katch-McArdle needs a body fat percentage between 2% and 70%.',
          'bodyFat',
        );
      const lbm = w * (1 - i.bodyFatPct / 100);
      return 370 + 21.6 * lbm;
    }
    default:
      return 10 * w + 6.25 * h - 5 * a + (i.sex === 'male' ? 5 : -161);
  }
}

export const ACTIVITY_LEVELS = [
  { value: '1.2', label: 'Sedentary (little or no exercise)' },
  { value: '1.375', label: 'Lightly active (1–3 days/week)' },
  { value: '1.55', label: 'Moderately active (3–5 days/week)' },
  { value: '1.725', label: 'Very active (6–7 days/week)' },
  { value: '1.9', label: 'Extra active (physical job or twice a day)' },
];

export function idealWeights(sex: Sex, heightCm: number) {
  if (!(heightCm >= 120 && heightCm <= 250))
    throw new InputError(
      'Height must be between 120 and 250 cm for ideal weight formulas.',
      'height',
    );
  const inchesOver5ft = Math.max(0, heightCm / 2.54 - 60);
  const m = sex === 'male';
  return {
    devine: (m ? 50 : 45.5) + 2.3 * inchesOver5ft,
    robinson: (m ? 52 : 49) + (m ? 1.9 : 1.7) * inchesOver5ft,
    miller: (m ? 56.2 : 53.1) + (m ? 1.41 : 1.36) * inchesOver5ft,
    hamwi: (m ? 48 : 45.5) + (m ? 2.7 : 2.2) * inchesOver5ft,
  };
}

/** U.S. Navy circumference method (all measurements in cm). */
export function navyBodyFat(i: {
  sex: Sex;
  heightCm: number;
  neckCm: number;
  waistCm: number;
  hipCm?: number;
}): number {
  const { sex, heightCm: h, neckCm: n, waistCm: w } = i;
  if (sex === 'male') {
    if (w <= n) throw new InputError('Waist must be larger than neck circumference.', 'waist');
    return 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
  }
  const hip = i.hipCm ?? 0;
  if (!(hip > 0)) throw new InputError('Hip measurement is required for women.', 'hip');
  if (w + hip <= n)
    throw new InputError('Check your measurements: waist + hip must exceed neck.', 'waist');
  return 495 / (1.29579 - 0.35004 * Math.log10(w + hip - n) + 0.221 * Math.log10(h)) - 450;
}

export function bodyFatCategory(sex: Sex, pct: number): string {
  const t = sex === 'male' ? [6, 14, 18, 25] : [14, 21, 25, 32];
  if (pct < t[0]) return 'Essential fat';
  if (pct < t[1]) return 'Athletes';
  if (pct < t[2]) return 'Fitness';
  if (pct < t[3]) return 'Average';
  return 'Obese';
}

export function waterIntake(weightKg: number, exerciseMin: number, hotClimate: boolean) {
  if (!(weightKg >= 10 && weightKg <= 300))
    throw new InputError('Weight must be between 10 and 300 kg.', 'weight');
  const base = weightKg * 35;
  const exercise = (exerciseMin / 30) * 350;
  const climate = hotClimate ? 500 : 0;
  return { ml: base + exercise + climate, base, exercise, climate };
}

export const MACRO_PRESETS: Record<
  string,
  { label: string; protein: number; carbs: number; fat: number }
> = {
  balanced: { label: 'Balanced (30 / 40 / 30)', protein: 30, carbs: 40, fat: 30 },
  indian: { label: 'Typical Indian diet (15 / 60 / 25)', protein: 15, carbs: 60, fat: 25 },
  highProtein: { label: 'High protein (35 / 40 / 25)', protein: 35, carbs: 40, fat: 25 },
  lowCarb: { label: 'Low carb (40 / 20 / 40)', protein: 40, carbs: 20, fat: 40 },
  keto: { label: 'Keto (25 / 5 / 70)', protein: 25, carbs: 5, fat: 70 },
};

export function macros(calories: number, proteinPct: number, carbsPct: number, fatPct: number) {
  if (Math.abs(proteinPct + carbsPct + fatPct - 100) > 0.01)
    throw new InputError('Protein, carbs and fat percentages must add up to 100%.', 'protein');
  return {
    protein: (calories * proteinPct) / 100 / 4,
    carbs: (calories * carbsPct) / 100 / 4,
    fat: (calories * fatPct) / 100 / 9,
  };
}

export const KCAL_PER_KG_FAT = 7700;

export function deficitPlan(
  currentKg: number,
  targetKg: number,
  tdee: number,
  dailyDeficit: number,
) {
  if (targetKg >= currentKg)
    throw new InputError(
      'Target weight must be lower than current weight for a deficit.',
      'target',
    );
  if (!(dailyDeficit > 0))
    throw new InputError('Daily deficit must be greater than zero.', 'deficit');
  const totalKcal = (currentKg - targetKg) * KCAL_PER_KG_FAT;
  const days = Math.ceil(totalKcal / dailyDeficit);
  return {
    totalKcal,
    days,
    dailyIntake: tdee - dailyDeficit,
    weeklyLossKg: (dailyDeficit * 7) / KCAL_PER_KG_FAT,
  };
}

export type DueMethod = 'lmp' | 'conception' | 'ivf3' | 'ivf5';

/** Naegele's rule with cycle-length adjustment; conception and IVF transfer alternatives. */
export function dueDate(method: DueMethod, date: Date, cycleLength = 28): Date {
  switch (method) {
    case 'lmp':
      if (cycleLength < 20 || cycleLength > 45)
        throw new InputError('Cycle length must be between 20 and 45 days.', 'cycle');
      return addDays(date, 280 + (cycleLength - 28));
    case 'conception':
      return addDays(date, 266);
    case 'ivf3':
      return addDays(date, 263);
    case 'ivf5':
      return addDays(date, 261);
  }
}

export function gestationalAge(due: Date, today: Date) {
  const lmpEquivalent = addDays(due, -280);
  const days = daysBetween(lmpEquivalent, today);
  return {
    weeks: Math.floor(days / 7),
    days: days % 7,
    totalDays: days,
    trimester: days < 0 ? 0 : days < 14 * 7 ? 1 : days < 28 * 7 ? 2 : 3,
  };
}
