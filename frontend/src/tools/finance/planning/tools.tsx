import { createFormTool } from '@/components/form-tool/FormTool';
import { formatINR, formatLakhCrore, formatPercent } from '@/utils/format';
import { sumMoney } from '@/utils/number';
import { corpusNeeded, inflationAdjusted, retirementPlan } from '../investment/engine';

type InflValues = { amount: number; rate: number; years: number };
export const InflationCalculator = createFormTool<InflValues>({
  fields: [
    {
      name: 'amount',
      label: 'Current cost / amount',
      type: 'currency',
      default: 100_000,
      min: 1,
      max: 1e12,
    },
    { name: 'rate', label: 'Inflation rate (p.a.)', type: 'percent', default: 6, min: 0, max: 50 },
    {
      name: 'years',
      label: 'Number of years',
      type: 'number',
      default: 10,
      min: 1,
      max: 100,
      integer: true,
      unit: 'years',
    },
  ],
  compute: (v) => {
    const r = inflationAdjusted(v.amount, v.rate, v.years);
    return {
      results: [
        {
          label: `Cost after ${v.years} years`,
          value: formatINR(r.futureCost),
          primary: true,
          hint: formatLakhCrore(r.futureCost),
        },
        {
          label: `Value of ${formatINR(v.amount)} after ${v.years} years`,
          value: formatINR(r.purchasingPower),
          hint: "in today's purchasing power",
        },
        {
          label: 'Loss of purchasing power',
          value: formatPercent((1 - r.purchasingPower / v.amount) * 100, 1),
        },
      ],
    };
  },
});

type RetValues = {
  age: number;
  retireAge: number;
  life: number;
  expense: number;
  inflation: number;
  preReturn: number;
  postReturn: number;
  savings: number;
};
export const RetirementCalculator = createFormTool<RetValues>({
  fields: [
    {
      name: 'age',
      label: 'Current age',
      type: 'number',
      default: 30,
      min: 15,
      max: 80,
      integer: true,
      unit: 'years',
    },
    {
      name: 'retireAge',
      label: 'Retirement age',
      type: 'number',
      default: 60,
      min: 30,
      max: 90,
      integer: true,
      unit: 'years',
    },
    {
      name: 'life',
      label: 'Life expectancy',
      type: 'number',
      default: 85,
      min: 50,
      max: 110,
      integer: true,
      unit: 'years',
    },
    {
      name: 'expense',
      label: 'Current monthly expenses',
      type: 'currency',
      default: 50_000,
      min: 1000,
      max: 1e8,
    },
    {
      name: 'inflation',
      label: 'Expected inflation',
      type: 'percent',
      default: 6,
      min: 0,
      max: 20,
    },
    {
      name: 'preReturn',
      label: 'Return before retirement',
      type: 'percent',
      default: 12,
      min: 0,
      max: 30,
    },
    {
      name: 'postReturn',
      label: 'Return after retirement',
      type: 'percent',
      default: 7,
      min: 0,
      max: 20,
    },
    {
      name: 'savings',
      label: 'Current retirement savings',
      type: 'currency',
      default: 500_000,
      min: 0,
      max: 1e11,
    },
  ],
  compute: (v) => {
    const p = retirementPlan({
      currentAge: v.age,
      retireAge: v.retireAge,
      lifeExpectancy: v.life,
      monthlyExpense: v.expense,
      inflationPct: v.inflation,
      preReturnPct: v.preReturn,
      postReturnPct: v.postReturn,
      currentSavings: v.savings,
    });
    return {
      results: [
        {
          label: 'Monthly SIP needed',
          value: formatINR(p.monthlySip),
          primary: true,
          hint: p.gap === 0 ? 'Your current savings are enough' : `for ${p.yearsToRetire} years`,
        },
        {
          label: 'Corpus needed at retirement',
          value: formatINR(p.corpus),
          hint: formatLakhCrore(p.corpus),
        },
        { label: 'Monthly expense at retirement', value: formatINR(p.expenseAtRetirement) },
        { label: 'Current savings will grow to', value: formatINR(p.savingsFV) },
        { label: 'Shortfall to fund', value: formatINR(p.gap) },
      ],
      chart: {
        kind: 'donut',
        title: 'Retirement corpus sources',
        data: [
          { label: 'Existing savings', value: Math.min(p.savingsFV, p.corpus) },
          { label: 'New SIPs', value: p.gap },
        ],
        format: 'inr',
      },
    };
  },
});

type CorpusValues = {
  expense: number;
  years: number;
  inflation: number;
  returns: number;
  buffer: number;
};
export const RetirementCorpusCalculator = createFormTool<CorpusValues>({
  fields: [
    {
      name: 'expense',
      label: 'Monthly expenses at retirement',
      type: 'currency',
      default: 100_000,
      min: 1000,
      max: 1e8,
      help: "Use tomorrow's cost, or today's cost if retiring now.",
    },
    {
      name: 'years',
      label: 'Years in retirement',
      type: 'number',
      default: 25,
      min: 1,
      max: 60,
      integer: true,
      unit: 'years',
    },
    {
      name: 'inflation',
      label: 'Inflation during retirement',
      type: 'percent',
      default: 6,
      min: 0,
      max: 20,
    },
    { name: 'returns', label: 'Return on corpus', type: 'percent', default: 7, min: 0, max: 20 },
    {
      name: 'buffer',
      label: 'Emergency / health buffer',
      type: 'currency',
      default: 1_000_000,
      min: 0,
      max: 1e10,
    },
  ],
  compute: (v) => {
    const corpus = corpusNeeded(v.expense * 12, v.inflation, v.returns, v.years);
    const total = corpus + v.buffer;
    const swr = ((v.expense * 12) / total) * 100;
    return {
      results: [
        {
          label: 'Retirement corpus required',
          value: formatINR(total),
          primary: true,
          hint: formatLakhCrore(total),
        },
        { label: 'Corpus for expenses', value: formatINR(corpus) },
        { label: 'Buffer', value: formatINR(v.buffer) },
        { label: 'First-year withdrawal rate', value: formatPercent(swr) },
        {
          label: 'Corpus as multiple of annual expense',
          value: `${(total / (v.expense * 12)).toFixed(1)}×`,
        },
      ],
    };
  },
});

type NwValues = {
  cash: number;
  deposits: number;
  equity: number;
  retirement: number;
  property: number;
  gold: number;
  vehicles: number;
  otherA: number;
  homeLoan: number;
  vehicleLoan: number;
  personalLoan: number;
  creditCard: number;
  otherL: number;
};
const money = (name: keyof NwValues, label: string, d = 0) => ({
  name,
  label,
  type: 'currency' as const,
  default: d,
  min: 0,
  max: 1e13,
});
export const NetWorthCalculator = createFormTool<NwValues>({
  fields: [
    money('cash', 'Cash & savings account', 200_000),
    money('deposits', 'FDs, RDs & bonds', 300_000),
    money('equity', 'Stocks & mutual funds', 500_000),
    money('retirement', 'EPF, PPF & NPS', 400_000),
    money('property', 'Real estate (market value)', 0),
    money('gold', 'Gold & jewellery', 100_000),
    money('vehicles', 'Vehicles', 300_000),
    money('otherA', 'Other assets'),
    money('homeLoan', 'Home loan outstanding'),
    money('vehicleLoan', 'Vehicle loan outstanding', 150_000),
    money('personalLoan', 'Personal / education loans'),
    money('creditCard', 'Credit card dues', 20_000),
    money('otherL', 'Other liabilities'),
  ],
  compute: (v) => {
    const assets = sumMoney([
      v.cash,
      v.deposits,
      v.equity,
      v.retirement,
      v.property,
      v.gold,
      v.vehicles,
      v.otherA,
    ]);
    const liabilities = sumMoney([
      v.homeLoan,
      v.vehicleLoan,
      v.personalLoan,
      v.creditCard,
      v.otherL,
    ]);
    const nw = assets - liabilities;
    const liquid = sumMoney([v.cash, v.deposits, v.equity]);
    return {
      results: [
        { label: 'Net worth', value: formatINR(nw), primary: true, hint: formatLakhCrore(nw) },
        { label: 'Total assets', value: formatINR(assets) },
        { label: 'Total liabilities', value: formatINR(liabilities) },
        {
          label: 'Debt-to-asset ratio',
          value: assets > 0 ? formatPercent((liabilities / assets) * 100, 1) : '—',
        },
        {
          label: 'Liquid assets',
          value: formatINR(liquid),
          hint: 'Cash, deposits and market investments',
        },
      ],
      chart: {
        kind: 'donut',
        title: 'Asset allocation',
        data: [
          { label: 'Cash', value: v.cash },
          { label: 'Deposits', value: v.deposits },
          { label: 'Equity', value: v.equity },
          { label: 'Retirement', value: v.retirement },
          { label: 'Real estate', value: v.property },
          { label: 'Gold', value: v.gold },
          { label: 'Vehicles & other', value: v.vehicles + v.otherA },
        ],
        format: 'inr',
      },
    };
  },
});
