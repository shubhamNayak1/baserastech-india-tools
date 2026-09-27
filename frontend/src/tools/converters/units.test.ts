import {
  ANGLE,
  AREA,
  convert,
  DATA,
  ENERGY,
  FUEL,
  LENGTH,
  POWER,
  PRESSURE,
  SPEED,
  TEMPERATURE,
  TIME,
  VOLUME,
  WEIGHT,
  FREQUENCY,
  type Quantity,
} from './units';

const ALL: Quantity[] = [
  LENGTH,
  WEIGHT,
  TEMPERATURE,
  AREA,
  VOLUME,
  SPEED,
  TIME,
  DATA,
  ENERGY,
  POWER,
  PRESSURE,
  FUEL,
  FREQUENCY,
  ANGLE,
];

describe('unit conversions', () => {
  it('converts known reference values', () => {
    expect(convert(LENGTH, 1, 'in', 'cm')).toBe(2.54);
    expect(convert(LENGTH, 1, 'mi', 'km')).toBe(1.609344);
    expect(convert(WEIGHT, 1, 'kg', 'lb')).toBeCloseTo(2.20462262, 8);
    expect(convert(WEIGHT, 1, 'tola', 'g')).toBeCloseTo(11.6638038, 6);
    expect(convert(TEMPERATURE, 100, 'c', 'f')).toBe(212);
    expect(convert(TEMPERATURE, -40, 'f', 'c')).toBe(-40);
    expect(convert(TEMPERATURE, 0, 'k', 'c')).toBe(-273.15);
    expect(convert(TEMPERATURE, 491.67, 'r', 'k')).toBe(273.15);
    expect(convert(AREA, 1, 'acre', 'sqft')).toBeCloseTo(43560, 6);
    expect(convert(AREA, 1, 'ha', 'acre')).toBeCloseTo(2.4710538, 6);
    expect(convert(AREA, 1, 'guntha', 'sqft')).toBeCloseTo(1089, 6);
    expect(convert(AREA, 40, 'guntha', 'acre')).toBeCloseTo(1, 9);
    expect(convert(AREA, 100, 'cent', 'acre')).toBeCloseTo(1, 9);
    expect(convert(VOLUME, 1, 'usgal', 'l')).toBe(3.785411784);
    expect(convert(SPEED, 100, 'kmh', 'mph')).toBeCloseTo(62.1371, 4);
    expect(convert(TIME, 1, 'd', 'h')).toBe(24);
    expect(convert(DATA, 1, 'GiB', 'MiB')).toBe(1024);
    expect(convert(DATA, 1, 'GB', 'MB')).toBe(1000);
    expect(convert(ENERGY, 1, 'kWh', 'MJ')).toBe(3.6);
    expect(convert(ENERGY, 1, 'kcal', 'kJ')).toBe(4.184);
    expect(convert(POWER, 1, 'tr', 'W')).toBeCloseTo(3516.85, 2);
    expect(convert(PRESSURE, 1, 'atm', 'psi')).toBeCloseTo(14.6959, 4);
    expect(convert(FUEL, 20, 'kmpl', 'l100')).toBe(5);
    expect(convert(FUEL, 5, 'l100', 'kmpl')).toBe(20);
    expect(convert(FUEL, 1, 'kmpl', 'mpgus')).toBeCloseTo(2.35215, 5);
    expect(convert(FREQUENCY, 60, 'rpm', 'Hz')).toBe(1);
    expect(convert(ANGLE, 180, 'deg', 'rad')).toBeCloseTo(Math.PI, 12);
  });
  it('round-trips every unit through every other unit', () => {
    for (const q of ALL) {
      for (const a of q.units) {
        for (const b of q.units) {
          const v = q.id === 'fuel' ? 12.5 : 3.7;
          const back = convert(q, convert(q, v, a.id, b.id), b.id, a.id);
          expect(back, `${q.id}: ${a.id}→${b.id}`).toBeCloseTo(v, 6);
        }
      }
    }
  });
  it('has unique unit ids and valid defaults', () => {
    for (const q of ALL) {
      const ids = q.units.map((u) => u.id);
      expect(new Set(ids).size, q.id).toBe(ids.length);
      expect(ids).toContain(q.defaultFrom);
      expect(ids).toContain(q.defaultTo);
    }
  });
});
