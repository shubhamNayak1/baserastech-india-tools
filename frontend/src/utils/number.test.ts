import { parseNumber, percentOf, round, sumMoney, requirePositive, InputError } from './number';
import {
  formatINR,
  formatLakhCrore,
  formatNumber,
  formatPercent,
  formatSmart,
  formatDuration,
} from './format';

describe('round', () => {
  it('rounds half away from zero without float drift', () => {
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(2.675, 2)).toBe(2.68);
    expect(round(-1.005, 2)).toBe(-1.01);
    expect(round(0.1 + 0.2, 2)).toBe(0.3);
    expect(round(123.456, 0)).toBe(123);
  });
  it('passes through non-finite values', () => {
    expect(round(Infinity)).toBe(Infinity);
  });
});

describe('money helpers', () => {
  it('sums in paise', () => {
    expect(sumMoney([0.1, 0.2, 0.3])).toBe(0.6);
    expect(sumMoney([1999.99, 0.01])).toBe(2000);
  });
  it('computes percentages to paise', () => {
    expect(percentOf(1000, 18)).toBe(180);
    expect(percentOf(99.99, 18)).toBe(18);
  });
});

describe('parseNumber', () => {
  it('parses Indian formatted numbers', () => {
    expect(parseNumber('₹1,00,000')).toBe(100000);
    expect(parseNumber(' 12.5% ')).toBe(12.5);
    expect(parseNumber('-3')).toBe(-3);
    expect(parseNumber('1e3')).toBe(1000);
  });
  it('rejects malformed input', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('1.2.3')).toBeNull();
    expect(parseNumber('-')).toBeNull();
    expect(parseNumber(Number.NaN)).toBeNull();
  });
});

describe('requirePositive', () => {
  it('throws human readable errors', () => {
    expect(() => requirePositive(0, 'Loan amount')).toThrow(InputError);
    expect(() => requirePositive(-1, 'Rate', true)).toThrow('Rate must be zero or more.');
    expect(requirePositive(0, 'Rate', true)).toBe(0);
  });
});

describe('formatting', () => {
  it('uses Indian grouping', () => {
    expect(formatINR(1000)).toBe('₹1,000');
    expect(formatINR(100000)).toBe('₹1,00,000');
    expect(formatINR(10000000)).toBe('₹1,00,00,000');
    expect(formatINR(-2500.5, 2)).toBe('-₹2,500.50');
    expect(formatNumber(1234567.891)).toBe('12,34,567.89');
  });
  it('never renders NaN, Infinity or undefined', () => {
    expect(formatINR(Number.NaN)).toBe('—');
    expect(formatNumber(Infinity)).toBe('—');
    expect(formatPercent(Number.NaN)).toBe('—');
    expect(formatSmart(-Infinity)).toBe('—');
  });
  it('describes lakh and crore', () => {
    expect(formatLakhCrore(5000000)).toBe('₹50 Lakh');
    expect(formatLakhCrore(12500000)).toBe('₹1.25 Crore');
    expect(formatLakhCrore(750)).toBe('₹750');
  });
  it('formats small and large numbers smartly', () => {
    expect(formatSmart(0.0000001)).toBe('1e-7');
    expect(formatSmart(1 / 3)).toBe('0.3333333333');
    expect(formatSmart(2.54)).toBe('2.54');
  });
  it('formats durations', () => {
    expect(formatDuration(26)).toBe('2 years 2 months');
    expect(formatDuration(12)).toBe('1 year');
    expect(formatDuration(0)).toBe('0 months');
  });
});
