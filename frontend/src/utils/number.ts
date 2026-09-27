/**
 * Numeric helpers. Monetary values are computed in floating point and rounded with
 * exponent-shift rounding, which avoids the classic binary artefacts (1.005 → 1.01,
 * 0.1 + 0.2 → 0.3). For sums of money we add in integer paise via sumMoney().
 */

export class InputError extends Error {
  readonly field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.name = 'InputError';
    this.field = field;
  }
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

/** Round half away from zero to `dp` decimal places without binary drift. */
export function round(value: number, dp = 2): number {
  if (!Number.isFinite(value)) return value;
  if (dp < 0 || dp > 15) throw new RangeError('dp out of range');
  const sign = value < 0 ? -1 : 1;
  const abs = Math.abs(value);
  // Scientific-notation shift keeps the decimal representation exact for typical inputs.
  const shifted = Math.round(Number(`${abs}e${dp}`));
  const result = Number(`${shifted}e-${dp}`);
  return Number.isFinite(result) ? sign * result : (sign * Math.round(abs * 10 ** dp)) / 10 ** dp;
}

export const round2 = (v: number) => round(v, 2);

/** Convert rupees to integer paise. */
export function toPaise(rupees: number): number {
  return Math.round(Number(`${rupees}e2`));
}

export function fromPaise(paise: number): number {
  return paise / 100;
}

/** Exact sum of monetary values (performed in paise). */
export function sumMoney(values: number[]): number {
  return fromPaise(values.reduce((acc, v) => acc + toPaise(v), 0));
}

/** Percentage of a monetary amount, rounded to paise. */
export function percentOf(amount: number, percent: number): number {
  return round2((amount * percent) / 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Parse user text into a number. Accepts Indian/Western grouping, ₹, %, whitespace. */
export function parseNumber(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;
  const cleaned = input.replace(/[₹,\s%_]/g, '').replace(/^\+/, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return null;
  if (!/^-?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function assertFinite(
  value: number,
  message = 'The result is too large to display.',
): number {
  if (!Number.isFinite(value)) throw new InputError(message);
  return value;
}

export function requirePositive(value: number, label: string, allowZero = false): number {
  if (!Number.isFinite(value)) throw new InputError(`${label} must be a valid number.`);
  if (allowZero ? value < 0 : value <= 0)
    throw new InputError(`${label} must be ${allowZero ? 'zero or more' : 'greater than zero'}.`);
  return value;
}
