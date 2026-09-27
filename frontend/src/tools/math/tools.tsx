import { createFormTool } from '@/components/form-tool/FormTool';
import type { ResultItem } from '@/components/form-tool/types';
import { formatNumber, formatSmart } from '@/utils/format';
import { InputError } from '@/utils/number';
import {
  combinations,
  describeBig,
  factorialBig,
  factorize,
  fracOp,
  fracToString,
  gcdMany,
  isPrime,
  lcmMany,
  nextPrime,
  parseFraction,
  parseIntegerList,
  parseNumberList,
  permutations,
  prevPrime,
  ratioSimplify,
  simplifyRadical,
  stats,
  toMixed,
  weightedAverage,
} from './engine';

const fmt = (n: number) => formatSmart(n, 12);

// ---------------------------------------------------------------- percentages
type PctValues = { mode: string; a: number; b: number };
export const PercentageCalculator = createFormTool<PctValues>({
  fields: [
    {
      name: 'mode',
      label: 'What do you want to find?',
      type: 'select',
      default: 'of',
      full: true,
      options: [
        { value: 'of', label: 'What is X% of Y?' },
        { value: 'is', label: 'X is what percent of Y?' },
        { value: 'whole', label: 'X is Y% of what?' },
        { value: 'change', label: 'Percentage change from X to Y' },
      ],
    },
    { name: 'a', label: 'X', type: 'number', default: 15, min: -1e15, max: 1e15 },
    { name: 'b', label: 'Y', type: 'number', default: 2000, min: -1e15, max: 1e15 },
  ],
  compute: (v) => {
    switch (v.mode) {
      case 'of':
        return {
          results: [
            { label: `${fmt(v.a)}% of ${fmt(v.b)}`, value: fmt((v.a / 100) * v.b), primary: true },
          ],
        };
      case 'is':
        if (v.b === 0) throw new InputError('Y cannot be zero.', 'b');
        return {
          results: [
            {
              label: `${fmt(v.a)} is this percent of ${fmt(v.b)}`,
              value: `${fmt((v.a / v.b) * 100)}%`,
              primary: true,
            },
          ],
        };
      case 'whole':
        if (v.b === 0) throw new InputError('Y cannot be zero.', 'b');
        return {
          results: [
            {
              label: `${fmt(v.a)} is ${fmt(v.b)}% of`,
              value: fmt((v.a * 100) / v.b),
              primary: true,
            },
          ],
        };
      default: {
        if (v.a === 0) throw new InputError('X cannot be zero for a percentage change.', 'a');
        const ch = ((v.b - v.a) / Math.abs(v.a)) * 100;
        return {
          results: [
            {
              label: ch >= 0 ? 'Percentage increase' : 'Percentage decrease',
              value: `${fmt(Math.abs(ch))}%`,
              primary: true,
            },
            { label: 'Difference', value: fmt(v.b - v.a) },
          ],
        };
      }
    }
  },
});

type DiffValues = { a: number; b: number };
export const PercentageDifferenceCalculator = createFormTool<DiffValues>({
  fields: [
    { name: 'a', label: 'Value 1', type: 'number', default: 120, min: -1e15, max: 1e15 },
    { name: 'b', label: 'Value 2', type: 'number', default: 150, min: -1e15, max: 1e15 },
  ],
  compute: (v) => {
    const avg = (Math.abs(v.a) + Math.abs(v.b)) / 2;
    if (avg === 0) throw new InputError('Both values cannot be zero.', 'a');
    const diff = Math.abs(v.a - v.b);
    return {
      results: [
        {
          label: 'Percentage difference',
          value: `${fmt((diff / avg) * 100)}%`,
          primary: true,
          hint: 'Relative to the average of the two values',
        },
        { label: 'Absolute difference', value: fmt(diff) },
        { label: 'Average of the two values', value: fmt(avg) },
        ...(v.a !== 0
          ? [
              {
                label: 'Change from value 1 to value 2',
                value: `${fmt(((v.b - v.a) / Math.abs(v.a)) * 100)}%`,
              },
            ]
          : []),
      ],
    };
  },
});

// ---------------------------------------------------------------- fractions, ratios, proportions
type FracValues = { a: string; op: string; b: string };
export const FractionCalculator = createFormTool<FracValues>({
  fields: [
    {
      name: 'a',
      label: 'First fraction',
      type: 'text',
      default: '3/4',
      placeholder: 'e.g. 3/4, 1 1/2 or 0.25',
      maxLength: 60,
    },
    {
      name: 'op',
      label: 'Operation',
      type: 'segmented',
      default: '+',
      options: [
        { value: '+', label: '+' },
        { value: '-', label: '−' },
        { value: '*', label: '×' },
        { value: '/', label: '÷' },
      ],
    },
    {
      name: 'b',
      label: 'Second fraction',
      type: 'text',
      default: '2/3',
      placeholder: 'e.g. 2/3',
      maxLength: 60,
    },
  ],
  compute: (v) => {
    const a = parseFraction(v.a, 'First fraction');
    const b = parseFraction(v.b, 'Second fraction');
    const r = fracOp(a, b, v.op);
    const decimal = Number(r.n) / Number(r.d);
    return {
      results: [
        { label: 'Result (simplified)', value: fracToString(r), primary: true },
        { label: 'Mixed number', value: toMixed(r) },
        { label: 'Decimal', value: fmt(decimal) },
        { label: 'Percentage', value: `${fmt(decimal * 100)}%` },
      ],
    };
  },
});

type RatioValues = { mode: string; a: number; b: number; c: number | ''; target: number };
export const RatioCalculator = createFormTool<RatioValues>({
  fields: [
    {
      name: 'mode',
      label: 'Calculate',
      type: 'segmented',
      default: 'simplify',
      full: true,
      options: [
        { value: 'simplify', label: 'Simplify ratio' },
        { value: 'scale', label: 'Scale to a total' },
      ],
    },
    { name: 'a', label: 'A', type: 'number', default: 12, min: 0, max: 1e12 },
    { name: 'b', label: 'B', type: 'number', default: 18, min: 0, max: 1e12 },
    { name: 'c', label: 'C', type: 'number', default: '', min: 0, max: 1e12, optional: true },
    {
      name: 'target',
      label: 'Total to divide',
      type: 'number',
      default: 1000,
      min: 0,
      max: 1e15,
      showIf: (v) => v.mode === 'scale',
    },
  ],
  compute: (v) => {
    const parts = [v.a, v.b, ...(typeof v.c === 'number' ? [v.c] : [])];
    if (parts.every((p) => p === 0))
      throw new InputError('Enter at least one non-zero value.', 'a');
    const simple = ratioSimplify(parts);
    const total = parts.reduce((x, y) => x + y, 0);
    const items: ResultItem[] = [
      { label: 'Simplified ratio', value: simple.join(' : '), primary: v.mode === 'simplify' },
      {
        label: 'As fractions of the whole',
        value: parts.map((p) => `${fmt((p / total) * 100)}%`).join(' : '),
      },
      {
        label: 'Unit ratio',
        value: parts.map((p) => fmt(p / parts[0] || 0)).join(' : '),
        hint: 'First term scaled to 1',
      },
    ];
    if (v.mode === 'scale')
      items.unshift({
        label: `Dividing ${fmt(v.target)} in this ratio`,
        value: parts.map((p) => fmt((p / total) * v.target)).join(' : '),
        primary: true,
      });
    return { results: items };
  },
});

type PropValues = {
  unknown: string;
  a: number | '';
  b: number | '';
  c: number | '';
  d: number | '';
};
export const ProportionCalculator = createFormTool<PropValues>({
  fields: [
    {
      name: 'unknown',
      label: 'Solve A/B = C/D for',
      type: 'segmented',
      default: 'd',
      full: true,
      options: ['a', 'b', 'c', 'd'].map((x) => ({ value: x, label: x.toUpperCase() })),
    },
    {
      name: 'a',
      label: 'A',
      type: 'number',
      default: 3,
      min: -1e15,
      max: 1e15,
      showIf: (v) => v.unknown !== 'a',
    },
    {
      name: 'b',
      label: 'B',
      type: 'number',
      default: 4,
      min: -1e15,
      max: 1e15,
      showIf: (v) => v.unknown !== 'b',
    },
    {
      name: 'c',
      label: 'C',
      type: 'number',
      default: 15,
      min: -1e15,
      max: 1e15,
      showIf: (v) => v.unknown !== 'c',
    },
    {
      name: 'd',
      label: 'D',
      type: 'number',
      default: 20,
      min: -1e15,
      max: 1e15,
      showIf: (v) => v.unknown !== 'd',
    },
  ],
  compute: (v) => {
    const n = (x: number | '') => (typeof x === 'number' ? x : 0);
    const [a, b, c, d] = [n(v.a), n(v.b), n(v.c), n(v.d)];
    let x: number;
    if (v.unknown === 'a') {
      if (d === 0) throw new InputError('D cannot be zero.', 'd');
      x = (b * c) / d;
    } else if (v.unknown === 'b') {
      if (c === 0) throw new InputError('C cannot be zero.', 'c');
      x = (a * d) / c;
    } else if (v.unknown === 'c') {
      if (b === 0) throw new InputError('B cannot be zero.', 'b');
      x = (a * d) / b;
    } else {
      if (a === 0) throw new InputError('A cannot be zero.', 'a');
      x = (b * c) / a;
    }
    const vals = { a, b, c, d, [v.unknown]: x } as Record<string, number>;
    return {
      results: [
        { label: `${v.unknown.toUpperCase()} =`, value: fmt(x), primary: true },
        {
          label: 'Proportion',
          value: `${fmt(vals.a)} / ${fmt(vals.b)} = ${fmt(vals.c)} / ${fmt(vals.d)}`,
        },
      ],
    };
  },
});

// ---------------------------------------------------------------- averages
type AvgValues = { numbers: string };
export const AverageCalculator = createFormTool<AvgValues>({
  fields: [
    {
      name: 'numbers',
      label: 'Numbers',
      type: 'textarea',
      default: '12, 15, 18, 22, 22, 30',
      rows: 4,
      placeholder: 'Separate with commas, spaces or new lines',
      maxLength: 200_000,
    },
  ],
  compute: (v) => {
    const s = stats(parseNumberList(v.numbers));
    return {
      results: [
        { label: 'Average (mean)', value: fmt(s.mean), primary: true },
        { label: 'Median', value: fmt(s.median) },
        {
          label: 'Mode',
          value: s.modes.length ? s.modes.map(fmt).join(', ') : 'No repeated value',
        },
        { label: 'Sum', value: fmt(s.sum) },
        { label: 'Count', value: formatNumber(s.n, 0) },
        { label: 'Range', value: `${fmt(s.range)} (${fmt(s.min)} to ${fmt(s.max)})` },
        { label: 'Standard deviation (population)', value: fmt(s.stdDev) },
        { label: 'Standard deviation (sample)', value: fmt(s.sampleStdDev) },
        ...(s.geometric !== null ? [{ label: 'Geometric mean', value: fmt(s.geometric) }] : []),
      ],
    };
  },
});

type WavgValues = { data: string };
export const WeightedAverageCalculator = createFormTool<WavgValues>({
  fields: [
    {
      name: 'data',
      label: 'Value and weight on each line',
      type: 'textarea',
      default: '85, 4\n72, 3\n90, 2\n65, 1',
      rows: 6,
      help: 'Example: “85, 4” means value 85 with weight 4 (credits, quantity, percentage…).',
      maxLength: 100_000,
    },
  ],
  compute: (v) => {
    const lines = v.data
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) throw new InputError('Enter at least one value and weight.', 'data');
    const pairs = lines.map((l, i) => {
      const p = l.split(/[\s,;:]+/).filter(Boolean);
      const value = Number(p[0]);
      const weight = Number(p[1]);
      if (p.length !== 2 || !Number.isFinite(value) || !Number.isFinite(weight))
        throw new InputError(
          `Line ${i + 1} should contain a value and a weight, e.g. “85, 4”.`,
          'data',
        );
      if (weight < 0) throw new InputError(`Line ${i + 1}: weight cannot be negative.`, 'data');
      return { value, weight };
    });
    const r = weightedAverage(pairs);
    const simple = pairs.reduce((a, p) => a + p.value, 0) / pairs.length;
    return {
      results: [
        { label: 'Weighted average', value: fmt(r.average), primary: true },
        { label: 'Total weight', value: fmt(r.totalWeight) },
        { label: 'Simple (unweighted) average', value: fmt(simple) },
      ],
    };
  },
});

// ---------------------------------------------------------------- powers and roots
type ExpValues = { base: number; exponent: number };
export const ExponentCalculator = createFormTool<ExpValues>({
  fields: [
    { name: 'base', label: 'Base', type: 'number', default: 2, min: -1e15, max: 1e15 },
    {
      name: 'exponent',
      label: 'Exponent (power)',
      type: 'number',
      default: 10,
      min: -1e6,
      max: 1e6,
    },
  ],
  compute: (v) => {
    if (v.base === 0 && v.exponent < 0)
      throw new InputError('Zero cannot be raised to a negative power.', 'exponent');
    if (v.base < 0 && !Number.isInteger(v.exponent))
      throw new InputError(
        'A negative base needs a whole-number exponent for a real result.',
        'exponent',
      );
    if (
      Number.isInteger(v.base) &&
      Number.isInteger(v.exponent) &&
      v.exponent >= 0 &&
      v.exponent <= 10000 &&
      Math.abs(v.base) <= 1e9
    ) {
      const big = BigInt(v.base) ** BigInt(v.exponent);
      const d = describeBig(big);
      return {
        results: [
          {
            label: `${fmt(v.base)}^${fmt(v.exponent)}`,
            value: d.digits > 60 ? d.scientific : d.grouped,
            primary: true,
          },
          { label: 'Number of digits', value: formatNumber(d.digits, 0) },
          ...(d.digits > 60
            ? [{ label: 'Exact value (first 60 digits)', value: `${d.grouped.slice(0, 80)}…` }]
            : []),
        ],
      };
    }
    const r = v.base ** v.exponent;
    if (!Number.isFinite(r))
      throw new InputError('The result is too large to display.', 'exponent');
    return {
      results: [{ label: `${fmt(v.base)}^${fmt(v.exponent)}`, value: fmt(r), primary: true }],
    };
  },
});

function rootTool(index: 2 | 3) {
  type RootValues = { x: number };
  const name = index === 2 ? 'Square root' : 'Cube root';
  const sym = index === 2 ? '√' : '∛';
  return createFormTool<RootValues>({
    fields: [
      {
        name: 'x',
        label: 'Number',
        type: 'number',
        default: index === 2 ? 72 : 54,
        min: index === 2 ? 0 : -1e15,
        max: 1e15,
      },
    ],
    compute: (v) => {
      const r = index === 2 ? Math.sqrt(v.x) : Math.cbrt(v.x);
      const simp = simplifyRadical(v.x, index);
      const perfect = Number.isInteger(v.x) && Number.isInteger(Number(r.toPrecision(15)));
      const items: ResultItem[] = [
        { label: `${name} of ${fmt(v.x)}`, value: fmt(r), primary: true },
      ];
      if (simp && !perfect && simp.outside !== 1)
        items.push({
          label: 'Simplified radical form',
          value: `${simp.outside}${sym}${simp.inside}`,
        });
      items.push({
        label: `Is ${fmt(v.x)} a perfect ${index === 2 ? 'square' : 'cube'}?`,
        value: perfect ? 'Yes' : 'No',
      });
      items.push({
        label: 'Check',
        value: `${fmt(r)}${index === 2 ? '²' : '³'} = ${fmt(r ** index)}`,
      });
      return { results: items };
    },
  });
}
export const SquareRootCalculator = rootTool(2);
export const CubeRootCalculator = rootTool(3);

// ---------------------------------------------------------------- number theory
type ListValues = { numbers: string };
export const GcdCalculator = createFormTool<ListValues>({
  fields: [
    {
      name: 'numbers',
      label: 'Whole numbers',
      type: 'textarea',
      default: '48, 180, 600',
      rows: 3,
      placeholder: 'e.g. 48, 180, 600',
      maxLength: 2000,
    },
  ],
  compute: (v) => {
    const nums = parseIntegerList(v.numbers);
    const g = gcdMany(nums);
    return {
      results: [
        {
          label: 'Greatest common divisor (GCD / HCF)',
          value: describeBig(g).grouped,
          primary: true,
        },
        {
          label: 'Simplified',
          value: g > 0n ? nums.map((n) => (n / g).toString()).join(' : ') : '—',
          hint: 'Each number divided by the GCD',
        },
        ...(nums.length === 2 && g > 0n
          ? [{ label: 'LCM of the two numbers', value: describeBig(lcmMany(nums)).grouped }]
          : []),
      ],
    };
  },
});

export const LcmCalculator = createFormTool<ListValues>({
  fields: [
    {
      name: 'numbers',
      label: 'Whole numbers',
      type: 'textarea',
      default: '4, 6, 15',
      rows: 3,
      placeholder: 'e.g. 4, 6, 15',
      maxLength: 2000,
    },
  ],
  compute: (v) => {
    const nums = parseIntegerList(v.numbers);
    const l = lcmMany(nums);
    return {
      results: [
        { label: 'Least common multiple (LCM)', value: describeBig(l).grouped, primary: true },
        { label: 'GCD / HCF', value: describeBig(gcdMany(nums)).grouped },
      ],
    };
  },
});

type PrimeValues = { n: string };
export const PrimeNumberChecker = createFormTool<PrimeValues>({
  fields: [
    {
      name: 'n',
      label: 'Whole number',
      type: 'text',
      default: '97',
      maxLength: 25,
      placeholder: 'Up to 24 digits',
    },
  ],
  compute: (v) => {
    const t = v.n.replace(/[,\s_]/g, '');
    if (!/^\d{1,24}$/.test(t))
      throw new InputError('Enter a positive whole number with up to 24 digits.', 'n');
    const n = BigInt(t);
    const prime = isPrime(n);
    const items: ResultItem[] = [
      {
        label: `Is ${describeBig(n).grouped} prime?`,
        value:
          n < 2n ? 'No – primes start at 2' : prime ? 'Yes, it is prime' : 'No, it is composite',
        primary: true,
      },
    ];
    if (!prime && n >= 4n && n <= 10n ** 13n) {
      const f = factorize(n);
      items.push({
        label: 'Prime factorisation',
        value: f
          .map((x) => (x.power > 1 ? `${x.prime}^${x.power}` : x.prime.toString()))
          .join(' × '),
      });
      const divisors = f.reduce((a, x) => a * (x.power + 1), 1);
      items.push({ label: 'Number of divisors', value: formatNumber(divisors, 0) });
    }
    if (n <= 10n ** 15n) {
      items.push({ label: 'Next prime', value: describeBig(nextPrime(n)).grouped });
      const p = prevPrime(n);
      items.push({ label: 'Previous prime', value: p ? describeBig(p).grouped : 'None' });
    }
    return { results: items };
  },
});

type RandValues = {
  min: number;
  max: number;
  count: number;
  unique: boolean;
  decimals: number;
  sort: boolean;
};
function secureRandom(): number {
  const a = new Uint32Array(2);
  crypto.getRandomValues(a);
  // 53-bit uniform float in [0, 1)
  return (a[0] * 2 ** 21 + (a[1] >>> 11)) / 2 ** 53;
}
export const RandomNumberGenerator = createFormTool<RandValues>({
  instant: false,
  submitLabel: 'Generate',
  urlState: false,
  fields: [
    { name: 'min', label: 'Minimum', type: 'number', default: 1, min: -1e12, max: 1e12 },
    { name: 'max', label: 'Maximum', type: 'number', default: 100, min: -1e12, max: 1e12 },
    {
      name: 'count',
      label: 'How many numbers',
      type: 'number',
      default: 1,
      min: 1,
      max: 1000,
      integer: true,
    },
    {
      name: 'decimals',
      label: 'Decimal places',
      type: 'number',
      default: 0,
      min: 0,
      max: 6,
      integer: true,
    },
    { name: 'unique', label: 'No repeats', type: 'toggle', default: true },
    { name: 'sort', label: 'Sort ascending', type: 'toggle', default: false },
  ],
  validate: (v) =>
    v.min >= v.max ? { field: 'max', message: 'Maximum must be greater than minimum.' } : null,
  compute: (v) => {
    const scale = 10 ** v.decimals;
    const lo = Math.ceil(v.min * scale);
    const hi = Math.floor(v.max * scale);
    const span = hi - lo + 1;
    if (v.unique && v.count > span)
      throw new InputError(
        `Only ${formatNumber(span, 0)} unique values exist in this range.`,
        'count',
      );
    const seen = new Set<number>();
    const out: number[] = [];
    while (out.length < v.count) {
      const x = lo + Math.floor(secureRandom() * span);
      if (v.unique && seen.has(x)) continue;
      seen.add(x);
      out.push(x / scale);
    }
    if (v.sort) out.sort((a, b) => a - b);
    const text = out.map((x) => x.toFixed(v.decimals)).join(', ');
    return {
      results: [
        {
          label: v.count === 1 ? 'Random number' : `${v.count} random numbers`,
          value: text,
          primary: true,
        },
      ],
      notes: ['Generated with your browser’s cryptographically secure random number generator.'],
    };
  },
});

type FactValues = { n: number };
export const FactorialCalculator = createFormTool<FactValues>({
  fields: [
    { name: 'n', label: 'n', type: 'number', default: 20, min: 0, max: 5000, integer: true },
  ],
  compute: (v) => {
    const d = describeBig(factorialBig(v.n));
    return {
      results: [
        { label: `${v.n}!`, value: d.digits > 40 ? d.scientific : d.grouped, primary: true },
        { label: 'Number of digits', value: formatNumber(d.digits, 0) },
        ...(d.digits > 40
          ? [{ label: 'Leading digits', value: `${d.grouped.slice(0, 60)}…` }]
          : []),
      ],
    };
  },
});

type NrValues = { n: number; r: number; repetition: boolean };
function nrTool(kind: 'perm' | 'comb') {
  return createFormTool<NrValues>({
    fields: [
      {
        name: 'n',
        label: 'Total items (n)',
        type: 'number',
        default: kind === 'perm' ? 10 : 52,
        min: 0,
        max: 10000,
        integer: true,
      },
      {
        name: 'r',
        label: 'Items chosen (r)',
        type: 'number',
        default: kind === 'perm' ? 3 : 5,
        min: 0,
        max: 10000,
        integer: true,
      },
      { name: 'repetition', label: 'Repetition allowed', type: 'toggle', default: false },
    ],
    compute: (v) => {
      const val =
        kind === 'perm'
          ? permutations(v.n, v.r, v.repetition)
          : combinations(v.n, v.r, v.repetition);
      const other =
        kind === 'perm'
          ? combinations(v.n, v.r, v.repetition)
          : permutations(v.n, v.r, v.repetition);
      const d = describeBig(val);
      const label = kind === 'perm' ? `P(${v.n}, ${v.r})` : `C(${v.n}, ${v.r})`;
      return {
        results: [
          {
            label: `${label}${v.repetition ? ' with repetition' : ''}`,
            value: d.digits > 40 ? d.scientific : d.grouped,
            primary: true,
          },
          {
            label:
              kind === 'perm' ? 'Combinations (order ignored)' : 'Permutations (order matters)',
            value:
              describeBig(other).digits > 40
                ? describeBig(other).scientific
                : describeBig(other).grouped,
          },
        ],
      };
    },
  });
}
export const PermutationCalculator = nrTool('perm');
export const CombinationCalculator = nrTool('comb');
