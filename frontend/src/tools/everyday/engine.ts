import { InputError, round2 } from '@/utils/number';

export function tipSplit(bill: number, tipPct: number, people: number, roundUp: boolean) {
  if (!(bill > 0)) throw new InputError('Bill amount must be greater than zero.', 'bill');
  if (!Number.isInteger(people) || people < 1)
    throw new InputError('Number of people must be at least 1.', 'people');
  const tip = round2((bill * tipPct) / 100);
  let total = round2(bill + tip);
  let perPerson = total / people;
  if (roundUp) {
    perPerson = Math.ceil(perPerson);
    total = perPerson * people;
  }
  return { tip: round2(total - bill), total, perPerson: round2(perPerson) };
}

export function fuelCost(
  distanceKm: number,
  kmpl: number,
  pricePerL: number,
  roundTrip: boolean,
  people: number,
) {
  if (!(kmpl > 0)) throw new InputError('Mileage must be greater than zero.', 'mileage');
  const d = distanceKm * (roundTrip ? 2 : 1);
  const litres = d / kmpl;
  const cost = litres * pricePerL;
  return {
    distance: d,
    litres,
    cost,
    perPerson: cost / Math.max(1, people),
    perKm: pricePerL / kmpl,
  };
}

export function mileage(distanceKm: number, litres: number, pricePerL: number) {
  if (!(distanceKm > 0)) throw new InputError('Distance must be greater than zero.', 'distance');
  if (!(litres > 0)) throw new InputError('Fuel quantity must be greater than zero.', 'litres');
  const kmpl = distanceKm / litres;
  return {
    kmpl,
    l100: 100 / kmpl,
    costPerKm: (litres * pricePerL) / distanceKm,
    cost: litres * pricePerL,
  };
}

export function electricityCost(
  watts: number,
  hoursPerDay: number,
  days: number,
  tariff: number,
  quantity = 1,
) {
  if (!(watts > 0)) throw new InputError('Power rating must be greater than zero.', 'watts');
  if (hoursPerDay < 0 || hoursPerDay > 24)
    throw new InputError('Hours per day must be between 0 and 24.', 'hours');
  const units = (watts * quantity * hoursPerDay * days) / 1000;
  return { units, cost: units * tariff, perDay: (watts * quantity * hoursPerDay * tariff) / 1000 };
}

export const SLEEP_CYCLE_MIN = 90;

/** Bedtimes (seconds since midnight) that complete whole sleep cycles before waking. */
export function bedtimesFor(wakeSec: number, fallAsleepMin: number, cycles = [6, 5, 4, 3]) {
  return cycles.map((c) => ({
    cycles: c,
    hours: (c * SLEEP_CYCLE_MIN) / 60,
    time: (((wakeSec - (c * SLEEP_CYCLE_MIN + fallAsleepMin) * 60) % 86400) + 86400) % 86400,
  }));
}

export function wakeTimesFor(bedSec: number, fallAsleepMin: number, cycles = [3, 4, 5, 6]) {
  return cycles.map((c) => ({
    cycles: c,
    hours: (c * SLEEP_CYCLE_MIN) / 60,
    time: (bedSec + (c * SLEEP_CYCLE_MIN + fallAsleepMin) * 60) % 86400,
  }));
}

export const COOKING_UNITS: Record<string, { label: string; ml?: number; g?: number }> = {
  tsp: { label: 'Teaspoon (5 ml)', ml: 5 },
  tbsp: { label: 'Tablespoon (15 ml)', ml: 15 },
  cup: { label: 'Cup – metric (250 ml)', ml: 250 },
  uscup: { label: 'Cup – US (236.6 ml)', ml: 236.588 },
  katori: { label: 'Katori (approx. 150 ml)', ml: 150 },
  ml: { label: 'Millilitre', ml: 1 },
  l: { label: 'Litre', ml: 1000 },
  floz: { label: 'Fluid ounce (US)', ml: 29.5735 },
  g: { label: 'Gram', g: 1 },
  kg: { label: 'Kilogram', g: 1000 },
  oz: { label: 'Ounce', g: 28.3495 },
  lb: { label: 'Pound', g: 453.592 },
};

/** Approximate densities in g/ml (spooned and levelled for dry ingredients). */
export const INGREDIENTS: Record<string, { label: string; density: number }> = {
  water: { label: 'Water', density: 1 },
  milk: { label: 'Milk', density: 1.03 },
  curd: { label: 'Curd / yoghurt', density: 1.03 },
  oil: { label: 'Cooking oil', density: 0.92 },
  ghee: { label: 'Ghee', density: 0.91 },
  butter: { label: 'Butter', density: 0.911 },
  honey: { label: 'Honey', density: 1.42 },
  sugar: { label: 'Sugar (granulated)', density: 0.845 },
  powderedSugar: { label: 'Powdered sugar', density: 0.5 },
  atta: { label: 'Atta (whole wheat flour)', density: 0.51 },
  maida: { label: 'Maida (all-purpose flour)', density: 0.53 },
  besan: { label: 'Besan (gram flour)', density: 0.39 },
  rice: { label: 'Rice (uncooked)', density: 0.78 },
  sooji: { label: 'Sooji / rava', density: 0.7 },
  salt: { label: 'Salt (table)', density: 1.2 },
  cocoa: { label: 'Cocoa powder', density: 0.42 },
};

export function convertCooking(
  amount: number,
  from: string,
  to: string,
  ingredient: string,
): number {
  const f = COOKING_UNITS[from];
  const t = COOKING_UNITS[to];
  const ing = INGREDIENTS[ingredient];
  if (!f || !t || !ing) throw new InputError('Choose valid units and ingredient.');
  const grams = f.g !== undefined ? amount * f.g : amount * (f.ml as number) * ing.density;
  return t.g !== undefined ? grams / t.g : grams / ing.density / (t.ml as number);
}

export function pickRandom<T>(items: T[], count: number, rng: () => number): T[] {
  if (count > items.length)
    throw new InputError(`You can pick at most ${items.length} from this list.`, 'count');
  const pool = [...items];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function splitProportional(
  items: { name: string; amount: number }[],
  extraPct: number,
  tip: number,
) {
  const subtotal = items.reduce((a, i) => a + i.amount, 0);
  if (!(subtotal > 0)) throw new InputError('Enter at least one amount.', 'items');
  const extra = (subtotal * extraPct) / 100;
  const grand = subtotal + extra + tip;
  return {
    subtotal,
    extra,
    grand,
    shares: items.map((i) => ({ name: i.name, amount: round2((i.amount / subtotal) * grand) })),
  };
}
