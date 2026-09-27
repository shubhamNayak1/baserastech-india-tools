import { createFormTool } from '@/components/form-tool/FormTool';
import type { Field, FormValues, ResultItem } from '@/components/form-tool/types';
import { formatNumber } from '@/utils/format';
import { InputError } from '@/utils/number';
import { addDays, formatLongDate, parseISODate, todayISO, toISODate } from '@/utils/date';
import {
  ACTIVITY_LEVELS,
  bmi,
  bmiCategoryAsianIndian,
  bmiCategoryWHO,
  bmr,
  bodyFatCategory,
  deficitPlan,
  dueDate,
  gestationalAge,
  idealWeights,
  KCAL_PER_KG_FAT,
  MACRO_PRESETS,
  macros,
  navyBodyFat,
  waterIntake,
  weightForBmi,
  type BmrFormula,
  type DueMethod,
  type Sex,
} from './engine';

type BodyValues = { units: string; weight: number; height: number; feet: number; inches: number };

function bodyFields<V extends BodyValues & FormValues>(
  opts: { weight?: boolean } = {},
): Field<V>[] {
  const f: Field<V>[] = [
    {
      name: 'units',
      label: 'Units',
      type: 'segmented',
      default: 'metric',
      full: true,
      options: [
        { value: 'metric', label: 'kg · cm' },
        { value: 'imperial', label: 'lb · ft/in' },
      ],
    },
  ];
  if (opts.weight !== false)
    f.push({
      name: 'weight',
      label: 'Weight',
      type: 'number',
      default: 70,
      min: 2,
      max: 1100,
      unit: (v) => (v.units === 'metric' ? 'kg' : 'lb'),
    });
  f.push(
    {
      name: 'height',
      label: 'Height',
      type: 'number',
      default: 170,
      min: 40,
      max: 272,
      unit: 'cm',
      showIf: (v) => v.units === 'metric',
    },
    {
      name: 'feet',
      label: 'Height – feet',
      type: 'number',
      default: 5,
      min: 1,
      max: 8,
      integer: true,
      unit: 'ft',
      showIf: (v) => v.units === 'imperial',
    },
    {
      name: 'inches',
      label: 'Height – inches',
      type: 'number',
      default: 7,
      min: 0,
      max: 11.9,
      unit: 'in',
      showIf: (v) => v.units === 'imperial',
    },
  );
  return f;
}

function metric(v: BodyValues) {
  const kg = v.units === 'metric' ? v.weight : v.weight * 0.45359237;
  const cm = v.units === 'metric' ? v.height : (v.feet * 12 + v.inches) * 2.54;
  return { kg, cm };
}

const kgLabel = (kg: number, units: string) =>
  units === 'metric' ? `${formatNumber(kg, 1)} kg` : `${formatNumber(kg / 0.45359237, 1)} lb`;

const sexField = <V extends FormValues>(): Field<V> => ({
  name: 'sex' as keyof V & string,
  label: 'Sex',
  type: 'segmented',
  default: 'male',
  options: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ],
});
const ageField = <V extends FormValues>(d = 30): Field<V> => ({
  name: 'age' as keyof V & string,
  label: 'Age',
  type: 'number',
  default: d,
  min: 15,
  max: 100,
  integer: true,
  unit: 'years',
});
const activityField = <V extends FormValues>(): Field<V> => ({
  name: 'activity' as keyof V & string,
  label: 'Activity level',
  type: 'select',
  default: '1.55',
  full: true,
  options: ACTIVITY_LEVELS,
});

// ---------------------------------------------------------------- BMI
type BmiValues = BodyValues;
export const BmiCalculator = createFormTool<BmiValues>({
  fields: bodyFields<BmiValues>(),
  compute: (v) => {
    const { kg, cm } = metric(v);
    const b = bmi(kg, cm);
    const who = bmiCategoryWHO(b);
    const asian = bmiCategoryAsianIndian(b);
    return {
      results: [
        {
          label: 'Your BMI',
          value: formatNumber(b, 1),
          primary: true,
          hint: `${asian.label} (Asian-Indian guideline)`,
        },
        { label: 'WHO category', value: who.label },
        {
          label: 'Asian-Indian category',
          value: asian.label,
          hint: 'Normal 18.5–22.9, overweight 23–24.9, obese ≥ 25',
        },
        {
          label: 'Healthy weight for your height',
          value: `${kgLabel(weightForBmi(18.5, cm), v.units)} – ${kgLabel(weightForBmi(22.9, cm), v.units)}`,
          hint: 'BMI 18.5–22.9',
        },
      ],
      chart: {
        kind: 'gauge',
        title: 'BMI scale (Asian-Indian cut-offs)',
        value: Math.min(Math.max(b, 12), 40),
        min: 12,
        max: 40,
        valueLabel: `BMI ${formatNumber(b, 1)}`,
        bands: [
          { to: 18.5, label: '<18.5', tone: 'blue' },
          { to: 23, label: '18.5–23', tone: 'green' },
          { to: 25, label: '23–25', tone: 'amber' },
          { to: 40, label: '25+', tone: 'red' },
        ],
      },
      notes: [
        'BMI does not distinguish muscle from fat and is not valid for pregnancy or children under 18.',
      ],
    };
  },
});

// ---------------------------------------------------------------- BMR / TDEE / calories
type BmrValues = BodyValues & { sex: string; age: number; formula: string; bodyFat: number | '' };
export const BmrCalculator = createFormTool<BmrValues>({
  fields: [
    ...bodyFields<BmrValues>(),
    sexField<BmrValues>(),
    ageField<BmrValues>(),
    {
      name: 'formula',
      label: 'Formula',
      type: 'select',
      default: 'mifflin',
      options: [
        { value: 'mifflin', label: 'Mifflin-St Jeor (recommended)' },
        { value: 'harris', label: 'Revised Harris-Benedict' },
        { value: 'katch', label: 'Katch-McArdle (needs body fat %)' },
      ],
    },
    {
      name: 'bodyFat',
      label: 'Body fat',
      type: 'percent',
      default: '',
      min: 2,
      max: 70,
      optional: true,
      showIf: (v) => v.formula === 'katch',
    },
  ],
  compute: (v) => {
    const { kg, cm } = metric(v);
    const val = bmr({
      sex: v.sex as Sex,
      weightKg: kg,
      heightCm: cm,
      age: v.age,
      formula: v.formula as BmrFormula,
      bodyFatPct: v.bodyFat === '' ? undefined : v.bodyFat,
    });
    return {
      results: [
        { label: 'Basal metabolic rate', value: `${formatNumber(val, 0)} kcal/day`, primary: true },
        ...ACTIVITY_LEVELS.map((a) => ({
          label: a.label.split(' (')[0],
          value: `${formatNumber(val * Number(a.value), 0)} kcal/day`,
          hint: 'Maintenance calories',
        })),
      ],
    };
  },
});

type TdeeValues = BodyValues & { sex: string; age: number; activity: string };
export const TdeeCalculator = createFormTool<TdeeValues>({
  fields: [
    ...bodyFields<TdeeValues>(),
    sexField<TdeeValues>(),
    ageField<TdeeValues>(),
    activityField<TdeeValues>(),
  ],
  compute: (v) => {
    const { kg, cm } = metric(v);
    const b = bmr({ sex: v.sex as Sex, weightKg: kg, heightCm: cm, age: v.age });
    const tdee = b * Number(v.activity);
    return {
      results: [
        {
          label: 'Total daily energy expenditure',
          value: `${formatNumber(tdee, 0)} kcal/day`,
          primary: true,
          hint: 'Calories to maintain your weight',
        },
        { label: 'BMR (at rest)', value: `${formatNumber(b, 0)} kcal/day` },
        { label: 'Calories burned by activity', value: `${formatNumber(tdee - b, 0)} kcal/day` },
        { label: 'Weekly energy use', value: `${formatNumber(tdee * 7, 0)} kcal` },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'BMR', value: b },
          { label: 'Activity', value: tdee - b },
        ],
        format: 'number',
      },
    };
  },
});

type CalValues = BodyValues & { sex: string; age: number; activity: string; goal: string };
const GOALS = [
  { value: '0', label: 'Maintain weight' },
  { value: '-250', label: 'Mild weight loss (0.25 kg/week)' },
  { value: '-500', label: 'Weight loss (0.5 kg/week)' },
  { value: '-1000', label: 'Extreme weight loss (1 kg/week)' },
  { value: '250', label: 'Mild weight gain (0.25 kg/week)' },
  { value: '500', label: 'Weight gain (0.5 kg/week)' },
];
export const CalorieCalculator = createFormTool<CalValues>({
  fields: [
    ...bodyFields<CalValues>(),
    sexField<CalValues>(),
    ageField<CalValues>(),
    activityField<CalValues>(),
    { name: 'goal', label: 'Goal', type: 'select', default: '-500', full: true, options: GOALS },
  ],
  compute: (v) => {
    const { kg, cm } = metric(v);
    const tdee =
      bmr({ sex: v.sex as Sex, weightKg: kg, heightCm: cm, age: v.age }) * Number(v.activity);
    const floor = v.sex === 'male' ? 1500 : 1200;
    const target = tdee + Number(v.goal);
    const safe = Math.max(target, floor);
    return {
      results: [
        {
          label: 'Daily calorie target',
          value: `${formatNumber(safe, 0)} kcal`,
          primary: true,
          hint: GOALS.find((g) => g.value === v.goal)?.label,
        },
        { label: 'Maintenance calories', value: `${formatNumber(tdee, 0)} kcal` },
        ...GOALS.filter((g) => g.value !== v.goal).map((g) => ({
          label: g.label,
          value: `${formatNumber(Math.max(tdee + Number(g.value), floor), 0)} kcal`,
        })),
      ],
      notes:
        target < floor
          ? [
              `Target raised to ${floor} kcal — eating less than this without medical supervision is not recommended.`,
            ]
          : undefined,
    };
  },
});

// ---------------------------------------------------------------- Ideal weight / body fat
type IdealValues = {
  units: string;
  height: number;
  feet: number;
  inches: number;
  sex: string;
  weight: number;
};
export const IdealWeightCalculator = createFormTool<IdealValues>({
  fields: [...bodyFields<IdealValues>({ weight: false }), sexField<IdealValues>()],
  compute: (v) => {
    const { cm } = metric({ ...v, weight: 0 });
    const w = idealWeights(v.sex as Sex, cm);
    const u = v.units;
    return {
      results: [
        {
          label: 'Healthy weight range (Asian-Indian BMI 18.5–22.9)',
          value: `${kgLabel(weightForBmi(18.5, cm), u)} – ${kgLabel(weightForBmi(22.9, cm), u)}`,
          primary: true,
        },
        { label: 'Devine formula', value: kgLabel(w.devine, u) },
        { label: 'Robinson formula', value: kgLabel(w.robinson, u) },
        { label: 'Miller formula', value: kgLabel(w.miller, u) },
        { label: 'Hamwi formula', value: kgLabel(w.hamwi, u) },
        {
          label: 'WHO BMI range (18.5–24.9)',
          value: `${kgLabel(weightForBmi(18.5, cm), u)} – ${kgLabel(weightForBmi(24.9, cm), u)}`,
        },
      ],
    };
  },
});

type FatValues = {
  sex: string;
  height: number;
  neck: number;
  waist: number;
  hip: number;
  age: number;
  weight: number;
};
export const BodyFatCalculator = createFormTool<FatValues>({
  fields: [
    sexField<FatValues>(),
    ageField<FatValues>(),
    { name: 'weight', label: 'Weight', type: 'number', default: 75, min: 20, max: 500, unit: 'kg' },
    {
      name: 'height',
      label: 'Height',
      type: 'number',
      default: 178,
      min: 100,
      max: 250,
      unit: 'cm',
    },
    {
      name: 'neck',
      label: 'Neck circumference',
      type: 'number',
      default: 38,
      min: 20,
      max: 80,
      unit: 'cm',
      help: 'Below the larynx.',
    },
    {
      name: 'waist',
      label: 'Waist circumference',
      type: 'number',
      default: 86,
      min: 40,
      max: 250,
      unit: 'cm',
      help: 'Men: at the navel. Women: at the narrowest point.',
    },
    {
      name: 'hip',
      label: 'Hip circumference',
      type: 'number',
      default: 97,
      min: 50,
      max: 250,
      unit: 'cm',
      showIf: (v) => v.sex === 'female',
    },
  ],
  compute: (v) => {
    const pct = navyBodyFat({
      sex: v.sex as Sex,
      heightCm: v.height,
      neckCm: v.neck,
      waistCm: v.waist,
      hipCm: v.hip,
    });
    if (!(pct > 1 && pct < 75))
      throw new InputError(
        'These measurements give an unrealistic result. Please re-check them.',
        'waist',
      );
    const fatKg = (v.weight * pct) / 100;
    return {
      results: [
        {
          label: 'Body fat',
          value: `${formatNumber(pct, 1)}%`,
          primary: true,
          hint: bodyFatCategory(v.sex as Sex, pct),
        },
        { label: 'Fat mass', value: `${formatNumber(fatKg, 1)} kg` },
        { label: 'Lean body mass', value: `${formatNumber(v.weight - fatKg, 1)} kg` },
        {
          label: 'Waist-to-height ratio',
          value: formatNumber(v.waist / v.height, 2),
          hint:
            v.waist / v.height >= 0.5
              ? 'Above 0.5 – higher cardiometabolic risk'
              : 'Below 0.5 – healthy',
        },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Fat mass', value: fatKg },
          { label: 'Lean mass', value: v.weight - fatKg },
        ],
        format: 'number',
      },
    };
  },
});

// ---------------------------------------------------------------- Water, macros, protein, deficit
type WaterValues = { weight: number; exercise: number; hot: boolean };
export const WaterIntakeCalculator = createFormTool<WaterValues>({
  fields: [
    {
      name: 'weight',
      label: 'Body weight',
      type: 'number',
      default: 70,
      min: 10,
      max: 300,
      unit: 'kg',
    },
    {
      name: 'exercise',
      label: 'Exercise per day',
      type: 'number',
      default: 30,
      min: 0,
      max: 600,
      integer: true,
      unit: 'minutes',
    },
    { name: 'hot', label: 'Hot or humid weather', type: 'toggle', default: true },
  ],
  compute: (v) => {
    const w = waterIntake(v.weight, v.exercise, v.hot);
    return {
      results: [
        {
          label: 'Daily water intake',
          value: `${formatNumber(w.ml / 1000, 1)} litres`,
          primary: true,
          hint: `about ${Math.round(w.ml / 250)} glasses of 250 ml`,
        },
        { label: 'Base need (35 ml/kg)', value: `${formatNumber(w.base, 0)} ml` },
        { label: 'For exercise', value: `${formatNumber(w.exercise, 0)} ml` },
        { label: 'For heat', value: `${formatNumber(w.climate, 0)} ml` },
      ],
      notes: [
        'About 20% of daily water usually comes from food. People with kidney or heart conditions should follow their doctor’s advice.',
      ],
    };
  },
});

type MacroValues = {
  calories: number;
  preset: string;
  protein: number;
  carbs: number;
  fat: number;
};
export const MacroCalculator = createFormTool<MacroValues>({
  fields: [
    {
      name: 'calories',
      label: 'Daily calories',
      type: 'number',
      default: 2000,
      min: 800,
      max: 8000,
      integer: true,
      unit: 'kcal',
      help: 'Use the Calorie Calculator if you don’t know this.',
    },
    {
      name: 'preset',
      label: 'Diet split (protein / carbs / fat)',
      type: 'select',
      default: 'balanced',
      full: true,
      options: [
        ...Object.entries(MACRO_PRESETS).map(([k, p]) => ({ value: k, label: p.label })),
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      name: 'protein',
      label: 'Protein',
      type: 'percent',
      default: 30,
      min: 0,
      max: 100,
      showIf: (v) => v.preset === 'custom',
    },
    {
      name: 'carbs',
      label: 'Carbohydrates',
      type: 'percent',
      default: 40,
      min: 0,
      max: 100,
      showIf: (v) => v.preset === 'custom',
    },
    {
      name: 'fat',
      label: 'Fat',
      type: 'percent',
      default: 30,
      min: 0,
      max: 100,
      showIf: (v) => v.preset === 'custom',
    },
  ],
  compute: (v) => {
    const p =
      v.preset === 'custom'
        ? { protein: v.protein, carbs: v.carbs, fat: v.fat }
        : MACRO_PRESETS[v.preset];
    const m = macros(v.calories, p.protein, p.carbs, p.fat);
    return {
      results: [
        {
          label: 'Protein',
          value: `${formatNumber(m.protein, 0)} g/day`,
          primary: true,
          hint: `${p.protein}% · ${formatNumber(m.protein * 4, 0)} kcal`,
        },
        {
          label: 'Carbohydrates',
          value: `${formatNumber(m.carbs, 0)} g/day`,
          hint: `${p.carbs}% · ${formatNumber(m.carbs * 4, 0)} kcal`,
        },
        {
          label: 'Fat',
          value: `${formatNumber(m.fat, 0)} g/day`,
          hint: `${p.fat}% · ${formatNumber(m.fat * 9, 0)} kcal`,
        },
      ],
      chart: {
        kind: 'donut',
        title: 'Calories by macro',
        data: [
          { label: 'Protein', value: m.protein * 4 },
          { label: 'Carbs', value: m.carbs * 4 },
          { label: 'Fat', value: m.fat * 9 },
        ],
        format: 'number',
      },
    };
  },
});

type ProteinValues = { weight: number; goal: string };
const PROTEIN_GOALS: Record<string, { label: string; min: number; max: number }> = {
  sedentary: { label: 'Sedentary adult (ICMR-NIN RDA)', min: 0.83, max: 1.0 },
  active: { label: 'Regular exercise / endurance', min: 1.2, max: 1.4 },
  strength: { label: 'Strength training / muscle gain', min: 1.6, max: 2.2 },
  loss: { label: 'Weight loss (preserve muscle)', min: 1.2, max: 1.6 },
  older: { label: 'Adults over 60', min: 1.0, max: 1.2 },
};
export const ProteinCalculator = createFormTool<ProteinValues>({
  fields: [
    {
      name: 'weight',
      label: 'Body weight',
      type: 'number',
      default: 70,
      min: 20,
      max: 300,
      unit: 'kg',
    },
    {
      name: 'goal',
      label: 'Goal / activity',
      type: 'select',
      default: 'sedentary',
      full: true,
      options: Object.entries(PROTEIN_GOALS).map(([k, g]) => ({ value: k, label: g.label })),
    },
  ],
  compute: (v) => {
    const g = PROTEIN_GOALS[v.goal];
    const lo = v.weight * g.min;
    const hi = v.weight * g.max;
    return {
      results: [
        {
          label: 'Daily protein',
          value: `${formatNumber(lo, 0)} – ${formatNumber(hi, 0)} g`,
          primary: true,
          hint: `${g.min}–${g.max} g per kg`,
        },
        {
          label: 'Per meal (3 meals)',
          value: `${formatNumber(lo / 3, 0)} – ${formatNumber(hi / 3, 0)} g`,
        },
        {
          label: 'Calories from protein',
          value: `${formatNumber(lo * 4, 0)} – ${formatNumber(hi * 4, 0)} kcal`,
        },
      ],
      notes: [
        'Vegetarian sources: dal, paneer, curd, soy, chana, rajma, milk and nuts. Spread intake across meals.',
        'People with kidney disease should consult a doctor before increasing protein.',
      ],
    };
  },
});

type DeficitValues = { current: number; target: number; tdee: number; deficit: number };
export const CalorieDeficitCalculator = createFormTool<DeficitValues>({
  fields: [
    {
      name: 'current',
      label: 'Current weight',
      type: 'number',
      default: 80,
      min: 30,
      max: 300,
      unit: 'kg',
    },
    {
      name: 'target',
      label: 'Target weight',
      type: 'number',
      default: 72,
      min: 30,
      max: 300,
      unit: 'kg',
    },
    {
      name: 'tdee',
      label: 'Maintenance calories (TDEE)',
      type: 'number',
      default: 2400,
      min: 1000,
      max: 6000,
      integer: true,
      unit: 'kcal',
    },
    {
      name: 'deficit',
      label: 'Daily calorie deficit',
      type: 'number',
      default: 500,
      min: 100,
      max: 1500,
      integer: true,
      unit: 'kcal',
    },
  ],
  compute: (v) => {
    const d = deficitPlan(v.current, v.target, v.tdee, v.deficit);
    const end = addDays(parseISODate(todayISO()), d.days);
    const items: ResultItem[] = [
      {
        label: 'Time to reach target',
        value: `${formatNumber(d.days, 0)} days`,
        primary: true,
        hint: `about ${formatNumber(d.days / 7, 1)} weeks · ${formatLongDate(end)}`,
      },
      { label: 'Daily calorie intake', value: `${formatNumber(d.dailyIntake, 0)} kcal` },
      { label: 'Expected weekly loss', value: `${formatNumber(d.weeklyLossKg, 2)} kg` },
      {
        label: 'Total deficit needed',
        value: `${formatNumber(d.totalKcal, 0)} kcal`,
        hint: `${KCAL_PER_KG_FAT} kcal per kg of fat`,
      },
    ];
    return {
      results: items,
      notes:
        d.weeklyLossKg > 1
          ? [
              'Losing more than about 1 kg a week is generally not advised without medical supervision.',
            ]
          : undefined,
    };
  },
});

// ---------------------------------------------------------------- Pregnancy
type DueValues = { method: string; date: string; cycle: number };
export const PregnancyDueDateCalculator = createFormTool<DueValues>({
  fields: [
    {
      name: 'method',
      label: 'Calculate from',
      type: 'select',
      default: 'lmp',
      full: true,
      options: [
        { value: 'lmp', label: 'First day of last menstrual period (LMP)' },
        { value: 'conception', label: 'Conception date' },
        { value: 'ivf3', label: 'IVF – day 3 embryo transfer' },
        { value: 'ivf5', label: 'IVF – day 5 blastocyst transfer' },
      ],
    },
    {
      name: 'date',
      label: 'Date',
      type: 'date',
      default: () => toISODate(addDays(parseISODate(todayISO()), -70)),
    },
    {
      name: 'cycle',
      label: 'Average cycle length',
      type: 'number',
      default: 28,
      min: 20,
      max: 45,
      integer: true,
      unit: 'days',
      showIf: (v) => v.method === 'lmp',
    },
  ],
  compute: (v) => {
    const start = parseISODate(v.date);
    const today = parseISODate(todayISO());
    if (start > today) throw new InputError('The date cannot be in the future.', 'date');
    const due = dueDate(v.method as DueMethod, start, v.cycle);
    const g = gestationalAge(due, today);
    if (g.totalDays > 44 * 7)
      throw new InputError('That date is more than 44 weeks ago. Please check the date.', 'date');
    const lmpEq = addDays(due, -280);
    return {
      results: [
        { label: 'Estimated due date', value: formatLongDate(due), primary: true },
        {
          label: 'Current pregnancy stage',
          value: `${g.weeks} weeks ${g.days} days`,
          hint: g.trimester ? `Trimester ${g.trimester}` : undefined,
        },
        { label: 'End of first trimester', value: formatLongDate(addDays(lmpEq, 13 * 7 + 6)) },
        { label: 'End of second trimester', value: formatLongDate(addDays(lmpEq, 27 * 7 + 6)) },
        { label: 'Full term begins (37 weeks)', value: formatLongDate(addDays(lmpEq, 37 * 7)) },
      ],
      notes: [
        'Only about 4% of babies arrive on their due date; most are born between 38 and 42 weeks. Your doctor may adjust the date after an ultrasound.',
      ],
    };
  },
});
