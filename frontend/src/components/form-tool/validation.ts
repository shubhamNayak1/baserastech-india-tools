import { InputError, parseNumber } from '@/utils/number';
import { todayISO } from '@/utils/date';
import type { Field, FieldValue, FormToolSpec, FormValues, Option } from './types';

export type RawValues = Record<string, string | boolean>;

const groupINR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

export function resolveDefault(field: Field<FormValues>): string | boolean {
  if (field.type === 'toggle') return field.default;
  // Show rupee defaults with Indian digit grouping (50,00,000) — parseNumber accepts commas.
  if (field.type === 'currency' && typeof field.default === 'number')
    return groupINR.format(field.default);
  const d = field.default;
  if (typeof d === 'function') return d();
  if ((field.type === 'date' || field.type === 'datetime') && d === 'today') return todayISO();
  return String(d);
}

export function initialRaw<V extends FormValues>(
  spec: FormToolSpec<V>,
  overrides?: URLSearchParams,
): RawValues {
  const raw: RawValues = {};
  for (const f of spec.fields as Field<FormValues>[]) {
    raw[f.name] = resolveDefault(f);
    const q = overrides?.get(f.name);
    if (q !== null && q !== undefined && q.length <= 5000) {
      if (f.type === 'toggle') raw[f.name] = q === '1' || q === 'true';
      else if (f.type === 'select' || f.type === 'segmented') {
        const opts = typeof f.options === 'function' ? null : f.options;
        if (!opts || opts.some((o) => o.value === q)) raw[f.name] = q;
      } else raw[f.name] = q;
    }
  }
  return raw;
}

export function fieldOptions<V extends FormValues>(field: Field<V>, values: V): Option[] {
  if (field.type !== 'select' && field.type !== 'segmented') return [];
  return typeof field.options === 'function' ? field.options(values) : field.options;
}

/** Loose typed view used for showIf/options before full validation. */
export function looseValues(spec: FormToolSpec<FormValues>, raw: RawValues): FormValues {
  const out: FormValues = {};
  for (const f of spec.fields) {
    const r = raw[f.name];
    if (f.type === 'number' || f.type === 'currency' || f.type === 'percent') {
      out[f.name] = parseNumber(r as string) ?? '';
    } else out[f.name] = r;
  }
  return out;
}

function numberLabelRange(n: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 6 }).format(n);
}

export interface ValidationOutcome<V> {
  values: V | null;
  errors: Record<string, string>;
  formError?: string;
}

export function validateForm<V extends FormValues>(
  spec: FormToolSpec<V>,
  raw: RawValues,
): ValidationOutcome<V> {
  const errors: Record<string, string> = {};
  const loose = looseValues(spec as unknown as FormToolSpec<FormValues>, raw) as V;
  const values: FormValues = {};
  for (const f of spec.fields as Field<FormValues>[]) {
    if (f.showIf && !f.showIf(loose as FormValues)) {
      values[f.name] = loose[f.name] as FieldValue;
      continue;
    }
    const r = raw[f.name];
    switch (f.type) {
      case 'number':
      case 'currency':
      case 'percent': {
        const text = String(r ?? '').trim();
        if (text === '') {
          if (f.optional) {
            values[f.name] = '';
            break;
          }
          errors[f.name] = `Please enter ${f.label.toLowerCase()}.`;
          break;
        }
        const n = parseNumber(text);
        if (n === null) {
          errors[f.name] = `${f.label} must be a number.`;
          break;
        }
        if (f.integer && !Number.isInteger(n)) {
          errors[f.name] = `${f.label} must be a whole number.`;
          break;
        }
        if (f.min !== undefined && (f.exclusiveMin ? n <= f.min : n < f.min)) {
          errors[f.name] = f.exclusiveMin
            ? `${f.label} must be greater than ${numberLabelRange(f.min)}.`
            : `${f.label} must be at least ${numberLabelRange(f.min)}.`;
          break;
        }
        if (f.max !== undefined && n > f.max) {
          errors[f.name] = `${f.label} must be at most ${numberLabelRange(f.max)}.`;
          break;
        }
        values[f.name] = n;
        break;
      }
      case 'select':
      case 'segmented': {
        const opts = fieldOptions(f, loose as FormValues);
        const v = String(r);
        values[f.name] = opts.some((o) => o.value === v) ? v : (opts[0]?.value ?? '');
        break;
      }
      case 'toggle':
        values[f.name] = Boolean(r);
        break;
      default: {
        const text = String(r ?? '');
        if (!f.optional && text.trim() === '') {
          errors[f.name] = `Please enter ${f.label.toLowerCase()}.`;
          break;
        }
        if (f.maxLength && text.length > f.maxLength) {
          errors[f.name] =
            `${f.label} is too long (max ${f.maxLength.toLocaleString('en-IN')} characters).`;
          break;
        }
        values[f.name] = text;
      }
    }
  }
  if (Object.keys(errors).length) return { values: null, errors };
  const cross = spec.validate?.(values as V);
  if (cross) {
    if (cross.field) return { values: null, errors: { [cross.field]: cross.message } };
    return { values: null, errors: {}, formError: cross.message };
  }
  return { values: values as V, errors };
}

export function toErrorMessage(e: unknown): { message: string; field?: string } {
  if (e instanceof InputError) return { message: e.message, field: e.field };
  if (e instanceof RangeError)
    return { message: 'The numbers are too large to calculate. Please use smaller values.' };
  return {
    message: 'Something went wrong with these inputs. Please check the values and try again.',
  };
}

/** Guard against leaking NaN/Infinity/undefined/null into the UI. */
export function hasInvalidOutput(text: string): boolean {
  return /\b(NaN|Infinity|undefined|null)\b/.test(text);
}
