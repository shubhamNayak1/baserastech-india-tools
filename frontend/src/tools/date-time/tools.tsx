import { createFormTool } from '@/components/form-tool/FormTool';
import type { Field, ResultItem } from '@/components/form-tool/types';
import { formatNumber } from '@/utils/format';
import { InputError } from '@/utils/number';
import {
  addDays,
  addMonths,
  addWorkingDays,
  countWorkingDays,
  daysBetween,
  diffYMD,
  formatHMS,
  formatLongDate,
  formatYMD,
  isLeapYear,
  isoWeek,
  parseHolidayList,
  parseISODate,
  parseTime,
  todayISO,
  toISODate,
  weekdayName,
  type WeekendRule,
} from '@/utils/date';
import {
  browserZone,
  formatInZone,
  formatOffset,
  TIME_ZONES,
  zonedWallTimeToUtc,
  zoneOffsetMinutes,
} from '@/utils/timezone';

const WEEKEND_OPTIONS = [
  { value: 'sat-sun', label: 'Saturday & Sunday off' },
  { value: 'sun', label: 'Only Sunday off' },
  { value: 'second-fourth-sat-sun', label: '2nd & 4th Saturday + Sundays off (banks)' },
  { value: 'none', label: 'No weekly off' },
];

const ZONE_OPTIONS = TIME_ZONES.map((z) => ({ value: z.zone, label: z.label }));

// ---------------------------------------------------------------- Age
type AgeValues = { dob: string; asOf: string };
export const AgeCalculator = createFormTool<AgeValues>({
  fields: [
    { name: 'dob', label: 'Date of birth', type: 'date', default: '1995-08-15' },
    { name: 'asOf', label: 'Age on', type: 'date', default: () => todayISO() },
  ],
  compute: (v) => {
    const dob = parseISODate(v.dob, 'Date of birth');
    const asOf = parseISODate(v.asOf, 'Age on date');
    if (asOf < dob) throw new InputError('Date of birth must be before the “age on” date.', 'dob');
    const age = diffYMD(dob, asOf);
    const days = daysBetween(dob, asOf);
    const isBirthday = age.months === 0 && age.days === 0;
    const next = isBirthday ? asOf : addMonths(dob, (age.years + 1) * 12);
    const untilNext = daysBetween(asOf, next);
    const totalMonths = age.years * 12 + age.months;
    return {
      results: [
        { label: 'Age', value: formatYMD(age), primary: true },
        { label: 'Total months', value: formatNumber(totalMonths, 0) },
        {
          label: 'Total weeks',
          value: `${formatNumber(Math.floor(days / 7), 0)} weeks ${days % 7} days`,
        },
        { label: 'Total days', value: formatNumber(days, 0) },
        {
          label: 'Next birthday',
          value: untilNext === 0 ? 'Today! 🎉' : `in ${formatNumber(untilNext, 0)} days`,
          hint: `${formatLongDate(next)} (turning ${isBirthday ? age.years : age.years + 1})`,
        },
        { label: 'Born on a', value: weekdayName(dob) },
      ],
    };
  },
});

// ---------------------------------------------------------------- Differences
type DiffValues = { start: string; end: string; includeEnd: boolean };
const rangeFields: Field<DiffValues>[] = [
  { name: 'start', label: 'Start date', type: 'date', default: () => todayISO() },
  {
    name: 'end',
    label: 'End date',
    type: 'date',
    default: () => toISODate(addDays(parseISODate(todayISO()), 100)),
  },
  { name: 'includeEnd', label: 'Include the end date (add 1 day)', type: 'toggle', default: false },
];

function orderedRange(v: DiffValues) {
  let a = parseISODate(v.start, 'Start date');
  let b = parseISODate(v.end, 'End date');
  const swapped = b < a;
  if (swapped) [a, b] = [b, a];
  return { a, b: v.includeEnd ? addDays(b, 1) : b, swapped };
}

export const DateDifferenceCalculator = createFormTool<DiffValues>({
  fields: rangeFields,
  compute: (v) => {
    const { a, b, swapped } = orderedRange(v);
    const days = daysBetween(a, b);
    const ymd = diffYMD(a, b);
    return {
      results: [
        {
          label: 'Difference',
          value: formatYMD(ymd),
          primary: true,
          hint: swapped ? 'End date is before start date – shown as a positive gap' : undefined,
        },
        { label: 'Total days', value: formatNumber(days, 0) },
        {
          label: 'Total weeks',
          value: `${formatNumber(Math.floor(days / 7), 0)} weeks ${days % 7} days`,
        },
        {
          label: 'Total months',
          value: formatNumber(ymd.years * 12 + ymd.months, 0),
          hint: ymd.days ? `and ${ymd.days} days` : undefined,
        },
        { label: 'Total hours', value: formatNumber(days * 24, 0) },
      ],
    };
  },
});

export const DaysBetweenDatesCalculator = createFormTool<DiffValues>({
  fields: rangeFields,
  compute: (v) => {
    const { a, b } = orderedRange(v);
    const days = daysBetween(a, b);
    const wd =
      days > 0 ? countWorkingDays(a, addDays(b, -1), 'sat-sun') : { working: 0, weekend: 0 };
    return {
      results: [
        { label: 'Days between dates', value: `${formatNumber(days, 0)} days`, primary: true },
        { label: 'Weekdays (Mon–Fri)', value: formatNumber(wd.working, 0) },
        { label: 'Weekend days', value: formatNumber(wd.weekend, 0) },
        { label: 'In weeks', value: `${formatNumber(days / 7, 2)} weeks` },
      ],
    };
  },
});

type AddValues = { start: string; amount: number; unit: string };
function shiftTool(direction: 1 | -1) {
  return createFormTool<AddValues>({
    fields: [
      { name: 'start', label: 'Start date', type: 'date', default: () => todayISO() },
      {
        name: 'amount',
        label: direction === 1 ? 'Add' : 'Subtract',
        type: 'number',
        default: 30,
        min: 0,
        max: 100000,
        integer: true,
        unit: (v) => String(v.unit),
      },
      {
        name: 'unit',
        label: 'Unit',
        type: 'segmented',
        default: 'days',
        options: ['days', 'weeks', 'months', 'years'].map((u) => ({
          value: u,
          label: u[0].toUpperCase() + u.slice(1),
        })),
      },
    ],
    compute: (v) => {
      const start = parseISODate(v.start, 'Start date');
      const n = v.amount * direction;
      const result =
        v.unit === 'days'
          ? addDays(start, n)
          : v.unit === 'weeks'
            ? addDays(start, n * 7)
            : v.unit === 'months'
              ? addMonths(start, n)
              : addMonths(start, n * 12);
      if (result.getUTCFullYear() < 1 || result.getUTCFullYear() > 9999)
        throw new InputError('The result is outside the supported date range.', 'amount');
      return {
        results: [
          { label: 'Resulting date', value: formatLongDate(result), primary: true },
          { label: 'ISO date', value: toISODate(result) },
          {
            label: 'Calendar days apart',
            value: formatNumber(Math.abs(daysBetween(start, result)), 0),
          },
        ],
      };
    },
  });
}
export const AddDaysCalculator = shiftTool(1);
export const SubtractDaysCalculator = shiftTool(-1);

// ---------------------------------------------------------------- Working days
type WorkValues = { start: string; end: string; weekend: string; holidays: string };
export const WorkingDaysCalculator = createFormTool<WorkValues>({
  fields: [
    { name: 'start', label: 'Start date', type: 'date', default: () => todayISO() },
    {
      name: 'end',
      label: 'End date',
      type: 'date',
      default: () => toISODate(addDays(parseISODate(todayISO()), 30)),
    },
    {
      name: 'weekend',
      label: 'Weekly off',
      type: 'select',
      default: 'sat-sun',
      full: true,
      options: WEEKEND_OPTIONS,
    },
    {
      name: 'holidays',
      label: 'Holidays to exclude',
      type: 'textarea',
      default: '',
      optional: true,
      rows: 3,
      placeholder: 'YYYY-MM-DD, one per line or comma-separated',
      maxLength: 10000,
    },
  ],
  compute: (v) => {
    const a = parseISODate(v.start, 'Start date');
    const b = parseISODate(v.end, 'End date');
    const r = countWorkingDays(a, b, v.weekend as WeekendRule, parseHolidayList(v.holidays));
    return {
      results: [
        {
          label: 'Working days',
          value: formatNumber(r.working, 0),
          primary: true,
          hint: 'Start and end dates included',
        },
        { label: 'Weekly offs', value: formatNumber(r.weekend, 0) },
        { label: 'Holidays on working days', value: formatNumber(r.holidays, 0) },
        { label: 'Total calendar days', value: formatNumber(r.total, 0) },
      ],
    };
  },
});

type BizValues = {
  start: string;
  days: number;
  direction: string;
  weekend: string;
  holidays: string;
};
export const BusinessDaysCalculator = createFormTool<BizValues>({
  fields: [
    { name: 'start', label: 'Start date', type: 'date', default: () => todayISO() },
    {
      name: 'days',
      label: 'Business days',
      type: 'number',
      default: 10,
      min: 0,
      max: 20000,
      integer: true,
      unit: 'days',
    },
    {
      name: 'direction',
      label: 'Direction',
      type: 'segmented',
      default: 'add',
      options: [
        { value: 'add', label: 'Add' },
        { value: 'sub', label: 'Subtract' },
      ],
    },
    {
      name: 'weekend',
      label: 'Weekly off',
      type: 'select',
      default: 'sat-sun',
      options: WEEKEND_OPTIONS,
    },
    {
      name: 'holidays',
      label: 'Holidays to skip',
      type: 'textarea',
      default: '',
      optional: true,
      rows: 3,
      placeholder: 'YYYY-MM-DD, one per line',
      maxLength: 10000,
    },
  ],
  compute: (v) => {
    const start = parseISODate(v.start, 'Start date');
    const result = addWorkingDays(
      start,
      v.direction === 'add' ? v.days : -v.days,
      v.weekend as WeekendRule,
      parseHolidayList(v.holidays),
    );
    return {
      results: [
        { label: 'Date', value: formatLongDate(result), primary: true },
        {
          label: 'Calendar days spanned',
          value: formatNumber(Math.abs(daysBetween(start, result)), 0),
        },
        { label: 'ISO date', value: toISODate(result) },
      ],
      notes: ['Counting starts from the next working day; the start date itself is not counted.'],
    };
  },
});

// ---------------------------------------------------------------- Calendar facts
type LeapValues = { year: number };
export const LeapYearChecker = createFormTool<LeapValues>({
  fields: [
    {
      name: 'year',
      label: 'Year',
      type: 'number',
      default: new Date().getFullYear(),
      min: 1,
      max: 9999,
      integer: true,
    },
  ],
  compute: (v) => {
    const leap = isLeapYear(v.year);
    let next = v.year + 1;
    while (!isLeapYear(next)) next++;
    let prev = v.year - 1;
    while (prev > 0 && !isLeapYear(prev)) prev--;
    const reason =
      v.year % 400 === 0
        ? 'divisible by 400'
        : v.year % 100 === 0
          ? 'divisible by 100 but not by 400'
          : v.year % 4 === 0
            ? 'divisible by 4 and not by 100'
            : 'not divisible by 4';
    return {
      results: [
        {
          label: `Is ${v.year} a leap year?`,
          value: leap ? 'Yes' : 'No',
          primary: true,
          hint: `Because it is ${reason}`,
        },
        { label: 'Days in the year', value: leap ? '366' : '365' },
        { label: 'Days in February', value: leap ? '29' : '28' },
        { label: 'Next leap year', value: String(next) },
        { label: 'Previous leap year', value: prev > 0 ? String(prev) : '—' },
      ],
    };
  },
});

type WeekValues = { date: string };
export const WeekNumberCalculator = createFormTool<WeekValues>({
  fields: [{ name: 'date', label: 'Date', type: 'date', default: () => todayISO() }],
  compute: (v) => {
    const d = parseISODate(v.date);
    const w = isoWeek(d);
    const dow = d.getUTCDay() || 7;
    const monday = addDays(d, 1 - dow);
    const sunday = addDays(monday, 6);
    const dayOfYear = daysBetween(new Date(Date.UTC(d.getUTCFullYear(), 0, 1)), d) + 1;
    const fyQuarter = Math.floor(((d.getUTCMonth() + 9) % 12) / 3) + 1;
    return {
      results: [
        { label: 'ISO week number', value: `Week ${w.week}`, primary: true, hint: `of ${w.year}` },
        { label: 'Week runs', value: `${toISODate(monday)} (Mon) to ${toISODate(sunday)} (Sun)` },
        {
          label: 'Day of the year',
          value: `${dayOfYear} of ${isLeapYear(d.getUTCFullYear()) ? 366 : 365}`,
        },
        { label: 'Calendar quarter', value: `Q${Math.floor(d.getUTCMonth() / 3) + 1}` },
        { label: 'Indian financial year quarter', value: `Q${fyQuarter} (April–March year)` },
        { label: 'Weekday', value: weekdayName(d) },
      ],
    };
  },
});

// ---------------------------------------------------------------- Time
type DurationValues = { start: string; end: string; breakMin: number; overnight: boolean };
export const TimeDurationCalculator = createFormTool<DurationValues>({
  fields: [
    { name: 'start', label: 'Start time', type: 'time', default: '09:30' },
    { name: 'end', label: 'End time', type: 'time', default: '18:15' },
    {
      name: 'breakMin',
      label: 'Break to subtract',
      type: 'number',
      default: 45,
      min: 0,
      max: 1440,
      integer: true,
      unit: 'minutes',
    },
    { name: 'overnight', label: 'End time is on the next day', type: 'toggle', default: false },
  ],
  compute: (v) => {
    const s = parseTime(v.start, 'Start time');
    let e = parseTime(v.end, 'End time');
    if (v.overnight || e < s) e += 86400;
    const total = e - s - v.breakMin * 60;
    if (total < 0)
      throw new InputError('The break is longer than the time between start and end.', 'breakMin');
    return {
      results: [
        {
          label: 'Duration',
          value: formatHMS(total),
          primary: true,
          hint: e - s >= 86400 ? undefined : e > 86400 ? 'Crosses midnight' : undefined,
        },
        {
          label: 'Decimal hours',
          value: `${formatNumber(total / 3600, 2)} hours`,
          hint: 'Useful for timesheets',
        },
        { label: 'Total minutes', value: formatNumber(total / 60, 0) },
      ],
    };
  },
});

type TzValues = { when: string; from: string; to: string };
export const TimeZoneConverter = createFormTool<TzValues>({
  fields: [
    {
      name: 'when',
      label: 'Date and time',
      type: 'datetime',
      default: () => `${todayISO()}T10:00`,
    },
    {
      name: 'from',
      label: 'From time zone',
      type: 'select',
      default: 'Asia/Kolkata',
      options: ZONE_OPTIONS,
    },
    {
      name: 'to',
      label: 'To time zone',
      type: 'select',
      default: 'America/New_York',
      options: ZONE_OPTIONS,
    },
  ],
  compute: (v) => {
    const utc = zonedWallTimeToUtc(v.when, v.from);
    const fromOff = zoneOffsetMinutes(v.from, utc);
    const toOff = zoneOffsetMinutes(v.to, utc);
    const diff = toOff - fromOff;
    const fmt = (z: string) => formatInZone(utc, z, { dateStyle: 'medium', timeStyle: 'short' });
    return {
      results: [
        {
          label: TIME_ZONES.find((z) => z.zone === v.to)?.label ?? v.to,
          value: fmt(v.to),
          primary: true,
          hint: formatOffset(toOff),
        },
        {
          label: TIME_ZONES.find((z) => z.zone === v.from)?.label ?? v.from,
          value: fmt(v.from),
          hint: formatOffset(fromOff),
        },
        {
          label: 'Time difference',
          value:
            diff === 0
              ? 'Same time'
              : `${diff > 0 ? '+' : '−'}${Math.floor(Math.abs(diff) / 60)}h ${Math.abs(diff) % 60}m`,
          hint: diff > 0 ? 'ahead' : diff < 0 ? 'behind' : undefined,
        },
      ],
      table: {
        title: 'Same moment around the world',
        columns: ['City / zone', 'Local time', 'Offset'],
        rows: TIME_ZONES.slice(0, 14).map((z) => [
          z.label,
          fmt(z.zone),
          formatOffset(zoneOffsetMinutes(z.zone, utc)),
        ]),
        initialRows: 8,
      },
      notes: ['Daylight saving time is applied automatically for the chosen date.'],
    };
  },
});

// ---------------------------------------------------------------- Unix timestamps
function parseTimestamp(raw: string): { ms: number; unit: string } {
  const t = raw.trim();
  if (!/^-?\d{1,16}(\.\d+)?$/.test(t))
    throw new InputError('Enter a Unix timestamp in seconds or milliseconds.', 'ts');
  const n = Number(t);
  const abs = Math.abs(n);
  if (abs >= 1e14) return { ms: n / 1000, unit: 'microseconds' };
  if (abs >= 1e11) return { ms: n, unit: 'milliseconds' };
  return { ms: n * 1000, unit: 'seconds' };
}

function relative(ms: number): string {
  const diff = ms - Date.now();
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const abs = Math.abs(diff);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
    ['second', 1000],
  ];
  for (const [u, size] of units)
    if (abs >= size || u === 'second') return rtf.format(Math.round(diff / size), u);
  return '';
}

function timestampResults(ms: number, unit?: string): ResultItem[] {
  if (!Number.isFinite(ms) || Math.abs(ms) > 8.64e15)
    throw new InputError('Timestamp is outside the supported range.', 'ts');
  const d = new Date(ms);
  const local = browserZone();
  return [
    {
      label: 'Date & time (IST)',
      value: formatInZone(ms, 'Asia/Kolkata', { dateStyle: 'full', timeStyle: 'medium' }),
      primary: true,
      hint: unit ? `Detected unit: ${unit}` : undefined,
    },
    { label: 'UTC', value: formatInZone(ms, 'UTC', { dateStyle: 'full', timeStyle: 'medium' }) },
    ...(local !== 'Asia/Kolkata' && local !== 'UTC'
      ? [
          {
            label: `Your time zone (${local})`,
            value: formatInZone(ms, local, { dateStyle: 'full', timeStyle: 'medium' }),
          },
        ]
      : []),
    { label: 'ISO 8601', value: d.toISOString() },
    { label: 'Relative', value: relative(ms) },
  ];
}

type TsValues = { ts: string };
export const UnixTimestampToDate = createFormTool<TsValues>({
  fields: [
    {
      name: 'ts',
      label: 'Unix timestamp',
      type: 'text',
      default: '1767225600',
      placeholder: 'e.g. 1767225600 or 1767225600000',
      maxLength: 20,
    },
  ],
  compute: (v) => {
    const { ms, unit } = parseTimestamp(v.ts);
    return { results: timestampResults(ms, unit) };
  },
});

type DtValues = { when: string; zone: string };
export const DateToUnixTimestamp = createFormTool<DtValues>({
  fields: [
    {
      name: 'when',
      label: 'Date and time',
      type: 'datetime',
      default: () => `${todayISO()}T00:00`,
    },
    {
      name: 'zone',
      label: 'Time zone of this date',
      type: 'select',
      default: 'Asia/Kolkata',
      options: ZONE_OPTIONS,
    },
  ],
  compute: (v) => {
    const utc = zonedWallTimeToUtc(v.when, v.zone);
    return {
      results: [
        { label: 'Unix timestamp (seconds)', value: String(Math.floor(utc / 1000)), primary: true },
        { label: 'Milliseconds', value: String(utc) },
        { label: 'ISO 8601 (UTC)', value: new Date(utc).toISOString() },
      ],
    };
  },
});

type UnixValues = { mode: string; ts: string; when: string; zone: string };
export const UnixTimestampConverter = createFormTool<UnixValues>({
  fields: [
    {
      name: 'mode',
      label: 'Convert',
      type: 'segmented',
      default: 'toDate',
      full: true,
      options: [
        { value: 'toDate', label: 'Timestamp → Date' },
        { value: 'toTs', label: 'Date → Timestamp' },
      ],
    },
    {
      name: 'ts',
      label: 'Unix timestamp',
      type: 'text',
      default: '1700000000',
      maxLength: 20,
      showIf: (v) => v.mode === 'toDate',
    },
    {
      name: 'when',
      label: 'Date and time',
      type: 'datetime',
      default: () => `${todayISO()}T12:00`,
      showIf: (v) => v.mode === 'toTs',
    },
    {
      name: 'zone',
      label: 'Time zone',
      type: 'select',
      default: 'Asia/Kolkata',
      options: ZONE_OPTIONS,
      showIf: (v) => v.mode === 'toTs',
    },
  ],
  compute: (v) => {
    if (v.mode === 'toDate') {
      const { ms, unit } = parseTimestamp(v.ts);
      return { results: timestampResults(ms, unit) };
    }
    const utc = zonedWallTimeToUtc(v.when, v.zone);
    return {
      results: [
        { label: 'Unix timestamp (seconds)', value: String(Math.floor(utc / 1000)), primary: true },
        { label: 'Milliseconds', value: String(utc) },
        { label: 'ISO 8601 (UTC)', value: new Date(utc).toISOString() },
      ],
    };
  },
});
