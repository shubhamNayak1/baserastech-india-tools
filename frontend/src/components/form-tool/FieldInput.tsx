import { useId, type KeyboardEvent } from 'react';
import { parseNumber } from '@/utils/number';
import { formatLakhCrore } from '@/utils/format';
import type { Field, FormValues, Option } from './types';

interface Props {
  field: Field<FormValues>;
  value: string | boolean;
  options: Option[];
  error?: string;
  onChange: (value: string | boolean) => void;
  onBlur: () => void;
}

export function Segmented({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const idx = options.findIndex((o) => o.value === value);
    let next = idx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (idx + 1) % options.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (idx - 1 + options.length) % options.length;
    else return;
    e.preventDefault();
    onChange(options[next].value);
    const btn = e.currentTarget.querySelectorAll('[role="radio"]')[next] as HTMLElement | undefined;
    btn?.focus();
  };
  return (
    <div role="radiogroup" aria-labelledby={id} className="segmented" onKeyDown={onKey}>
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className="segmented-btn"
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function FieldInput({ field, value, options, error, onChange, onBlur }: Props) {
  const id = useId();
  const errId = `${id}-err`;
  const helpId = `${id}-help`;
  const describedBy =
    [error ? errId : '', field.help ? helpId : ''].filter(Boolean).join(' ') || undefined;
  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    onBlur,
  } as const;

  let control;
  let hint: string | null = null;
  switch (field.type) {
    case 'number':
    case 'currency':
    case 'percent': {
      const prefix = field.type === 'currency' ? '₹' : null;
      const suffix =
        field.type === 'percent' ? '%' : typeof field.unit === 'string' ? field.unit : null;
      const n = parseNumber(value as string);
      if (field.type === 'currency' && n !== null && Math.abs(n) >= 1000) hint = formatLakhCrore(n);
      control = (
        <div className="relative">
          {prefix && (
            <span
              className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500"
              aria-hidden="true"
            >
              {prefix}
            </span>
          )}
          <input
            {...common}
            type="text"
            inputMode={field.integer && (field.min ?? 0) >= 0 ? 'numeric' : 'decimal'}
            autoComplete="off"
            className={`input tabular-nums ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-16' : ''} ${error ? 'input-error' : ''}`}
            value={value as string}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => {
              // Re-format currency with Indian grouping (50,00,000) once the user leaves the field.
              if (field.type === 'currency' && n !== null && Math.abs(n) < 1e15) {
                const formatted = new Intl.NumberFormat('en-IN', {
                  maximumFractionDigits: 2,
                }).format(n);
                if (formatted !== value) onChange(formatted);
              }
              onBlur();
            }}
          />
          {suffix && (
            <span
              className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-slate-500"
              aria-hidden="true"
            >
              {suffix}
            </span>
          )}
        </div>
      );
      break;
    }
    case 'select':
      control = (
        <select
          {...common}
          className={`input ${error ? 'input-error' : ''}`}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'segmented':
      return (
        <div className={field.full ? 'sm:col-span-2' : ''}>
          <span className="label" id={id}>
            {field.label}
          </span>
          <Segmented
            id={id}
            label={field.label}
            options={options}
            value={value as string}
            onChange={onChange}
          />
          {field.help && <p className="help-text">{field.help}</p>}
        </div>
      );
    case 'toggle':
      return (
        <div className={`flex items-start gap-3 ${field.full ? 'sm:col-span-2' : ''}`}>
          <input
            {...common}
            type="checkbox"
            className="mt-0.5 h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <label htmlFor={id} className="text-sm text-slate-700">
            {field.label}
            {field.help && (
              <span id={helpId} className="block text-xs text-slate-500">
                {field.help}
              </span>
            )}
          </label>
        </div>
      );
    case 'textarea':
      control = (
        <textarea
          {...common}
          className={`textarea ${error ? 'input-error' : ''}`}
          rows={field.rows ?? 6}
          value={value as string}
          placeholder={field.placeholder}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'date':
    case 'time':
    case 'datetime':
    case 'text':
      control = (
        <input
          {...common}
          type={field.type === 'datetime' ? 'datetime-local' : field.type}
          step={field.type === 'datetime' || field.type === 'time' ? 1 : undefined}
          className={`input ${error ? 'input-error' : ''}`}
          value={value as string}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
  }

  return (
    <div className={field.full || field.type === 'textarea' ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="label">
        {field.label}
        {'optional' in field && field.optional && (
          <span className="font-normal text-slate-400"> (optional)</span>
        )}
      </label>
      {control}
      {hint && !error && <p className="help-text">{hint}</p>}
      {field.help && (
        <p id={helpId} className="help-text">
          {field.help}
        </p>
      )}
      {error && (
        <p id={errId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
