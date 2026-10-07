import { InputError } from './number';

/** All calendar-date math is done on UTC midnight to stay immune to DST shifts. */
const DAY_MS = 86_400_000;

export function parseISODate(value: string, label = 'Date'): Date {
  if (!value) throw new InputError(`Please enter ${label.toLowerCase()}.`);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) throw new InputError(`${label} is not a valid date.`);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) {
    throw new InputError(`${label} is not a valid calendar date.`);
  }
  if (y < 1 || y > 9999) throw new InputError(`${label} must be between years 1 and 9999.`);
  return date;
}

export function toISODate(date: Date): string {
  const y = String(date.getUTCFullYear()).padStart(4, '0');
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Today's local calendar date as ISO string. */
export function todayISO(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function addMonths(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const target = new Date(Date.UTC(y, m, 1));
  const lastDay = daysInMonth(target.getUTCFullYear(), target.getUTCMonth());
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return target;
}

export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** month is 0-based */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export interface YMD {
  years: number;
  months: number;
  days: number;
}

/** Calendar difference from `from` to `to` (to >= from) in years, months, days. */
export function diffYMD(from: Date, to: Date): YMD {
  if (to < from) throw new InputError('The end date must be on or after the start date.');
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  // Month-end aware: adding months clamps (31 Jan + 1 month = 29 Feb).
  if (addMonths(from, months) > to) months -= 1;
  const days = daysBetween(addMonths(from, months), to);
  return { years: Math.floor(months / 12), months: months % 12, days };
}

export function formatYMD({ years, months, days }: YMD): string {
  const part = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;
  return [part(years, 'year'), part(months, 'month'), part(days, 'day')].join(', ');
}

/** ISO-8601 week number and week-year. */
export function isoWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
  return { week, year: d.getUTCFullYear() };
}

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function weekdayName(date: Date): string {
  return WEEKDAYS[date.getUTCDay()];
}

export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export type WeekendRule = 'sat-sun' | 'sun' | 'second-fourth-sat-sun' | 'none';

export function isWeekend(date: Date, rule: WeekendRule): boolean {
  const dow = date.getUTCDay();
  switch (rule) {
    case 'none':
      return false;
    case 'sun':
      return dow === 0;
    case 'sat-sun':
      return dow === 0 || dow === 6;
    case 'second-fourth-sat-sun': {
      if (dow === 0) return true;
      if (dow !== 6) return false;
      const nth = Math.ceil(date.getUTCDate() / 7);
      return nth === 2 || nth === 4;
    }
  }
}

export function parseHolidayList(text: string): Set<string> {
  const set = new Set<string>();
  text
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((s) => {
      set.add(toISODate(parseISODate(s, `Holiday "${s}"`)));
    });
  return set;
}

/** Count working days between two dates (inclusive of both ends). */
export function countWorkingDays(
  start: Date,
  end: Date,
  rule: WeekendRule,
  holidays: Set<string> = new Set(),
): { working: number; weekend: number; holidays: number; total: number } {
  if (end < start) throw new InputError('The end date must be on or after the start date.');
  const total = daysBetween(start, end) + 1;
  if (total > 366 * 200) throw new InputError('Please choose a range shorter than 200 years.');
  let working = 0;
  let weekend = 0;
  let hol = 0;
  for (let i = 0; i < total; i++) {
    const d = addDays(start, i);
    if (isWeekend(d, rule)) weekend++;
    else if (holidays.has(toISODate(d))) hol++;
    else working++;
  }
  return { working, weekend, holidays: hol, total };
}

/** Move forward (or backward) by N working days, skipping weekends and holidays. */
export function addWorkingDays(
  start: Date,
  n: number,
  rule: WeekendRule,
  holidays: Set<string> = new Set(),
): Date {
  if (rule === 'none' && holidays.size === 0) return addDays(start, n);
  const step = n >= 0 ? 1 : -1;
  let remaining = Math.abs(n);
  let d = start;
  let guard = 0;
  while (remaining > 0) {
    d = addDays(d, step);
    if (!isWeekend(d, rule) && !holidays.has(toISODate(d))) remaining--;
    if (++guard > 100_000) throw new InputError('Number of days is too large.');
  }
  return d;
}

/** Parse "HH:MM" or "HH:MM:SS" into seconds since midnight. */
export function parseTime(value: string, label = 'Time'): number {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec((value ?? '').trim());
  if (!m) throw new InputError(`${label} must be in HH:MM format.`);
  const h = Number(m[1]);
  const mi = Number(m[2]);
  const s = Number(m[3] ?? 0);
  if (h > 23 || mi > 59 || s > 59) throw new InputError(`${label} is not a valid time.`);
  return h * 3600 + mi * 60 + s;
}

export function formatClock(secondsOfDay: number, use12h = true): string {
  const total = ((Math.round(secondsOfDay) % 86400) + 86400) % 86400;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const mm = String(m).padStart(2, '0');
  if (!use12h) return `${String(h).padStart(2, '0')}:${mm}`;
  const suffix = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${suffix}`;
}

export function formatHMS(totalSeconds: number): string {
  const sign = totalSeconds < 0 ? '-' : '';
  let s = Math.abs(Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  const parts = [];
  if (h) parts.push(`${h} hr`);
  if (m) parts.push(`${m} min`);
  if (s || parts.length === 0) parts.push(`${s} sec`);
  return sign + parts.join(' ');
}

/** "7 October 2026" for an ISO date, used for published/reviewed dates on content pages. */
export function formatPublishDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseISODate(iso));
}
