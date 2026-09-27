/** Five-field cron parser (minute hour day-of-month month day-of-week) with next-run calculation. */
const FIELDS = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  {
    name: 'month',
    min: 1,
    max: 12,
    names: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  },
  { name: 'day of week', min: 0, max: 7, names: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] },
] as const;

const MACROS: Record<string, string> = {
  '@yearly': '0 0 1 1 *',
  '@annually': '0 0 1 1 *',
  '@monthly': '0 0 1 * *',
  '@weekly': '0 0 * * 0',
  '@daily': '0 0 * * *',
  '@midnight': '0 0 * * *',
  '@hourly': '0 * * * *',
};

export interface ParsedCron {
  sets: Set<number>[];
  domStar: boolean;
  dowStar: boolean;
  expression: string;
}

function parseField(src: string, idx: number): Set<number> {
  const f = FIELDS[idx];
  const set = new Set<number>();
  const names = 'names' in f ? (f.names as readonly string[]) : null;
  const val = (t: string) => {
    const up = t.toUpperCase();
    if (names && names.includes(up)) return names.indexOf(up) + (idx === 3 ? 1 : 0);
    if (!/^\d+$/.test(t)) throw new Error(`“${t}” is not valid in the ${f.name} field.`);
    const n = Number(t);
    if (n < f.min || n > f.max)
      throw new Error(`${f.name} must be between ${f.min} and ${f.max} (got ${n}).`);
    return n;
  };
  for (const part of src.split(',')) {
    if (!part) throw new Error(`Empty value in the ${f.name} field.`);
    const [range, stepStr] = part.split('/');
    const step = stepStr === undefined ? 1 : Number(stepStr);
    if (!Number.isInteger(step) || step < 1)
      throw new Error(`Invalid step “/${stepStr}” in the ${f.name} field.`);
    let lo: number;
    let hi: number;
    if (range === '*') {
      lo = f.min;
      hi = idx === 4 ? 6 : f.max;
    } else if (range.includes('-')) {
      const [a, b] = range.split('-');
      lo = val(a);
      hi = val(b);
      if (lo > hi) throw new Error(`Range ${range} in the ${f.name} field is backwards.`);
    } else {
      lo = val(range);
      hi = stepStr !== undefined ? (idx === 4 ? 6 : f.max) : lo;
    }
    for (let v = lo; v <= hi; v += step) set.add(idx === 4 && v === 7 ? 0 : v);
  }
  return set;
}

export function parseCron(expr: string): ParsedCron {
  const trimmed = expr.trim();
  const e = MACROS[trimmed.toLowerCase()] ?? trimmed;
  const parts = e.split(/\s+/);
  if (parts.length !== 5)
    throw new Error(
      `A cron expression needs 5 fields (minute hour day month weekday); found ${parts.length}.`,
    );
  return {
    sets: parts.map(parseField),
    domStar: parts[2] === '*',
    dowStar: parts[4] === '*',
    expression: e,
  };
}

/** Next run times after `from`, evaluated in the given IANA zone offset function. */
export function nextRuns(
  c: ParsedCron,
  from: Date,
  count: number,
  offsetMinutes: (utcMs: number) => number,
): Date[] {
  const out: Date[] = [];
  // Work in "zoned" wall-clock milliseconds, stepping minute by minute with fast skips.
  let t = Math.floor(from.getTime() / 60000) * 60000 + 60000;
  const limit = t + 5 * 366 * 86_400_000;
  while (out.length < count && t < limit) {
    const local = new Date(t + offsetMinutes(t) * 60000);
    const mo = local.getUTCMonth() + 1;
    if (!c.sets[3].has(mo)) {
      t +=
        new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth() + 1, 1)).getTime() -
        local.getTime();
      continue;
    }
    const dom = local.getUTCDate();
    const dow = local.getUTCDay();
    const domOk = c.sets[2].has(dom);
    const dowOk = c.sets[4].has(dow);
    const dayOk =
      c.domStar && c.dowStar ? true : c.domStar ? dowOk : c.dowStar ? domOk : domOk || dowOk;
    if (!dayOk) {
      t += 86_400_000 - (local.getUTCHours() * 3600 + local.getUTCMinutes() * 60) * 1000;
      continue;
    }
    if (!c.sets[1].has(local.getUTCHours())) {
      t += (60 - local.getUTCMinutes()) * 60000;
      continue;
    }
    if (c.sets[0].has(local.getUTCMinutes())) out.push(new Date(t));
    t += 60000;
  }
  return out;
}
