import { useEffect, useId, useState, type ReactNode } from 'react';
import { ResultGrid } from '@/components/tool/ResultPanel';
import type { RegexOutput } from './lib/regex';
import { runRegexSafely } from './lib/regexRunner';

const FLAG_INFO: [string, string][] = [
  ['g', 'global'],
  ['i', 'ignore case'],
  ['m', 'multiline'],
  ['s', 'dot matches newline'],
  ['u', 'unicode'],
  ['y', 'sticky'],
];

function highlight(text: string, out: RegexOutput): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  out.matches.forEach((m, i) => {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <mark
        key={i}
        className={`rounded px-0.5 ${i % 2 ? 'bg-amber-200' : 'bg-sky-200'} text-slate-900`}
      >
        {m.match || '∅'}
      </mark>,
    );
    last = m.index + m.match.length;
  });
  nodes.push(text.slice(last));
  return nodes;
}

export default function RegexTester() {
  const ids = { p: useId(), t: useId(), r: useId() };
  const [pattern, setPattern] = useState('(?<name>[A-Z][a-z]+)\\s+(?<phone>[6-9]\\d{9})');
  const [flags, setFlags] = useState('g');
  const [text, setText] = useState(
    'Contacts:\nAsha 9876543210\nRavi 8123456789\ninvalid 1234567890\nMeera 7012345678',
  );
  const [replacement, setReplacement] = useState('$<name>: +91-$<phone>');
  const [useReplace, setUseReplace] = useState(true);
  const [out, setOut] = useState<RegexOutput | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      if (!pattern) {
        setOut(null);
        setError('');
        return;
      }
      runRegexSafely(pattern, flags, text, useReplace ? replacement : undefined)
        .then((r) => !cancelled && (setOut(r), setError('')))
        .catch((e: Error) => !cancelled && (setOut(null), setError(e.message)));
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [pattern, flags, text, replacement, useReplace]);

  const toggleFlag = (f: string) =>
    setFlags((cur) => (cur.includes(f) ? cur.replace(f, '') : cur + f));

  return (
    <div className="space-y-4">
      <div className="card space-y-4 p-4">
        <div>
          <label htmlFor={ids.p} className="label">
            Regular expression
          </label>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">/</span>
            <input
              id={ids.p}
              className="input font-mono"
              value={pattern}
              spellCheck={false}
              autoComplete="off"
              onChange={(e) => setPattern(e.target.value)}
              aria-invalid={Boolean(error)}
            />
            <span className="text-slate-400">/{flags}</span>
          </div>
        </div>
        <fieldset className="flex flex-wrap gap-3">
          <legend className="label">Flags</legend>
          {FLAG_INFO.map(([f, label]) => (
            <label key={f} className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="checkbox"
                className="h-4 w-4"
                checked={flags.includes(f)}
                onChange={() => toggleFlag(f)}
              />
              <code className="font-mono">{f}</code> {label}
            </label>
          ))}
        </fieldset>
        <div>
          <label htmlFor={ids.t} className="label">
            Test string
          </label>
          <textarea
            id={ids.t}
            className="textarea"
            rows={6}
            value={text}
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={useReplace}
              onChange={(e) => setUseReplace(e.target.checked)}
            />{' '}
            Test a replacement
          </label>
          {useReplace && (
            <input
              id={ids.r}
              aria-label="Replacement"
              className="input mt-2 font-mono"
              value={replacement}
              spellCheck={false}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="$1, $<name>, $&"
            />
          )}
        </div>
      </div>

      <div aria-live="polite">
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
      </div>

      {out && (
        <section className="card space-y-4 p-4 sm:p-6" aria-labelledby="result-heading">
          <h2 id="result-heading" className="text-lg">
            Result
          </h2>
          <ResultGrid
            items={[
              {
                label: 'Matches',
                value: `${out.matches.length}${out.truncated ? '+' : ''}`,
                primary: true,
                hint: out.truncated ? 'Showing the first 1,000' : undefined,
              },
            ]}
          />
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-700">Highlighted matches</h3>
            <pre className="whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm">
              {highlight(text, out)}
            </pre>
          </div>
          {out.matches.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Index</th>
                    <th className="px-3 py-2">Match</th>
                    <th className="px-3 py-2">Groups</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {out.matches.slice(0, 200).map((m, i) => (
                    <tr key={i}>
                      <td className="px-3 py-1.5">{i + 1}</td>
                      <td className="px-3 py-1.5">{m.index}</td>
                      <td className="px-3 py-1.5">{m.match}</td>
                      <td className="px-3 py-1.5">
                        {Object.keys(m.named).length
                          ? Object.entries(m.named)
                              .map(([k, v]) => `${k}=${v ?? ''}`)
                              .join(', ')
                          : m.groups.map((g, gi) => `$${gi + 1}=${g ?? ''}`).join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {out.replaced !== undefined && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-700">After replacement</h3>
              <pre className="code-output whitespace-pre-wrap">{out.replaced}</pre>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
