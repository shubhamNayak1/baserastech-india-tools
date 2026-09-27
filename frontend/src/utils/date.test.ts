import {
  addMonths,
  addWorkingDays,
  countWorkingDays,
  diffYMD,
  isLeapYear,
  isoWeek,
  parseISODate,
  parseTime,
  toISODate,
  formatClock,
  daysBetween,
} from './date';

const d = (s: string) => parseISODate(s);

describe('date utils', () => {
  it('validates calendar dates', () => {
    expect(() => parseISODate('2023-02-29')).toThrow('not a valid calendar date');
    expect(() => parseISODate('hello')).toThrow();
    expect(toISODate(d('2024-02-29'))).toBe('2024-02-29');
  });
  it('computes leap years', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
  });
  it('diffs in years/months/days', () => {
    expect(diffYMD(d('1990-05-15'), d('2026-09-27'))).toEqual({ years: 36, months: 4, days: 12 });
    expect(diffYMD(d('2024-01-31'), d('2024-03-01'))).toEqual({ years: 0, months: 1, days: 1 });
    expect(diffYMD(d('2000-02-29'), d('2001-02-28'))).toEqual({ years: 1, months: 0, days: 0 });
    expect(() => diffYMD(d('2025-01-02'), d('2025-01-01'))).toThrow();
  });
  it('adds months clamping to month end', () => {
    expect(toISODate(addMonths(d('2024-01-31'), 1))).toBe('2024-02-29');
    expect(toISODate(addMonths(d('2024-03-31'), -1))).toBe('2024-02-29');
  });
  it('computes ISO week numbers', () => {
    expect(isoWeek(d('2026-01-01'))).toEqual({ week: 1, year: 2026 });
    expect(isoWeek(d('2021-01-03'))).toEqual({ week: 53, year: 2020 });
    expect(isoWeek(d('2024-12-30'))).toEqual({ week: 1, year: 2025 });
  });
  it('counts working days', () => {
    // Mon 2026-09-21 to Sun 2026-09-27
    expect(countWorkingDays(d('2026-09-21'), d('2026-09-27'), 'sat-sun')).toEqual({
      working: 5,
      weekend: 2,
      holidays: 0,
      total: 7,
    });
    const hol = new Set(['2026-10-02']);
    expect(countWorkingDays(d('2026-09-28'), d('2026-10-04'), 'sat-sun', hol).working).toBe(4);
    // second & fourth Saturday rule: Sep 2026 Saturdays: 5, 12, 19, 26
    expect(
      countWorkingDays(d('2026-09-01'), d('2026-09-30'), 'second-fourth-sat-sun').working,
    ).toBe(24);
  });
  it('adds working days skipping weekends', () => {
    expect(toISODate(addWorkingDays(d('2026-09-25'), 1, 'sat-sun'))).toBe('2026-09-28');
    expect(toISODate(addWorkingDays(d('2026-09-28'), -1, 'sat-sun'))).toBe('2026-09-25');
    expect(daysBetween(d('2026-01-01'), d('2026-12-31'))).toBe(364);
  });
  it('parses and formats times', () => {
    expect(parseTime('07:30')).toBe(27000);
    expect(() => parseTime('25:00')).toThrow();
    expect(formatClock(0)).toBe('12:00 AM');
    expect(formatClock(13 * 3600 + 5 * 60)).toBe('1:05 PM');
    expect(formatClock(-3600, false)).toBe('23:00');
  });
});
