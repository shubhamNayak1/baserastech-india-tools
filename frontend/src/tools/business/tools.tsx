import { createFormTool } from '@/components/form-tool/FormTool';
import type { ResultItem } from '@/components/form-tool/types';
import {
  formatINR,
  formatINRSmart,
  formatNumber,
  formatPercent,
  formatSmart,
} from '@/utils/format';
import { loanSummary } from '../finance/loan/engine';
import {
  applyDiscounts,
  breakEven,
  loanApr,
  margin,
  marginToMarkup,
  markupToMargin,
  percentChange,
  priceFromMargin,
  priceFromMarkup,
  roas,
  roi,
  tieredCommission,
} from './engine';

type MarginValues = { cost: number; price: number };
export const ProfitMarginCalculator = createFormTool<MarginValues>({
  fields: [
    { name: 'cost', label: 'Cost price', type: 'currency', default: 600, min: 0, max: 1e12 },
    {
      name: 'price',
      label: 'Selling price',
      type: 'currency',
      default: 1000,
      min: 0.01,
      max: 1e12,
    },
  ],
  compute: (v) => {
    const m = margin(v.cost, v.price);
    return {
      results: [
        {
          label: m.profit >= 0 ? 'Profit margin' : 'Loss margin',
          value: formatPercent(m.marginPct),
          primary: true,
        },
        { label: m.profit >= 0 ? 'Profit' : 'Loss', value: formatINRSmart(Math.abs(m.profit)) },
        { label: 'Markup on cost', value: v.cost > 0 ? formatPercent(m.markupPct) : '—' },
      ],
      chart:
        m.profit > 0
          ? {
              kind: 'donut',
              data: [
                { label: 'Cost', value: v.cost },
                { label: 'Profit', value: m.profit },
              ],
              format: 'inr',
            }
          : undefined,
    };
  },
});

type GrossValues = { revenue: number; cogs: number };
export const GrossMarginCalculator = createFormTool<GrossValues>({
  fields: [
    {
      name: 'revenue',
      label: 'Revenue (net sales)',
      type: 'currency',
      default: 1_000_000,
      min: 0.01,
      max: 1e13,
    },
    {
      name: 'cogs',
      label: 'Cost of goods sold (COGS)',
      type: 'currency',
      default: 620_000,
      min: 0,
      max: 1e13,
      help: 'Materials, direct labour and other direct costs.',
    },
  ],
  compute: (v) => {
    const m = margin(v.cogs, v.revenue);
    return {
      results: [
        { label: 'Gross margin', value: formatPercent(m.marginPct), primary: true },
        { label: 'Gross profit', value: formatINR(m.profit) },
        { label: 'COGS as % of revenue', value: formatPercent((v.cogs / v.revenue) * 100) },
      ],
    };
  },
});

type NetValues = {
  revenue: number;
  cogs: number;
  opex: number;
  interest: number;
  tax: number;
  other: number;
};
export const NetMarginCalculator = createFormTool<NetValues>({
  fields: [
    {
      name: 'revenue',
      label: 'Revenue',
      type: 'currency',
      default: 5_000_000,
      min: 0.01,
      max: 1e13,
    },
    {
      name: 'cogs',
      label: 'Cost of goods sold',
      type: 'currency',
      default: 2_800_000,
      min: 0,
      max: 1e13,
    },
    {
      name: 'opex',
      label: 'Operating expenses',
      type: 'currency',
      default: 1_200_000,
      min: 0,
      max: 1e13,
      help: 'Salaries, rent, marketing, utilities, depreciation.',
    },
    {
      name: 'interest',
      label: 'Interest expense',
      type: 'currency',
      default: 100_000,
      min: 0,
      max: 1e13,
    },
    { name: 'tax', label: 'Income tax', type: 'currency', default: 225_000, min: 0, max: 1e13 },
    { name: 'other', label: 'Other income', type: 'currency', default: 0, min: 0, max: 1e13 },
  ],
  compute: (v) => {
    const gross = v.revenue - v.cogs;
    const operating = gross - v.opex;
    const net = operating - v.interest - v.tax + v.other;
    return {
      results: [
        {
          label: 'Net profit margin',
          value: formatPercent((net / v.revenue) * 100),
          primary: true,
        },
        { label: 'Net profit', value: formatINR(net) },
        { label: 'Gross margin', value: formatPercent((gross / v.revenue) * 100) },
        { label: 'Operating margin', value: formatPercent((operating / v.revenue) * 100) },
      ],
      chart: {
        kind: 'bars',
        title: 'Profit waterfall',
        labels: ['Revenue', 'Gross profit', 'Operating profit', 'Net profit'],
        series: [{ name: 'Amount', values: [v.revenue, gross, operating, net] }],
        format: 'inr',
      },
    };
  },
});

type MarkupValues = { mode: string; cost: number; markup: number; price: number };
export const MarkupCalculator = createFormTool<MarkupValues>({
  fields: [
    {
      name: 'mode',
      label: 'Find',
      type: 'segmented',
      default: 'price',
      full: true,
      options: [
        { value: 'price', label: 'Selling price' },
        { value: 'markup', label: 'Markup %' },
      ],
    },
    { name: 'cost', label: 'Cost price', type: 'currency', default: 800, min: 0.01, max: 1e12 },
    {
      name: 'markup',
      label: 'Markup',
      type: 'percent',
      default: 25,
      min: 0,
      max: 100000,
      showIf: (v) => v.mode === 'price',
    },
    {
      name: 'price',
      label: 'Selling price',
      type: 'currency',
      default: 1000,
      min: 0,
      max: 1e12,
      showIf: (v) => v.mode === 'markup',
    },
  ],
  compute: (v) => {
    if (v.mode === 'price') {
      const price = priceFromMarkup(v.cost, v.markup);
      return {
        results: [
          { label: 'Selling price', value: formatINRSmart(price), primary: true },
          { label: 'Profit per unit', value: formatINRSmart(price - v.cost) },
          { label: 'Equivalent margin', value: formatPercent(markupToMargin(v.markup)) },
        ],
      };
    }
    const markup = ((v.price - v.cost) / v.cost) * 100;
    return {
      results: [
        { label: 'Markup', value: formatPercent(markup), primary: true },
        { label: 'Profit per unit', value: formatINRSmart(v.price - v.cost) },
        {
          label: 'Margin on selling price',
          value: v.price > 0 ? formatPercent(((v.price - v.cost) / v.price) * 100) : '—',
        },
      ],
    };
  },
});

type DiscountValues = {
  price: number;
  type: string;
  discount: number;
  amount: number;
  extra: number;
  qty: number;
};
export const DiscountCalculator = createFormTool<DiscountValues>({
  fields: [
    { name: 'price', label: 'Original price', type: 'currency', default: 2499, min: 0, max: 1e12 },
    {
      name: 'type',
      label: 'Discount as',
      type: 'segmented',
      default: 'pct',
      options: [
        { value: 'pct', label: 'Percentage' },
        { value: 'amt', label: 'Amount' },
      ],
    },
    {
      name: 'discount',
      label: 'Discount',
      type: 'percent',
      default: 20,
      min: 0,
      max: 100,
      showIf: (v) => v.type === 'pct',
    },
    {
      name: 'amount',
      label: 'Discount amount',
      type: 'currency',
      default: 500,
      min: 0,
      max: 1e12,
      showIf: (v) => v.type === 'amt',
    },
    {
      name: 'extra',
      label: 'Additional discount (e.g. coupon, bank offer)',
      type: 'percent',
      default: 0,
      min: 0,
      max: 100,
      help: 'Applied on the already discounted price.',
    },
    { name: 'qty', label: 'Quantity', type: 'number', default: 1, min: 1, max: 1e6, integer: true },
  ],
  validate: (v) =>
    v.type === 'amt' && v.amount > v.price
      ? { field: 'amount', message: 'Discount cannot exceed the price.' }
      : null,
  compute: (v) => {
    const first = v.type === 'pct' ? v.discount : v.price > 0 ? (v.amount / v.price) * 100 : 0;
    const d = applyDiscounts(v.price, [first, v.extra]);
    return {
      results: [
        {
          label: 'Price after discount',
          value: formatINRSmart(d.final * v.qty),
          primary: true,
          hint: v.qty > 1 ? `${formatINRSmart(d.final)} each` : undefined,
        },
        { label: 'You save', value: formatINRSmart(d.saved * v.qty) },
        { label: 'Effective discount', value: formatPercent(d.effectivePct) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'You pay', value: d.final },
          { label: 'You save', value: d.saved },
        ],
        format: 'inr',
      },
    };
  },
});

type BeValues = { fixed: number; price: number; variable: number; target: number };
export const BreakEvenCalculator = createFormTool<BeValues>({
  fields: [
    {
      name: 'fixed',
      label: 'Fixed costs (per period)',
      type: 'currency',
      default: 200_000,
      min: 0,
      max: 1e13,
      help: 'Rent, salaries, EMIs — costs that don’t change with sales.',
    },
    {
      name: 'price',
      label: 'Selling price per unit',
      type: 'currency',
      default: 500,
      min: 0.01,
      max: 1e10,
    },
    {
      name: 'variable',
      label: 'Variable cost per unit',
      type: 'currency',
      default: 300,
      min: 0,
      max: 1e10,
    },
    { name: 'target', label: 'Target profit', type: 'currency', default: 0, min: 0, max: 1e13 },
  ],
  compute: (v) => {
    const b = breakEven(v.fixed, v.price, v.variable, v.target);
    return {
      results: [
        {
          label: v.target > 0 ? 'Units to reach target profit' : 'Break-even units',
          value: formatNumber(b.unitsRounded, 0),
          primary: true,
        },
        { label: 'Sales revenue needed', value: formatINR(b.revenue) },
        { label: 'Contribution per unit', value: formatINRSmart(b.contribution) },
        { label: 'Contribution margin ratio', value: formatPercent(b.contributionRatioPct) },
      ],
    };
  },
});

type RoiValues = { invested: number; returned: number; years: number | '' };
export const RoiCalculator = createFormTool<RoiValues>({
  fields: [
    {
      name: 'invested',
      label: 'Amount invested',
      type: 'currency',
      default: 100_000,
      min: 0.01,
      max: 1e13,
    },
    {
      name: 'returned',
      label: 'Amount returned',
      type: 'currency',
      default: 150_000,
      min: 0,
      max: 1e14,
    },
    {
      name: 'years',
      label: 'Investment period',
      type: 'number',
      default: 2,
      min: 0.01,
      max: 100,
      unit: 'years',
      optional: true,
    },
  ],
  compute: (v) => {
    const r = roi(v.invested, v.returned, typeof v.years === 'number' ? v.years : undefined);
    return {
      results: [
        { label: 'Return on investment (ROI)', value: formatPercent(r.roiPct), primary: true },
        { label: r.gain >= 0 ? 'Net profit' : 'Net loss', value: formatINR(Math.abs(r.gain)) },
        ...(r.annualised !== undefined
          ? [{ label: 'Annualised ROI', value: formatPercent(r.annualised) }]
          : []),
      ],
    };
  },
});

type RoasValues = { spend: number; revenue: number; margin: number | '' };
export const RoasCalculator = createFormTool<RoasValues>({
  fields: [
    { name: 'spend', label: 'Ad spend', type: 'currency', default: 50_000, min: 0.01, max: 1e12 },
    {
      name: 'revenue',
      label: 'Revenue from ads',
      type: 'currency',
      default: 200_000,
      min: 0,
      max: 1e13,
    },
    {
      name: 'margin',
      label: 'Gross margin on products',
      type: 'percent',
      default: 40,
      min: 0.01,
      max: 100,
      optional: true,
      help: 'Used to find break-even ROAS and profit.',
    },
  ],
  compute: (v) => {
    const r = roas(v.spend, v.revenue, typeof v.margin === 'number' ? v.margin : undefined);
    const items: ResultItem[] = [
      {
        label: 'ROAS',
        value: `${formatNumber(r.roas, 2)}×`,
        primary: true,
        hint: `₹${formatNumber(r.roas, 2)} revenue per ₹1 spent`,
      },
      { label: 'ROAS (%)', value: formatPercent(r.roasPct, 0) },
    ];
    if (r.breakEvenRoas !== undefined)
      items.push({ label: 'Break-even ROAS', value: `${formatNumber(r.breakEvenRoas, 2)}×` });
    if (r.profit !== undefined)
      items.push({
        label: r.profit >= 0 ? 'Profit after ad spend' : 'Loss after ad spend',
        value: formatINR(Math.abs(r.profit)),
      });
    return { results: items };
  },
});

type RevenueValues = { price: number; units: number; growth: number; months: number };
export const RevenueCalculator = createFormTool<RevenueValues>({
  fields: [
    {
      name: 'price',
      label: 'Average price per unit',
      type: 'currency',
      default: 1200,
      min: 0,
      max: 1e10,
    },
    {
      name: 'units',
      label: 'Units sold in the first month',
      type: 'number',
      default: 500,
      min: 0,
      max: 1e10,
    },
    {
      name: 'growth',
      label: 'Monthly growth in units',
      type: 'percent',
      default: 5,
      min: -100,
      max: 1000,
    },
    {
      name: 'months',
      label: 'Projection period',
      type: 'number',
      default: 12,
      min: 1,
      max: 60,
      integer: true,
      unit: 'months',
    },
  ],
  compute: (v) => {
    let units = v.units;
    let total = 0;
    const labels: string[] = [];
    const values: number[] = [];
    for (let m = 1; m <= v.months; m++) {
      const rev = units * v.price;
      total += rev;
      labels.push(`M${m}`);
      values.push(rev);
      units *= 1 + v.growth / 100;
    }
    return {
      results: [
        { label: `Total revenue (${v.months} months)`, value: formatINR(total), primary: true },
        { label: 'First-month revenue', value: formatINR(values[0]) },
        { label: 'Last-month revenue', value: formatINR(values.at(-1) ?? 0) },
        { label: 'Average monthly revenue', value: formatINR(total / v.months) },
      ],
      chart: {
        kind: 'bars',
        title: 'Monthly revenue',
        labels,
        series: [{ name: 'Revenue', values }],
        format: 'inr',
      },
    };
  },
});

type CostValues = { fixed: number; variable: number; units: number; price: number | '' };
export const CostCalculator = createFormTool<CostValues>({
  fields: [
    { name: 'fixed', label: 'Fixed costs', type: 'currency', default: 150_000, min: 0, max: 1e13 },
    {
      name: 'variable',
      label: 'Variable cost per unit',
      type: 'currency',
      default: 220,
      min: 0,
      max: 1e10,
    },
    {
      name: 'units',
      label: 'Units produced',
      type: 'number',
      default: 1000,
      min: 1,
      max: 1e10,
      integer: true,
    },
    {
      name: 'price',
      label: 'Selling price per unit',
      type: 'currency',
      default: '',
      min: 0,
      max: 1e10,
      optional: true,
    },
  ],
  compute: (v) => {
    const variableTotal = v.variable * v.units;
    const total = v.fixed + variableTotal;
    const avg = total / v.units;
    const items: ResultItem[] = [
      { label: 'Total cost', value: formatINR(total), primary: true },
      { label: 'Average cost per unit', value: formatINRSmart(avg) },
      { label: 'Total variable cost', value: formatINR(variableTotal) },
      { label: 'Fixed cost per unit', value: formatINRSmart(v.fixed / v.units) },
    ];
    if (typeof v.price === 'number')
      items.push({ label: 'Profit at this volume', value: formatINR(v.price * v.units - total) });
    return {
      results: items,
      chart: {
        kind: 'donut',
        data: [
          { label: 'Fixed', value: v.fixed },
          { label: 'Variable', value: variableTotal },
        ],
        format: 'inr',
      },
    };
  },
});

type PricingValues = { cost: number; margin: number; fee: number; gst: string };
export const PricingCalculator = createFormTool<PricingValues>({
  fields: [
    {
      name: 'cost',
      label: 'Cost per unit',
      type: 'currency',
      default: 450,
      min: 0.01,
      max: 1e10,
      help: 'Include packaging and shipping.',
    },
    {
      name: 'margin',
      label: 'Desired profit margin',
      type: 'percent',
      default: 30,
      min: 0,
      max: 95,
    },
    {
      name: 'fee',
      label: 'Marketplace / payment fees',
      type: 'percent',
      default: 2,
      min: 0,
      max: 60,
      help: 'Percentage of the selling price taken by the platform or gateway.',
    },
    {
      name: 'gst',
      label: 'GST rate',
      type: 'select',
      default: '18',
      options: ['0', '5', '12', '18', '28', '40'].map((r) => ({ value: r, label: `${r}%` })),
    },
  ],
  validate: (v) =>
    v.margin + v.fee >= 100
      ? { field: 'margin', message: 'Margin plus fees must be below 100%.' }
      : null,
  compute: (v) => {
    const price = priceFromMargin(v.cost, v.margin + v.fee);
    const fee = (price * v.fee) / 100;
    const profit = price - v.cost - fee;
    const withGst = price * (1 + Number(v.gst) / 100);
    return {
      results: [
        {
          label: 'Selling price (incl. GST)',
          value: formatINRSmart(Math.ceil(withGst)),
          primary: true,
          hint: 'Rounded up to the next rupee',
        },
        { label: 'Selling price (excl. GST)', value: formatINRSmart(price) },
        { label: 'Profit per unit', value: formatINRSmart(profit) },
        { label: 'Platform fee per unit', value: formatINRSmart(fee) },
        { label: 'Markup on cost', value: formatPercent(marginToMarkup(v.margin + v.fee)) },
      ],
    };
  },
});

type BizLoanValues = { amount: number; rate: number; tenure: number; fee: number };
export const BusinessLoanCalculator = createFormTool<BizLoanValues>({
  fields: [
    {
      name: 'amount',
      label: 'Loan amount',
      type: 'currency',
      default: 1_000_000,
      min: 1000,
      max: 1e11,
    },
    { name: 'rate', label: 'Interest rate (p.a.)', type: 'percent', default: 14, min: 0, max: 50 },
    {
      name: 'tenure',
      label: 'Tenure',
      type: 'number',
      default: 36,
      min: 1,
      max: 240,
      integer: true,
      unit: 'months',
    },
    { name: 'fee', label: 'Processing fee', type: 'percent', default: 2, min: 0, max: 10 },
  ],
  compute: (v) => {
    const s = loanSummary(v.amount, v.rate, v.tenure);
    const a = loanApr(v.amount, v.rate, v.tenure, v.fee);
    return {
      results: [
        { label: 'Monthly EMI', value: formatINR(s.emi), primary: true },
        { label: 'Total interest', value: formatINR(s.totalInterest) },
        { label: 'Processing fee', value: formatINR(a.fee), hint: 'Plus 18% GST, usually' },
        {
          label: 'Effective annual cost (APR)',
          value: formatPercent(a.aprPct),
          hint: 'Includes the processing fee',
        },
        { label: 'Total repayment', value: formatINR(s.totalPayment) },
      ],
      chart: {
        kind: 'donut',
        data: [
          { label: 'Principal', value: v.amount },
          { label: 'Interest', value: s.totalInterest },
          { label: 'Fee', value: a.fee },
        ],
        format: 'inr',
      },
    };
  },
});

type CommissionValues = {
  sales: number;
  mode: string;
  rate: number;
  tier1: number;
  rate1: number;
  rate2: number;
  base: number;
};
export const CommissionCalculator = createFormTool<CommissionValues>({
  fields: [
    { name: 'sales', label: 'Sales amount', type: 'currency', default: 500_000, min: 0, max: 1e13 },
    {
      name: 'mode',
      label: 'Commission structure',
      type: 'segmented',
      default: 'flat',
      full: true,
      options: [
        { value: 'flat', label: 'Flat rate' },
        { value: 'tiered', label: 'Tiered (slab)' },
      ],
    },
    {
      name: 'rate',
      label: 'Commission rate',
      type: 'percent',
      default: 5,
      min: 0,
      max: 100,
      showIf: (v) => v.mode === 'flat',
    },
    {
      name: 'tier1',
      label: 'First slab up to',
      type: 'currency',
      default: 200_000,
      min: 0,
      max: 1e13,
      showIf: (v) => v.mode === 'tiered',
    },
    {
      name: 'rate1',
      label: 'Rate on first slab',
      type: 'percent',
      default: 3,
      min: 0,
      max: 100,
      showIf: (v) => v.mode === 'tiered',
    },
    {
      name: 'rate2',
      label: 'Rate above first slab',
      type: 'percent',
      default: 6,
      min: 0,
      max: 100,
      showIf: (v) => v.mode === 'tiered',
    },
    {
      name: 'base',
      label: 'Base salary / retainer',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e10,
    },
  ],
  compute: (v) => {
    const commission =
      v.mode === 'flat'
        ? (v.sales * v.rate) / 100
        : tieredCommission(v.sales, [
            { upTo: v.tier1, ratePct: v.rate1 },
            { upTo: null, ratePct: v.rate2 },
          ]);
    return {
      results: [
        { label: 'Commission earned', value: formatINRSmart(commission), primary: true },
        {
          label: 'Effective commission rate',
          value: v.sales > 0 ? formatPercent((commission / v.sales) * 100) : '—',
        },
        { label: 'Total earnings', value: formatINRSmart(commission + v.base) },
        {
          label: 'TDS u/s 194H (if applicable)',
          value: formatINRSmart(commission > 20_000 ? commission * 0.02 : 0),
          hint: '2% when commission exceeds ₹20,000 a year',
        },
      ],
    };
  },
});

type PctChangeValues = { mode: string; from: number; to: number; pct: number };
function pctChangeTool(direction: 'increase' | 'decrease') {
  const up = direction === 'increase';
  return createFormTool<PctChangeValues>({
    fields: [
      {
        name: 'mode',
        label: 'Calculate',
        type: 'segmented',
        default: 'change',
        full: true,
        options: [
          { value: 'change', label: `% ${direction} between values` },
          { value: 'apply', label: `${up ? 'Increase' : 'Decrease'} a value by %` },
        ],
      },
      {
        name: 'from',
        label: up ? 'Original value' : 'Original value',
        type: 'number',
        default: up ? 80 : 120,
        min: -1e15,
        max: 1e15,
      },
      {
        name: 'to',
        label: 'New value',
        type: 'number',
        default: up ? 100 : 90,
        min: -1e15,
        max: 1e15,
        showIf: (v) => v.mode === 'change',
      },
      {
        name: 'pct',
        label: `Percentage ${direction}`,
        type: 'percent',
        default: 15,
        min: 0,
        max: up ? 1e9 : 100,
        showIf: (v) => v.mode === 'apply',
      },
    ],
    compute: (v) => {
      if (v.mode === 'apply') {
        const result = v.from * (1 + ((up ? 1 : -1) * v.pct) / 100);
        return {
          results: [
            {
              label: `Value after ${v.pct}% ${direction}`,
              value: formatSmart(result),
              primary: true,
            },
            {
              label: `${up ? 'Increase' : 'Decrease'} amount`,
              value: formatSmart(Math.abs(result - v.from)),
            },
          ],
        };
      }
      const pct = percentChange(v.from, v.to);
      const isExpected = up ? pct >= 0 : pct <= 0;
      if (!isExpected && pct !== 0) {
        return {
          results: [
            {
              label: `Percentage ${up ? 'decrease' : 'increase'}`,
              value: formatPercent(Math.abs(pct)),
              primary: true,
              hint: `The value went ${up ? 'down' : 'up'}, not ${up ? 'up' : 'down'}`,
            },
            { label: 'Difference', value: formatSmart(v.to - v.from) },
          ],
        };
      }
      return {
        results: [
          { label: `Percentage ${direction}`, value: formatPercent(Math.abs(pct)), primary: true },
          { label: 'Difference', value: formatSmart(Math.abs(v.to - v.from)) },
          {
            label: 'Ratio (new ÷ original)',
            value: v.from !== 0 ? `${formatSmart(v.to / v.from)}×` : '—',
          },
        ],
      };
    },
  });
}
export const PercentageIncreaseCalculator = pctChangeTool('increase');
export const PercentageDecreaseCalculator = pctChangeTool('decrease');
