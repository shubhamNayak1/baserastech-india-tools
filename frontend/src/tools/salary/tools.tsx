import { createFormTool } from '@/components/form-tool/FormTool';
import type { Field, ResultItem } from '@/components/form-tool/types';
import { formatINR, formatLakhCrore, formatNumber, formatPercent } from '@/utils/format';
import { InputError, round } from '@/utils/number';
import {
  addDays,
  addMonths,
  diffYMD,
  formatLongDate,
  formatYMD,
  parseISODate,
  todayISO,
  toISODate,
} from '@/utils/date';
import { computeIncomeTax } from '../tax/engine';
import { CURRENT_RULES, FY_OPTIONS, DEFAULT_FY, getTaxRules } from '../tax/rules';
import {
  ctcToInHand,
  epfCorpus,
  esiContribution,
  fromAnnual,
  gratuity,
  mergedDays,
  pfContribution,
  toAnnual,
  type PayPeriod,
  type PfMode,
} from './engine';

const REGIME_OPTIONS = [
  { value: 'new', label: 'New regime' },
  { value: 'old', label: 'Old regime' },
];
const PF_OPTIONS = [
  { value: 'capped', label: 'PF on ₹15,000 cap (most common)' },
  { value: 'full', label: 'PF on full basic' },
  { value: 'none', label: 'No PF' },
];
const PERIOD_OPTIONS = [
  { value: 'hour', label: 'Per hour' },
  { value: 'day', label: 'Per day' },
  { value: 'week', label: 'Per week' },
  { value: 'month', label: 'Per month' },
  { value: 'year', label: 'Per year' },
];

function fyField<V extends { fy: string }>(): Field<V> {
  return {
    name: 'fy' as keyof V & string,
    label: 'Financial year',
    type: 'select',
    default: DEFAULT_FY,
    options: FY_OPTIONS,
  };
}

export function rulesNote(fy: string): string[] {
  const r = getTaxRules(fy);
  return r.status === 'provisional' && r.note ? [r.note] : [];
}

// ---------------------------------------------------------------- CTC to in-hand
type CtcValues = {
  ctc: number;
  variable: number;
  basicPct: number;
  hraPct: number;
  pf: string;
  gratuity: boolean;
  pt: number;
  regime: string;
  fy: string;
  rent: number;
  metro: boolean;
  ded80c: number;
};
const ctcFields: Field<CtcValues>[] = [
  {
    name: 'ctc',
    label: 'Annual CTC',
    type: 'currency',
    default: 1_200_000,
    min: 10_000,
    max: 1e10,
  },
  {
    name: 'variable',
    label: 'Variable pay / bonus in CTC',
    type: 'currency',
    default: 0,
    min: 0,
    max: 1e10,
    help: 'Annual performance bonus included in CTC.',
  },
  {
    name: 'basicPct',
    label: 'Basic salary (% of fixed CTC)',
    type: 'percent',
    default: 50,
    min: 10,
    max: 90,
  },
  { name: 'hraPct', label: 'HRA (% of basic)', type: 'percent', default: 40, min: 0, max: 60 },
  { name: 'pf', label: 'Provident fund', type: 'select', default: 'capped', options: PF_OPTIONS },
  {
    name: 'pt',
    label: 'Professional tax (per year)',
    type: 'currency',
    default: 2500,
    min: 0,
    max: 2500,
    help: 'Up to ₹2,500 depending on your state; 0 in states without PT.',
  },
  {
    name: 'regime',
    label: 'Tax regime',
    type: 'segmented',
    default: 'new',
    options: REGIME_OPTIONS,
  },
  fyField<CtcValues>(),
  {
    name: 'gratuity',
    label: 'Gratuity is part of CTC (4.81% of basic)',
    type: 'toggle',
    default: true,
    full: true,
  },
  {
    name: 'rent',
    label: 'Monthly rent paid (for HRA)',
    type: 'currency',
    default: 0,
    min: 0,
    max: 1e7,
    showIf: (v) => v.regime === 'old',
  },
  {
    name: 'metro',
    label: 'Living in Delhi, Mumbai, Kolkata or Chennai',
    type: 'toggle',
    default: false,
    showIf: (v) => v.regime === 'old',
  },
  {
    name: 'ded80c',
    label: '80C investments besides PF',
    type: 'currency',
    default: 0,
    min: 0,
    max: 150_000,
    showIf: (v) => v.regime === 'old',
  },
];

function ctcCompute(v: CtcValues) {
  return ctcToInHand({
    ctc: v.ctc,
    basicPct: v.basicPct,
    hraPctOfBasic: v.hraPct,
    pfMode: v.pf as PfMode,
    includeGratuity: v.gratuity,
    variablePay: v.variable,
    professionalTax: v.pt,
    regime: v.regime as 'new' | 'old',
    fy: v.fy,
    rentPaidMonthly: v.rent,
    metro: v.metro,
    deductions80C: v.ded80c,
  });
}

export const CtcToInHandCalculator = createFormTool<CtcValues>({
  fields: ctcFields,
  compute: (v) => {
    const b = ctcCompute(v);
    return {
      results: [
        {
          label: 'Monthly in-hand salary',
          value: formatINR(b.monthlyFixedInHand),
          primary: true,
          hint:
            v.variable > 0
              ? `${formatINR(b.monthlyInHand)} per month on average including variable pay`
              : 'After PF, professional tax and income tax',
        },
        {
          label: 'Annual take-home',
          value: formatINR(b.annualInHand),
          hint: formatLakhCrore(b.annualInHand),
        },
        { label: 'Gross salary', value: formatINR(b.grossSalary) },
        { label: 'Income tax (incl. cess)', value: formatINR(b.incomeTax) },
        { label: 'Employee PF', value: formatINR(b.employeePf) },
        { label: 'Take-home as % of CTC', value: formatPercent((b.annualInHand / v.ctc) * 100, 1) },
      ],
      chart: {
        kind: 'donut',
        title: 'Where your CTC goes',
        data: [
          { label: 'Take-home', value: b.annualInHand },
          { label: 'Income tax', value: b.incomeTax },
          { label: 'PF (employee + employer)', value: b.employeePf + b.employerPf },
          { label: 'Gratuity', value: b.gratuity },
          { label: 'Professional tax', value: b.professionalTax },
        ],
        format: 'inr',
      },
      table: {
        title: 'Salary structure',
        columns: ['Component', 'Monthly', 'Annual'],
        rows: [
          ['Basic', formatINR(b.basic / 12), formatINR(b.basic)],
          ['HRA', formatINR(b.hra / 12), formatINR(b.hra)],
          ['Special allowance', formatINR(b.special / 12), formatINR(b.special)],
          ...(b.variable
            ? [['Variable pay', formatINR(b.variable / 12), formatINR(b.variable)]]
            : []),
          ['Gross salary', formatINR(b.grossSalary / 12), formatINR(b.grossSalary)],
          ['Employer PF', formatINR(b.employerPf / 12), formatINR(b.employerPf)],
          ...(b.gratuity ? [['Gratuity', formatINR(b.gratuity / 12), formatINR(b.gratuity)]] : []),
          ['Employee PF (deduction)', formatINR(-b.employeePf / 12), formatINR(-b.employeePf)],
          [
            'Professional tax (deduction)',
            formatINR(-b.professionalTax / 12),
            formatINR(-b.professionalTax),
          ],
          ['Income tax (deduction)', formatINR(-b.incomeTax / 12), formatINR(-b.incomeTax)],
          ['Take-home', formatINR(b.annualInHand / 12), formatINR(b.annualInHand)],
        ],
        initialRows: 20,
      },
      notes: rulesNote(v.fy),
    };
  },
});

// ---------------------------------------------------------------- In-hand from gross
type InHandValues = {
  gross: number;
  period: string;
  basicPct: number;
  pf: string;
  pt: number;
  other: number;
  regime: string;
  fy: string;
};
export const InHandSalaryCalculator = createFormTool<InHandValues>({
  fields: [
    {
      name: 'gross',
      label: 'Gross salary',
      type: 'currency',
      default: 80_000,
      min: 1000,
      max: 1e9,
    },
    {
      name: 'period',
      label: 'Gross salary is',
      type: 'segmented',
      default: 'month',
      options: [
        { value: 'month', label: 'Monthly' },
        { value: 'year', label: 'Annual' },
      ],
    },
    {
      name: 'basicPct',
      label: 'Basic (% of gross)',
      type: 'percent',
      default: 50,
      min: 10,
      max: 100,
    },
    { name: 'pf', label: 'Provident fund', type: 'select', default: 'capped', options: PF_OPTIONS },
    {
      name: 'pt',
      label: 'Professional tax (per month)',
      type: 'currency',
      default: 200,
      min: 0,
      max: 300,
    },
    {
      name: 'other',
      label: 'Other monthly deductions',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e8,
      help: 'Meal cards, insurance, loans recovered by employer, etc.',
    },
    {
      name: 'regime',
      label: 'Tax regime',
      type: 'segmented',
      default: 'new',
      options: REGIME_OPTIONS,
    },
    fyField<InHandValues>(),
  ],
  compute: (v) => {
    const monthly = v.period === 'month' ? v.gross : v.gross / 12;
    const pf = pfContribution((monthly * v.basicPct) / 100, v.pf as PfMode);
    const esi = esiContribution(monthly);
    const tax = computeIncomeTax({
      fy: v.fy,
      regime: v.regime as 'new' | 'old',
      salaryIncome: monthly * 12,
      professionalTax: v.pt * 12,
      deductions: { sec80C: pf.employee * 12 },
    }).totalTax;
    const inHand = monthly - pf.employee - esi.employee - v.pt - v.other - tax / 12;
    if (inHand < 0) throw new InputError('Deductions exceed the gross salary.', 'other');
    return {
      results: [
        { label: 'Monthly in-hand salary', value: formatINR(inHand), primary: true },
        { label: 'Annual in-hand', value: formatINR(inHand * 12) },
        { label: 'Employee PF (monthly)', value: formatINR(pf.employee) },
        ...(esi.applicable ? [{ label: 'ESI (0.75%)', value: formatINR(esi.employee) }] : []),
        { label: 'Income tax (monthly TDS)', value: formatINR(tax / 12) },
        { label: 'Total monthly deductions', value: formatINR(monthly - inHand) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'In-hand', value: inHand },
          { label: 'PF', value: pf.employee },
          { label: 'Tax', value: tax / 12 },
          { label: 'PT & other', value: v.pt + v.other + esi.employee },
        ],
        format: 'inr',
      },
      notes: rulesNote(v.fy),
    };
  },
});

// ---------------------------------------------------------------- Hike & increment
type HikeValues = { mode: string; current: number; hike: number; next: number };
export const SalaryHikeCalculator = createFormTool<HikeValues>({
  fields: [
    {
      name: 'mode',
      label: 'I know',
      type: 'segmented',
      default: 'pct',
      full: true,
      options: [
        { value: 'pct', label: 'Hike percentage' },
        { value: 'new', label: 'New salary' },
      ],
    },
    {
      name: 'current',
      label: 'Current salary (CTC)',
      type: 'currency',
      default: 1_000_000,
      min: 1,
      max: 1e10,
    },
    {
      name: 'hike',
      label: 'Hike',
      type: 'percent',
      default: 15,
      min: -100,
      max: 1000,
      showIf: (v) => v.mode === 'pct',
    },
    {
      name: 'next',
      label: 'New salary (CTC)',
      type: 'currency',
      default: 1_200_000,
      min: 0,
      max: 1e10,
      showIf: (v) => v.mode === 'new',
    },
  ],
  compute: (v) => {
    const next = v.mode === 'pct' ? v.current * (1 + v.hike / 100) : v.next;
    const pct = ((next - v.current) / v.current) * 100;
    return {
      results: [
        v.mode === 'pct'
          ? {
              label: 'New salary',
              value: formatINR(next),
              primary: true,
              hint: formatLakhCrore(next),
            }
          : { label: 'Salary hike', value: formatPercent(pct), primary: true },
        { label: 'Increase per year', value: formatINR(next - v.current) },
        { label: 'Increase per month', value: formatINR((next - v.current) / 12) },
        { label: 'New monthly salary', value: formatINR(next / 12) },
        ...(v.mode === 'new' ? [] : [{ label: 'Hike percentage', value: formatPercent(pct) }]),
      ],
    };
  },
});

type IncValues = { current: number; increment: number; years: number; inflation: number };
export const SalaryIncrementCalculator = createFormTool<IncValues>({
  fields: [
    {
      name: 'current',
      label: 'Current annual salary',
      type: 'currency',
      default: 800_000,
      min: 1,
      max: 1e10,
    },
    {
      name: 'increment',
      label: 'Expected yearly increment',
      type: 'percent',
      default: 8,
      min: -50,
      max: 200,
    },
    {
      name: 'years',
      label: 'Project for',
      type: 'number',
      default: 5,
      min: 1,
      max: 40,
      integer: true,
      unit: 'years',
    },
    {
      name: 'inflation',
      label: 'Inflation (for real growth)',
      type: 'percent',
      default: 6,
      min: 0,
      max: 30,
    },
  ],
  compute: (v) => {
    const rows: string[][] = [];
    const labels: string[] = [];
    const values: number[] = [];
    let s = v.current;
    for (let y = 1; y <= v.years; y++) {
      const prev = s;
      s *= 1 + v.increment / 100;
      rows.push([`Year ${y}`, formatINR(s), formatINR(s - prev), formatINR(s / 12)]);
      labels.push(`Y${y}`);
      values.push(s);
    }
    const realGrowth = ((1 + v.increment / 100) / (1 + v.inflation / 100) - 1) * 100;
    return {
      results: [
        {
          label: `Salary after ${v.years} years`,
          value: formatINR(s),
          primary: true,
          hint: formatLakhCrore(s),
        },
        {
          label: 'First increment',
          value: formatINR((v.current * v.increment) / 100),
          hint: `${formatINR((v.current * v.increment) / 1200)} per month`,
        },
        { label: 'Total growth', value: formatPercent(((s - v.current) / v.current) * 100, 1) },
        {
          label: 'Real growth per year',
          value: formatPercent(realGrowth),
          hint: realGrowth < 0 ? 'Increment is below inflation' : 'After inflation',
        },
      ],
      chart: {
        kind: 'bars',
        title: 'Projected salary',
        labels,
        series: [{ name: 'Annual salary', values }],
        format: 'inr',
      },
      table: { columns: ['Year', 'Annual salary', 'Increment', 'Monthly'], rows },
    };
  },
});

// ---------------------------------------------------------------- Comparison & conversions
type CompareValues = { a: number; aPeriod: string; b: number; bPeriod: string; hours: number };
export const SalaryComparisonCalculator = createFormTool<CompareValues>({
  fields: [
    { name: 'a', label: 'Salary A', type: 'currency', default: 75_000, min: 0, max: 1e10 },
    {
      name: 'aPeriod',
      label: 'Salary A is paid',
      type: 'select',
      default: 'month',
      options: PERIOD_OPTIONS,
    },
    { name: 'b', label: 'Salary B', type: 'currency', default: 1_000_000, min: 0, max: 1e10 },
    {
      name: 'bPeriod',
      label: 'Salary B is paid',
      type: 'select',
      default: 'year',
      options: PERIOD_OPTIONS,
    },
    {
      name: 'hours',
      label: 'Working hours per week',
      type: 'number',
      default: 40,
      min: 1,
      max: 100,
      unit: 'hours',
    },
  ],
  compute: (v) => {
    const a = toAnnual(v.a, v.aPeriod as PayPeriod, v.hours);
    const b = toAnnual(v.b, v.bPeriod as PayPeriod, v.hours);
    if (a === 0 && b === 0) throw new InputError('Enter at least one salary.', 'a');
    const diff = b - a;
    const higher =
      diff === 0
        ? 'Both salaries are equal'
        : diff > 0
          ? 'Salary B is higher'
          : 'Salary A is higher';
    return {
      results: [
        {
          label: 'Annual difference',
          value: formatINR(Math.abs(diff)),
          primary: true,
          hint: higher,
        },
        {
          label: 'Difference (%)',
          value: a > 0 ? formatPercent((diff / a) * 100) : '—',
          hint: 'Relative to salary A',
        },
        { label: 'Salary A per year', value: formatINR(a), hint: `${formatINR(a / 12)} per month` },
        { label: 'Salary B per year', value: formatINR(b), hint: `${formatINR(b / 12)} per month` },
        { label: 'Monthly difference', value: formatINR(Math.abs(diff) / 12) },
      ],
      chart: {
        kind: 'bars',
        labels: ['Salary A', 'Salary B'],
        series: [{ name: 'Annual', values: [a, b] }],
        format: 'inr',
      },
    };
  },
});

type PeriodValues = { amount: number; period: string; hours: number; days: number };
function periodTool(target: PayPeriod, def: { amount: number; period: PayPeriod }) {
  const names: Record<PayPeriod, string> = {
    hour: 'Hourly',
    day: 'Daily',
    week: 'Weekly',
    month: 'Monthly',
    year: 'Annual',
  };
  return createFormTool<PeriodValues>({
    fields: [
      {
        name: 'amount',
        label: 'Salary amount',
        type: 'currency',
        default: def.amount,
        min: 0,
        max: 1e11,
      },
      {
        name: 'period',
        label: 'Paid',
        type: 'select',
        default: def.period,
        options: PERIOD_OPTIONS.filter((o) => o.value !== target),
      },
      {
        name: 'hours',
        label: 'Hours per week',
        type: 'number',
        default: 40,
        min: 1,
        max: 100,
        unit: 'hours',
      },
      {
        name: 'days',
        label: 'Working days per week',
        type: 'number',
        default: 5,
        min: 1,
        max: 7,
        integer: true,
        unit: 'days',
      },
    ],
    compute: (v) => {
      const annual = toAnnual(v.amount, v.period as PayPeriod, v.hours, v.days);
      const all = fromAnnual(annual, v.hours, v.days);
      const order: PayPeriod[] = ['year', 'month', 'week', 'day', 'hour'];
      return {
        results: [
          {
            label: `${names[target]} salary`,
            value: formatINR(all[target], target === 'hour' || target === 'day' ? 2 : 0),
            primary: true,
          },
          ...order
            .filter((p) => p !== target)
            .map((p) => ({
              label: `${names[p]} equivalent`,
              value: formatINR(all[p], p === 'hour' || p === 'day' ? 2 : 0),
            })),
        ],
        notes: ['Assumes 52 working weeks a year with no unpaid leave.'],
      };
    },
  });
}
export const MonthlySalaryCalculator = periodTool('month', { amount: 1_200_000, period: 'year' });
export const AnnualSalaryCalculator = periodTool('year', { amount: 75_000, period: 'month' });
export const HourlySalaryCalculator = periodTool('hour', { amount: 100_000, period: 'month' });

type DailyValues = { monthly: number; basis: string; absent: number };
export const DailySalaryCalculator = createFormTool<DailyValues>({
  fields: [
    {
      name: 'monthly',
      label: 'Monthly salary',
      type: 'currency',
      default: 50_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'basis',
      label: 'Days used to calculate per-day pay',
      type: 'select',
      default: '30',
      options: [
        { value: '30', label: '30 days (calendar month, common)' },
        { value: '26', label: '26 days (excluding Sundays)' },
        { value: '22', label: '22 working days (5-day week)' },
        { value: '31', label: '31 days' },
      ],
    },
    {
      name: 'absent',
      label: 'Days of unpaid leave (LOP)',
      type: 'number',
      default: 0,
      min: 0,
      max: 31,
      unit: 'days',
    },
  ],
  compute: (v) => {
    const days = Number(v.basis);
    const daily = v.monthly / days;
    const lop = daily * v.absent;
    return {
      results: [
        { label: 'Daily salary', value: formatINR(daily, 2), primary: true },
        { label: 'Hourly (8-hour day)', value: formatINR(daily / 8, 2) },
        { label: 'Loss of pay deduction', value: formatINR(lop), hint: `${v.absent} day(s)` },
        { label: 'Salary after LOP', value: formatINR(Math.max(0, v.monthly - lop)) },
      ],
    };
  },
});

type FreelanceValues = {
  income: number;
  expenses: number;
  taxPct: number;
  hours: number;
  weeksOff: number;
  billablePct: number;
};
export const FreelanceHourlyRateCalculator = createFormTool<FreelanceValues>({
  fields: [
    {
      name: 'income',
      label: 'Desired annual take-home income',
      type: 'currency',
      default: 1_500_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'expenses',
      label: 'Annual business expenses',
      type: 'currency',
      default: 150_000,
      min: 0,
      max: 1e10,
      help: 'Software, equipment, internet, insurance, co-working…',
    },
    {
      name: 'taxPct',
      label: 'Effective income tax rate',
      type: 'percent',
      default: 10,
      min: 0,
      max: 60,
    },
    {
      name: 'hours',
      label: 'Working hours per week',
      type: 'number',
      default: 40,
      min: 1,
      max: 100,
      unit: 'hours',
    },
    {
      name: 'billablePct',
      label: 'Billable share of hours',
      type: 'percent',
      default: 70,
      min: 5,
      max: 100,
      help: 'Time spent on admin, sales and learning is not billable.',
    },
    {
      name: 'weeksOff',
      label: 'Weeks off per year',
      type: 'number',
      default: 6,
      min: 0,
      max: 50,
      unit: 'weeks',
    },
  ],
  validate: (v) =>
    v.taxPct >= 100 ? { field: 'taxPct', message: 'Tax rate must be below 100%.' } : null,
  compute: (v) => {
    const billableHours = v.hours * (v.billablePct / 100) * (52 - v.weeksOff);
    if (billableHours <= 0)
      throw new InputError('You need at least some billable hours.', 'weeksOff');
    const revenueNeeded = v.income / (1 - v.taxPct / 100) + v.expenses;
    const hourly = revenueNeeded / billableHours;
    return {
      results: [
        {
          label: 'Minimum hourly rate',
          value: formatINR(Math.ceil(hourly)),
          primary: true,
          hint: 'Before GST',
        },
        { label: 'Day rate (8 hours)', value: formatINR(Math.ceil(hourly * 8)) },
        { label: 'Annual revenue needed', value: formatINR(revenueNeeded) },
        { label: 'Billable hours per year', value: formatNumber(billableHours, 0) },
      ],
      notes: [
        'Add 18% GST on invoices if your turnover crosses the GST registration threshold (₹20 lakh for services in most states).',
      ],
    };
  },
});

// ---------------------------------------------------------------- Gratuity, EPF, PF
type GratuityValues = { salary: number; years: number; months: number; covered: string };
export const GratuityCalculator = createFormTool<GratuityValues>({
  fields: [
    {
      name: 'salary',
      label: 'Last drawn basic + DA (monthly)',
      type: 'currency',
      default: 60_000,
      min: 1,
      max: 1e9,
    },
    {
      name: 'years',
      label: 'Years of service',
      type: 'number',
      default: 10,
      min: 0,
      max: 60,
      integer: true,
      unit: 'years',
    },
    {
      name: 'months',
      label: 'Additional months',
      type: 'number',
      default: 7,
      min: 0,
      max: 11,
      integer: true,
      unit: 'months',
    },
    {
      name: 'covered',
      label: 'Employer covered under Gratuity Act?',
      type: 'segmented',
      default: 'yes',
      options: [
        { value: 'yes', label: 'Yes (10+ employees)' },
        { value: 'no', label: 'No' },
      ],
    },
  ],
  compute: (v) => {
    const g = gratuity(v.salary, v.years, v.months, v.covered === 'yes');
    return {
      results: [
        {
          label: 'Gratuity amount',
          value: formatINR(g.amount),
          primary: true,
          hint: `for ${g.countedYears} counted years`,
        },
        {
          label: 'Tax-exempt portion',
          value: formatINR(g.exempt),
          hint: `Cap ₹${formatNumber(CURRENT_RULES.gratuity.exemptionCap)}`,
        },
        { label: 'Taxable portion', value: formatINR(g.taxable) },
        {
          label: 'Eligible under the Act?',
          value: g.eligible ? 'Yes' : 'Not yet',
          hint: 'Requires 5 years of continuous service (except death/disability)',
        },
      ],
    };
  },
});

type EpfValues = {
  basic: number;
  age: number;
  retireAge: number;
  growth: number;
  rate: number;
  balance: number;
  vpf: number;
  mode: string;
};
export const EpfCalculator = createFormTool<EpfValues>({
  fields: [
    {
      name: 'basic',
      label: 'Monthly basic + DA',
      type: 'currency',
      default: 30_000,
      min: 1000,
      max: 1e8,
    },
    {
      name: 'age',
      label: 'Current age',
      type: 'number',
      default: 28,
      min: 18,
      max: 57,
      integer: true,
      unit: 'years',
    },
    {
      name: 'retireAge',
      label: 'Retirement age',
      type: 'number',
      default: 58,
      min: 40,
      max: 60,
      integer: true,
      unit: 'years',
    },
    {
      name: 'balance',
      label: 'Current EPF balance',
      type: 'currency',
      default: 200_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'growth',
      label: 'Annual salary increase',
      type: 'percent',
      default: 7,
      min: 0,
      max: 30,
    },
    {
      name: 'rate',
      label: 'EPF interest rate',
      type: 'percent',
      default: CURRENT_RULES.epf.interestPct,
      min: 0,
      max: 15,
    },
    {
      name: 'vpf',
      label: 'Voluntary PF (VPF)',
      type: 'percent',
      default: 0,
      min: 0,
      max: 88,
      help: '% of basic, in addition to the mandatory 12%.',
    },
    {
      name: 'mode',
      label: 'Contribution basis',
      type: 'select',
      default: 'full',
      options: PF_OPTIONS.filter((o) => o.value !== 'none'),
    },
  ],
  compute: (v) => {
    const r = epfCorpus({
      basicDa: v.basic,
      age: v.age,
      retireAge: v.retireAge,
      growthPct: v.growth,
      ratePct: v.rate,
      balance: v.balance,
      vpfPct: v.vpf,
      mode: v.mode as PfMode,
    });
    return {
      results: [
        {
          label: `EPF corpus at ${v.retireAge}`,
          value: formatINR(r.corpus),
          primary: true,
          hint: formatLakhCrore(r.corpus),
        },
        { label: 'Your contributions', value: formatINR(r.totalEmployee) },
        { label: "Employer's contributions (EPF)", value: formatINR(r.totalEmployer) },
        { label: 'Interest earned', value: formatINR(r.totalInterest) },
      ],
      notes: [
        'The employer’s 8.33% EPS share goes to the pension scheme and is not part of this corpus.',
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Opening balance', value: v.balance },
          { label: 'Your contribution', value: r.totalEmployee },
          { label: 'Employer', value: r.totalEmployer },
          { label: 'Interest', value: r.totalInterest },
        ],
        format: 'inr',
      },
      table: {
        title: 'Year-wise EPF balance',
        columns: ['Year', 'Age', 'Contribution', 'Interest', 'Balance'],
        rows: r.rows.map((x) => [
          `Year ${x.year}`,
          String(x.age),
          formatINR(x.contribution),
          formatINR(x.interest),
          formatINR(x.balance),
        ]),
      },
    };
  },
});

type PfValues = { basic: number; mode: string; vpf: number };
export const PfCalculator = createFormTool<PfValues>({
  fields: [
    {
      name: 'basic',
      label: 'Monthly basic + DA',
      type: 'currency',
      default: 30_000,
      min: 0,
      max: 1e8,
    },
    {
      name: 'mode',
      label: 'Contribution basis',
      type: 'select',
      default: 'capped',
      options: PF_OPTIONS.filter((o) => o.value !== 'none'),
    },
    { name: 'vpf', label: 'Voluntary PF (VPF)', type: 'percent', default: 0, min: 0, max: 88 },
  ],
  compute: (v) => {
    const c = pfContribution(v.basic, v.mode as PfMode, v.vpf);
    const toAccount = c.employee + c.vpf + c.employerEpf;
    return {
      results: [
        {
          label: 'Total monthly PF deposit',
          value: formatINR(toAccount),
          primary: true,
          hint: 'Credited to your EPF account',
        },
        { label: 'Employee share (12%)', value: formatINR(c.employee) },
        ...(c.vpf ? [{ label: 'VPF', value: formatINR(c.vpf) }] : []),
        { label: 'Employer share to EPF', value: formatINR(c.employerEpf) },
        { label: 'Employer share to EPS (pension)', value: formatINR(c.eps) },
        { label: 'Yearly EPF deposit', value: formatINR(toAccount * 12) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Employee', value: c.employee + c.vpf },
          { label: 'Employer EPF', value: c.employerEpf },
          { label: 'EPS', value: c.eps },
        ],
        format: 'inr',
      },
    };
  },
});

type EmpValues = { gross: number; basic: number; mode: string; vpf: number; pt: number };
export const EmployeeContributionCalculator = createFormTool<EmpValues>({
  fields: [
    {
      name: 'gross',
      label: 'Monthly gross salary',
      type: 'currency',
      default: 40_000,
      min: 0,
      max: 1e8,
    },
    {
      name: 'basic',
      label: 'Monthly basic + DA',
      type: 'currency',
      default: 20_000,
      min: 0,
      max: 1e8,
    },
    { name: 'mode', label: 'PF basis', type: 'select', default: 'capped', options: PF_OPTIONS },
    { name: 'vpf', label: 'Voluntary PF', type: 'percent', default: 0, min: 0, max: 88 },
    {
      name: 'pt',
      label: 'Professional tax (monthly)',
      type: 'currency',
      default: 200,
      min: 0,
      max: 300,
    },
  ],
  validate: (v) =>
    v.basic > v.gross ? { field: 'basic', message: 'Basic cannot exceed gross salary.' } : null,
  compute: (v) => {
    const pf = pfContribution(v.basic, v.mode as PfMode, v.vpf);
    const esi = esiContribution(v.gross);
    const total = pf.employee + pf.vpf + esi.employee + v.pt;
    return {
      results: [
        {
          label: 'Total employee deductions',
          value: formatINR(total),
          primary: true,
          hint: 'per month',
        },
        { label: 'Employee PF (12%)', value: formatINR(pf.employee) },
        ...(pf.vpf ? [{ label: 'VPF', value: formatINR(pf.vpf) }] : []),
        {
          label: 'ESI (0.75%)',
          value: esi.applicable ? formatINR(esi.employee) : 'Not applicable',
          hint: esi.applicable ? undefined : 'Gross above ₹21,000',
        },
        { label: 'Professional tax', value: formatINR(v.pt) },
        {
          label: 'Salary after these deductions',
          value: formatINR(v.gross - total),
          hint: 'Before income tax',
        },
      ],
    };
  },
});

type EmployerValues = { gross: number; basic: number; mode: string; gratuity: boolean };
export const EmployerContributionCalculator = createFormTool<EmployerValues>({
  fields: [
    {
      name: 'gross',
      label: 'Monthly gross salary',
      type: 'currency',
      default: 40_000,
      min: 0,
      max: 1e8,
    },
    {
      name: 'basic',
      label: 'Monthly basic + DA',
      type: 'currency',
      default: 20_000,
      min: 0,
      max: 1e8,
    },
    { name: 'mode', label: 'PF basis', type: 'select', default: 'capped', options: PF_OPTIONS },
    {
      name: 'gratuity',
      label: 'Include gratuity provision (4.81% of basic)',
      type: 'toggle',
      default: true,
    },
  ],
  validate: (v) =>
    v.basic > v.gross ? { field: 'basic', message: 'Basic cannot exceed gross salary.' } : null,
  compute: (v) => {
    const pf = pfContribution(v.basic, v.mode as PfMode);
    const esi = esiContribution(v.gross);
    const grat = v.gratuity ? round((v.basic * 4.81) / 100, 0) : 0;
    const total = pf.employerCost + esi.employer + grat;
    return {
      results: [
        { label: 'Employer cost over gross (monthly)', value: formatINR(total), primary: true },
        {
          label: 'Monthly cost to company',
          value: formatINR(v.gross + total),
          hint: `${formatINR((v.gross + total) * 12)} per year`,
        },
        { label: 'EPF (3.67%)', value: formatINR(pf.employerEpf) },
        { label: 'EPS (8.33%, max ₹1,250)', value: formatINR(pf.eps) },
        { label: 'EDLI + admin charges', value: formatINR(pf.edli + pf.admin) },
        {
          label: 'ESI (3.25%)',
          value: esi.applicable ? formatINR(esi.employer) : 'Not applicable',
        },
        ...(v.gratuity ? [{ label: 'Gratuity provision', value: formatINR(grat) }] : []),
      ],
    };
  },
});

// ---------------------------------------------------------------- HRA, bonus, leave, notice, experience
type HraValues = { basic: number; da: number; hra: number; rent: number; metro: string };
export const HraCalculator = createFormTool<HraValues>({
  fields: [
    {
      name: 'basic',
      label: 'Monthly basic salary',
      type: 'currency',
      default: 50_000,
      min: 0,
      max: 1e8,
    },
    {
      name: 'da',
      label: 'Monthly dearness allowance',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e8,
    },
    {
      name: 'hra',
      label: 'Monthly HRA received',
      type: 'currency',
      default: 20_000,
      min: 0,
      max: 1e8,
    },
    {
      name: 'rent',
      label: 'Monthly rent paid',
      type: 'currency',
      default: 18_000,
      min: 0,
      max: 1e8,
    },
    {
      name: 'metro',
      label: 'City',
      type: 'segmented',
      default: 'metro',
      full: true,
      options: [
        { value: 'metro', label: 'Delhi/Mumbai/Kolkata/Chennai' },
        { value: 'non', label: 'Other city' },
      ],
    },
  ],
  compute: (v) => {
    const salary = v.basic + v.da;
    const limits = [
      { label: 'Actual HRA received', value: v.hra },
      { label: 'Rent paid − 10% of salary', value: Math.max(0, v.rent - salary * 0.1) },
      {
        label: `${v.metro === 'metro' ? '50' : '40'}% of basic + DA`,
        value: salary * (v.metro === 'metro' ? 0.5 : 0.4),
      },
    ];
    const exempt = Math.min(...limits.map((l) => l.value));
    return {
      results: [
        {
          label: 'HRA exemption (monthly)',
          value: formatINR(exempt),
          primary: true,
          hint: `${formatINR(exempt * 12)} per year`,
        },
        {
          label: 'Taxable HRA (monthly)',
          value: formatINR(v.hra - exempt),
          hint: `${formatINR((v.hra - exempt) * 12)} per year`,
        },
        ...limits.map((l) => ({
          label: l.label,
          value: formatINR(l.value),
          hint: l.value === exempt ? 'Lowest – this is your exemption' : undefined,
        })),
      ],
      notes: [
        'HRA exemption is available only in the old tax regime.',
        'If annual rent exceeds ₹1 lakh, your landlord’s PAN is required.',
      ],
    };
  },
});

type BonusValues = {
  mode: string;
  wage: number;
  minWage: number;
  months: number;
  pct: number;
  ctc: number;
  perfPct: number;
  slab: string;
};
export const BonusCalculator = createFormTool<BonusValues>({
  fields: [
    {
      name: 'mode',
      label: 'Bonus type',
      type: 'segmented',
      default: 'statutory',
      full: true,
      options: [
        { value: 'statutory', label: 'Statutory (Bonus Act)' },
        { value: 'performance', label: 'Performance bonus' },
      ],
    },
    {
      name: 'wage',
      label: 'Monthly basic + DA',
      type: 'currency',
      default: 15_000,
      min: 0,
      max: 1e8,
      showIf: (v) => v.mode === 'statutory',
    },
    {
      name: 'minWage',
      label: 'Applicable monthly minimum wage',
      type: 'currency',
      default: 0,
      min: 0,
      max: 100_000,
      showIf: (v) => v.mode === 'statutory',
      help: 'Optional. Used if higher than ₹7,000.',
    },
    {
      name: 'months',
      label: 'Months worked in the year',
      type: 'number',
      default: 12,
      min: 1,
      max: 12,
      integer: true,
      unit: 'months',
      showIf: (v) => v.mode === 'statutory',
    },
    {
      name: 'pct',
      label: 'Bonus rate',
      type: 'percent',
      default: 8.33,
      min: 8.33,
      max: 20,
      showIf: (v) => v.mode === 'statutory',
      help: 'Minimum 8.33%, maximum 20%.',
    },
    {
      name: 'ctc',
      label: 'Annual CTC / base salary',
      type: 'currency',
      default: 1_200_000,
      min: 0,
      max: 1e10,
      showIf: (v) => v.mode === 'performance',
    },
    {
      name: 'perfPct',
      label: 'Bonus (% of CTC)',
      type: 'percent',
      default: 10,
      min: 0,
      max: 500,
      showIf: (v) => v.mode === 'performance',
    },
    {
      name: 'slab',
      label: 'Your marginal tax rate',
      type: 'select',
      default: '20',
      options: ['0', '5', '10', '15', '20', '25', '30'].map((r) => ({ value: r, label: `${r}%` })),
      showIf: (v) => v.mode === 'performance',
    },
  ],
  compute: (v) => {
    if (v.mode === 'statutory') {
      if (v.wage > 21_000)
        throw new InputError(
          'The Payment of Bonus Act covers employees earning up to ₹21,000 per month.',
          'wage',
        );
      // Sec 12: bonus is computed on actual wage, capped at ₹7,000 or the minimum wage, whichever is higher.
      const base = Math.min(v.wage, Math.max(7000, v.minWage));
      const bonus = (base * v.months * v.pct) / 100;
      return {
        results: [
          { label: 'Statutory bonus', value: formatINR(bonus), primary: true },
          {
            label: 'Wage used for calculation',
            value: formatINR(base),
            hint: 'Actual wage, capped at ₹7,000 or the minimum wage (whichever is higher)',
          },
          { label: 'Maximum bonus at 20%', value: formatINR((base * v.months * 20) / 100) },
        ],
        notes: [
          'Enter your scheduled-employment minimum wage if it is above ₹7,000; the cap then rises to that wage.',
        ],
      };
    }
    const bonus = (v.ctc * v.perfPct) / 100;
    const tax = (bonus * Number(v.slab) * 1.04) / 100;
    return {
      results: [
        { label: 'Bonus amount', value: formatINR(bonus), primary: true },
        { label: 'Estimated tax on bonus', value: formatINR(tax), hint: `at ${v.slab}% + 4% cess` },
        { label: 'Bonus after tax', value: formatINR(bonus - tax) },
      ],
    };
  },
});

type LeaveValues = {
  salary: number;
  days: number;
  divisor: string;
  years: number;
  retirement: boolean;
};
export const LeaveEncashmentCalculator = createFormTool<LeaveValues>({
  fields: [
    {
      name: 'salary',
      label: 'Monthly basic + DA',
      type: 'currency',
      default: 60_000,
      min: 1,
      max: 1e8,
    },
    {
      name: 'days',
      label: 'Leave days to encash',
      type: 'number',
      default: 45,
      min: 0,
      max: 1000,
      unit: 'days',
    },
    {
      name: 'divisor',
      label: 'Per-day salary based on',
      type: 'select',
      default: '30',
      options: [
        { value: '30', label: '30 days a month' },
        { value: '26', label: '26 working days' },
      ],
    },
    {
      name: 'retirement',
      label: 'Encashment on retirement or resignation',
      type: 'toggle',
      default: true,
      help: 'Encashment during service is fully taxable.',
    },
    {
      name: 'years',
      label: 'Completed years of service',
      type: 'number',
      default: 15,
      min: 0,
      max: 60,
      integer: true,
      unit: 'years',
      showIf: (v) => v.retirement,
    },
  ],
  compute: (v) => {
    const amount = (v.salary / Number(v.divisor)) * v.days;
    const results: ResultItem[] = [
      { label: 'Leave encashment amount', value: formatINR(amount), primary: true },
    ];
    if (v.retirement) {
      const cap = CURRENT_RULES.leaveEncashment.exemptionCap;
      const maxDays = Math.min(v.days, v.years * 30);
      const limits = [amount, cap, v.salary * 10, (v.salary / 30) * maxDays];
      const exempt = Math.min(...limits);
      results.push({
        label: 'Tax-exempt (non-government)',
        value: formatINR(exempt),
        hint: 'Least of actual, ₹25 lakh, 10 months’ salary and 30 days per year of service',
      });
      results.push({ label: 'Taxable amount', value: formatINR(amount - exempt) });
    } else {
      results.push({
        label: 'Taxable amount',
        value: formatINR(amount),
        hint: 'Fully taxable during service',
      });
    }
    return { results, notes: ['Government employees get full exemption on retirement.'] };
  },
});

type NoticeValues = {
  resign: string;
  length: number;
  unit: string;
  served: number;
  monthly: number;
};
export const NoticePeriodCalculator = createFormTool<NoticeValues>({
  fields: [
    { name: 'resign', label: 'Resignation date', type: 'date', default: () => todayISO() },
    {
      name: 'length',
      label: 'Notice period',
      type: 'number',
      default: 60,
      min: 1,
      max: 365,
      integer: true,
      unit: (v) => String(v.unit),
    },
    {
      name: 'unit',
      label: 'Notice period in',
      type: 'segmented',
      default: 'days',
      options: [
        { value: 'days', label: 'Days' },
        { value: 'months', label: 'Months' },
      ],
    },
    {
      name: 'served',
      label: 'Days you will actually serve',
      type: 'number',
      default: 0,
      min: 0,
      max: 365,
      integer: true,
      optional: true,
      help: 'Leave 0 to serve the full notice.',
    },
    {
      name: 'monthly',
      label: 'Monthly gross salary (for buyout)',
      type: 'currency',
      default: 100_000,
      min: 0,
      max: 1e9,
    },
  ],
  compute: (v) => {
    const start = parseISODate(v.resign, 'Resignation date');
    const lastDay =
      v.unit === 'days' ? addDays(start, v.length - 1) : addDays(addMonths(start, v.length), -1);
    const totalDays = Math.round((lastDay.getTime() - start.getTime()) / 86_400_000) + 1;
    const served = v.served > 0 ? Math.min(v.served, totalDays) : totalDays;
    const shortfall = totalDays - served;
    const buyout = (v.monthly / 30) * shortfall;
    return {
      results: [
        {
          label: 'Last working day',
          value: formatLongDate(served < totalDays ? addDays(start, served - 1) : lastDay),
          primary: true,
        },
        { label: 'Full notice ends on', value: formatLongDate(lastDay) },
        { label: 'Notice period length', value: `${totalDays} days` },
        {
          label: 'Notice buyout / shortfall recovery',
          value: formatINR(buyout),
          hint: shortfall ? `${shortfall} unserved day(s) at gross/30` : 'No shortfall',
        },
      ],
      notes: [
        'Your employment contract decides whether notice is counted in calendar days and whether leave can be adjusted.',
      ],
    };
  },
});

type ExpValues = {
  s1: string;
  e1: string;
  s2: string;
  e2: string;
  s3: string;
  e3: string;
  s4: string;
  e4: string;
};
const jobFields: Field<ExpValues>[] = [1, 2, 3, 4].flatMap((n) => [
  {
    name: `s${n}` as keyof ExpValues & string,
    label: `Job ${n} – start date`,
    type: 'date' as const,
    default: n === 1 ? '2018-07-01' : n === 2 ? '2021-04-12' : '',
    optional: n > 1,
  },
  {
    name: `e${n}` as keyof ExpValues & string,
    label: `Job ${n} – end date`,
    type: 'date' as const,
    default: n === 1 ? '2021-03-31' : n === 2 ? todayISO() : '',
    optional: n > 1,
    help: n === 1 ? 'Use today’s date for your current job.' : undefined,
  },
]);
export const ExperienceCalculator = createFormTool<ExpValues>({
  fields: jobFields,
  compute: (v) => {
    const intervals = [];
    const rows: string[][] = [];
    for (const n of [1, 2, 3, 4]) {
      const s = v[`s${n}` as keyof ExpValues];
      const e = v[`e${n}` as keyof ExpValues];
      if (!s && !e) continue;
      if (!s || !e)
        throw new InputError(
          `Enter both start and end dates for job ${n}.`,
          `${!s ? 's' : 'e'}${n}`,
        );
      const start = parseISODate(s, `Job ${n} start date`);
      const end = parseISODate(e, `Job ${n} end date`);
      if (end < start) throw new InputError(`Job ${n} end date is before its start date.`, `e${n}`);
      intervals.push({ start, end });
      rows.push([
        `Job ${n}`,
        toISODate(start),
        toISODate(end),
        formatYMD(diffYMD(start, addDays(end, 1))),
      ]);
    }
    if (!intervals.length) throw new InputError('Enter at least one job.', 's1');
    const days = mergedDays(intervals);
    const years = days / 365.25;
    const whole = Math.floor(years);
    const months = Math.floor((years - whole) * 12);
    return {
      results: [
        {
          label: 'Total experience',
          value: `${whole} years ${months} months`,
          primary: true,
          hint: 'Overlapping periods counted once',
        },
        { label: 'In decimal years', value: `${formatNumber(years, 1)} years` },
        { label: 'Total days', value: formatNumber(days, 0) },
      ],
      table: { columns: ['Job', 'Start', 'End', 'Duration'], rows },
    };
  },
});

// ---------------------------------------------------------------- Offer comparison & breakup
type OfferValues = {
  aCtc: number;
  aVar: number;
  aBonus: number;
  bCtc: number;
  bVar: number;
  bBonus: number;
  basicPct: number;
  regime: string;
};
export const OfferComparisonCalculator = createFormTool<OfferValues>({
  fields: [
    {
      name: 'aCtc',
      label: 'Offer A – annual CTC',
      type: 'currency',
      default: 1_800_000,
      min: 10_000,
      max: 1e10,
    },
    {
      name: 'aVar',
      label: 'Offer A – variable pay',
      type: 'currency',
      default: 180_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'aBonus',
      label: 'Offer A – joining bonus',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e10,
    },
    {
      name: 'bCtc',
      label: 'Offer B – annual CTC',
      type: 'currency',
      default: 1_700_000,
      min: 10_000,
      max: 1e10,
    },
    {
      name: 'bVar',
      label: 'Offer B – variable pay',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e10,
    },
    {
      name: 'bBonus',
      label: 'Offer B – joining bonus',
      type: 'currency',
      default: 100_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'basicPct',
      label: 'Basic (% of fixed pay) – both',
      type: 'percent',
      default: 50,
      min: 10,
      max: 90,
    },
    {
      name: 'regime',
      label: 'Tax regime',
      type: 'segmented',
      default: 'new',
      options: REGIME_OPTIONS,
    },
  ],
  compute: (v) => {
    const calc = (ctc: number, variable: number) =>
      ctcToInHand({
        ctc,
        basicPct: v.basicPct,
        hraPctOfBasic: 40,
        pfMode: 'capped',
        includeGratuity: true,
        variablePay: variable,
        professionalTax: 2500,
        regime: v.regime as 'new' | 'old',
      });
    const a = calc(v.aCtc, v.aVar);
    const b = calc(v.bCtc, v.bVar);
    const aYear1 = a.annualInHand + v.aBonus * 0.7;
    const bYear1 = b.annualInHand + v.bBonus * 0.7;
    const better =
      a.monthlyFixedInHand === b.monthlyFixedInHand
        ? 'Equal'
        : a.monthlyFixedInHand > b.monthlyFixedInHand
          ? 'Offer A'
          : 'Offer B';
    return {
      results: [
        {
          label: 'Higher fixed monthly take-home',
          value: better,
          primary: true,
          hint: `Difference ${formatINR(Math.abs(a.monthlyFixedInHand - b.monthlyFixedInHand))} per month`,
        },
        { label: 'Offer A – fixed monthly in-hand', value: formatINR(a.monthlyFixedInHand) },
        { label: 'Offer B – fixed monthly in-hand', value: formatINR(b.monthlyFixedInHand) },
        {
          label: 'Offer A – first-year cash (approx.)',
          value: formatINR(aYear1),
          hint: 'Take-home incl. full variable and joining bonus after ~30% tax',
        },
        { label: 'Offer B – first-year cash (approx.)', value: formatINR(bYear1) },
      ],
      chart: {
        kind: 'bars',
        labels: ['Offer A', 'Offer B'],
        series: [
          {
            name: 'Fixed take-home',
            values: [a.monthlyFixedInHand * 12, b.monthlyFixedInHand * 12],
          },
          {
            name: 'Variable & joining bonus',
            values: [aYear1 - a.monthlyFixedInHand * 12, bYear1 - b.monthlyFixedInHand * 12],
          },
        ],
        stacked: true,
        format: 'inr',
      },
      notes: [
        'Also weigh ESOPs, insurance, commute, growth and work-life balance — they are not captured here.',
      ],
    };
  },
});

type BreakupValues = {
  ctc: number;
  basicPct: number;
  hraPct: number;
  lta: number;
  pf: string;
  gratuity: boolean;
  variable: number;
};
export const SalaryBreakupCalculator = createFormTool<BreakupValues>({
  fields: [
    {
      name: 'ctc',
      label: 'Annual CTC',
      type: 'currency',
      default: 1_000_000,
      min: 10_000,
      max: 1e10,
    },
    {
      name: 'basicPct',
      label: 'Basic (% of fixed CTC)',
      type: 'percent',
      default: 50,
      min: 10,
      max: 90,
      help: 'Labour codes require basic to be at least 50% of wages.',
    },
    { name: 'hraPct', label: 'HRA (% of basic)', type: 'percent', default: 40, min: 0, max: 60 },
    {
      name: 'lta',
      label: 'Leave travel allowance (annual)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e8,
    },
    {
      name: 'variable',
      label: 'Variable pay (annual)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e10,
    },
    { name: 'pf', label: 'Provident fund', type: 'select', default: 'capped', options: PF_OPTIONS },
    { name: 'gratuity', label: 'Gratuity included in CTC', type: 'toggle', default: true },
  ],
  compute: (v) => {
    const fixed = v.ctc - v.variable;
    if (fixed <= 0) throw new InputError('Variable pay must be less than CTC.', 'variable');
    const basic = (fixed * v.basicPct) / 100;
    const hra = (basic * v.hraPct) / 100;
    const pf = pfContribution(basic / 12, v.pf as PfMode);
    const employerPf = pf.employerTotal * 12;
    const grat = v.gratuity ? round((basic * 4.81) / 100, 0) : 0;
    const special = fixed - basic - hra - v.lta - employerPf - grat;
    if (special < 0)
      throw new InputError(
        'Components exceed the fixed CTC. Reduce basic, HRA or LTA.',
        'basicPct',
      );
    const rows: [string, number][] = [
      ['Basic salary', basic],
      ['House rent allowance (HRA)', hra],
      ...(v.lta ? ([['Leave travel allowance', v.lta]] as [string, number][]) : []),
      ['Special allowance', special],
      ['Employer PF', employerPf],
      ...(grat ? ([['Gratuity', grat]] as [string, number][]) : []),
      ...(v.variable ? ([['Variable pay', v.variable]] as [string, number][]) : []),
    ];
    const gross = basic + hra + v.lta + special + v.variable;
    return {
      results: [
        {
          label: 'Monthly gross salary',
          value: formatINR((gross - v.variable) / 12),
          primary: true,
          hint: 'Fixed components paid monthly',
        },
        { label: 'Basic (monthly)', value: formatINR(basic / 12) },
        { label: 'HRA (monthly)', value: formatINR(hra / 12) },
        { label: 'Special allowance (monthly)', value: formatINR(special / 12) },
        { label: 'Employee PF (monthly)', value: formatINR(pf.employee) },
      ],
      chart: {
        kind: 'donut',
        title: 'CTC composition',
        data: rows.map(([label, value]) => ({ label, value })),
        format: 'inr',
      },
      table: {
        title: 'Salary breakup',
        columns: ['Component', 'Monthly', 'Annual', '% of CTC'],
        rows: [
          ...rows.map(([l, a]) => [
            l,
            formatINR(a / 12),
            formatINR(a),
            formatPercent((a / v.ctc) * 100, 1),
          ]),
          ['Total CTC', formatINR(v.ctc / 12), formatINR(v.ctc), '100%'],
        ],
        initialRows: 20,
      },
    };
  },
});
