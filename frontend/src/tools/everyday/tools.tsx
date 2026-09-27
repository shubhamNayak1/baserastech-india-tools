import { createFormTool } from '@/components/form-tool/FormTool';
import type { ResultItem } from '@/components/form-tool/types';
import { formatINR, formatINRSmart, formatNumber, formatSmart } from '@/utils/format';
import { InputError } from '@/utils/number';
import {
  addDays,
  addMonths,
  daysBetween,
  diffYMD,
  formatClock,
  formatLongDate,
  formatYMD,
  parseISODate,
  parseTime,
  todayISO,
  toISODate,
} from '@/utils/date';
import {
  bedtimesFor,
  convertCooking,
  COOKING_UNITS,
  electricityCost,
  fuelCost,
  INGREDIENTS,
  mileage,
  pickRandom,
  splitProportional,
  tipSplit,
  wakeTimesFor,
} from './engine';

type TipValues = { bill: number; tip: number; people: number; roundUp: boolean };
export const TipCalculator = createFormTool<TipValues>({
  fields: [
    { name: 'bill', label: 'Bill amount', type: 'currency', default: 2400, min: 1, max: 1e9 },
    { name: 'tip', label: 'Tip', type: 'percent', default: 10, min: 0, max: 100 },
    {
      name: 'people',
      label: 'Number of people',
      type: 'number',
      default: 4,
      min: 1,
      max: 500,
      integer: true,
    },
    {
      name: 'roundUp',
      label: 'Round up each share to the nearest rupee',
      type: 'toggle',
      default: false,
    },
  ],
  compute: (v) => {
    const r = tipSplit(v.bill, v.tip, v.people, v.roundUp);
    return {
      results: [
        { label: 'Each person pays', value: formatINRSmart(r.perPerson), primary: true },
        { label: 'Tip amount', value: formatINRSmart(r.tip) },
        { label: 'Total with tip', value: formatINRSmart(r.total) },
      ],
      table: {
        title: 'Tip at a glance',
        columns: ['Tip %', 'Tip', 'Total', 'Per person'],
        rows: [5, 10, 12.5, 15, 20].map((p) => {
          const x = tipSplit(v.bill, p, v.people, false);
          return [
            `${p}%`,
            formatINRSmart(x.tip),
            formatINRSmart(x.total),
            formatINRSmart(x.perPerson),
          ];
        }),
      },
      notes: [
        'Check whether a service charge is already on the bill — it is optional in restaurants in India.',
      ],
    };
  },
});

type SplitValues = {
  mode: string;
  total: number;
  people: number;
  service: number;
  gst: number;
  tip: number;
  items: string;
};
export const SplitBillCalculator = createFormTool<SplitValues>({
  fields: [
    {
      name: 'mode',
      label: 'Split',
      type: 'segmented',
      default: 'equal',
      full: true,
      options: [
        { value: 'equal', label: 'Equally' },
        { value: 'items', label: 'By what each person ordered' },
      ],
    },
    {
      name: 'total',
      label: 'Food & drinks subtotal',
      type: 'currency',
      default: 3200,
      min: 1,
      max: 1e9,
      showIf: (v) => v.mode === 'equal',
    },
    {
      name: 'people',
      label: 'Number of people',
      type: 'number',
      default: 4,
      min: 1,
      max: 500,
      integer: true,
      showIf: (v) => v.mode === 'equal',
    },
    {
      name: 'items',
      label: 'Name and amount ordered (one per line)',
      type: 'textarea',
      default: 'Asha, 850\nRavi, 1200\nMeera, 650\nKabir, 500',
      rows: 5,
      showIf: (v) => v.mode === 'items',
      maxLength: 5000,
    },
    { name: 'service', label: 'Service charge', type: 'percent', default: 0, min: 0, max: 30 },
    {
      name: 'gst',
      label: 'GST',
      type: 'percent',
      default: 5,
      min: 0,
      max: 28,
      help: 'Most restaurants charge 5%.',
    },
    { name: 'tip', label: 'Tip (amount)', type: 'currency', default: 0, min: 0, max: 1e8 },
  ],
  compute: (v) => {
    const extraPct = v.service + v.gst;
    if (v.mode === 'equal') {
      const s = splitProportional([{ name: 'All', amount: v.total }], extraPct, v.tip);
      return {
        results: [
          {
            label: 'Each person pays',
            value: formatINRSmart(Math.ceil((s.grand / v.people) * 100) / 100),
            primary: true,
          },
          { label: 'Grand total', value: formatINRSmart(s.grand) },
          { label: 'Service charge + GST', value: formatINRSmart(s.extra) },
        ],
      };
    }
    const items = v.items
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l, i) => {
        const m = /^(.*?)[,:\-\t ]+₹?\s*([\d,.]+)$/.exec(l);
        if (!m) throw new InputError(`Line ${i + 1} should look like “Name, 500”.`, 'items');
        const amount = Number(m[2].replace(/,/g, ''));
        if (!(amount >= 0)) throw new InputError(`Line ${i + 1}: enter a valid amount.`, 'items');
        return { name: m[1].trim() || `Person ${i + 1}`, amount };
      });
    if (!items.length) throw new InputError('Add at least one person.', 'items');
    const s = splitProportional(items, extraPct, v.tip);
    return {
      results: [
        {
          label: 'Grand total',
          value: formatINRSmart(s.grand),
          primary: true,
          hint: 'Tax, service and tip shared in proportion to what each ordered',
        },
        ...s.shares.map((x) => ({ label: x.name, value: formatINRSmart(x.amount) })),
      ],
    };
  },
});

type FuelValues = {
  distance: number;
  mileage: number;
  price: number;
  roundTrip: boolean;
  people: number;
};
export const FuelCostCalculator = createFormTool<FuelValues>({
  fields: [
    {
      name: 'distance',
      label: 'Trip distance (one way)',
      type: 'number',
      default: 300,
      min: 1,
      max: 100000,
      unit: 'km',
    },
    {
      name: 'mileage',
      label: 'Vehicle mileage',
      type: 'number',
      default: 15,
      min: 1,
      max: 200,
      unit: 'km/L',
    },
    {
      name: 'price',
      label: 'Fuel price',
      type: 'currency',
      default: 105,
      min: 1,
      max: 1000,
      help: 'Petrol/diesel price per litre in your city.',
    },
    {
      name: 'people',
      label: 'People sharing the cost',
      type: 'number',
      default: 1,
      min: 1,
      max: 60,
      integer: true,
    },
    { name: 'roundTrip', label: 'Round trip', type: 'toggle', default: true },
  ],
  compute: (v) => {
    const r = fuelCost(v.distance, v.mileage, v.price, v.roundTrip, v.people);
    return {
      results: [
        {
          label: 'Fuel cost',
          value: formatINR(r.cost),
          primary: true,
          hint: `${formatNumber(r.distance, 0)} km`,
        },
        { label: 'Fuel needed', value: `${formatNumber(r.litres, 1)} litres` },
        { label: 'Cost per km', value: formatINR(r.perKm, 2) },
        ...(v.people > 1 ? [{ label: 'Per person', value: formatINR(r.perPerson) }] : []),
      ],
      notes: [
        'Add tolls and parking separately. Real-world mileage is usually lower than the company-claimed figure.',
      ],
    };
  },
});

type MileageValues = {
  mode: string;
  distance: number;
  start: number;
  end: number;
  litres: number;
  price: number;
};
export const FuelMileageCalculator = createFormTool<MileageValues>({
  fields: [
    {
      name: 'mode',
      label: 'Distance from',
      type: 'segmented',
      default: 'odometer',
      full: true,
      options: [
        { value: 'odometer', label: 'Odometer readings' },
        { value: 'distance', label: 'Trip distance' },
      ],
    },
    {
      name: 'start',
      label: 'Odometer at last full tank',
      type: 'number',
      default: 12450,
      min: 0,
      max: 1e7,
      unit: 'km',
      showIf: (v) => v.mode === 'odometer',
    },
    {
      name: 'end',
      label: 'Odometer now',
      type: 'number',
      default: 12900,
      min: 0,
      max: 1e7,
      unit: 'km',
      showIf: (v) => v.mode === 'odometer',
    },
    {
      name: 'distance',
      label: 'Distance driven',
      type: 'number',
      default: 450,
      min: 1,
      max: 1e6,
      unit: 'km',
      showIf: (v) => v.mode === 'distance',
    },
    {
      name: 'litres',
      label: 'Fuel filled to top up',
      type: 'number',
      default: 30,
      min: 0.1,
      max: 10000,
      unit: 'litres',
    },
    {
      name: 'price',
      label: 'Fuel price per litre',
      type: 'currency',
      default: 105,
      min: 0,
      max: 1000,
    },
  ],
  validate: (v) =>
    v.mode === 'odometer' && v.end <= v.start
      ? { field: 'end', message: 'Current reading must be higher than the previous reading.' }
      : null,
  compute: (v) => {
    const d = v.mode === 'odometer' ? v.end - v.start : v.distance;
    const r = mileage(d, v.litres, v.price);
    return {
      results: [
        { label: 'Mileage', value: `${formatNumber(r.kmpl, 2)} km/L`, primary: true },
        { label: 'Fuel consumption', value: `${formatNumber(r.l100, 2)} L/100 km` },
        { label: 'Running cost', value: `${formatINR(r.costPerKm, 2)} per km` },
        { label: 'Distance', value: `${formatNumber(d, 0)} km` },
      ],
      notes: ['For accuracy, fill the tank completely both times (the “tank-to-tank” method).'],
    };
  },
});

const APPLIANCES: Record<string, { label: string; watts: number }> = {
  ac15: { label: 'Air conditioner 1.5 ton (≈1,500 W)', watts: 1500 },
  ac1: { label: 'Air conditioner 1 ton (≈1,100 W)', watts: 1100 },
  geyser: { label: 'Geyser / water heater (2,000 W)', watts: 2000 },
  fridge: { label: 'Refrigerator (average ≈150 W)', watts: 150 },
  fan: { label: 'Ceiling fan (75 W)', watts: 75 },
  bldc: { label: 'BLDC ceiling fan (30 W)', watts: 30 },
  led: { label: 'LED bulb (9 W)', watts: 9 },
  tv: { label: 'LED TV 43″ (≈100 W)', watts: 100 },
  wm: { label: 'Washing machine (≈500 W)', watts: 500 },
  iron: { label: 'Electric iron (1,000 W)', watts: 1000 },
  microwave: { label: 'Microwave (1,200 W)', watts: 1200 },
  laptop: { label: 'Laptop (65 W)', watts: 65 },
  ev: { label: 'EV home charger (3,300 W)', watts: 3300 },
  custom: { label: 'Custom wattage', watts: 0 },
};
type ElecValues = {
  appliance: string;
  watts: number;
  qty: number;
  hours: number;
  days: number;
  tariff: number;
};
export const ElectricityCostCalculator = createFormTool<ElecValues>({
  fields: [
    {
      name: 'appliance',
      label: 'Appliance',
      type: 'select',
      default: 'ac15',
      full: true,
      options: Object.entries(APPLIANCES).map(([k, a]) => ({ value: k, label: a.label })),
    },
    {
      name: 'watts',
      label: 'Power rating',
      type: 'number',
      default: 1000,
      min: 1,
      max: 100000,
      unit: 'watts',
      showIf: (v) => v.appliance === 'custom',
    },
    {
      name: 'qty',
      label: 'Quantity',
      type: 'number',
      default: 1,
      min: 1,
      max: 1000,
      integer: true,
    },
    { name: 'hours', label: 'Hours used per day', type: 'number', default: 8, min: 0, max: 24 },
    { name: 'days', label: 'Days', type: 'number', default: 30, min: 1, max: 366, integer: true },
    {
      name: 'tariff',
      label: 'Electricity rate per unit (kWh)',
      type: 'currency',
      default: 7,
      min: 0,
      max: 100,
      help: 'See your electricity bill; slab rates vary by state and usage.',
    },
  ],
  compute: (v) => {
    const w = v.appliance === 'custom' ? v.watts : APPLIANCES[v.appliance].watts;
    const r = electricityCost(w, v.hours, v.days, v.tariff, v.qty);
    return {
      results: [
        { label: `Cost for ${v.days} days`, value: formatINR(r.cost), primary: true },
        { label: 'Units consumed', value: `${formatNumber(r.units, 1)} kWh` },
        { label: 'Cost per day', value: formatINR(r.perDay, 2) },
        { label: 'Cost per year (same usage)', value: formatINR(r.perDay * 365) },
      ],
      notes: [
        'Actual AC and fridge consumption depends on star rating, thermostat setting and compressor cycling.',
      ],
    };
  },
});

type CookValues = { amount: number; from: string; to: string; ingredient: string };
const COOK_OPTS = Object.entries(COOKING_UNITS).map(([k, u]) => ({ value: k, label: u.label }));
export const CookingUnitConverter = createFormTool<CookValues>({
  fields: [
    { name: 'amount', label: 'Amount', type: 'number', default: 2, min: 0, max: 1e6 },
    {
      name: 'ingredient',
      label: 'Ingredient',
      type: 'select',
      default: 'atta',
      options: Object.entries(INGREDIENTS).map(([k, i]) => ({ value: k, label: i.label })),
    },
    { name: 'from', label: 'From', type: 'select', default: 'cup', options: COOK_OPTS },
    { name: 'to', label: 'To', type: 'select', default: 'g', options: COOK_OPTS },
  ],
  compute: (v) => {
    const r = convertCooking(v.amount, v.from, v.to, v.ingredient);
    const others = ['g', 'cup', 'uscup', 'tbsp', 'tsp', 'ml'].filter(
      (u) => u !== v.to && u !== v.from,
    );
    const items: ResultItem[] = [
      {
        label: `${formatSmart(v.amount)} ${COOKING_UNITS[v.from].label.split(' (')[0].toLowerCase()} of ${INGREDIENTS[v.ingredient].label.toLowerCase()}`,
        value: `${formatNumber(r, 2)} ${COOKING_UNITS[v.to].label.split(' (')[0].toLowerCase()}`,
        primary: true,
      },
      ...others.map((u) => ({
        label: COOKING_UNITS[u].label,
        value: formatNumber(convertCooking(v.amount, v.from, u, v.ingredient), 2),
      })),
    ];
    return {
      results: items,
      notes: [
        'Weights of dry ingredients vary with how they are packed; values assume spooned and levelled measures.',
      ],
    };
  },
});

type PickValues = { items: string; count: number };
export const RandomPicker = createFormTool<PickValues>({
  instant: false,
  submitLabel: 'Pick',
  urlState: false,
  fields: [
    {
      name: 'items',
      label: 'Names or options (one per line)',
      type: 'textarea',
      default: 'Asha\nRavi\nMeera\nKabir\nZoya\nArjun',
      rows: 8,
      maxLength: 50000,
    },
    {
      name: 'count',
      label: 'How many to pick',
      type: 'number',
      default: 1,
      min: 1,
      max: 1000,
      integer: true,
    },
  ],
  compute: (v) => {
    const list = v.items
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length < 1) throw new InputError('Add at least one option.', 'items');
    const rng = () => crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32;
    const picks = pickRandom(list, v.count, rng);
    return {
      results: [
        {
          label: v.count === 1 ? 'Picked' : `Picked ${v.count}`,
          value: picks.join(', '),
          primary: true,
        },
        { label: 'Out of', value: `${list.length} options` },
      ],
      notes: ['Uses your browser’s secure random generator; each option has an equal chance.'],
    };
  },
});

type DateCalcValues = {
  mode: string;
  start: string;
  end: string;
  amount: number;
  unit: string;
  op: string;
};
export const DateCalculator = createFormTool<DateCalcValues>({
  fields: [
    {
      name: 'mode',
      label: 'Calculate',
      type: 'segmented',
      default: 'diff',
      full: true,
      options: [
        { value: 'diff', label: 'Difference between dates' },
        { value: 'shift', label: 'Add / subtract' },
      ],
    },
    { name: 'start', label: 'Start date', type: 'date', default: () => todayISO() },
    {
      name: 'end',
      label: 'End date',
      type: 'date',
      default: () => toISODate(addDays(parseISODate(todayISO()), 180)),
      showIf: (v) => v.mode === 'diff',
    },
    {
      name: 'op',
      label: 'Operation',
      type: 'segmented',
      default: 'add',
      options: [
        { value: 'add', label: 'Add' },
        { value: 'sub', label: 'Subtract' },
      ],
      showIf: (v) => v.mode === 'shift',
    },
    {
      name: 'amount',
      label: 'Amount',
      type: 'number',
      default: 90,
      min: 0,
      max: 100000,
      integer: true,
      showIf: (v) => v.mode === 'shift',
    },
    {
      name: 'unit',
      label: 'Unit',
      type: 'select',
      default: 'days',
      options: ['days', 'weeks', 'months', 'years'].map((u) => ({
        value: u,
        label: u[0].toUpperCase() + u.slice(1),
      })),
      showIf: (v) => v.mode === 'shift',
    },
  ],
  compute: (v) => {
    const s = parseISODate(v.start, 'Start date');
    if (v.mode === 'diff') {
      let a = s;
      let b = parseISODate(v.end, 'End date');
      if (b < a) [a, b] = [b, a];
      const days = daysBetween(a, b);
      return {
        results: [
          { label: 'Difference', value: formatYMD(diffYMD(a, b)), primary: true },
          { label: 'Total days', value: formatNumber(days, 0) },
          { label: 'Weeks', value: `${Math.floor(days / 7)} weeks ${days % 7} days` },
        ],
      };
    }
    const n = v.op === 'add' ? v.amount : -v.amount;
    const r =
      v.unit === 'days'
        ? addDays(s, n)
        : v.unit === 'weeks'
          ? addDays(s, n * 7)
          : v.unit === 'months'
            ? addMonths(s, n)
            : addMonths(s, n * 12);
    return {
      results: [
        { label: 'Resulting date', value: formatLongDate(r), primary: true },
        { label: 'ISO date', value: toISODate(r) },
      ],
    };
  },
});

type SleepValues = { wake: string; fall: number };
export const SleepCalculator = createFormTool<SleepValues>({
  fields: [
    { name: 'wake', label: 'I need to wake up at', type: 'time', default: '06:30' },
    {
      name: 'fall',
      label: 'Time to fall asleep',
      type: 'number',
      default: 15,
      min: 0,
      max: 120,
      integer: true,
      unit: 'minutes',
    },
  ],
  compute: (v) => {
    const beds = bedtimesFor(parseTime(v.wake, 'Wake-up time'), v.fall);
    return {
      results: beds.map((b, i) => ({
        label: `${b.cycles} sleep cycles (${b.hours} h of sleep)`,
        value: formatClock(b.time),
        primary: i === 0,
        hint: i === 0 ? 'Recommended for adults' : i === 1 ? 'Good' : undefined,
      })),
      notes: [
        'A sleep cycle lasts about 90 minutes. Waking at the end of a cycle helps you feel less groggy. Adults need 7–9 hours of sleep.',
      ],
    };
  },
});

type WakeValues = { useNow: boolean; bed: string; fall: number };
export const WakeUpTimeCalculator = createFormTool<WakeValues>({
  fields: [
    { name: 'useNow', label: 'I am going to bed now', type: 'toggle', default: true },
    { name: 'bed', label: 'Bedtime', type: 'time', default: '23:00', showIf: (v) => !v.useNow },
    {
      name: 'fall',
      label: 'Time to fall asleep',
      type: 'number',
      default: 15,
      min: 0,
      max: 120,
      integer: true,
      unit: 'minutes',
    },
  ],
  compute: (v) => {
    const now = new Date();
    const bed = v.useNow
      ? now.getHours() * 3600 + now.getMinutes() * 60
      : parseTime(v.bed, 'Bedtime');
    const wakes = wakeTimesFor(bed, v.fall);
    return {
      results: [...wakes].reverse().map((w, i) => ({
        label: `After ${w.cycles} cycles (${w.hours} h of sleep)`,
        value: formatClock(w.time),
        primary: i === 0,
        hint: i === 0 ? 'Best for a full night' : undefined,
      })),
      notes: [`Based on falling asleep about ${v.fall} minutes after ${formatClock(bed)}.`],
    };
  },
});
