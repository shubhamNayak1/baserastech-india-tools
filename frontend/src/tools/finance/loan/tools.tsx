import { createFormTool } from '@/components/form-tool/FormTool';
import type { Field, ResultItem, ToolResult } from '@/components/form-tool/types';
import {
  formatDuration,
  formatINR,
  formatLakhCrore,
  formatNumber,
  formatPercent,
} from '@/utils/format';
import { InputError, round } from '@/utils/number';
import { addMonths, todayISO, parseISODate } from '@/utils/date';
import {
  amortizationSchedule,
  loanSummary,
  principalForEmi,
  tenureForEmi,
  tenureMonths,
  totals,
  yearlySummary,
  type ScheduleRow,
} from './engine';

type LoanValues = { amount: number; rate: number; tenure: number; unit: string; fee: number | '' };

const tenureUnit: Field<LoanValues> = {
  name: 'unit',
  label: 'Tenure in',
  type: 'segmented',
  default: 'years',
  options: [
    { value: 'years', label: 'Years' },
    { value: 'months', label: 'Months' },
  ],
};

function loanFields(d: {
  amount: number;
  rate: number;
  tenure: number;
  maxYears: number;
  label?: string;
}): Field<LoanValues>[] {
  return [
    {
      name: 'amount',
      label: d.label ?? 'Loan amount',
      type: 'currency',
      default: d.amount,
      min: 1000,
      max: 1e11,
      exclusiveMin: false,
    },
    {
      name: 'rate',
      label: 'Interest rate (p.a.)',
      type: 'percent',
      default: d.rate,
      min: 0,
      max: 50,
      step: 0.05,
    },
    {
      name: 'tenure',
      label: 'Loan tenure',
      type: 'number',
      default: d.tenure,
      min: 1,
      max: d.maxYears * 12,
      unit: (v) => (v.unit === 'months' ? 'months' : 'years'),
      help: `Up to ${d.maxYears} years.`,
    },
    tenureUnit,
  ];
}

function yearlyChart(rows: ScheduleRow[]) {
  const y = yearlySummary(rows);
  return {
    kind: 'bars' as const,
    title: 'Principal vs interest paid each year',
    labels: y.map((r) => `Y${r.year}`),
    series: [
      { name: 'Principal', values: y.map((r) => r.principal) },
      { name: 'Interest', values: y.map((r) => r.interest) },
    ],
    stacked: true,
    format: 'inr' as const,
  };
}

function yearlyTable(rows: ScheduleRow[]) {
  const y = yearlySummary(rows);
  return {
    title: 'Year-wise repayment schedule',
    columns: [
      'Year',
      'Principal',
      'Interest',
      ...(y.some((r) => r.prepayment) ? ['Prepayment'] : []),
      'Balance',
    ],
    rows: y.map((r) => [
      `Year ${r.year}`,
      formatINR(r.principal),
      formatINR(r.interest),
      ...(y.some((x) => x.prepayment) ? [formatINR(r.prepayment)] : []),
      formatINR(r.closing),
    ]),
    initialRows: 10,
  };
}

function monthsFrom(v: { tenure: number; unit: string }) {
  const m = tenureMonths(v.tenure, v.unit);
  if (m > 600) throw new InputError('Tenure cannot exceed 50 years.', 'tenure');
  if (m < 1) throw new InputError('Tenure must be at least 1 month.', 'tenure');
  return m;
}

function emiResult(v: LoanValues, extra: { feeLabel?: boolean } = {}): ToolResult {
  const months = monthsFrom(v);
  const s = loanSummary(v.amount, v.rate, months);
  const rows = amortizationSchedule(v.amount, v.rate, months);
  const results: ResultItem[] = [
    {
      label: 'Monthly EMI',
      value: formatINR(s.emi),
      primary: true,
      hint: `for ${formatDuration(months)}`,
    },
    { label: 'Principal amount', value: formatINR(v.amount) },
    { label: 'Total interest', value: formatINR(s.totalInterest) },
    {
      label: 'Total payment',
      value: formatINR(s.totalPayment),
      hint: formatLakhCrore(s.totalPayment),
    },
  ];
  if (extra.feeLabel && typeof v.fee === 'number' && v.fee > 0) {
    const fee = round((v.amount * v.fee) / 100, 0);
    results.push({ label: 'Processing fee (+18% GST)', value: formatINR(fee * 1.18) });
    results.push({
      label: 'Total cost of loan',
      value: formatINR(s.totalInterest + fee * 1.18),
      hint: 'Interest + processing fee incl. GST',
    });
  }
  return {
    results,
    summary: `EMI ${formatINR(s.emi)}`,
    chart: {
      kind: 'donut',
      title: 'Total payment breakdown',
      data: [
        { label: 'Principal', value: v.amount },
        { label: 'Interest', value: s.totalInterest },
      ],
      format: 'inr',
    },
    table: yearlyTable(rows),
    notes:
      s.totalInterest > v.amount
        ? [
            'You will pay more in interest than the amount borrowed. A shorter tenure or prepayments can reduce this.',
          ]
        : undefined,
  };
}

function makeEmiTool(d: {
  amount: number;
  rate: number;
  tenure: number;
  maxYears: number;
  fee?: number;
}) {
  const fields = loanFields(d);
  if (d.fee !== undefined) {
    fields.push({
      name: 'fee',
      label: 'Processing fee',
      type: 'percent',
      default: d.fee,
      min: 0,
      max: 10,
      optional: true,
      help: 'Percentage of loan amount charged upfront.',
    });
  }
  return createFormTool<LoanValues>({
    fields,
    compute: (v) => emiResult(v, { feeLabel: d.fee !== undefined }),
  });
}

export const EmiCalculator = makeEmiTool({
  amount: 5_000_000,
  rate: 8.5,
  tenure: 20,
  maxYears: 40,
});
export const HomeLoanEmiCalculator = makeEmiTool({
  amount: 5_000_000,
  rate: 8.5,
  tenure: 20,
  maxYears: 30,
  fee: 0.5,
});
export const PersonalLoanEmiCalculator = makeEmiTool({
  amount: 500_000,
  rate: 11,
  tenure: 3,
  maxYears: 7,
  fee: 2,
});

type CarValues = { price: number; down: number; rate: number; tenure: number; unit: string };
export const CarLoanEmiCalculator = createFormTool<CarValues>({
  fields: [
    {
      name: 'price',
      label: 'On-road price of car',
      type: 'currency',
      default: 1_000_000,
      min: 10_000,
      max: 1e9,
    },
    { name: 'down', label: 'Down payment', type: 'currency', default: 200_000, min: 0, max: 1e9 },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 9, min: 0, max: 40 },
    {
      name: 'tenure',
      label: 'Loan tenure',
      type: 'number',
      default: 5,
      min: 1,
      max: 96,
      unit: (v) => (v.unit === 'months' ? 'months' : 'years'),
    },
    tenureUnit as unknown as Field<CarValues>,
  ],
  validate: (v) =>
    v.down >= v.price
      ? { field: 'down', message: 'Down payment must be less than the car price.' }
      : null,
  compute: (v) => {
    const loan = v.price - v.down;
    const months = monthsFrom(v);
    const s = loanSummary(loan, v.rate, months);
    return {
      results: [
        {
          label: 'Monthly EMI',
          value: formatINR(s.emi),
          primary: true,
          hint: `for ${formatDuration(months)}`,
        },
        {
          label: 'Loan amount',
          value: formatINR(loan),
          hint: `${formatNumber((loan / v.price) * 100, 1)}% of on-road price`,
        },
        { label: 'Total interest', value: formatINR(s.totalInterest) },
        {
          label: 'Total cost of car',
          value: formatINR(v.down + s.totalPayment),
          hint: 'Down payment + all EMIs',
        },
      ],
      chart: {
        kind: 'donut',
        title: 'Total cost breakdown',
        data: [
          { label: 'Down payment', value: v.down },
          { label: 'Loan principal', value: loan },
          { label: 'Interest', value: s.totalInterest },
        ],
        format: 'inr',
      },
      table: yearlyTable(amortizationSchedule(loan, v.rate, months)),
    };
  },
});

type EduValues = { amount: number; rate: number; moratorium: number; repay: number; mode: string };
export const EducationLoanEmiCalculator = createFormTool<EduValues>({
  fields: [
    {
      name: 'amount',
      label: 'Loan amount',
      type: 'currency',
      default: 1_000_000,
      min: 1000,
      max: 1e9,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 10, min: 0, max: 30 },
    {
      name: 'moratorium',
      label: 'Moratorium (course + grace)',
      type: 'number',
      default: 4,
      min: 0,
      max: 8,
      unit: 'years',
      help: 'Typically course duration plus 6–12 months.',
    },
    {
      name: 'repay',
      label: 'Repayment tenure',
      type: 'number',
      default: 7,
      min: 1,
      max: 15,
      unit: 'years',
    },
    {
      name: 'mode',
      label: 'Interest during moratorium',
      type: 'segmented',
      default: 'accrue',
      full: true,
      options: [
        { value: 'accrue', label: 'Added to loan' },
        { value: 'pay', label: 'Paid monthly' },
      ],
    },
  ],
  compute: (v) => {
    // Most Indian lenders charge simple interest during the moratorium.
    const moratoriumInterest = (v.amount * v.rate * v.moratorium) / 100;
    const monthlyInterestDuringStudy = (v.amount * v.rate) / 1200;
    const principal = v.mode === 'accrue' ? v.amount + moratoriumInterest : v.amount;
    const months = Math.round(v.repay * 12);
    const s = loanSummary(principal, v.rate, months);
    const totalInterest = s.totalInterest + moratoriumInterest;
    return {
      results: [
        {
          label: 'EMI after moratorium',
          value: formatINR(s.emi),
          primary: true,
          hint: `for ${formatDuration(months)}`,
        },
        v.mode === 'accrue'
          ? { label: 'Interest added during moratorium', value: formatINR(moratoriumInterest) }
          : {
              label: 'Monthly interest during moratorium',
              value: formatINR(monthlyInterestDuringStudy),
            },
        { label: 'Loan amount at repayment start', value: formatINR(principal) },
        { label: 'Total interest', value: formatINR(totalInterest) },
        { label: 'Total payment', value: formatINR(v.amount + totalInterest) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Principal', value: v.amount },
          { label: 'Interest', value: totalInterest },
        ],
        format: 'inr',
      },
      table: yearlyTable(amortizationSchedule(principal, v.rate, months)),
      notes: [
        'Interest paid on an education loan is deductible under Section 80E (old tax regime) for up to 8 years.',
      ],
    };
  },
});

type EligValues = { income: number; existing: number; rate: number; tenure: number; foir: number };
export const LoanEligibilityCalculator = createFormTool<EligValues>({
  fields: [
    {
      name: 'income',
      label: 'Net monthly income',
      type: 'currency',
      default: 100_000,
      min: 1000,
      max: 1e8,
    },
    {
      name: 'existing',
      label: 'Existing monthly EMIs',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e8,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 8.5, min: 0, max: 40 },
    {
      name: 'tenure',
      label: 'Loan tenure',
      type: 'number',
      default: 20,
      min: 1,
      max: 30,
      unit: 'years',
    },
    {
      name: 'foir',
      label: 'Max. EMI to income ratio (FOIR)',
      type: 'percent',
      default: 50,
      min: 10,
      max: 75,
      help: 'Lenders usually allow 40–60% of net income towards all EMIs.',
    },
  ],
  compute: (v) => {
    const maxEmi = (v.income * v.foir) / 100 - v.existing;
    if (maxEmi <= 0)
      throw new InputError(
        'Your existing EMIs already use the permitted share of income, so no additional loan is likely.',
        'existing',
      );
    const months = v.tenure * 12;
    const loan = principalForEmi(maxEmi, v.rate, months);
    const s = loanSummary(loan, v.rate, months);
    return {
      results: [
        {
          label: 'Estimated eligible loan amount',
          value: formatINR(Math.floor(loan / 1000) * 1000),
          primary: true,
          hint: formatLakhCrore(loan),
        },
        { label: 'Maximum affordable EMI', value: formatINR(maxEmi) },
        { label: 'Total interest over tenure', value: formatINR(s.totalInterest) },
        { label: 'Total payment', value: formatINR(s.totalPayment) },
      ],
      notes: [
        'Actual eligibility also depends on credit score, age, employer category and the lender’s policy.',
      ],
    };
  },
});

type TenureValues = { amount: number; rate: number; emi: number };
export const LoanTenureCalculator = createFormTool<TenureValues>({
  fields: [
    {
      name: 'amount',
      label: 'Loan amount',
      type: 'currency',
      default: 2_500_000,
      min: 1000,
      max: 1e10,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 9, min: 0, max: 50 },
    {
      name: 'emi',
      label: 'Monthly EMI you can pay',
      type: 'currency',
      default: 30_000,
      min: 1,
      max: 1e9,
    },
  ],
  compute: (v) => {
    const months = tenureForEmi(v.amount, v.rate, v.emi);
    if (months > 1200)
      throw new InputError(
        'At this EMI the loan would take over 100 years. Please increase the EMI.',
        'emi',
      );
    const rows = amortizationSchedule(v.amount, v.rate, months);
    const t = totals(rows);
    const last = rows.at(-1);
    return {
      results: [
        {
          label: 'Loan tenure',
          value: formatDuration(months),
          primary: true,
          hint: `${months} monthly instalments`,
        },
        {
          label: 'Total interest',
          value: formatINR(Math.max(0, v.emi * (months - 1) + (last?.payment ?? 0) - v.amount)),
        },
        { label: 'Total payment', value: formatINR(v.emi * (months - 1) + (last?.payment ?? 0)) },
        {
          label: 'Last EMI',
          value: formatINR(last?.payment ?? 0),
          hint: 'Final instalment is usually smaller',
        },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Principal', value: v.amount },
          { label: 'Interest', value: t.interest },
        ],
        format: 'inr',
      },
    };
  },
});

type PrepayValues = {
  amount: number;
  rate: number;
  tenure: number;
  prepay: number;
  start: number;
  frequency: string;
  strategy: string;
};
export const LoanPrepaymentCalculator = createFormTool<PrepayValues>({
  fields: [
    {
      name: 'amount',
      label: 'Outstanding loan amount',
      type: 'currency',
      default: 5_000_000,
      min: 1000,
      max: 1e10,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 8.5, min: 0, max: 50 },
    {
      name: 'tenure',
      label: 'Remaining tenure',
      type: 'number',
      default: 20,
      min: 1,
      max: 40,
      unit: 'years',
    },
    {
      name: 'prepay',
      label: 'Prepayment amount',
      type: 'currency',
      default: 500_000,
      min: 1,
      max: 1e10,
    },
    {
      name: 'start',
      label: 'Prepay in month number',
      type: 'number',
      default: 12,
      min: 1,
      max: 480,
      integer: true,
      help: 'Month of the first prepayment (1 = next month).',
    },
    {
      name: 'frequency',
      label: 'Prepayment frequency',
      type: 'select',
      default: 'once',
      options: [
        { value: 'once', label: 'One time' },
        { value: 'yearly', label: 'Every year' },
        { value: 'monthly', label: 'Every month' },
      ],
    },
    {
      name: 'strategy',
      label: 'After prepayment',
      type: 'segmented',
      default: 'reduce-tenure',
      full: true,
      options: [
        { value: 'reduce-tenure', label: 'Reduce tenure' },
        { value: 'reduce-emi', label: 'Reduce EMI' },
      ],
    },
  ],
  validate: (v) =>
    v.start > v.tenure * 12
      ? { field: 'start', message: 'Prepayment month must fall within the loan tenure.' }
      : null,
  compute: (v) => {
    const months = Math.round(v.tenure * 12);
    const base = amortizationSchedule(v.amount, v.rate, months);
    const plan = amortizationSchedule(v.amount, v.rate, months, {
      amount: v.prepay,
      startMonth: v.start,
      frequency: v.frequency as 'once' | 'monthly' | 'yearly',
      strategy: v.strategy as 'reduce-tenure' | 'reduce-emi',
    });
    const b = totals(base);
    const p = totals(plan);
    const saved = b.interest - p.interest;
    const results: ResultItem[] = [
      { label: 'Interest saved', value: formatINR(saved), primary: true },
      { label: 'Interest without prepayment', value: formatINR(b.interest) },
      { label: 'Interest with prepayment', value: formatINR(p.interest) },
    ];
    if (v.strategy === 'reduce-tenure') {
      results.push({
        label: 'New tenure',
        value: formatDuration(plan.length),
        hint: `${formatDuration(months - plan.length)} earlier`,
      });
    } else {
      const after = plan.find((r) => r.period === v.start + 1);
      results.push({
        label: 'New EMI after prepayment',
        value: formatINR(after?.payment ?? 0),
        hint: `was ${formatINR(base[0].payment)}`,
      });
    }
    return {
      results,
      chart: {
        kind: 'bars',
        title: 'Total interest comparison',
        labels: ['Without prepayment', 'With prepayment'],
        series: [{ name: 'Interest', values: [b.interest, p.interest] }],
        format: 'inr',
      },
      table: yearlyTable(plan),
    };
  },
});

type AmortValues = {
  amount: number;
  rate: number;
  tenure: number;
  unit: string;
  start: string;
  view: string;
};
export const LoanAmortizationCalculator = createFormTool<AmortValues>({
  fields: [
    {
      name: 'amount',
      label: 'Loan amount',
      type: 'currency',
      default: 2_000_000,
      min: 1000,
      max: 1e10,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 9, min: 0, max: 50 },
    {
      name: 'tenure',
      label: 'Loan tenure',
      type: 'number',
      default: 10,
      min: 1,
      max: 480,
      unit: (v) => (v.unit === 'months' ? 'months' : 'years'),
    },
    tenureUnit as unknown as Field<AmortValues>,
    { name: 'start', label: 'First EMI date', type: 'date', default: () => todayISO() },
    {
      name: 'view',
      label: 'Schedule view',
      type: 'segmented',
      default: 'monthly',
      options: [
        { value: 'monthly', label: 'Monthly' },
        { value: 'yearly', label: 'Yearly' },
      ],
    },
  ],
  compute: (v) => {
    const months = monthsFrom(v);
    const s = loanSummary(v.amount, v.rate, months);
    const rows = amortizationSchedule(v.amount, v.rate, months);
    const start = parseISODate(v.start, 'First EMI date');
    const fmtMonth = new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const table =
      v.view === 'yearly'
        ? yearlyTable(rows)
        : {
            title: 'Monthly amortization schedule',
            columns: ['#', 'Month', 'EMI', 'Principal', 'Interest', 'Balance'],
            rows: rows.map((r) => [
              String(r.period),
              fmtMonth.format(addMonths(start, r.period - 1)),
              formatINR(r.payment, 2),
              formatINR(r.principal, 2),
              formatINR(r.interest, 2),
              formatINR(r.closing, 2),
            ]),
            initialRows: 24,
          };
    return {
      results: [
        { label: 'Monthly EMI', value: formatINR(s.emi), primary: true },
        { label: 'Total interest', value: formatINR(s.totalInterest) },
        { label: 'Total payment', value: formatINR(s.totalPayment) },
        { label: 'Last EMI date', value: fmtMonth.format(addMonths(start, months - 1)) },
        {
          label: 'Interest share of total',
          value: formatPercent((s.totalInterest / s.totalPayment) * 100, 1),
        },
      ],
      chart: yearlyChart(rows),
      table,
    };
  },
});
