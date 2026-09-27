import { InputError } from './number';

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function partsFormatter(zone: string) {
  let f = dtfCache.get(zone);
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('en-US', {
        timeZone: zone,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      throw new InputError(`Unknown time zone “${zone}”.`);
    }
    dtfCache.set(zone, f);
  }
  return f;
}

/** Offset of `zone` from UTC in minutes at a given instant (IST = +330). */
export function zoneOffsetMinutes(zone: string, utcMs: number): number {
  const p = Object.fromEntries(
    partsFormatter(zone)
      .formatToParts(new Date(utcMs))
      .map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour) % 24,
    Number(p.minute),
    Number(p.second),
  );
  return Math.round((asUtc - Math.floor(utcMs / 1000) * 1000) / 60000);
}

/** Convert a wall-clock time in `zone` ("YYYY-MM-DDTHH:MM[:SS]") to a UTC timestamp (ms). */
export function zonedWallTimeToUtc(local: string, zone: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(local);
  if (!m) throw new InputError('Enter a valid date and time.');
  const [y, mo, d, h, mi, s] = [m[1], m[2], m[3], m[4], m[5], m[6] ?? '0'].map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, s);
  if (Number.isNaN(guess)) throw new InputError('Enter a valid date and time.');
  const off1 = zoneOffsetMinutes(zone, guess);
  let utc = guess - off1 * 60000;
  const off2 = zoneOffsetMinutes(zone, utc);
  if (off2 !== off1) utc = guess - off2 * 60000;
  return utc;
}

export function formatInZone(
  utcMs: number,
  zone: string,
  opts: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: zone,
    dateStyle: 'full',
    timeStyle: 'long',
    ...opts,
  }).format(new Date(utcMs));
}

export function formatOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '−';
  const abs = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** Curated list of zones people in India commonly need, IST first. */
export const TIME_ZONES: { zone: string; label: string }[] = [
  { zone: 'Asia/Kolkata', label: 'India (IST)' },
  { zone: 'UTC', label: 'UTC / GMT' },
  { zone: 'America/New_York', label: 'New York (US Eastern)' },
  { zone: 'America/Chicago', label: 'Chicago (US Central)' },
  { zone: 'America/Denver', label: 'Denver (US Mountain)' },
  { zone: 'America/Los_Angeles', label: 'Los Angeles / San Francisco (US Pacific)' },
  { zone: 'America/Toronto', label: 'Toronto (Canada Eastern)' },
  { zone: 'America/Vancouver', label: 'Vancouver (Canada Pacific)' },
  { zone: 'America/Sao_Paulo', label: 'São Paulo (Brazil)' },
  { zone: 'Europe/London', label: 'London (UK)' },
  { zone: 'Europe/Dublin', label: 'Dublin (Ireland)' },
  { zone: 'Europe/Paris', label: 'Paris (France)' },
  { zone: 'Europe/Berlin', label: 'Berlin (Germany)' },
  { zone: 'Europe/Amsterdam', label: 'Amsterdam (Netherlands)' },
  { zone: 'Europe/Zurich', label: 'Zurich (Switzerland)' },
  { zone: 'Europe/Moscow', label: 'Moscow (Russia)' },
  { zone: 'Africa/Johannesburg', label: 'Johannesburg (South Africa)' },
  { zone: 'Africa/Nairobi', label: 'Nairobi (Kenya)' },
  { zone: 'Asia/Dubai', label: 'Dubai / Abu Dhabi (UAE)' },
  { zone: 'Asia/Riyadh', label: 'Riyadh (Saudi Arabia)' },
  { zone: 'Asia/Qatar', label: 'Doha (Qatar)' },
  { zone: 'Asia/Karachi', label: 'Karachi (Pakistan)' },
  { zone: 'Asia/Kathmandu', label: 'Kathmandu (Nepal)' },
  { zone: 'Asia/Dhaka', label: 'Dhaka (Bangladesh)' },
  { zone: 'Asia/Colombo', label: 'Colombo (Sri Lanka)' },
  { zone: 'Asia/Bangkok', label: 'Bangkok (Thailand)' },
  { zone: 'Asia/Singapore', label: 'Singapore' },
  { zone: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (Malaysia)' },
  { zone: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { zone: 'Asia/Shanghai', label: 'Beijing / Shanghai (China)' },
  { zone: 'Asia/Tokyo', label: 'Tokyo (Japan)' },
  { zone: 'Asia/Seoul', label: 'Seoul (South Korea)' },
  { zone: 'Australia/Perth', label: 'Perth (Australia Western)' },
  { zone: 'Australia/Sydney', label: 'Sydney / Melbourne (Australia Eastern)' },
  { zone: 'Pacific/Auckland', label: 'Auckland (New Zealand)' },
];

export function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  } catch {
    return 'Asia/Kolkata';
  }
}
