/**
 * Unit definitions. Linear units convert via a factor to the base unit; non-linear
 * units (temperature, fuel economy) supply toBase/fromBase functions.
 */
export interface Unit {
  id: string;
  label: string;
  symbol: string;
  factor?: number;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
  group?: 'Metric' | 'Imperial / US' | 'Indian' | 'Other';
}

export interface Quantity {
  id: string;
  base: string;
  units: Unit[];
  defaultFrom: string;
  defaultTo: string;
  defaultValue: number;
  allowNegative?: boolean;
  note?: string;
}

const PI = Math.PI;

export const LENGTH: Quantity = {
  id: 'length',
  base: 'm',
  defaultFrom: 'ft',
  defaultTo: 'm',
  defaultValue: 10,
  units: [
    { id: 'nm', label: 'Nanometre', symbol: 'nm', factor: 1e-9, group: 'Metric' },
    { id: 'um', label: 'Micrometre', symbol: 'µm', factor: 1e-6, group: 'Metric' },
    { id: 'mm', label: 'Millimetre', symbol: 'mm', factor: 0.001, group: 'Metric' },
    { id: 'cm', label: 'Centimetre', symbol: 'cm', factor: 0.01, group: 'Metric' },
    { id: 'm', label: 'Metre', symbol: 'm', factor: 1, group: 'Metric' },
    { id: 'km', label: 'Kilometre', symbol: 'km', factor: 1000, group: 'Metric' },
    { id: 'in', label: 'Inch', symbol: 'in', factor: 0.0254, group: 'Imperial / US' },
    { id: 'ft', label: 'Foot', symbol: 'ft', factor: 0.3048, group: 'Imperial / US' },
    { id: 'yd', label: 'Yard / Gaj', symbol: 'yd', factor: 0.9144, group: 'Imperial / US' },
    { id: 'mi', label: 'Mile', symbol: 'mi', factor: 1609.344, group: 'Imperial / US' },
    { id: 'nmi', label: 'Nautical mile', symbol: 'nmi', factor: 1852, group: 'Other' },
    { id: 'mil', label: 'Mil (thou)', symbol: 'mil', factor: 2.54e-5, group: 'Imperial / US' },
    { id: 'hath', label: 'Hath (cubit, 18 in)', symbol: 'hath', factor: 0.4572, group: 'Indian' },
    { id: 'au', label: 'Astronomical unit', symbol: 'au', factor: 149_597_870_700, group: 'Other' },
    { id: 'ly', label: 'Light-year', symbol: 'ly', factor: 9_460_730_472_580_800, group: 'Other' },
  ],
};

export const WEIGHT: Quantity = {
  id: 'weight',
  base: 'kg',
  defaultFrom: 'kg',
  defaultTo: 'lb',
  defaultValue: 70,
  units: [
    { id: 'mg', label: 'Milligram', symbol: 'mg', factor: 1e-6, group: 'Metric' },
    { id: 'g', label: 'Gram', symbol: 'g', factor: 0.001, group: 'Metric' },
    { id: 'kg', label: 'Kilogram', symbol: 'kg', factor: 1, group: 'Metric' },
    { id: 'q', label: 'Quintal', symbol: 'q', factor: 100, group: 'Metric' },
    { id: 't', label: 'Tonne (metric ton)', symbol: 't', factor: 1000, group: 'Metric' },
    { id: 'ct', label: 'Carat', symbol: 'ct', factor: 0.0002, group: 'Metric' },
    { id: 'oz', label: 'Ounce', symbol: 'oz', factor: 0.028349523125, group: 'Imperial / US' },
    { id: 'lb', label: 'Pound', symbol: 'lb', factor: 0.45359237, group: 'Imperial / US' },
    { id: 'st', label: 'Stone', symbol: 'st', factor: 6.35029318, group: 'Imperial / US' },
    {
      id: 'uston',
      label: 'US short ton',
      symbol: 'ton (US)',
      factor: 907.18474,
      group: 'Imperial / US',
    },
    {
      id: 'ukton',
      label: 'UK long ton',
      symbol: 'ton (UK)',
      factor: 1016.0469088,
      group: 'Imperial / US',
    },
    { id: 'gr', label: 'Grain', symbol: 'gr', factor: 6.479891e-5, group: 'Imperial / US' },
    { id: 'tola', label: 'Tola', symbol: 'tola', factor: 0.0116638038, group: 'Indian' },
    { id: 'ratti', label: 'Ratti', symbol: 'ratti', factor: 0.000121497, group: 'Indian' },
    { id: 'seer', label: 'Seer', symbol: 'seer', factor: 0.9331, group: 'Indian' },
    { id: 'maund', label: 'Maund', symbol: 'maund', factor: 37.3242, group: 'Indian' },
  ],
};

export const TEMPERATURE: Quantity = {
  id: 'temperature',
  base: 'c',
  defaultFrom: 'c',
  defaultTo: 'f',
  defaultValue: 37,
  allowNegative: true,
  units: [
    { id: 'c', label: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
    {
      id: 'f',
      label: 'Fahrenheit',
      symbol: '°F',
      toBase: (v) => ((v - 32) * 5) / 9,
      fromBase: (v) => (v * 9) / 5 + 32,
    },
    {
      id: 'k',
      label: 'Kelvin',
      symbol: 'K',
      toBase: (v) => v - 273.15,
      fromBase: (v) => v + 273.15,
    },
    {
      id: 'r',
      label: 'Rankine',
      symbol: '°R',
      toBase: (v) => ((v - 491.67) * 5) / 9,
      fromBase: (v) => ((v + 273.15) * 9) / 5,
    },
  ],
};

const SQFT = 0.09290304;
export const AREA: Quantity = {
  id: 'area',
  base: 'm2',
  defaultFrom: 'acre',
  defaultTo: 'sqft',
  defaultValue: 1,
  note: 'Traditional Indian land units such as bigha, katha and marla vary between states and even districts. Values here follow the most widely used definitions — confirm with local land records for legal use.',
  units: [
    { id: 'mm2', label: 'Square millimetre', symbol: 'mm²', factor: 1e-6, group: 'Metric' },
    { id: 'cm2', label: 'Square centimetre', symbol: 'cm²', factor: 1e-4, group: 'Metric' },
    { id: 'm2', label: 'Square metre', symbol: 'm²', factor: 1, group: 'Metric' },
    { id: 'are', label: 'Are', symbol: 'a', factor: 100, group: 'Metric' },
    { id: 'ha', label: 'Hectare', symbol: 'ha', factor: 10_000, group: 'Metric' },
    { id: 'km2', label: 'Square kilometre', symbol: 'km²', factor: 1e6, group: 'Metric' },
    { id: 'sqin', label: 'Square inch', symbol: 'in²', factor: 0.00064516, group: 'Imperial / US' },
    { id: 'sqft', label: 'Square foot', symbol: 'ft²', factor: SQFT, group: 'Imperial / US' },
    {
      id: 'sqyd',
      label: 'Square yard / Gaj',
      symbol: 'yd²',
      factor: 0.83612736,
      group: 'Imperial / US',
    },
    { id: 'acre', label: 'Acre', symbol: 'ac', factor: 4046.8564224, group: 'Imperial / US' },
    {
      id: 'sqmi',
      label: 'Square mile',
      symbol: 'mi²',
      factor: 2_589_988.110336,
      group: 'Imperial / US',
    },
    {
      id: 'cent',
      label: 'Cent (South India)',
      symbol: 'cent',
      factor: 435.6 * SQFT,
      group: 'Indian',
    },
    {
      id: 'guntha',
      label: 'Guntha (Maharashtra, Karnataka)',
      symbol: 'guntha',
      factor: 1089 * SQFT,
      group: 'Indian',
    },
    {
      id: 'ground',
      label: 'Ground (Tamil Nadu)',
      symbol: 'ground',
      factor: 2400 * SQFT,
      group: 'Indian',
    },
    {
      id: 'ankanam',
      label: 'Ankanam (Andhra Pradesh)',
      symbol: 'ankanam',
      factor: 72 * SQFT,
      group: 'Indian',
    },
    {
      id: 'marla',
      label: 'Marla (Punjab, Haryana)',
      symbol: 'marla',
      factor: 272.25 * SQFT,
      group: 'Indian',
    },
    {
      id: 'kanal',
      label: 'Kanal (Punjab, Haryana)',
      symbol: 'kanal',
      factor: 5445 * SQFT,
      group: 'Indian',
    },
    {
      id: 'katha-wb',
      label: 'Katha (West Bengal)',
      symbol: 'katha',
      factor: 720 * SQFT,
      group: 'Indian',
    },
    {
      id: 'bigha-wb',
      label: 'Bigha (West Bengal, Assam)',
      symbol: 'bigha',
      factor: 14_400 * SQFT,
      group: 'Indian',
    },
    {
      id: 'bigha-gj',
      label: 'Bigha (Gujarat)',
      symbol: 'bigha',
      factor: 17_424 * SQFT,
      group: 'Indian',
    },
    {
      id: 'bigha-rj',
      label: 'Bigha (Rajasthan, pucca)',
      symbol: 'bigha',
      factor: 27_225 * SQFT,
      group: 'Indian',
    },
  ],
};

export const VOLUME: Quantity = {
  id: 'volume',
  base: 'l',
  defaultFrom: 'l',
  defaultTo: 'usgal',
  defaultValue: 10,
  units: [
    { id: 'ml', label: 'Millilitre', symbol: 'ml', factor: 0.001, group: 'Metric' },
    { id: 'cl', label: 'Centilitre', symbol: 'cl', factor: 0.01, group: 'Metric' },
    { id: 'l', label: 'Litre', symbol: 'L', factor: 1, group: 'Metric' },
    { id: 'm3', label: 'Cubic metre', symbol: 'm³', factor: 1000, group: 'Metric' },
    { id: 'cm3', label: 'Cubic centimetre (cc)', symbol: 'cm³', factor: 0.001, group: 'Metric' },
    {
      id: 'tsp',
      label: 'Teaspoon (US)',
      symbol: 'tsp',
      factor: 0.00492892159375,
      group: 'Imperial / US',
    },
    {
      id: 'tbsp',
      label: 'Tablespoon (US)',
      symbol: 'tbsp',
      factor: 0.01478676478125,
      group: 'Imperial / US',
    },
    {
      id: 'usfloz',
      label: 'Fluid ounce (US)',
      symbol: 'fl oz',
      factor: 0.0295735295625,
      group: 'Imperial / US',
    },
    { id: 'uscup', label: 'Cup (US)', symbol: 'cup', factor: 0.2365882365, group: 'Imperial / US' },
    { id: 'uspt', label: 'Pint (US)', symbol: 'pt', factor: 0.473176473, group: 'Imperial / US' },
    { id: 'usqt', label: 'Quart (US)', symbol: 'qt', factor: 0.946352946, group: 'Imperial / US' },
    {
      id: 'usgal',
      label: 'Gallon (US)',
      symbol: 'gal',
      factor: 3.785411784,
      group: 'Imperial / US',
    },
    {
      id: 'ukfloz',
      label: 'Fluid ounce (UK)',
      symbol: 'fl oz (UK)',
      factor: 0.0284130625,
      group: 'Imperial / US',
    },
    {
      id: 'ukpt',
      label: 'Pint (UK)',
      symbol: 'pt (UK)',
      factor: 0.56826125,
      group: 'Imperial / US',
    },
    {
      id: 'ukgal',
      label: 'Gallon (UK)',
      symbol: 'gal (UK)',
      factor: 4.54609,
      group: 'Imperial / US',
    },
    { id: 'in3', label: 'Cubic inch', symbol: 'in³', factor: 0.016387064, group: 'Imperial / US' },
    { id: 'ft3', label: 'Cubic foot', symbol: 'ft³', factor: 28.316846592, group: 'Imperial / US' },
    { id: 'bbl', label: 'Barrel (oil)', symbol: 'bbl', factor: 158.987294928, group: 'Other' },
  ],
};

export const SPEED: Quantity = {
  id: 'speed',
  base: 'ms',
  defaultFrom: 'kmh',
  defaultTo: 'mph',
  defaultValue: 100,
  units: [
    { id: 'ms', label: 'Metre per second', symbol: 'm/s', factor: 1 },
    { id: 'kmh', label: 'Kilometre per hour', symbol: 'km/h', factor: 1 / 3.6 },
    { id: 'mph', label: 'Mile per hour', symbol: 'mph', factor: 0.44704 },
    { id: 'kn', label: 'Knot', symbol: 'kn', factor: 1852 / 3600 },
    { id: 'fts', label: 'Foot per second', symbol: 'ft/s', factor: 0.3048 },
    { id: 'mach', label: 'Mach (sea level, 15 °C)', symbol: 'Ma', factor: 340.29 },
    { id: 'c', label: 'Speed of light', symbol: 'c', factor: 299_792_458 },
  ],
};

export const TIME: Quantity = {
  id: 'time',
  base: 's',
  defaultFrom: 'h',
  defaultTo: 'min',
  defaultValue: 2.5,
  units: [
    { id: 'ns', label: 'Nanosecond', symbol: 'ns', factor: 1e-9 },
    { id: 'us', label: 'Microsecond', symbol: 'µs', factor: 1e-6 },
    { id: 'ms', label: 'Millisecond', symbol: 'ms', factor: 0.001 },
    { id: 's', label: 'Second', symbol: 's', factor: 1 },
    { id: 'min', label: 'Minute', symbol: 'min', factor: 60 },
    { id: 'h', label: 'Hour', symbol: 'h', factor: 3600 },
    { id: 'd', label: 'Day', symbol: 'd', factor: 86_400 },
    { id: 'wk', label: 'Week', symbol: 'wk', factor: 604_800 },
    { id: 'mo', label: 'Month (average)', symbol: 'mo', factor: 2_629_746 },
    { id: 'yr', label: 'Year (average)', symbol: 'yr', factor: 31_556_952 },
    { id: 'dec', label: 'Decade', symbol: 'dec', factor: 315_569_520 },
    { id: 'cent', label: 'Century', symbol: 'c', factor: 3_155_695_200 },
  ],
};

export const DATA: Quantity = {
  id: 'data',
  base: 'B',
  defaultFrom: 'GB',
  defaultTo: 'MB',
  defaultValue: 1,
  note: 'Decimal units (KB, MB, GB) use powers of 1000, as storage manufacturers and ISPs do. Binary units (KiB, MiB, GiB) use powers of 1024, which operating systems often display as “GB”.',
  units: [
    { id: 'bit', label: 'Bit', symbol: 'bit', factor: 0.125 },
    { id: 'B', label: 'Byte', symbol: 'B', factor: 1 },
    { id: 'kbit', label: 'Kilobit', symbol: 'kbit', factor: 125 },
    { id: 'Mbit', label: 'Megabit', symbol: 'Mbit', factor: 125_000 },
    { id: 'Gbit', label: 'Gigabit', symbol: 'Gbit', factor: 125_000_000 },
    { id: 'KB', label: 'Kilobyte (1000)', symbol: 'KB', factor: 1e3 },
    { id: 'MB', label: 'Megabyte (1000²)', symbol: 'MB', factor: 1e6 },
    { id: 'GB', label: 'Gigabyte (1000³)', symbol: 'GB', factor: 1e9 },
    { id: 'TB', label: 'Terabyte (1000⁴)', symbol: 'TB', factor: 1e12 },
    { id: 'PB', label: 'Petabyte (1000⁵)', symbol: 'PB', factor: 1e15 },
    { id: 'KiB', label: 'Kibibyte (1024)', symbol: 'KiB', factor: 1024 },
    { id: 'MiB', label: 'Mebibyte (1024²)', symbol: 'MiB', factor: 1024 ** 2 },
    { id: 'GiB', label: 'Gibibyte (1024³)', symbol: 'GiB', factor: 1024 ** 3 },
    { id: 'TiB', label: 'Tebibyte (1024⁴)', symbol: 'TiB', factor: 1024 ** 4 },
    { id: 'PiB', label: 'Pebibyte (1024⁵)', symbol: 'PiB', factor: 1024 ** 5 },
  ],
};

export const ENERGY: Quantity = {
  id: 'energy',
  base: 'J',
  defaultFrom: 'kcal',
  defaultTo: 'kJ',
  defaultValue: 500,
  units: [
    { id: 'J', label: 'Joule', symbol: 'J', factor: 1 },
    { id: 'kJ', label: 'Kilojoule', symbol: 'kJ', factor: 1000 },
    { id: 'MJ', label: 'Megajoule', symbol: 'MJ', factor: 1e6 },
    { id: 'cal', label: 'Calorie', symbol: 'cal', factor: 4.184 },
    { id: 'kcal', label: 'Kilocalorie (food Calorie)', symbol: 'kcal', factor: 4184 },
    { id: 'Wh', label: 'Watt-hour', symbol: 'Wh', factor: 3600 },
    { id: 'kWh', label: 'Kilowatt-hour (electricity unit)', symbol: 'kWh', factor: 3.6e6 },
    { id: 'eV', label: 'Electronvolt', symbol: 'eV', factor: 1.602176634e-19 },
    { id: 'BTU', label: 'British thermal unit', symbol: 'BTU', factor: 1055.05585262 },
    { id: 'therm', label: 'Therm (US)', symbol: 'thm', factor: 105_480_400 },
    { id: 'ftlb', label: 'Foot-pound', symbol: 'ft·lbf', factor: 1.3558179483314 },
  ],
};

export const POWER: Quantity = {
  id: 'power',
  base: 'W',
  defaultFrom: 'hp',
  defaultTo: 'kW',
  defaultValue: 100,
  units: [
    { id: 'W', label: 'Watt', symbol: 'W', factor: 1 },
    { id: 'kW', label: 'Kilowatt', symbol: 'kW', factor: 1000 },
    { id: 'MW', label: 'Megawatt', symbol: 'MW', factor: 1e6 },
    { id: 'hp', label: 'Horsepower (mechanical)', symbol: 'hp', factor: 745.69987158227 },
    { id: 'ps', label: 'Metric horsepower (PS)', symbol: 'PS', factor: 735.49875 },
    { id: 'btuh', label: 'BTU per hour', symbol: 'BTU/h', factor: 0.29307107017 },
    { id: 'tr', label: 'Ton of refrigeration (AC ton)', symbol: 'TR', factor: 3516.8528421 },
    { id: 'kcalh', label: 'Kilocalorie per hour', symbol: 'kcal/h', factor: 1.163 },
  ],
};

export const PRESSURE: Quantity = {
  id: 'pressure',
  base: 'Pa',
  defaultFrom: 'psi',
  defaultTo: 'bar',
  defaultValue: 32,
  units: [
    { id: 'Pa', label: 'Pascal', symbol: 'Pa', factor: 1 },
    { id: 'kPa', label: 'Kilopascal', symbol: 'kPa', factor: 1000 },
    { id: 'MPa', label: 'Megapascal', symbol: 'MPa', factor: 1e6 },
    { id: 'bar', label: 'Bar', symbol: 'bar', factor: 1e5 },
    { id: 'mbar', label: 'Millibar', symbol: 'mbar', factor: 100 },
    { id: 'atm', label: 'Standard atmosphere', symbol: 'atm', factor: 101_325 },
    { id: 'psi', label: 'Pound per square inch', symbol: 'psi', factor: 6894.757293168 },
    { id: 'kgcm2', label: 'Kilogram-force per cm²', symbol: 'kgf/cm²', factor: 98_066.5 },
    { id: 'mmHg', label: 'Millimetre of mercury', symbol: 'mmHg', factor: 133.322387415 },
    { id: 'inHg', label: 'Inch of mercury', symbol: 'inHg', factor: 3386.389 },
    { id: 'torr', label: 'Torr', symbol: 'Torr', factor: 101_325 / 760 },
  ],
};

export const FUEL: Quantity = {
  id: 'fuel',
  base: 'kmpl',
  defaultFrom: 'kmpl',
  defaultTo: 'l100',
  defaultValue: 18,
  note: 'L/100 km is an inverse measure: lower is more efficient.',
  units: [
    { id: 'kmpl', label: 'Kilometres per litre', symbol: 'km/L', factor: 1 },
    {
      id: 'l100',
      label: 'Litres per 100 km',
      symbol: 'L/100 km',
      toBase: (v) => 100 / v,
      fromBase: (v) => 100 / v,
    },
    {
      id: 'mpgus',
      label: 'Miles per gallon (US)',
      symbol: 'mpg (US)',
      factor: 1.609344 / 3.785411784,
    },
    { id: 'mpguk', label: 'Miles per gallon (UK)', symbol: 'mpg (UK)', factor: 1.609344 / 4.54609 },
    { id: 'mpl', label: 'Miles per litre', symbol: 'mi/L', factor: 1.609344 },
  ],
};

export const FREQUENCY: Quantity = {
  id: 'frequency',
  base: 'Hz',
  defaultFrom: 'GHz',
  defaultTo: 'MHz',
  defaultValue: 2.4,
  units: [
    { id: 'Hz', label: 'Hertz', symbol: 'Hz', factor: 1 },
    { id: 'kHz', label: 'Kilohertz', symbol: 'kHz', factor: 1e3 },
    { id: 'MHz', label: 'Megahertz', symbol: 'MHz', factor: 1e6 },
    { id: 'GHz', label: 'Gigahertz', symbol: 'GHz', factor: 1e9 },
    { id: 'THz', label: 'Terahertz', symbol: 'THz', factor: 1e12 },
    { id: 'rpm', label: 'Revolutions per minute', symbol: 'rpm', factor: 1 / 60 },
    { id: 'rads', label: 'Radians per second', symbol: 'rad/s', factor: 1 / (2 * PI) },
  ],
};

export const ANGLE: Quantity = {
  id: 'angle',
  base: 'deg',
  defaultFrom: 'deg',
  defaultTo: 'rad',
  defaultValue: 90,
  allowNegative: true,
  units: [
    { id: 'deg', label: 'Degree', symbol: '°', factor: 1 },
    { id: 'rad', label: 'Radian', symbol: 'rad', factor: 180 / PI },
    { id: 'grad', label: 'Gradian', symbol: 'gon', factor: 0.9 },
    { id: 'arcmin', label: 'Arcminute', symbol: '′', factor: 1 / 60 },
    { id: 'arcsec', label: 'Arcsecond', symbol: '″', factor: 1 / 3600 },
    { id: 'mrad', label: 'Milliradian', symbol: 'mrad', factor: 0.18 / PI },
    { id: 'turn', label: 'Turn (revolution)', symbol: 'turn', factor: 360 },
  ],
};

export function findUnit(q: Quantity, id: string): Unit {
  const u = q.units.find((x) => x.id === id);
  if (!u) throw new Error(`Unknown unit ${id}`);
  return u;
}

export function toBase(q: Quantity, unitId: string, value: number): number {
  const u = findUnit(q, unitId);
  return u.toBase ? u.toBase(value) : value * (u.factor as number);
}

export function fromBase(q: Quantity, unitId: string, base: number): number {
  const u = findUnit(q, unitId);
  return u.fromBase ? u.fromBase(base) : base / (u.factor as number);
}

export function convert(q: Quantity, value: number, from: string, to: string): number {
  if (from === to) return value;
  const r = fromBase(q, to, toBase(q, from, value));
  // trim binary noise (0.30000000000000004)
  return Number(r.toPrecision(15));
}
