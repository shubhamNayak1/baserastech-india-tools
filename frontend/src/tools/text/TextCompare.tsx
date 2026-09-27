import { useMemo, useState } from 'react';
import { ResultGrid } from '@/components/tool/ResultPanel';
import { diffLines } from './engine';

export default function TextCompare() {
  const [a, setA] = useState(
    'GST rate: 18%\nInvoice date: 01-09-2026\nAmount: ₹10,000\nStatus: Pending',
  );
  const [b, setB] = useState(
    'GST rate: 18%\nInvoice date: 05-09-2026\nAmount: ₹10,000\nStatus: Paid\nPaid via UPI',
  );
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreWs, setIgnoreWs] = useState(true);

  const result = useMemo(() => {
    try {
      return { ops: diffLines(a, b, { ignoreCase, ignoreWhitespace: ignoreWs }), error: '' };
    } catch (e) {
      return { ops: [], error: (e as Error).message };
    }
  }, [a, b, ignoreCase, ignoreWs]);

  const added = result.ops.filter((o) => o.type === 'add').length;
  const removed = result.ops.filter((o) => o.type === 'del').length;
  const same = result.ops.filter((o) => o.type === 'same').length;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap gap-4 p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={ignoreCase}
            onChange={(e) => setIgnoreCase(e.target.checked)}
          />{' '}
          Ignore case
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={ignoreWs}
            onChange={(e) => setIgnoreWs(e.target.checked)}
          />{' '}
          Ignore extra whitespace
        </label>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <label htmlFor="cmp-a" className="mb-2 block text-sm font-medium text-slate-700">
            Original text
          </label>
          <textarea
            id="cmp-a"
            className="textarea"
            rows={10}
            value={a}
            onChange={(e) => setA(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="card p-4">
          <label htmlFor="cmp-b" className="mb-2 block text-sm font-medium text-slate-700">
            Changed text
          </label>
          <textarea
            id="cmp-b"
            className="textarea"
            rows={10}
            value={b}
            onChange={(e) => setB(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
      {result.error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {result.error}
        </p>
      ) : (
        <section className="card p-4 sm:p-6" aria-labelledby="result-heading">
          <h2 id="result-heading" className="mb-4 text-lg">
            Differences
          </h2>
          <ResultGrid
            items={[
              {
                label: 'Result',
                value:
                  added || removed ? `${added + removed} line(s) differ` : 'Texts are identical',
                primary: true,
              },
              { label: 'Lines added', value: String(added) },
              { label: 'Lines removed', value: String(removed) },
              { label: 'Unchanged lines', value: String(same) },
            ]}
          />
          <div
            className="mt-4 overflow-x-auto rounded-lg border border-slate-200 font-mono text-sm"
            role="table"
            aria-label="Line differences"
          >
            {result.ops.map((op, i) => (
              <div
                key={i}
                role="row"
                className={`flex gap-3 px-3 py-0.5 ${op.type === 'add' ? 'bg-green-50 text-green-900' : op.type === 'del' ? 'bg-red-50 text-red-900 line-through decoration-red-300' : 'text-slate-700'}`}
              >
                <span
                  role="cell"
                  className="w-4 shrink-0 select-none text-slate-400"
                  aria-label={
                    op.type === 'add' ? 'added' : op.type === 'del' ? 'removed' : 'unchanged'
                  }
                >
                  {op.type === 'add' ? '+' : op.type === 'del' ? '−' : ' '}
                </span>
                <span role="cell" className="whitespace-pre-wrap break-all">
                  {op.text || ' '}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
