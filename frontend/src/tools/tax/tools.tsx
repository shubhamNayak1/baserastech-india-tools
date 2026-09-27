import { createFormTool } from '@/components/form-tool/FormTool';
import type { Field, ResultItem, ToolResult } from '@/components/form-tool/types';
import {
  formatINR,
  formatINRSmart,
  formatLakhCrore,
  formatNumber,
  formatPercent,
} from '@/utils/format';
import { InputError } from '@/utils/number';
import { parseISODate, todayISO } from '@/utils/date';
import { compareRegimes, computeIncomeTax, hraExemption, type TaxResult } from './engine';
import { addGst, fromGstAmount, impliedRate, removeGst, splitGst } from './gst';
import { capitalGains } from './capitalGains';
import { CURRENT_RULES, DEFAULT_FY, FY_OPTIONS, getTaxRules, type AgeGroup } from './rules';

const GST_RATE_OPTIONS = [
  ...CURRENT_RULES.gstRates.map((r) => ({ value: String(r.ratePct), label: r.label })),
  { value: 'custom', label: 'Custom rate' },
];
const SUPPLY_OPTIONS = [
  { value: 'intra', label: 'Within state (CGST + SGST)' },
  { value: 'inter', label: 'Inter-state (IGST)' },
];
const AGE_OPTIONS = [
  { value: 'below60', label: 'Below 60' },
  { value: 'senior', label: '60 to 79' },
  { value: 'superSenior', label: '80 and above' },
];
const SLAB_OPTIONS = ['0', '5', '10', '15', '20', '25', '30'].map((r) => ({
  value: r,
  label: `${r}%`,
}));

function provisionalNote(fy: string): string[] {
  const r = getTaxRules(fy);
  return r.status === 'provisional' && r.note ? [r.note] : [];
}

type RateValues = { rate: string; custom: number };
function rateFields<V extends RateValues>(defaultRate = '18'): Field<V>[] {
  return [
    {
      name: 'rate' as keyof V & string,
      label: 'GST rate',
      type: 'select',
      default: defaultRate,
      options: GST_RATE_OPTIONS,
    },
    {
      name: 'custom' as keyof V & string,
      label: 'Custom GST rate',
      type: 'percent',
      default: 18,
      min: 0,
      max: 100,
      showIf: (v) => v.rate === 'custom',
    },
  ];
}
const rateOf = (v: RateValues) => (v.rate === 'custom' ? v.custom : Number(v.rate));

function gstResult(
  r: ReturnType<typeof addGst>,
  rate: number,
  inter: boolean,
  headline: 'total' | 'base' | 'gst',
): ToolResult {
  const items: ResultItem[] = [
    {
      label: 'Total amount (incl. GST)',
      value: formatINRSmart(r.total),
      primary: headline === 'total',
    },
    {
      label: 'Taxable value (excl. GST)',
      value: formatINRSmart(r.base),
      primary: headline === 'base',
    },
    {
      label: `GST @ ${formatNumber(rate, 2)}%`,
      value: formatINRSmart(r.gst),
      primary: headline === 'gst',
    },
  ];
  items.sort((a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)));
  if (inter)
    items.push({ label: `IGST @ ${formatNumber(rate, 2)}%`, value: formatINRSmart(r.igst) });
  else {
    items.push({ label: `CGST @ ${formatNumber(rate / 2, 3)}%`, value: formatINRSmart(r.cgst) });
    items.push({
      label: `SGST/UTGST @ ${formatNumber(rate / 2, 3)}%`,
      value: formatINRSmart(r.sgst),
    });
  }
  return {
    results: items,
    chart: {
      kind: 'donut',
      data: [
        { label: 'Taxable value', value: r.base },
        { label: 'GST', value: r.gst },
      ],
      format: 'inr',
    },
  };
}

// ---------------------------------------------------------------- GST family
type GstValues = RateValues & { amount: number; mode: string; supply: string };
export const GstCalculator = createFormTool<GstValues>({
  fields: [
    {
      name: 'mode',
      label: 'Amount is',
      type: 'segmented',
      default: 'exclusive',
      full: true,
      options: [
        { value: 'exclusive', label: 'Excluding GST (add GST)' },
        { value: 'inclusive', label: 'Including GST (remove GST)' },
      ],
    },
    { name: 'amount', label: 'Amount', type: 'currency', default: 10_000, min: 0, max: 1e12 },
    ...rateFields<GstValues>(),
    {
      name: 'supply',
      label: 'Type of supply',
      type: 'select',
      default: 'intra',
      options: SUPPLY_OPTIONS,
    },
  ],
  compute: (v) => {
    const rate = rateOf(v);
    const inter = v.supply === 'inter';
    const r =
      v.mode === 'exclusive' ? addGst(v.amount, rate, inter) : removeGst(v.amount, rate, inter);
    return gstResult(r, rate, inter, v.mode === 'exclusive' ? 'total' : 'base');
  },
});

type SimpleGstValues = RateValues & { amount: number; supply: string };
export const GstInclusiveCalculator = createFormTool<SimpleGstValues>({
  fields: [
    {
      name: 'amount',
      label: 'Price including GST',
      type: 'currency',
      default: 11_800,
      min: 0,
      max: 1e12,
    },
    ...rateFields<SimpleGstValues>(),
    {
      name: 'supply',
      label: 'Type of supply',
      type: 'select',
      default: 'intra',
      options: SUPPLY_OPTIONS,
    },
  ],
  compute: (v) =>
    gstResult(
      removeGst(v.amount, rateOf(v), v.supply === 'inter'),
      rateOf(v),
      v.supply === 'inter',
      'base',
    ),
});

export const GstExclusiveCalculator = createFormTool<SimpleGstValues>({
  fields: [
    {
      name: 'amount',
      label: 'Price excluding GST',
      type: 'currency',
      default: 10_000,
      min: 0,
      max: 1e12,
    },
    ...rateFields<SimpleGstValues>(),
    {
      name: 'supply',
      label: 'Type of supply',
      type: 'select',
      default: 'intra',
      options: SUPPLY_OPTIONS,
    },
  ],
  compute: (v) =>
    gstResult(
      addGst(v.amount, rateOf(v), v.supply === 'inter'),
      rateOf(v),
      v.supply === 'inter',
      'total',
    ),
});

type ReverseValues = RateValues & { mode: string; gst: number; base: number; total: number };
export const GstReverseCalculator = createFormTool<ReverseValues>({
  fields: [
    {
      name: 'mode',
      label: 'I know',
      type: 'segmented',
      default: 'gst',
      full: true,
      options: [
        { value: 'gst', label: 'GST amount & rate' },
        { value: 'rate', label: 'Price before & after GST' },
      ],
    },
    {
      name: 'gst',
      label: 'GST amount',
      type: 'currency',
      default: 1_800,
      min: 0,
      max: 1e12,
      showIf: (v) => v.mode === 'gst',
    },
    ...rateFields<ReverseValues>().map((f) => ({
      ...f,
      showIf: (v: ReverseValues) => v.mode === 'gst' && (!f.showIf || f.showIf(v)),
    })),
    {
      name: 'base',
      label: 'Price before GST',
      type: 'currency',
      default: 10_000,
      min: 0.01,
      max: 1e12,
      showIf: (v) => v.mode === 'rate',
    },
    {
      name: 'total',
      label: 'Price after GST',
      type: 'currency',
      default: 11_800,
      min: 0,
      max: 1e12,
      showIf: (v) => v.mode === 'rate',
    },
  ],
  compute: (v) => {
    if (v.mode === 'gst') {
      const rate = rateOf(v);
      const r = fromGstAmount(v.gst, rate);
      return {
        results: [
          { label: 'Taxable value', value: formatINRSmart(r.base), primary: true },
          { label: 'Total including GST', value: formatINRSmart(r.total) },
          { label: 'GST amount', value: formatINRSmart(v.gst) },
        ],
      };
    }
    const rate = impliedRate(v.base, v.total);
    return {
      results: [
        { label: 'GST rate applied', value: formatPercent(rate, 3), primary: true },
        { label: 'GST amount', value: formatINRSmart(v.total - v.base) },
        {
          label: 'Matches standard slab',
          value: CURRENT_RULES.gstRates.some((g) => Math.abs(g.ratePct - rate) < 0.01)
            ? 'Yes'
            : 'No',
        },
      ],
    };
  },
});

type SplitValues = RateValues & { mode: string; amount: number; place: string };
export const GstSplitCalculator = createFormTool<SplitValues>({
  fields: [
    {
      name: 'mode',
      label: 'Amount entered is',
      type: 'segmented',
      default: 'base',
      full: true,
      options: [
        { value: 'base', label: 'Taxable value' },
        { value: 'total', label: 'Total incl. GST' },
        { value: 'gst', label: 'GST amount' },
      ],
    },
    { name: 'amount', label: 'Amount', type: 'currency', default: 50_000, min: 0, max: 1e12 },
    ...rateFields<SplitValues>(),
    {
      name: 'place',
      label: 'Place of supply',
      type: 'select',
      default: 'state',
      options: [
        { value: 'state', label: 'Same state (CGST + SGST)' },
        { value: 'ut', label: 'Same union territory (CGST + UTGST)' },
        { value: 'inter', label: 'Different state (IGST)' },
      ],
    },
  ],
  compute: (v) => {
    const rate = rateOf(v);
    const gst =
      v.mode === 'gst'
        ? v.amount
        : v.mode === 'base'
          ? addGst(v.amount, rate).gst
          : removeGst(v.amount, rate).gst;
    const s = splitGst(gst, v.place === 'inter');
    const second = v.place === 'ut' ? 'UTGST' : 'SGST';
    return {
      results: [
        { label: 'Total GST', value: formatINRSmart(gst), primary: true },
        ...(v.place === 'inter'
          ? [{ label: `IGST @ ${formatNumber(rate, 2)}%`, value: formatINRSmart(s.igst) }]
          : [
              { label: `CGST @ ${formatNumber(rate / 2, 3)}%`, value: formatINRSmart(s.cgst) },
              { label: `${second} @ ${formatNumber(rate / 2, 3)}%`, value: formatINRSmart(s.sgst) },
            ]),
      ],
      notes: [
        'CGST and SGST/UTGST are always equal halves of the GST rate; IGST applies to inter-state supplies and imports.',
      ],
    };
  },
});

type GstAmountValues = RateValues & { amount: number };
export const GstAmountCalculator = createFormTool<GstAmountValues>({
  fields: [
    {
      name: 'amount',
      label: 'Taxable value',
      type: 'currency',
      default: 25_000,
      min: 0,
      max: 1e12,
    },
    ...rateFields<GstAmountValues>(),
  ],
  compute: (v) => {
    const rate = rateOf(v);
    const r = addGst(v.amount, rate);
    return {
      results: [
        {
          label: 'GST amount',
          value: formatINRSmart(r.gst),
          primary: true,
          hint: `at ${formatNumber(rate, 2)}%`,
        },
        { label: 'Total with GST', value: formatINRSmart(r.total) },
      ],
      table: {
        title: 'GST at every rate',
        columns: ['Rate', 'GST', 'Total'],
        rows: CURRENT_RULES.gstRates
          .filter((g) => g.ratePct > 0)
          .map((g) => {
            const x = addGst(v.amount, g.ratePct);
            return [`${g.ratePct}%`, formatINRSmart(x.gst), formatINRSmart(x.total)];
          }),
      },
    };
  },
});

// ---------------------------------------------------------------- Income tax
type ItValues = {
  fy: string;
  age: string;
  salary: number;
  other: number;
  c80: number;
  d80: number;
  nps: number;
  home: number;
  hra: number;
  otherDed: number;
  employerNps: number;
};
function slabTable(r: TaxResult, title: string) {
  return {
    title,
    columns: ['Income slab', 'Rate', 'Taxable in slab', 'Tax'],
    rows: r.lines.map((l) => [
      l.to === null
        ? `Above ${formatLakhCrore(l.from)}`
        : `${formatLakhCrore(l.from, true)} – ${formatLakhCrore(l.to, true)}`,
      `${l.ratePct}%`,
      formatINR(l.taxable),
      formatINR(l.tax),
    ]),
    initialRows: 10,
  };
}
export const IncomeTaxCalculator = createFormTool<ItValues>({
  fields: [
    {
      name: 'fy',
      label: 'Financial year',
      type: 'select',
      default: DEFAULT_FY,
      options: FY_OPTIONS,
    },
    { name: 'age', label: 'Your age', type: 'select', default: 'below60', options: AGE_OPTIONS },
    {
      name: 'salary',
      label: 'Annual salary / pension (gross)',
      type: 'currency',
      default: 1_500_000,
      min: 0,
      max: 1e11,
    },
    {
      name: 'other',
      label: 'Other income (interest, rent, etc.)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e11,
    },
    {
      name: 'employerNps',
      label: 'Employer NPS contribution (80CCD(2))',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e9,
      help: 'Allowed in both regimes.',
    },
    {
      name: 'c80',
      label: '80C investments (PF, PPF, ELSS, LIC…)',
      type: 'currency',
      default: 150_000,
      min: 0,
      max: 1e9,
      help: 'Old regime only. Capped at ₹1.5 lakh.',
    },
    {
      name: 'd80',
      label: '80D health insurance premium',
      type: 'currency',
      default: 25_000,
      min: 0,
      max: 1e9,
    },
    {
      name: 'nps',
      label: 'NPS 80CCD(1B)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e9,
      help: 'Up to ₹50,000.',
    },
    {
      name: 'home',
      label: 'Home loan interest (24b)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e9,
      help: 'Self-occupied: up to ₹2 lakh.',
    },
    {
      name: 'hra',
      label: 'HRA exemption',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e9,
      help: 'Use the HRA calculator to work this out.',
    },
    {
      name: 'otherDed',
      label: 'Other deductions (80E, 80G, 80TTA…)',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e9,
    },
  ],
  compute: (v) => {
    const c = compareRegimes({
      fy: v.fy,
      age: v.age as AgeGroup,
      salaryIncome: v.salary,
      otherIncome: v.other,
      employerNps: v.employerNps,
      professionalTax: 0,
      deductions: {
        sec80C: v.c80,
        sec80D: v.d80,
        sec80CCD1B: v.nps,
        sec24b: v.home,
        hraExemption: v.hra,
        other: v.otherDed,
      },
    });
    const best = c[c.better];
    return {
      results: [
        {
          label: `Tax payable (${c.better === 'new' ? 'new' : 'old'} regime – lower)`,
          value: formatINR(best.totalTax),
          primary: true,
          hint:
            c.saving > 0
              ? `Saves ${formatINR(c.saving)} vs the ${c.better === 'new' ? 'old' : 'new'} regime`
              : 'Both regimes give the same tax',
        },
        {
          label: 'New regime tax',
          value: formatINR(c.new.totalTax),
          hint: `Taxable income ${formatINR(c.new.taxableIncome)}`,
        },
        {
          label: 'Old regime tax',
          value: formatINR(c.old.totalTax),
          hint: `Taxable income ${formatINR(c.old.taxableIncome)}`,
        },
        { label: 'Effective tax rate', value: formatPercent(best.effectiveRatePct) },
        { label: 'Monthly TDS (approx.)', value: formatINR(best.totalTax / 12) },
        { label: 'Rebate u/s 87A applied', value: formatINR(best.rebate) },
      ],
      chart: {
        kind: 'bars',
        title: 'Tax under each regime',
        labels: ['New regime', 'Old regime'],
        series: [{ name: 'Tax + cess', values: [c.new.totalTax, c.old.totalTax] }],
        format: 'inr',
      },
      table: slabTable(best, `Slab-wise tax – ${c.better} regime`),
      notes: [
        ...provisionalNote(v.fy),
        'Capital gains taxed at special rates are not included; use the Capital Gains Calculator for those.',
      ],
    };
  },
});

type HraTaxValues = {
  fy: string;
  basic: number;
  hra: number;
  rent: number;
  metro: string;
  otherIncome: number;
  ded: number;
};
export const HraTaxExemptionCalculator = createFormTool<HraTaxValues>({
  fields: [
    {
      name: 'fy',
      label: 'Financial year',
      type: 'select',
      default: DEFAULT_FY,
      options: FY_OPTIONS,
    },
    {
      name: 'basic',
      label: 'Annual basic + DA',
      type: 'currency',
      default: 600_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'hra',
      label: 'Annual HRA received',
      type: 'currency',
      default: 240_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'rent',
      label: 'Annual rent paid',
      type: 'currency',
      default: 216_000,
      min: 0,
      max: 1e10,
    },
    {
      name: 'metro',
      label: 'City',
      type: 'segmented',
      default: 'metro',
      options: [
        { value: 'metro', label: 'Metro' },
        { value: 'non', label: 'Non-metro' },
      ],
    },
    {
      name: 'otherIncome',
      label: 'Other taxable salary & income',
      type: 'currency',
      default: 400_000,
      min: 0,
      max: 1e10,
      help: 'Special allowance, bonus and other income besides basic and HRA.',
    },
    {
      name: 'ded',
      label: 'Other deductions (80C, 80D…)',
      type: 'currency',
      default: 150_000,
      min: 0,
      max: 1e9,
    },
  ],
  compute: (v) => {
    const h = hraExemption({
      basicDa: v.basic,
      hraReceived: v.hra,
      rentPaid: v.rent,
      metro: v.metro === 'metro',
      fy: v.fy,
    });
    const gross = v.basic + v.hra + v.otherIncome;
    const withHra = computeIncomeTax({
      fy: v.fy,
      regime: 'old',
      salaryIncome: gross,
      deductions: { other: v.ded, hraExemption: h.exempt },
    });
    const without = computeIncomeTax({
      fy: v.fy,
      regime: 'old',
      salaryIncome: gross,
      deductions: { other: v.ded },
    });
    const newRegime = computeIncomeTax({ fy: v.fy, regime: 'new', salaryIncome: gross });
    return {
      results: [
        {
          label: 'HRA exempt from tax',
          value: formatINR(h.exempt),
          primary: true,
          hint: `${formatINR(h.exempt / 12)} per month`,
        },
        {
          label: 'Tax saved by HRA (old regime)',
          value: formatINR(without.totalTax - withHra.totalTax),
        },
        { label: 'Taxable HRA', value: formatINR(h.taxable) },
        { label: 'Old regime tax with HRA', value: formatINR(withHra.totalTax) },
        {
          label: 'New regime tax (no HRA)',
          value: formatINR(newRegime.totalTax),
          hint:
            newRegime.totalTax < withHra.totalTax
              ? 'New regime is still cheaper'
              : 'Old regime with HRA is cheaper',
        },
      ],
      table: {
        title: 'The three HRA limits',
        columns: ['Rule', 'Amount'],
        rows: [
          ['Actual HRA received', formatINR(h.actual)],
          ['Rent paid − 10% of basic + DA', formatINR(h.rentMinus)],
          [`${v.metro === 'metro' ? 50 : 40}% of basic + DA`, formatINR(h.pctOfSalary)],
        ],
      },
      notes: [
        ...provisionalNote(v.fy),
        `Metro cities for HRA: ${getTaxRules(v.fy).hra.metroCities.join(', ')}.`,
      ],
    };
  },
});

// ---------------------------------------------------------------- TDS
type TdsValues = { section: string; amount: number; pan: string };
export const TdsCalculator = createFormTool<TdsValues>({
  fields: [
    {
      name: 'section',
      label: 'Nature of payment',
      type: 'select',
      default: '194J-prof',
      full: true,
      options: CURRENT_RULES.tds.map((t) => ({ value: t.id, label: `${t.section} – ${t.nature}` })),
    },
    {
      name: 'amount',
      label: 'Payment amount',
      type: 'currency',
      default: 100_000,
      min: 0,
      max: 1e12,
    },
    {
      name: 'pan',
      label: 'Payee has furnished PAN?',
      type: 'segmented',
      default: 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
    },
  ],
  compute: (v) => {
    const s = CURRENT_RULES.tds.find((t) => t.id === v.section);
    if (!s) throw new InputError('Choose a section.', 'section');
    const basisText =
      s.basis === 'per-month'
        ? 'per month'
        : s.basis === 'per-transaction'
          ? 'per transaction'
          : 'in a financial year';
    const below = v.amount <= s.threshold;
    const rate = v.pan === 'no' ? Math.max(s.ratePct, s.noPanRatePct ?? 20) : s.ratePct;
    const base = s.onExcess ? Math.max(0, v.amount - s.threshold) : v.amount;
    const tds = below ? 0 : (base * rate) / 100;
    return {
      results: [
        {
          label: 'TDS to deduct',
          value: formatINRSmart(Math.round(tds)),
          primary: true,
          hint: below
            ? `Below threshold of ${formatINR(s.threshold)} ${basisText}`
            : `${formatNumber(rate, 2)}% of ${formatINR(base)}`,
        },
        { label: 'Amount payable after TDS', value: formatINRSmart(v.amount - Math.round(tds)) },
        { label: 'Section', value: s.section },
        { label: 'Threshold', value: `${formatINR(s.threshold)} ${basisText}` },
      ],
      notes: [
        'Thresholds apply to the aggregate paid to the same payee; check whether earlier payments cross the limit.',
        'Without PAN, TDS is generally 20% (5% for 194-O and 194Q) under Section 206AA.',
      ],
    };
  },
});

// ---------------------------------------------------------------- Capital gains
type CgValues = {
  asset: string;
  buy: string;
  sell: string;
  buyPrice: number;
  sellPrice: number;
  expenses: number;
  slab: string;
};
export const CapitalGainsCalculator = createFormTool<CgValues>({
  fields: [
    {
      name: 'asset',
      label: 'Asset type',
      type: 'select',
      default: 'listed-equity',
      full: true,
      options: CURRENT_RULES.capitalGains.assets.map((a) => ({ value: a.id, label: a.label })),
    },
    { name: 'buy', label: 'Purchase date', type: 'date', default: '2022-04-01' },
    { name: 'sell', label: 'Sale date', type: 'date', default: () => todayISO() },
    {
      name: 'buyPrice',
      label: 'Purchase cost',
      type: 'currency',
      default: 500_000,
      min: 0,
      max: 1e12,
    },
    {
      name: 'sellPrice',
      label: 'Sale value',
      type: 'currency',
      default: 800_000,
      min: 0,
      max: 1e12,
    },
    {
      name: 'expenses',
      label: 'Transfer expenses & improvements',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e12,
      help: 'Brokerage, stamp duty, commission, cost of improvement.',
    },
    {
      name: 'slab',
      label: 'Your income-tax slab rate',
      type: 'select',
      default: '30',
      options: SLAB_OPTIONS,
    },
  ],
  compute: (v) => {
    const buy = parseISODate(v.buy, 'Purchase date');
    const sell = parseISODate(v.sell, 'Sale date');
    const rules = getTaxRules();
    const r = capitalGains(
      {
        assetId: v.asset,
        buyDate: buy,
        sellDate: sell,
        buyPrice: v.buyPrice,
        sellPrice: v.sellPrice,
        expenses: v.expenses,
        slabRatePct: Number(v.slab),
      },
      rules,
    );
    const results: ResultItem[] = [
      {
        label: r.gain >= 0 ? 'Tax on capital gains' : 'Capital loss',
        value: r.gain >= 0 ? formatINR(r.totalTax) : formatINR(-r.gain),
        primary: true,
        hint:
          r.gain >= 0
            ? `Includes ${rules.cessPct}% cess`
            : 'Can be set off and carried forward for 8 years',
      },
      {
        label: 'Type of gain',
        value: `${r.term === 'long' ? 'Long-term' : 'Short-term'} (${r.monthsHeld} months held)`,
      },
      { label: 'Capital gain', value: formatINR(r.gain) },
      { label: 'Taxable gain', value: formatINR(r.taxableGain) },
      { label: 'Tax rate', value: r.method },
    ];
    if (r.indexed)
      results.push({
        label: 'Indexed cost of acquisition',
        value: formatINR(r.indexed.indexedCost),
        hint: `Gain with indexation ${formatINR(r.indexed.gain)}`,
      });
    return {
      results,
      notes: [
        'Surcharge (for income above ₹50 lakh) is not included.',
        ...(r.gain < 0
          ? [
              'Short-term losses can be set off against any capital gain; long-term losses only against long-term gains.',
            ]
          : []),
      ],
    };
  },
});

// ---------------------------------------------------------------- Tax saving
type SavingValues = {
  fy: string;
  salary: number;
  c80: number;
  d80: number;
  nps: number;
  home: number;
  age: string;
};
export const TaxSavingCalculator = createFormTool<SavingValues>({
  fields: [
    {
      name: 'fy',
      label: 'Financial year',
      type: 'select',
      default: DEFAULT_FY,
      options: FY_OPTIONS,
    },
    { name: 'age', label: 'Your age', type: 'select', default: 'below60', options: AGE_OPTIONS },
    {
      name: 'salary',
      label: 'Annual gross income',
      type: 'currency',
      default: 1_800_000,
      min: 0,
      max: 1e11,
    },
    {
      name: 'c80',
      label: 'Current 80C investments',
      type: 'currency',
      default: 60_000,
      min: 0,
      max: 1e9,
    },
    { name: 'd80', label: 'Current 80D premium', type: 'currency', default: 0, min: 0, max: 1e9 },
    { name: 'nps', label: 'Current NPS 80CCD(1B)', type: 'currency', default: 0, min: 0, max: 1e9 },
    {
      name: 'home',
      label: 'Home loan interest paid',
      type: 'currency',
      default: 0,
      min: 0,
      max: 1e9,
    },
  ],
  compute: (v) => {
    const rules = getTaxRules(v.fy);
    const L = rules.deductionLimits;
    const age = v.age as AgeGroup;
    const d80Limit = age === 'below60' ? L.sec80D.self : L.sec80D.selfSenior;
    const base = { fy: v.fy, age, salaryIncome: v.salary };
    const now = computeIncomeTax({
      ...base,
      regime: 'old',
      deductions: { sec80C: v.c80, sec80D: v.d80, sec80CCD1B: v.nps, sec24b: v.home },
    });
    const maxed = computeIncomeTax({
      ...base,
      regime: 'old',
      deductions: {
        sec80C: L.sec80C,
        sec80D: Math.max(v.d80, d80Limit),
        sec80CCD1B: L.sec80CCD1B,
        sec24b: v.home,
      },
    });
    const newTax = computeIncomeTax({ ...base, regime: 'new' });
    const room = [
      ['80C (ELSS, PPF, EPF, life insurance, tuition)', Math.max(0, L.sec80C - v.c80)],
      ['80D (health insurance for self/family)', Math.max(0, d80Limit - v.d80)],
      ['80CCD(1B) (NPS, additional)', Math.max(0, L.sec80CCD1B - v.nps)],
    ] as const;
    const best = Math.min(now.totalTax, maxed.totalTax, newTax.totalTax);
    return {
      results: [
        {
          label: 'Additional tax you can save (old regime)',
          value: formatINR(now.totalTax - maxed.totalTax),
          primary: true,
          hint: 'By using all remaining deduction limits',
        },
        { label: 'Old regime tax now', value: formatINR(now.totalTax) },
        { label: 'Old regime tax with full deductions', value: formatINR(maxed.totalTax) },
        { label: 'New regime tax', value: formatINR(newTax.totalTax) },
        {
          label: 'Best option',
          value: best === newTax.totalTax ? 'New regime' : 'Old regime with deductions',
        },
      ],
      table: {
        title: 'Unused deduction room',
        columns: ['Section', 'Remaining limit'],
        rows: room.map(([s, r]) => [s, formatINR(r)]),
      },
      notes: [
        ...provisionalNote(v.fy),
        'Invest only in products that suit your goals — tax saving alone is not a good reason to buy insurance or lock in money.',
      ],
    };
  },
});
