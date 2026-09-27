import { InputError } from '@/utils/number';

// ---------------------------------------------------------------- integers (BigInt)
export function gcdBig(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
}

export function gcdMany(nums: bigint[]): bigint {
  return nums.reduce((acc, n) => gcdBig(acc, n), 0n);
}

export function lcmMany(nums: bigint[]): bigint {
  if (nums.some((n) => n === 0n)) return 0n;
  return nums.reduce((acc, n) => {
    const a = acc < 0n ? -acc : acc;
    const b = n < 0n ? -n : n;
    return (a / gcdBig(a, b)) * b;
  }, 1n);
}

export function parseIntegerList(text: string, min = 2, max = 50): bigint[] {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  if (parts.length < min) throw new InputError(`Enter at least ${min} whole numbers.`, 'numbers');
  if (parts.length > max) throw new InputError(`Enter at most ${max} numbers.`, 'numbers');
  return parts.map((p) => {
    if (!/^-?\d{1,30}$/.test(p)) throw new InputError(`“${p}” is not a whole number.`, 'numbers');
    return BigInt(p);
  });
}

export function factorialBig(n: number): bigint {
  if (!Number.isInteger(n) || n < 0)
    throw new InputError('Enter a non-negative whole number.', 'n');
  if (n > 5000) throw new InputError('Please enter a number up to 5,000.', 'n');
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
}

export function permutations(n: number, r: number, repetition = false): bigint {
  validateNr(n, r, repetition);
  if (repetition) return BigInt(n) ** BigInt(r);
  let p = 1n;
  for (let i = 0; i < r; i++) p *= BigInt(n - i);
  return p;
}

export function combinations(n: number, r: number, repetition = false): bigint {
  validateNr(n, r, repetition);
  if (repetition) return combinations(n + r - 1, r);
  const k = Math.min(r, n - r);
  let c = 1n;
  for (let i = 1; i <= k; i++) c = (c * BigInt(n - k + i)) / BigInt(i);
  return c;
}

function validateNr(n: number, r: number, repetition: boolean) {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0)
    throw new InputError('n and r must be non-negative whole numbers.', 'n');
  if (!repetition && r > n)
    throw new InputError('r cannot be greater than n without repetition.', 'r');
  if (n > 10000 || r > 10000) throw new InputError('Please keep n and r at or below 10,000.', 'n');
}

/** Human-friendly rendering of big integers: grouped digits + digit count + scientific. */
export function describeBig(n: bigint): { grouped: string; digits: number; scientific: string } {
  const s = (n < 0n ? -n : n).toString();
  const sign = n < 0n ? '-' : '';
  const grouped = sign + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const scientific = s.length > 15 ? `${sign}${s[0]}.${s.slice(1, 7)}e+${s.length - 1}` : sign + s;
  return { grouped, digits: s.length, scientific };
}

// ---------------------------------------------------------------- primes
function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base %= mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exp >>= 1n;
  }
  return result;
}

/** Deterministic Miller–Rabin for n < 3.3 × 10^24 using the first 13 prime bases. */
export function isPrime(n: bigint): boolean {
  if (n < 2n) return false;
  const small = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n];
  for (const p of small) {
    if (n === p) return true;
    if (n % p === 0n) return false;
  }
  let d = n - 1n;
  let s = 0;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    s++;
  }
  outer: for (const a of small) {
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 1; i < s; i++) {
      x = (x * x) % n;
      if (x === n - 1n) continue outer;
    }
    return false;
  }
  return true;
}

/** Prime factorisation by trial division (fast enough up to ~10^12). */
export function factorize(n: bigint): { prime: bigint; power: number }[] {
  if (n < 2n) return [];
  const out: { prime: bigint; power: number }[] = [];
  let m = n;
  for (let p = 2n; p * p <= m; p += p === 2n ? 1n : 2n) {
    let k = 0;
    while (m % p === 0n) {
      m /= p;
      k++;
    }
    if (k) out.push({ prime: p, power: k });
    if (p > 2_000_000n) break;
  }
  if (m > 1n) out.push({ prime: m, power: 1 });
  return out;
}

export function nextPrime(n: bigint): bigint {
  let c = n + 1n;
  while (!isPrime(c)) c++;
  return c;
}

export function prevPrime(n: bigint): bigint | null {
  for (let c = n - 1n; c >= 2n; c--) if (isPrime(c)) return c;
  return null;
}

// ---------------------------------------------------------------- fractions
export interface Fraction {
  n: bigint;
  d: bigint;
}

export function frac(n: bigint, d: bigint): Fraction {
  if (d === 0n) throw new InputError('Denominator cannot be zero.');
  if (d < 0n) {
    n = -n;
    d = -d;
  }
  const g = gcdBig(n, d) || 1n;
  return { n: n / g, d: d / g };
}

/** Parse "3/4", "1 1/2", "-2 3/5", "0.75" or "5". */
export function parseFraction(text: string, label = 'Fraction'): Fraction {
  const s = text.trim();
  let m = /^(-)?(\d+)\s+(\d+)\s*\/\s*(\d+)$/.exec(s);
  if (m) {
    const whole = BigInt(m[2]);
    const f = frac(whole * BigInt(m[4]) + BigInt(m[3]), BigInt(m[4]));
    return m[1] ? { n: -f.n, d: f.d } : f;
  }
  m = /^(-?\d+)\s*\/\s*(-?\d+)$/.exec(s);
  if (m) return frac(BigInt(m[1]), BigInt(m[2]));
  m = /^(-)?(\d*)\.(\d+)$/.exec(s);
  if (m) {
    const d = 10n ** BigInt(m[3].length);
    const n = BigInt((m[2] || '0') + m[3]);
    return frac(m[1] ? -n : n, d);
  }
  if (/^-?\d+$/.test(s)) return frac(BigInt(s), 1n);
  throw new InputError(`${label} must look like 3/4, 1 1/2 or 0.75.`);
}

export function fracOp(a: Fraction, b: Fraction, op: string): Fraction {
  switch (op) {
    case '+':
      return frac(a.n * b.d + b.n * a.d, a.d * b.d);
    case '-':
      return frac(a.n * b.d - b.n * a.d, a.d * b.d);
    case '*':
      return frac(a.n * b.n, a.d * b.d);
    case '/':
      if (b.n === 0n) throw new InputError('Cannot divide by zero.');
      return frac(a.n * b.d, a.d * b.n);
    default:
      throw new InputError('Unknown operation.');
  }
}

export function fracToString(f: Fraction): string {
  return f.d === 1n ? f.n.toString() : `${f.n}/${f.d}`;
}

export function toMixed(f: Fraction): string {
  const neg = f.n < 0n;
  const an = neg ? -f.n : f.n;
  const whole = an / f.d;
  const rem = an % f.d;
  if (rem === 0n) return `${neg ? '-' : ''}${whole}`;
  if (whole === 0n) return `${neg ? '-' : ''}${rem}/${f.d}`;
  return `${neg ? '-' : ''}${whole} ${rem}/${f.d}`;
}

// ---------------------------------------------------------------- statistics
export function parseNumberList(text: string, min = 1, max = 10000): number[] {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  if (parts.length < min)
    throw new InputError(`Enter at least ${min} number${min > 1 ? 's' : ''}.`, 'numbers');
  if (parts.length > max)
    throw new InputError(`Enter at most ${max.toLocaleString('en-IN')} numbers.`, 'numbers');
  return parts.map((p) => {
    const n = Number(p);
    if (!Number.isFinite(n) || p.trim() === '')
      throw new InputError(`“${p}” is not a number.`, 'numbers');
    return n;
  });
}

export function stats(values: number[]) {
  const n = values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const counts = new Map<number, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1));
  const maxCount = Math.max(...counts.values());
  const modes =
    maxCount > 1
      ? [...counts.entries()]
          .filter(([, c]) => c === maxCount)
          .map(([v]) => v)
          .sort((a, b) => a - b)
      : [];
  const variance = values.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
  const sampleVariance = n > 1 ? (variance * n) / (n - 1) : 0;
  const geometric = values.every((v) => v > 0)
    ? Math.exp(values.reduce((a, v) => a + Math.log(v), 0) / n)
    : null;
  return {
    n,
    sum,
    mean,
    median,
    modes,
    min: sorted[0],
    max: sorted[n - 1],
    range: sorted[n - 1] - sorted[0],
    stdDev: Math.sqrt(variance),
    sampleStdDev: Math.sqrt(sampleVariance),
    geometric,
  };
}

export function weightedAverage(pairs: { value: number; weight: number }[]) {
  const totalWeight = pairs.reduce((a, p) => a + p.weight, 0);
  if (totalWeight === 0) throw new InputError('Total weight cannot be zero.', 'data');
  return { average: pairs.reduce((a, p) => a + p.value * p.weight, 0) / totalWeight, totalWeight };
}

// ---------------------------------------------------------------- radicals
/** Simplify ⁿ√x for integers: √72 = 6√2. */
export function simplifyRadical(
  x: number,
  index: 2 | 3,
): { outside: number; inside: number } | null {
  if (!Number.isInteger(x) || Math.abs(x) > 1e12) return null;
  const sign = index === 3 && x < 0 ? -1 : 1;
  let inside = Math.abs(x);
  let outside = 1;
  for (let f = 2; f ** index <= inside; f++) {
    while (inside % f ** index === 0) {
      inside /= f ** index;
      outside *= f;
    }
  }
  return { outside: outside * sign, inside };
}

export function ratioSimplify(values: number[]): number[] {
  // Scale decimals to integers first.
  const decimals = Math.max(...values.map((v) => (String(v).split('.')[1] ?? '').length));
  if (decimals > 8) throw new InputError('Use at most 8 decimal places.');
  const ints = values.map((v) => BigInt(Math.round(v * 10 ** decimals)));
  const g = gcdMany(ints) || 1n;
  return ints.map((i) => Number(i / g));
}
