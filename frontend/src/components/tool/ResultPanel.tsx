import type { ReactNode } from 'react';
import type { ToolResult } from '@/components/form-tool/types';
import { Chart } from '@/components/charts/Charts';
import { DataTable } from './DataTable';
import { ShareBar } from './ShareBar';

export function ResultGrid({ items }: { items: ToolResult['results'] }) {
  const primary = items.filter((i) => i.primary);
  const rest = items.filter((i) => !i.primary);
  return (
    <div className="space-y-4">
      {primary.map((p) => (
        <div key={p.label} className="rounded-lg bg-brand-50 p-4">
          <div className="text-sm font-medium text-brand-900">{p.label}</div>
          <div className="mt-1 break-words text-3xl font-semibold tabular-nums text-brand-950">
            {p.value}
          </div>
          {p.hint && <div className="mt-1 text-sm text-brand-900/80">{p.hint}</div>}
        </div>
      ))}
      {rest.length > 0 && (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rest.map((r) => (
            <div key={r.label} className="rounded-lg border border-slate-200 p-3">
              <dt className="text-sm text-slate-600">{r.label}</dt>
              <dd className="mt-0.5 break-words text-lg font-semibold tabular-nums text-slate-900">
                {r.value}
              </dd>
              {r.hint && <dd className="text-xs text-slate-500">{r.hint}</dd>}
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function resultLines(result: ToolResult): string[] {
  return result.results.map((r) => `${r.label}: ${r.value}`);
}

interface Props {
  result: ToolResult;
  extra?: ReactNode;
}

export function ResultPanel({ result, extra }: Props) {
  return (
    <section aria-labelledby="result-heading" className="card p-4 sm:p-6" id="tool-result">
      <h2 id="result-heading" className="mb-4 text-lg">
        Result
      </h2>
      <div aria-live="polite">
        <ResultGrid items={result.results} />
      </div>
      {result.notes && result.notes.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-slate-600">
          {result.notes.map((n) => (
            <li key={n}>• {n}</li>
          ))}
        </ul>
      )}
      <div className="mt-5">
        <ShareBar lines={resultLines(result)} />
      </div>
      {extra}
      {result.chart && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h3 className="mb-3 text-base">Visual breakdown</h3>
          <Chart spec={result.chart} />
        </div>
      )}
      {result.table && (
        <div className="mt-6 border-t border-slate-100 pt-5">
          <DataTable spec={result.table} />
        </div>
      )}
    </section>
  );
}
