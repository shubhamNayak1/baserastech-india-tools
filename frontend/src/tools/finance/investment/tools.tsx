import { createFormTool } from '@/components/form-tool/FormTool';
import type { ResultItem, ToolResult } from '@/components/form-tool/types';
import { formatINR, formatLakhCrore, formatNumber, formatPercent } from '@/utils/format';
import { InputError } from '@/utils/number';
import {
  cagr,
  futureValue,
  lumpsum,
  presentValue,
  presentValueOfAnnuity,
  ruleOf72,
  sip,
  stp,
  swp,
  type YearPoint,
} from './engine';

function growthChart(points: YearPoint[]) {
  return {
    kind: 'bars' as const,
    title: 'Growth over time',
    labels: points.map((p) => `Y${p.year}`),
    series: [
      { name: 'Invested', values: points.map((p) => p.invested) },
      { name: 'Returns', values: points.map((p) => Math.max(0, p.value - p.invested)) },
    ],
    stacked: true,
    format: 'inr' as const,
  };
}

function growthTable(points: YearPoint[]) {
  return {
    title: 'Year-wise growth',
    columns: ['Year', 'Invested', 'Value', 'Gains'],
    rows: points.map((p) => [
      `Year ${p.year}`,
      formatINR(p.invested),
      formatINR(p.value),
      formatINR(p.value - p.invested),
    ]),
    initialRows: 10,
  };
}

function investResult(
  invested: number,
  value: number,
  points: YearPoint[],
  label = 'Estimated value',
): ToolResult {
  return {
    results: [
      { label, value: formatINR(value), primary: true, hint: formatLakhCrore(value) },
      { label: 'Total invested', value: formatINR(invested) },
      { label: 'Estimated returns', value: formatINR(value - invested) },
      {
        label: 'Wealth gain',
        value: `${formatNumber(value / invested, 2)}×`,
        hint: 'Final value ÷ amount invested',
      },
    ],
    chart: {
      kind: 'donut',
      title: 'Invested vs returns',
      data: [
        { label: 'Invested', value: invested },
        { label: 'Returns', value: Math.max(0, value - invested) },
      ],
      format: 'inr',
    },
    table: growthTable(points),
  };
}

type SipValues = { monthly: number; rate: number; years: number };
export const SipCalculator = createFormTool<SipValues>({
  fields: [
    {
      name: 'monthly',
      label: 'Monthly investment',
      type: 'currency',
      default: 5000,
      min: 100,
      max: 1e8,
    },
    {
      name: 'rate',
      label: 'Expected return (p.a.)',
      type: 'percent',
      default: 12,
      min: 0,
      max: 50,
    },
    {
      name: 'years',
      label: 'Investment period',
      type: 'number',
      default: 10,
      min: 1,
      max: 50,
      integer: true,
      unit: 'years',
    },
  ],
  compute: (v) => {
    const r = sip(v.monthly, v.rate, v.years);
    const res = investResult(r.invested, r.value, r.points);
    res.chart = growthChart(r.points);
    return res;
  },
});

type SipReturnsValues = {
  monthly: number;
  rate: number;
  years: number;
  stepUp: number;
  inflation: number | '';
};
export const SipReturnsCalculator = createFormTool<SipReturnsValues>({
  fields: [
    {
      name: 'monthly',
      label: 'Starting monthly SIP',
      type: 'currency',
      default: 10_000,
      min: 100,
      max: 1e8,
    },
    {
      name: 'rate',
      label: 'Expected return (p.a.)',
      type: 'percent',
      default: 12,
      min: 0,
      max: 50,
    },
    {
      name: 'years',
      label: 'Investment period',
      type: 'number',
      default: 15,
      min: 1,
      max: 50,
      integer: true,
      unit: 'years',
    },
    {
      name: 'stepUp',
      label: 'Annual step-up',
      type: 'percent',
      default: 10,
      min: 0,
      max: 100,
      help: 'Increase your SIP by this % every year.',
    },
    {
      name: 'inflation',
      label: 'Inflation (to show real value)',
      type: 'percent',
      default: 6,
      min: 0,
      max: 30,
      optional: true,
    },
  ],
  compute: (v) => {
    const r = sip(v.monthly, v.rate, v.years, v.stepUp);
    const flat = sip(v.monthly, v.rate, v.years);
    const res = investResult(r.invested, r.value, r.points, 'Maturity value');
    res.results.push({
      label: 'Extra wealth from step-up',
      value: formatINR(r.value - flat.value),
      hint: `vs a flat SIP of ${formatINR(v.monthly)}`,
    });
    if (typeof v.inflation === 'number' && v.inflation > 0) {
      res.results.push({
        label: "Value in today's money",
        value: formatINR(r.value / (1 + v.inflation / 100) ** v.years),
        hint: `at ${v.inflation}% inflation`,
      });
    }
    res.chart = growthChart(r.points);
    return res;
  },
});

type LumpValues = { amount: number; rate: number; years: number };
export const LumpSumCalculator = createFormTool<LumpValues>({
  fields: [
    {
      name: 'amount',
      label: 'Total investment',
      type: 'currency',
      default: 100_000,
      min: 100,
      max: 1e11,
    },
    {
      name: 'rate',
      label: 'Expected return (p.a.)',
      type: 'percent',
      default: 12,
      min: 0,
      max: 50,
    },
    {
      name: 'years',
      label: 'Time period',
      type: 'number',
      default: 10,
      min: 1,
      max: 60,
      integer: true,
      unit: 'years',
    },
  ],
  compute: (v) => {
    const r = lumpsum(v.amount, v.rate, v.years);
    return investResult(r.invested, r.value, r.points);
  },
});

type SwpValues = {
  corpus: number;
  withdrawal: number;
  rate: number;
  years: number;
  stepUp: number;
};
export const SwpCalculator = createFormTool<SwpValues>({
  fields: [
    {
      name: 'corpus',
      label: 'Total investment',
      type: 'currency',
      default: 5_000_000,
      min: 1000,
      max: 1e11,
    },
    {
      name: 'withdrawal',
      label: 'Monthly withdrawal',
      type: 'currency',
      default: 30_000,
      min: 100,
      max: 1e9,
    },
    { name: 'rate', label: 'Expected return (p.a.)', type: 'percent', default: 8, min: 0, max: 30 },
    {
      name: 'years',
      label: 'Time period',
      type: 'number',
      default: 20,
      min: 1,
      max: 50,
      integer: true,
      unit: 'years',
    },
    {
      name: 'stepUp',
      label: 'Annual increase in withdrawal',
      type: 'percent',
      default: 0,
      min: 0,
      max: 30,
      help: 'Raise withdrawals yearly to keep pace with inflation.',
    },
  ],
  compute: (v) => {
    const r = swp(v.corpus, v.withdrawal, v.rate, v.years, v.stepUp);
    const results: ResultItem[] = [
      {
        label: 'Final value',
        value: formatINR(r.finalBalance),
        primary: true,
        hint: r.depletedAt ? 'Corpus exhausted' : `after ${v.years} years`,
      },
      { label: 'Total withdrawn', value: formatINR(r.totalWithdrawn) },
      { label: 'Total investment', value: formatINR(v.corpus) },
    ];
    if (r.depletedAt) {
      results.push({
        label: 'Money lasts for',
        value: `${Math.floor(r.depletedAt / 12)} years ${r.depletedAt % 12} months`,
      });
    }
    return {
      results,
      notes: r.depletedAt
        ? [
            'Withdrawals exceed what the corpus can sustain for the chosen period. Reduce the withdrawal or expect a higher return.',
          ]
        : undefined,
      table: {
        title: 'Year-wise withdrawal schedule',
        columns: ['Year', 'Opening', 'Withdrawn', 'Returns', 'Closing'],
        rows: r.rows.map((x) => [
          `Year ${x.year}`,
          formatINR(x.opening),
          formatINR(x.withdrawn),
          formatINR(x.returns),
          formatINR(x.closing),
        ]),
      },
      chart: {
        kind: 'bars',
        title: 'Balance at year end',
        labels: r.rows.map((x) => `Y${x.year}`),
        series: [{ name: 'Balance', values: r.rows.map((x) => x.closing) }],
        format: 'inr',
      },
    };
  },
});

type StpValues = {
  amount: number;
  transfer: number;
  source: number;
  target: number;
  months: number;
};
export const StpCalculator = createFormTool<StpValues>({
  fields: [
    {
      name: 'amount',
      label: 'Lump sum in source fund',
      type: 'currency',
      default: 1_200_000,
      min: 1000,
      max: 1e11,
    },
    {
      name: 'transfer',
      label: 'Monthly transfer',
      type: 'currency',
      default: 100_000,
      min: 100,
      max: 1e10,
    },
    {
      name: 'source',
      label: 'Source fund return (p.a.)',
      type: 'percent',
      default: 6.5,
      min: 0,
      max: 30,
      help: 'e.g. liquid / debt fund',
    },
    {
      name: 'target',
      label: 'Target fund return (p.a.)',
      type: 'percent',
      default: 12,
      min: 0,
      max: 50,
      help: 'e.g. equity fund',
    },
    {
      name: 'months',
      label: 'Period',
      type: 'number',
      default: 12,
      min: 1,
      max: 600,
      integer: true,
      unit: 'months',
    },
  ],
  compute: (v) => {
    const r = stp(v.amount, v.transfer, v.source, v.target, v.months);
    return {
      results: [
        {
          label: 'Total value',
          value: formatINR(r.totalValue),
          primary: true,
          hint: `after ${v.months} months`,
        },
        { label: 'Target fund value', value: formatINR(r.targetValue) },
        { label: 'Balance left in source fund', value: formatINR(r.sourceBalance) },
        {
          label: 'Total transferred',
          value: formatINR(r.transferred),
          hint: `${r.transfers} transfers`,
        },
        { label: 'Total gains', value: formatINR(r.gains) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Target fund', value: r.targetValue },
          { label: 'Source fund', value: r.sourceBalance },
        ],
        format: 'inr',
      },
    };
  },
});

type CagrValues = { start: number; end: number; years: number };
export const CagrCalculator = createFormTool<CagrValues>({
  fields: [
    {
      name: 'start',
      label: 'Initial value',
      type: 'currency',
      default: 100_000,
      min: 0.01,
      max: 1e12,
    },
    { name: 'end', label: 'Final value', type: 'currency', default: 250_000, min: 0, max: 1e14 },
    {
      name: 'years',
      label: 'Duration',
      type: 'number',
      default: 5,
      min: 0.1,
      max: 100,
      unit: 'years',
    },
  ],
  compute: (v) => {
    const c = cagr(v.start, v.end, v.years);
    return {
      results: [
        { label: 'CAGR', value: formatPercent(c), primary: true },
        { label: 'Absolute return', value: formatPercent(((v.end - v.start) / v.start) * 100) },
        { label: 'Total gain', value: formatINR(v.end - v.start) },
        { label: 'Growth multiple', value: `${formatNumber(v.end / v.start, 2)}×` },
      ],
    };
  },
});

type InvReturnValues = { invested: number; final: number; income: number; years: number };
export const InvestmentReturnCalculator = createFormTool<InvReturnValues>({
  fields: [
    {
      name: 'invested',
      label: 'Amount invested',
      type: 'currency',
      default: 200_000,
      min: 1,
      max: 1e12,
    },
    {
      name: 'final',
      label: 'Current / sale value',
      type: 'currency',
      default: 290_000,
      min: 0,
      max: 1e14,
    },
    {
      name: 'income',
      label: 'Dividends / income received',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e12,
    },
    {
      name: 'years',
      label: 'Holding period',
      type: 'number',
      default: 3,
      min: 0.01,
      max: 100,
      unit: 'years',
    },
  ],
  compute: (v) => {
    const total = v.final + v.income;
    const gain = total - v.invested;
    const annual = cagr(v.invested, total, v.years);
    return {
      results: [
        {
          label: 'Total return',
          value: formatPercent((gain / v.invested) * 100),
          primary: true,
          hint: gain >= 0 ? 'Profit' : 'Loss',
        },
        { label: 'Profit / loss', value: formatINR(gain) },
        { label: 'Annualised return (CAGR)', value: formatPercent(annual) },
        { label: 'Total value received', value: formatINR(total) },
      ],
    };
  },
});

type FvValues = { pv: number; rate: number; periods: number; payment: number; timing: string };
export const FutureValueCalculator = createFormTool<FvValues>({
  fields: [
    { name: 'pv', label: 'Present value', type: 'currency', default: 100_000, min: 0, max: 1e12 },
    { name: 'rate', label: 'Rate per period', type: 'percent', default: 8, min: -99, max: 100 },
    {
      name: 'periods',
      label: 'Number of periods',
      type: 'number',
      default: 10,
      min: 0,
      max: 1000,
      unit: 'periods',
    },
    {
      name: 'payment',
      label: 'Additional payment per period',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e10,
    },
    {
      name: 'timing',
      label: 'Payments made at',
      type: 'segmented',
      default: 'end',
      options: [
        { value: 'end', label: 'End of period' },
        { value: 'start', label: 'Start of period' },
      ],
    },
  ],
  compute: (v) => {
    const fv = futureValue(v.pv, v.rate, v.periods, v.payment, v.timing === 'start');
    const invested = v.pv + v.payment * v.periods;
    return {
      results: [
        {
          label: 'Future value',
          value: formatINR(fv, 2),
          primary: true,
          hint: formatLakhCrore(fv),
        },
        { label: 'Total contributions', value: formatINR(invested, 2) },
        { label: 'Total growth', value: formatINR(fv - invested, 2) },
      ],
    };
  },
});

type PvValues = { fv: number; rate: number; periods: number; mode: string };
export const PresentValueCalculator = createFormTool<PvValues>({
  fields: [
    {
      name: 'mode',
      label: 'Calculate PV of',
      type: 'segmented',
      default: 'lump',
      full: true,
      options: [
        { value: 'lump', label: 'A future amount' },
        { value: 'annuity', label: 'Regular payments' },
      ],
    },
    {
      name: 'fv',
      label: 'Future amount / payment per period',
      type: 'currency',
      default: 1_000_000,
      min: 0,
      max: 1e14,
    },
    {
      name: 'rate',
      label: 'Discount rate per period',
      type: 'percent',
      default: 7,
      min: -99,
      max: 100,
    },
    {
      name: 'periods',
      label: 'Number of periods',
      type: 'number',
      default: 10,
      min: 0,
      max: 1000,
      unit: 'periods',
    },
  ],
  compute: (v) => {
    const pv =
      v.mode === 'lump'
        ? presentValue(v.fv, v.rate, v.periods)
        : presentValueOfAnnuity(v.fv, v.rate, v.periods);
    const nominal = v.mode === 'lump' ? v.fv : v.fv * v.periods;
    return {
      results: [
        {
          label: 'Present value',
          value: formatINR(pv, 2),
          primary: true,
          hint: formatLakhCrore(pv),
        },
        {
          label: v.mode === 'lump' ? 'Future amount' : 'Total of all payments',
          value: formatINR(nominal, 2),
        },
        { label: 'Discount', value: formatINR(nominal - pv, 2) },
      ],
    };
  },
});

type R72Values = { mode: string; rate: number; years: number };
export const RuleOf72Calculator = createFormTool<R72Values>({
  fields: [
    {
      name: 'mode',
      label: 'Find',
      type: 'segmented',
      default: 'years',
      full: true,
      options: [
        { value: 'years', label: 'Years to double' },
        { value: 'rate', label: 'Rate needed' },
      ],
    },
    {
      name: 'rate',
      label: 'Annual return',
      type: 'percent',
      default: 8,
      min: 0.01,
      max: 100,
      showIf: (v) => v.mode === 'years',
    },
    {
      name: 'years',
      label: 'Years to double',
      type: 'number',
      default: 6,
      min: 0.1,
      max: 200,
      unit: 'years',
      showIf: (v) => v.mode === 'rate',
    },
  ],
  compute: (v) => {
    if (v.mode === 'rate') {
      if (!(v.years > 0)) throw new InputError('Years must be greater than zero.', 'years');
      const exact = (2 ** (1 / v.years) - 1) * 100;
      return {
        results: [
          {
            label: 'Return needed (Rule of 72)',
            value: formatPercent(72 / v.years),
            primary: true,
          },
          { label: 'Exact return needed', value: formatPercent(exact, 3) },
        ],
      };
    }
    const r = ruleOf72(v.rate);
    return {
      results: [
        {
          label: 'Years to double (Rule of 72)',
          value: `${formatNumber(r.rule72, 2)} years`,
          primary: true,
        },
        { label: 'Exact years to double', value: `${formatNumber(r.exact, 2)} years` },
        { label: 'Years to triple (Rule of 114)', value: `${formatNumber(r.rule114, 2)} years` },
        { label: 'Years to 4× (Rule of 144)', value: `${formatNumber(r.rule144, 2)} years` },
      ],
    };
  },
});
