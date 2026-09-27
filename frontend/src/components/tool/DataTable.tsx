import { useState } from 'react';
import type { TableSpec } from '@/components/form-tool/types';

export function DataTable({ spec }: { spec: TableSpec }) {
  const limit = spec.initialRows ?? 12;
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? spec.rows : spec.rows.slice(0, limit);
  return (
    <div>
      {spec.title && <h3 className="mb-2 text-base">{spec.title}</h3>}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {spec.columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={`whitespace-nowrap px-3 py-2 font-medium text-slate-700 ${i ? 'text-right' : 'text-left'}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`whitespace-nowrap px-3 py-2 tabular-nums ${ci ? 'text-right' : 'text-left text-slate-700'}`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {spec.rows.length > limit && (
        <button
          type="button"
          className="btn-ghost btn-sm mt-2"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
        >
          {expanded ? 'Show fewer rows' : `Show all ${spec.rows.length} rows`}
        </button>
      )}
    </div>
  );
}
