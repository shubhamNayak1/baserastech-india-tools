import { isFiniteNumber, round } from './number';

const DASH = '—';

const nfCache = new Map<string, Intl.NumberFormat>();
function nf(min: number, max: number): Intl.NumberFormat {
  const key = `${min}-${max}`;
  let f = nfCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat('en-IN', { minimumFractionDigits: min, maximumFractionDigits: max });
    nfCache.set(key, f);
  }
  return f;
}

/** Indian digit grouping: 1,00,00,000. */
export function formatNumber(value: number, maxDecimals = 2, minDecimals = 0): string {
  if (!isFiniteNumber(value)) return DASH;
  const r = round(value, maxDecimals);
  return nf(minDecimals, maxDecimals).format(Object.is(r, -0) ? 0 : r);
}

/** ₹ with Indian grouping. Rounds to whole rupees by default; pass decimals=2 for paise. */
export function formatINR(value: number, decimals = 0): string {
  if (!isFiniteNumber(value)) return DASH;
  const neg = value < 0;
  const body = formatNumber(Math.abs(value), decimals, decimals);
  return `${neg ? '-' : ''}₹${body}`;
}

/** 2 decimals only when there are paise. */
export function formatINRSmart(value: number): string {
  if (!isFiniteNumber(value)) return DASH;
  const hasPaise = Math.abs(round(value, 2) - Math.round(value)) > 0.004;
  return formatINR(value, hasPaise ? 2 : 0);
}

export function formatPercent(value: number, decimals = 2): string {
  if (!isFiniteNumber(value)) return DASH;
  return `${formatNumber(value, decimals)}%`;
}

/** "₹12.5 Lakh", "₹1.2 Crore", "₹45,000". */
export function formatLakhCrore(value: number, withSymbol = true): string {
  if (!isFiniteNumber(value)) return DASH;
  const sym = withSymbol ? '₹' : '';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}${sym}${formatNumber(abs / 1e7, 2)} Crore`;
  if (abs >= 1e5) return `${sign}${sym}${formatNumber(abs / 1e5, 2)} Lakh`;
  if (abs >= 1e3) return `${sign}${sym}${formatNumber(abs / 1e3, 2)} Thousand`;
  return `${sign}${sym}${formatNumber(abs, 2)}`;
}

/** Format any number with sensible precision for scientific/converter output. */
export function formatSmart(value: number, significant = 10): string {
  if (!isFiniteNumber(value)) return DASH;
  if (value === 0) return '0';
  const abs = Math.abs(value);
  if (abs >= 1e15 || abs < 1e-6) {
    return value.toExponential(Math.min(significant - 1, 8)).replace(/\.?0+e/, 'e');
  }
  const precise = Number(value.toPrecision(significant));
  const decimals = Math.max(0, Math.min(10, significant - Math.floor(Math.log10(abs)) - 1));
  return formatNumber(precise, decimals);
}

export function pluralize(n: number, singular: string, plural = `${singular}s`): string {
  return `${formatNumber(n, 0)} ${n === 1 ? singular : plural}`;
}

export function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts: string[] = [];
  if (years) parts.push(pluralize(years, 'year'));
  if (months || !years) parts.push(pluralize(months, 'month'));
  return parts.join(' ');
}
