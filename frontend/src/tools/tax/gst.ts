import { InputError, round2, sumMoney } from '@/utils/number';

export interface GstBreakup {
  base: number;
  gst: number;
  total: number;
  cgst: number;
  sgst: number;
  igst: number;
}

function validate(amount: number, ratePct: number) {
  if (!(amount >= 0)) throw new InputError('Amount cannot be negative.', 'amount');
  if (ratePct < 0 || ratePct > 100)
    throw new InputError('GST rate must be between 0% and 100%.', 'rate');
}

/** Split GST into CGST + SGST (intra-state) or IGST (inter-state), keeping paise exact. */
export function splitGst(
  gst: number,
  interState: boolean,
): Pick<GstBreakup, 'cgst' | 'sgst' | 'igst'> {
  if (interState) return { cgst: 0, sgst: 0, igst: round2(gst) };
  const half = round2(gst / 2);
  return { cgst: half, sgst: round2(gst - half), igst: 0 };
}

/** Add GST to a base (exclusive) price. */
export function addGst(base: number, ratePct: number, interState = false): GstBreakup {
  validate(base, ratePct);
  const gst = round2((base * ratePct) / 100);
  return { base: round2(base), gst, total: sumMoney([base, gst]), ...splitGst(gst, interState) };
}

/** Extract GST from a GST-inclusive price. */
export function removeGst(total: number, ratePct: number, interState = false): GstBreakup {
  validate(total, ratePct);
  const base = round2((total * 100) / (100 + ratePct));
  const gst = round2(total - base);
  return { base, gst, total: round2(total), ...splitGst(gst, interState) };
}

/** From a known GST amount, find the taxable value and invoice total. */
export function fromGstAmount(gst: number, ratePct: number): { base: number; total: number } {
  if (!(ratePct > 0)) throw new InputError('GST rate must be greater than zero.', 'rate');
  const base = round2((gst * 100) / ratePct);
  return { base, total: sumMoney([base, gst]) };
}

/** Implied GST rate from base and total. */
export function impliedRate(base: number, total: number): number {
  if (!(base > 0)) throw new InputError('Taxable value must be greater than zero.', 'base');
  if (total < base) throw new InputError('Total cannot be less than the taxable value.', 'total');
  return ((total - base) / base) * 100;
}
