import { createFormTool } from '@/components/form-tool/FormTool';
import { formatINR, formatLakhCrore, formatNumber, formatPercent } from '@/utils/format';
import { InputError } from '@/utils/number';
import {
  compoundInterest,
  fdPayout,
  fixedDeposit,
  nps,
  ppf,
  recurringDeposit,
  simpleInterest,
  type Compounding,
} from './engine';

const periodUnits = [
  { value: 'years', label: 'Years' },
  { value: 'months', label: 'Months' },
  { value: 'days', label: 'Days' },
];

function toYears(value: number, unit: string) {
  return unit === 'years' ? value : unit === 'months' ? value / 12 : value / 365;
}

type FdValues = {
  amount: number;
  rate: number;
  tenure: number;
  unit: string;
  compounding: string;
  senior: boolean;
};
export const FdCalculator = createFormTool<FdValues>({
  fields: [
    {
      name: 'amount',
      label: 'Deposit amount',
      type: 'currency',
      default: 100_000,
      min: 1000,
      max: 1e11,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 7, min: 0, max: 20 },
    {
      name: 'tenure',
      label: 'Tenure',
      type: 'number',
      default: 5,
      min: 1,
      max: 3650,
      unit: (v) => String(v.unit),
    },
    { name: 'unit', label: 'Tenure in', type: 'segmented', default: 'years', options: periodUnits },
    {
      name: 'compounding',
      label: 'Compounding',
      type: 'select',
      default: 'quarterly',
      options: [
        { value: 'quarterly', label: 'Quarterly (most banks)' },
        { value: 'monthly', label: 'Monthly' },
        { value: 'half-yearly', label: 'Half-yearly' },
        { value: 'yearly', label: 'Yearly' },
        { value: 'simple', label: 'Simple interest (short term)' },
      ],
    },
    { name: 'senior', label: 'Senior citizen (+0.50%)', type: 'toggle', default: false },
  ],
  compute: (v) => {
    const years = toYears(v.tenure, v.unit);
    if (years > 10) throw new InputError('Bank FDs are offered for up to 10 years.', 'tenure');
    if (years < 7 / 365) throw new InputError('FD tenure must be at least 7 days.', 'tenure');
    const rate = v.rate + (v.senior ? 0.5 : 0);
    const compounding = (
      years < 0.5 && v.compounding !== 'simple' ? 'simple' : v.compounding
    ) as Compounding;
    const r = fixedDeposit(v.amount, rate, years, compounding);
    return {
      results: [
        {
          label: 'Maturity amount',
          value: formatINR(r.maturity),
          primary: true,
          hint: formatLakhCrore(r.maturity),
        },
        { label: 'Interest earned', value: formatINR(r.interest) },
        { label: 'Interest rate applied', value: formatPercent(rate) },
        { label: 'Effective annual yield', value: formatPercent(r.effectiveAnnual) },
        {
          label: 'Monthly payout (non-cumulative)',
          value: formatINR(fdPayout(v.amount, rate, 'monthly')),
        },
        {
          label: 'Quarterly payout (non-cumulative)',
          value: formatINR(fdPayout(v.amount, rate, 'quarterly')),
        },
      ],
      notes: [
        ...(compounding !== v.compounding
          ? ['Deposits shorter than 6 months earn simple interest at most banks.']
          : []),
        'FD interest is taxable at your slab rate; TDS applies above the annual threshold.',
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Principal', value: v.amount },
          { label: 'Interest', value: r.interest },
        ],
        format: 'inr',
      },
    };
  },
});

type RdValues = { monthly: number; rate: number; months: number };
export const RdCalculator = createFormTool<RdValues>({
  fields: [
    {
      name: 'monthly',
      label: 'Monthly deposit',
      type: 'currency',
      default: 5000,
      min: 10,
      max: 1e8,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 6.7, min: 0, max: 20 },
    {
      name: 'months',
      label: 'Tenure',
      type: 'number',
      default: 60,
      min: 6,
      max: 120,
      integer: true,
      unit: 'months',
    },
  ],
  compute: (v) => {
    const r = recurringDeposit(v.monthly, v.rate, v.months);
    return {
      results: [
        { label: 'Maturity amount', value: formatINR(r.maturity), primary: true },
        { label: 'Total deposited', value: formatINR(r.invested) },
        { label: 'Interest earned', value: formatINR(r.interest) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Deposits', value: r.invested },
          { label: 'Interest', value: r.interest },
        ],
        format: 'inr',
      },
    };
  },
});

type PpfValues = { deposit: number; rate: number; years: string };
export const PpfCalculator = createFormTool<PpfValues>({
  fields: [
    {
      name: 'deposit',
      label: 'Yearly investment',
      type: 'currency',
      default: 150_000,
      min: 500,
      max: 150_000,
      help: '₹500 to ₹1,50,000 per financial year.',
    },
    {
      name: 'rate',
      label: 'Interest rate (p.a.)',
      type: 'percent',
      default: 7.1,
      min: 0,
      max: 15,
      help: 'Government-notified rate, revised quarterly.',
    },
    {
      name: 'years',
      label: 'Duration',
      type: 'select',
      default: '15',
      options: ['15', '20', '25', '30', '35', '40', '45', '50'].map((y) => ({
        value: y,
        label: `${y} years${y === '15' ? ' (lock-in)' : ''}`,
      })),
    },
  ],
  compute: (v) => {
    const r = ppf(v.deposit, v.rate, Number(v.years));
    return {
      results: [
        {
          label: 'Maturity value',
          value: formatINR(r.maturity),
          primary: true,
          hint: formatLakhCrore(r.maturity),
        },
        { label: 'Total invested', value: formatINR(r.invested) },
        { label: 'Total interest', value: formatINR(r.interest) },
      ],
      notes: ['PPF is EEE: deposits (under 80C, old regime), interest and maturity are tax-free.'],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Invested', value: r.invested },
          { label: 'Interest', value: r.interest },
        ],
        format: 'inr',
      },
      table: {
        title: 'Year-wise PPF balance',
        columns: ['Year', 'Deposit', 'Interest', 'Balance'],
        rows: r.rows.map((x) => [
          `Year ${x.year}`,
          formatINR(x.deposit),
          formatINR(x.interest),
          formatINR(x.balance),
        ]),
        initialRows: 15,
      },
    };
  },
});

type NpsValues = {
  age: number;
  monthly: number;
  rate: number;
  annuityPct: number;
  annuityRate: number;
};
export const NpsCalculator = createFormTool<NpsValues>({
  fields: [
    {
      name: 'age',
      label: 'Your current age',
      type: 'number',
      default: 30,
      min: 18,
      max: 59,
      integer: true,
      unit: 'years',
    },
    {
      name: 'monthly',
      label: 'Monthly contribution',
      type: 'currency',
      default: 5000,
      min: 500,
      max: 1e7,
    },
    {
      name: 'rate',
      label: 'Expected return (p.a.)',
      type: 'percent',
      default: 10,
      min: 0,
      max: 20,
    },
    {
      name: 'annuityPct',
      label: 'Corpus used for annuity',
      type: 'percent',
      default: 40,
      min: 40,
      max: 100,
      help: 'Minimum 40% must buy an annuity at 60.',
    },
    {
      name: 'annuityRate',
      label: 'Expected annuity rate',
      type: 'percent',
      default: 6,
      min: 0,
      max: 15,
    },
  ],
  compute: (v) => {
    const r = nps({
      currentAge: v.age,
      monthly: v.monthly,
      returnPct: v.rate,
      annuityPct: v.annuityPct,
      annuityRatePct: v.annuityRate,
    });
    return {
      results: [
        { label: 'Expected monthly pension', value: formatINR(r.monthlyPension), primary: true },
        {
          label: 'Total corpus at 60',
          value: formatINR(r.corpus),
          hint: formatLakhCrore(r.corpus),
        },
        { label: 'Lump sum withdrawal (tax-free)', value: formatINR(r.lumpSum) },
        { label: 'Annuity purchase amount', value: formatINR(r.annuityCorpus) },
        {
          label: 'Total contribution',
          value: formatINR(r.invested),
          hint: `over ${r.years} years`,
        },
        { label: 'Interest earned', value: formatINR(r.gains) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Lump sum', value: r.lumpSum },
          { label: 'Annuity', value: r.annuityCorpus },
        ],
        format: 'inr',
      },
    };
  },
});

type SiValues = { principal: number; rate: number; time: number; unit: string };
export const SimpleInterestCalculator = createFormTool<SiValues>({
  fields: [
    {
      name: 'principal',
      label: 'Principal amount',
      type: 'currency',
      default: 100_000,
      min: 0,
      max: 1e12,
    },
    {
      name: 'rate',
      label: 'Rate of interest (p.a.)',
      type: 'percent',
      default: 8,
      min: 0,
      max: 100,
    },
    {
      name: 'time',
      label: 'Time period',
      type: 'number',
      default: 3,
      min: 0,
      max: 36500,
      unit: (v) => String(v.unit),
    },
    { name: 'unit', label: 'Time in', type: 'segmented', default: 'years', options: periodUnits },
  ],
  compute: (v) => {
    const years = toYears(v.time, v.unit);
    const r = simpleInterest(v.principal, v.rate, years);
    return {
      results: [
        { label: 'Simple interest', value: formatINR(r.interest, 2), primary: true },
        { label: 'Total amount', value: formatINR(r.amount, 2) },
        { label: 'Time in years', value: formatNumber(years, 4) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Principal', value: v.principal },
          { label: 'Interest', value: r.interest },
        ],
        format: 'inr',
      },
    };
  },
});

type CiValues = {
  principal: number;
  rate: number;
  years: number;
  frequency: string;
  monthly: number;
};
export const CompoundInterestCalculator = createFormTool<CiValues>({
  fields: [
    {
      name: 'principal',
      label: 'Principal amount',
      type: 'currency',
      default: 100_000,
      min: 0,
      max: 1e12,
    },
    { name: 'rate', label: 'Annual interest rate', type: 'percent', default: 8, min: 0, max: 100 },
    {
      name: 'years',
      label: 'Time period',
      type: 'number',
      default: 10,
      min: 0.1,
      max: 100,
      unit: 'years',
    },
    {
      name: 'frequency',
      label: 'Compounding frequency',
      type: 'select',
      default: '4',
      options: [
        { value: '1', label: 'Yearly' },
        { value: '2', label: 'Half-yearly' },
        { value: '4', label: 'Quarterly' },
        { value: '12', label: 'Monthly' },
        { value: '365', label: 'Daily' },
      ],
    },
    { name: 'monthly', label: 'Monthly addition', type: 'currency', default: 0, min: 0, max: 1e10 },
  ],
  compute: (v) => {
    const r = compoundInterest(v.principal, v.rate, v.years, Number(v.frequency), v.monthly);
    if (r.invested <= 0)
      throw new InputError('Enter a principal or a monthly addition.', 'principal');
    const simple = simpleInterest(v.principal, v.rate, v.years);
    return {
      results: [
        {
          label: 'Final amount',
          value: formatINR(r.amount, 2),
          primary: true,
          hint: formatLakhCrore(r.amount),
        },
        { label: 'Total interest', value: formatINR(r.interest, 2) },
        { label: 'Total invested', value: formatINR(r.invested) },
        ...(v.monthly === 0
          ? [
              {
                label: 'Extra vs simple interest',
                value: formatINR(r.interest - simple.interest, 2),
              },
            ]
          : []),
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Invested', value: r.invested },
          { label: 'Interest', value: r.interest },
        ],
        format: 'inr',
      },
    };
  },
});
