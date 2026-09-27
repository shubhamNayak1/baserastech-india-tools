import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { ResultGrid } from '@/components/tool/ResultPanel';
import { ShareBar } from '@/components/tool/ShareBar';
import { useToolMeta } from '@/components/tool/ToolContext';
import { formatSmart } from '@/utils/format';
import { parseNumber } from '@/utils/number';
import { convert, findUnit, type Quantity, type Unit } from './units';

function groupUnits(units: Unit[]) {
  const groups = new Map<string, Unit[]>();
  units.forEach((u) => {
    const g = u.group ?? '';
    groups.set(g, [...(groups.get(g) ?? []), u]);
  });
  return [...groups.entries()];
}

function UnitSelect({
  id,
  label,
  q,
  value,
  onChange,
}: {
  id: string;
  label: string;
  q: Quantity;
  value: string;
  onChange: (v: string) => void;
}) {
  const groups = groupUnits(q.units);
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {groups.map(([g, units]) =>
          g ? (
            <optgroup key={g} label={g}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label} ({u.symbol})
                </option>
              ))}
            </optgroup>
          ) : (
            units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label} ({u.symbol})
              </option>
            ))
          ),
        )}
      </select>
    </div>
  );
}

export function Converter({ q }: { q: Quantity }) {
  const meta = useToolMeta();
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const valid = (id: string | null, d: string) => (id && q.units.some((u) => u.id === id) ? id : d);
  const [raw, setRaw] = useState(params.get('v') ?? String(q.defaultValue));
  const [from, setFrom] = useState(valid(params.get('from'), q.defaultFrom));
  const [to, setTo] = useState(valid(params.get('to'), q.defaultTo));
  const [used, setUsed] = useState(false);

  const value = parseNumber(raw);
  let error = '';
  if (raw.trim() === '') error = 'Please enter a value to convert.';
  else if (value === null) error = 'Please enter a valid number.';
  else if (!q.allowNegative && value < 0) error = 'Value cannot be negative for this unit.';
  else if (q.id === 'fuel' && value === 0) error = 'Fuel economy must be greater than zero.';
  else if (q.id === 'temperature' && value !== null && convert(q, value, from, 'k') < -1e-9)
    error = 'That is below absolute zero (−273.15 °C).';

  const result = !error && value !== null ? convert(q, value, from, to) : null;
  const fromU = findUnit(q, from);
  const toU = findUnit(q, to);

  useEffect(() => {
    if (error) return;
    const t = window.setTimeout(() => {
      const p = new URLSearchParams({ v: raw, from, to });
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}?${p.toString()}`,
      );
    }, 400);
    return () => window.clearTimeout(t);
  }, [raw, from, to, error]);

  const table = useMemo(() => {
    if (value === null || error) return [];
    return q.units
      .filter((u) => u.id !== from)
      .map((u) => ({ u, v: convert(q, value, from, u.id) }));
  }, [q, value, from, error]);

  const markUsed = () => {
    if (!used) {
      setUsed(true);
      analytics.track('tool_used', { tool: meta?.slug, category: meta?.category });
    }
  };

  const unitFactor = !fromU.toBase && !toU.toBase ? convert(q, 1, from, to) : null;
  const items =
    result !== null
      ? [
          {
            label: `${formatSmart(value as number)} ${fromU.symbol} =`,
            value: `${formatSmart(result)} ${toU.symbol}`,
            primary: true,
            hint:
              unitFactor !== null
                ? `1 ${fromU.symbol} = ${formatSmart(unitFactor)} ${toU.symbol}`
                : undefined,
          },
        ]
      : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-4 sm:p-6">
          <div>
            <label htmlFor="conv-value" className="label">
              Value
            </label>
            <input
              id="conv-value"
              className={`input text-lg tabular-nums ${error ? 'input-error' : ''}`}
              inputMode="decimal"
              value={raw}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'conv-err' : undefined}
              onChange={(e) => {
                setRaw(e.target.value);
                markUsed();
              }}
            />
            {error && (
              <p id="conv-err" className="field-error" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <UnitSelect
              id="conv-from"
              label="From"
              q={q}
              value={from}
              onChange={(v) => {
                setFrom(v);
                markUsed();
              }}
            />
            <button
              type="button"
              className="btn-secondary mb-0.5 h-11 w-11 p-0"
              aria-label="Swap units"
              onClick={() => {
                setFrom(to);
                setTo(from);
                markUsed();
              }}
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <UnitSelect
              id="conv-to"
              label="To"
              q={q}
              value={to}
              onChange={(v) => {
                setTo(v);
                markUsed();
              }}
            />
          </div>
          {q.note && <p className="mt-4 text-xs text-slate-500">{q.note}</p>}
        </div>
        <section className="card p-4 sm:p-6" aria-labelledby="result-heading">
          <h2 id="result-heading" className="mb-4 text-lg">
            Result
          </h2>
          <div aria-live="polite">
            {items.length ? (
              <ResultGrid items={items} />
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                Enter a valid value to see the conversion.
              </p>
            )}
          </div>
          {items.length > 0 && (
            <div className="mt-5">
              <ShareBar lines={[`${items[0].label} ${items[0].value}`]} />
            </div>
          )}
        </section>
      </div>
      {table.length > 0 && (
        <section className="card p-4 sm:p-6" aria-labelledby="all-units">
          <h2 id="all-units" className="mb-3 text-lg">
            {formatSmart(value as number)} {fromU.symbol} in all units
          </h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <tbody className="divide-y divide-slate-100">
                {table.map(({ u, v }) => (
                  <tr key={u.id} className={u.id === to ? 'bg-brand-50' : ''}>
                    <th scope="row" className="px-3 py-2 text-left font-normal text-slate-700">
                      {u.label}
                    </th>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatSmart(v)} {u.symbol}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
