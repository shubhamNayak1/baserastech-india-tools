import { useMemo, useRef, useState } from 'react';
import { Delete } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { ShareBar } from '@/components/tool/ShareBar';
import { useToolMeta } from '@/components/tool/ToolContext';
import { Segmented } from '@/components/form-tool/FieldInput';
import { formatSmart } from '@/utils/format';
import { evaluate, ExpressionError, type AngleMode } from './expression';

type Key = {
  label: string;
  insert?: string;
  action?: 'clear' | 'back' | 'equals' | 'ans';
  aria?: string;
  tone?: 'fn' | 'op' | 'eq' | 'num';
};

const KEYS: Key[] = [
  { label: 'sin', insert: 'sin(', tone: 'fn' },
  { label: 'cos', insert: 'cos(', tone: 'fn' },
  { label: 'tan', insert: 'tan(', tone: 'fn' },
  { label: '(', insert: '(', tone: 'fn' },
  { label: ')', insert: ')', tone: 'fn' },
  { label: 'asin', insert: 'asin(', tone: 'fn', aria: 'arc sine' },
  { label: 'acos', insert: 'acos(', tone: 'fn', aria: 'arc cosine' },
  { label: 'atan', insert: 'atan(', tone: 'fn', aria: 'arc tangent' },
  { label: 'ln', insert: 'ln(', tone: 'fn', aria: 'natural log' },
  { label: 'log', insert: 'log(', tone: 'fn', aria: 'log base 10' },
  { label: 'x²', insert: '^2', tone: 'fn', aria: 'square' },
  { label: 'xʸ', insert: '^', tone: 'fn', aria: 'power' },
  { label: '√', insert: 'sqrt(', tone: 'fn', aria: 'square root' },
  { label: 'π', insert: 'pi', tone: 'fn', aria: 'pi' },
  { label: 'e', insert: 'e', tone: 'fn', aria: 'Euler number' },
  { label: 'AC', action: 'clear', tone: 'op', aria: 'clear all' },
  { label: '⌫', action: 'back', tone: 'op', aria: 'backspace' },
  { label: '%', insert: '%', tone: 'op', aria: 'percent' },
  { label: 'n!', insert: '!', tone: 'op', aria: 'factorial' },
  { label: '÷', insert: '÷', tone: 'op', aria: 'divide' },
  { label: '7', insert: '7' },
  { label: '8', insert: '8' },
  { label: '9', insert: '9' },
  { label: 'Ans', action: 'ans', tone: 'op', aria: 'previous answer' },
  { label: '×', insert: '×', tone: 'op', aria: 'multiply' },
  { label: '4', insert: '4' },
  { label: '5', insert: '5' },
  { label: '6', insert: '6' },
  { label: 'EXP', insert: '×10^', tone: 'op', aria: 'times ten to the power' },
  { label: '−', insert: '-', tone: 'op', aria: 'minus' },
  { label: '1', insert: '1' },
  { label: '2', insert: '2' },
  { label: '3', insert: '3' },
  { label: '0', insert: '0' },
  { label: '+', insert: '+', tone: 'op', aria: 'plus' },
  { label: '.', insert: '.', aria: 'decimal point' },
  { label: '=', action: 'equals', tone: 'eq', aria: 'equals' },
];

export default function ScientificCalculator() {
  const meta = useToolMeta();
  const [expr, setExpr] = useState('');
  const [mode, setMode] = useState<AngleMode>('deg');
  const [ans, setAns] = useState<number | null>(null);
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = useMemo(() => {
    if (!expr.trim()) return '';
    try {
      return formatSmart(
        evaluate(expr.replace(/ans/gi, ans !== null ? `(${ans})` : '0'), mode),
        12,
      );
    } catch {
      return '';
    }
  }, [expr, mode, ans]);

  const insert = (text: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? expr.length;
    const end = el?.selectionEnd ?? expr.length;
    const next = expr.slice(0, start) + text + expr.slice(end);
    setExpr(next);
    setError('');
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + text.length, start + text.length);
    });
  };

  const equals = () => {
    if (!expr.trim()) return;
    try {
      const value = evaluate(expr.replace(/ans/gi, ans !== null ? `(${ans})` : '0'), mode);
      const shown = formatSmart(value, 12);
      setHistory((h) => [{ expr, result: shown }, ...h].slice(0, 10));
      setAns(value);
      setExpr(String(value));
      setError('');
      analytics.track('calculation_completed', { tool: meta?.slug });
    } catch (e) {
      setError(
        e instanceof ExpressionError ? e.message : 'That expression could not be calculated.',
      );
    }
  };

  const press = (k: Key) => {
    if (k.action === 'clear') {
      setExpr('');
      setError('');
    } else if (k.action === 'back') setExpr((x) => x.slice(0, -1));
    else if (k.action === 'equals') equals();
    else if (k.action === 'ans') insert('Ans');
    else if (k.insert) insert(k.insert);
  };

  const tone = (t?: Key['tone']) =>
    t === 'eq'
      ? 'bg-brand-600 text-white hover:bg-brand-700'
      : t === 'op'
        ? 'bg-slate-200 text-slate-900 hover:bg-slate-300'
        : t === 'fn'
          ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 text-sm'
          : 'bg-white text-slate-900 hover:bg-slate-50 border border-slate-200';

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="card p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="w-44">
            <span id="angle-mode" className="sr-only">
              Angle mode
            </span>
            <Segmented
              id="angle-mode"
              label="Angle mode"
              value={mode}
              onChange={(v) => setMode(v as AngleMode)}
              options={[
                { value: 'deg', label: 'DEG' },
                { value: 'rad', label: 'RAD' },
              ]}
            />
          </div>
          <span className="text-xs text-slate-500">Type or tap · Enter to calculate</span>
        </div>
        <div className="rounded-xl bg-slate-900 p-4 text-right text-white">
          <label htmlFor="sci-input" className="sr-only">
            Expression
          </label>
          <input
            id="sci-input"
            ref={inputRef}
            value={expr}
            onChange={(e) => {
              setExpr(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                equals();
              } else if (e.key === 'Escape') setExpr('');
            }}
            placeholder="0"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent text-right font-mono text-2xl text-white placeholder:text-slate-500 focus:outline-none"
          />
          <div className="mt-1 min-h-[1.5rem] font-mono text-lg text-slate-300" aria-live="polite">
            {error ? (
              <span className="text-red-300" role="alert">
                {error}
              </span>
            ) : preview && preview !== expr ? (
              `= ${preview}`
            ) : (
              ''
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {KEYS.map((k) => (
            <button
              key={k.label}
              type="button"
              aria-label={k.aria ?? k.label}
              onClick={() => press(k)}
              className={`flex min-h-[48px] items-center justify-center rounded-lg font-medium transition-colors ${tone(k.tone)} ${k.action === 'equals' ? 'col-span-4' : ''}`}
            >
              {k.action === 'back' ? <Delete className="h-5 w-5" aria-hidden="true" /> : k.label}
            </button>
          ))}
        </div>
      </div>
      <section className="card p-4 sm:p-6" aria-labelledby="history-heading">
        <h2 id="history-heading" className="mb-3 text-lg">
          History
        </h2>
        {history.length ? (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="w-full rounded-lg border border-slate-200 p-2 text-right hover:bg-slate-50"
                  onClick={() => setExpr(h.expr)}
                >
                  <span className="block truncate font-mono text-sm text-slate-500">{h.expr}</span>
                  <span className="block font-mono text-lg text-slate-900">= {h.result}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">
            Your calculations will appear here. Tap one to reuse it.
          </p>
        )}
        {history[0] && (
          <div className="mt-4">
            <ShareBar lines={[`${history[0].expr} = ${history[0].result}`]} compact />
          </div>
        )}
      </section>
    </div>
  );
}
