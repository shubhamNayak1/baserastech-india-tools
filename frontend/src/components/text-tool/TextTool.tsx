import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { Check, Copy, Download, Eraser, RefreshCw, Wand2 } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { Segmented } from '@/components/form-tool/FieldInput';
import type { ResultItem } from '@/components/form-tool/types';
import { ResultGrid } from '@/components/tool/ResultPanel';
import { ShareBar } from '@/components/tool/ShareBar';
import { copyText } from '@/components/tool/share';
import { useToolMeta } from '@/components/tool/ToolContext';

export type OptionValue = string | number | boolean;
export type Options = Record<string, OptionValue>;

export type TextOption =
  | {
      name: string;
      label: string;
      type: 'select';
      default: string;
      options: { value: string; label: string }[];
      showIf?: (o: Options) => boolean;
      help?: string;
    }
  | {
      name: string;
      label: string;
      type: 'segmented';
      default: string;
      options: { value: string; label: string }[];
      showIf?: (o: Options) => boolean;
      help?: string;
    }
  | {
      name: string;
      label: string;
      type: 'toggle';
      default: boolean;
      showIf?: (o: Options) => boolean;
      help?: string;
    }
  | {
      name: string;
      label: string;
      type: 'number';
      default: number;
      min: number;
      max: number;
      showIf?: (o: Options) => boolean;
      help?: string;
    }
  | {
      name: string;
      label: string;
      type: 'text' | 'password' | 'textarea';
      default: string;
      placeholder?: string;
      showIf?: (o: Options) => boolean;
      help?: string;
      maxLength?: number;
    };

export interface TransformResult {
  output?: string;
  /** Pre-escaped HTML for syntax-highlighted output (must be sanitised by the transform). */
  html?: string;
  info?: ResultItem[];
  error?: string;
  extra?: ReactNode;
}

export interface TextToolSpec {
  /** Omit for pure generators (UUID, password, lorem ipsum). */
  input?: {
    label: string;
    placeholder?: string;
    sample: string;
    rows?: number;
    maxLength?: number;
  };
  outputLabel?: string;
  options?: TextOption[];
  transform: (input: string, o: Options) => TransformResult | Promise<TransformResult>;
  /** Re-run automatically as the user types (default true for transforms, false for generators). */
  live?: boolean;
  actionLabel?: string;
  /** Show output as a large monospace block (default true). */
  mono?: boolean;
  downloadName?: string;
  /** Layout: output below (stacked) or beside input on large screens. */
  layout?: 'split' | 'stacked';
}

const MAX_INPUT = 2_000_000;

function OptionControl({
  opt,
  value,
  onChange,
}: {
  opt: TextOption;
  value: OptionValue;
  onChange: (v: OptionValue) => void;
}) {
  const id = useId();
  if (opt.type === 'toggle') {
    return (
      <label htmlFor={id} className="flex min-h-[44px] items-center gap-2 text-sm text-slate-700">
        <input
          id={id}
          type="checkbox"
          className="h-5 w-5 rounded border-slate-300 text-brand-600"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
        />
        {opt.label}
      </label>
    );
  }
  if (opt.type === 'segmented') {
    return (
      <div className="min-w-[12rem]">
        <span id={id} className="label">
          {opt.label}
        </span>
        <Segmented
          id={id}
          label={opt.label}
          options={opt.options}
          value={String(value)}
          onChange={onChange}
        />
      </div>
    );
  }
  return (
    <div className={opt.type === 'textarea' ? 'w-full' : 'min-w-[10rem]'}>
      <label htmlFor={id} className="label">
        {opt.label}
      </label>
      {opt.type === 'select' ? (
        <select
          id={id}
          className="input"
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
        >
          {opt.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : opt.type === 'number' ? (
        <input
          id={id}
          type="number"
          className="input w-28"
          min={opt.min}
          max={opt.max}
          value={Number(value)}
          onChange={(e) =>
            onChange(Math.min(opt.max, Math.max(opt.min, Number(e.target.value) || opt.min)))
          }
        />
      ) : opt.type === 'textarea' ? (
        <textarea
          id={id}
          className="textarea min-h-[100px]"
          value={String(value)}
          placeholder={opt.placeholder}
          maxLength={opt.maxLength}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type={opt.type === 'password' ? 'password' : 'text'}
          autoComplete="off"
          spellCheck={false}
          className="input font-mono"
          value={String(value)}
          placeholder={opt.placeholder}
          maxLength={opt.maxLength ?? 2000}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {opt.help && <p className="help-text">{opt.help}</p>}
    </div>
  );
}

export function TextTool({ spec }: { spec: TextToolSpec }) {
  const meta = useToolMeta();
  const inputId = useId();
  const outputId = useId();
  const initialOptions = useMemo(
    () => Object.fromEntries((spec.options ?? []).map((o) => [o.name, o.default])) as Options,
    [spec.options],
  );
  const [input, setInput] = useState(spec.input?.sample ?? '');
  const [opts, setOpts] = useState<Options>(initialOptions);
  const [result, setResult] = useState<TransformResult>({});
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [nonce, setNonce] = useState(0);
  const live = spec.live ?? Boolean(spec.input);
  const usedRef = useRef(false);
  const runId = useRef(0);

  const run = useMemo(
    () => async (text: string, o: Options) => {
      const id = ++runId.current;
      if (text.length > MAX_INPUT) {
        setResult({
          error: `Input is too large (max ${(MAX_INPUT / 1e6).toFixed(0)} million characters).`,
        });
        return;
      }
      setBusy(true);
      try {
        const r = await spec.transform(text, o);
        if (id === runId.current) setResult(r);
      } catch (e) {
        if (id === runId.current)
          setResult({
            error:
              e instanceof Error ? e.message : 'Something went wrong while processing the input.',
          });
      } finally {
        if (id === runId.current) setBusy(false);
      }
    },
    [spec],
  );

  useEffect(() => {
    if (!live && nonce === 0 && spec.input) return;
    const delay = input.length > 50_000 ? 400 : 120;
    const t = window.setTimeout(() => void run(input, opts), live ? delay : 0);
    return () => window.clearTimeout(t);
  }, [input, opts, nonce, live, run, spec.input]);

  const markUsed = () => {
    if (usedRef.current) return;
    usedRef.current = true;
    analytics.track('tool_used', { tool: meta?.slug, category: meta?.category });
  };

  const onAction = () => {
    markUsed();
    setNonce((n) => n + 1);
    analytics.track('calculation_completed', { tool: meta?.slug, category: meta?.category });
  };

  const onCopy = async () => {
    if (!result.output) return;
    const ok = await copyText(result.output);
    if (ok) {
      setCopied(true);
      analytics.track('result_copied', { tool: meta?.slug });
      window.setTimeout(() => setCopied(false), 1500);
    }
  };

  const onDownload = () => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = spec.downloadName ?? `${meta?.slug ?? 'output'}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const visibleOptions = (spec.options ?? []).filter((o) => !o.showIf || o.showIf(opts));
  const hasOutput = result.output !== undefined || result.html !== undefined;
  const split = (spec.layout ?? 'split') === 'split' && Boolean(spec.input) && hasOutput;
  const mono = spec.mono ?? true;

  return (
    <div className="space-y-4">
      {visibleOptions.length > 0 && (
        <div className="card flex flex-wrap items-end gap-4 p-4">
          {visibleOptions.map((o) => (
            <OptionControl
              key={o.name}
              opt={o}
              value={opts[o.name]}
              onChange={(v) => {
                markUsed();
                setOpts((p) => ({ ...p, [o.name]: v }));
              }}
            />
          ))}
        </div>
      )}

      <div className={split ? 'grid gap-4 lg:grid-cols-2' : 'space-y-4'}>
        {spec.input && (
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                {spec.input.label}
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    setInput(spec.input!.sample);
                    markUsed();
                  }}
                >
                  Sample
                </button>
                <button type="button" className="btn-ghost btn-sm" onClick={() => setInput('')}>
                  <Eraser className="h-4 w-4" aria-hidden="true" /> Clear
                </button>
              </div>
            </div>
            <textarea
              id={inputId}
              className={`textarea ${mono ? 'font-mono' : 'font-sans'} min-h-[240px]`}
              rows={spec.input.rows ?? 12}
              value={input}
              spellCheck={false}
              maxLength={spec.input.maxLength ?? MAX_INPUT}
              placeholder={spec.input.placeholder}
              onChange={(e) => {
                setInput(e.target.value);
                markUsed();
              }}
            />
            <p className="help-text">{input.length.toLocaleString('en-IN')} characters</p>
          </div>
        )}

        {hasOutput && (
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span id={outputId} className="text-sm font-medium text-slate-700">
                {spec.outputLabel ?? 'Output'}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={onCopy}
                  disabled={!result.output}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}{' '}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={onDownload}
                  disabled={!result.output}
                  aria-label="Download output"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            {result.html !== undefined ? (
              <pre
                aria-labelledby={outputId}
                className="code-output min-h-[240px]"
                dangerouslySetInnerHTML={{ __html: result.html }}
              />
            ) : (
              <textarea
                aria-labelledby={outputId}
                readOnly
                className={`textarea ${mono ? 'font-mono' : 'font-sans'} min-h-[240px] bg-slate-50`}
                rows={12}
                value={result.output ?? ''}
              />
            )}
          </div>
        )}
      </div>

      {(!spec.input || !live) && (
        <div className="flex gap-3">
          <button type="button" className="btn-primary" onClick={onAction} disabled={busy}>
            {spec.input ? (
              <Wand2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            {spec.actionLabel ?? (spec.input ? 'Run' : 'Generate')}
          </button>
        </div>
      )}

      <div aria-live="polite">
        {result.error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {result.error}
          </p>
        )}
      </div>

      {(result.info?.length || result.extra) && !result.error ? (
        <section className="card p-4 sm:p-6" aria-labelledby="result-heading">
          <h2 id="result-heading" className="mb-4 text-lg">
            Result
          </h2>
          {result.info && <ResultGrid items={result.info} />}
          {result.extra}
          {result.info && result.info.length > 0 && !hasOutput && (
            <div className="mt-5">
              <ShareBar lines={result.info.map((i) => `${i.label}: ${i.value}`)} compact />
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

export function createTextTool(spec: TextToolSpec) {
  function TextToolComponent() {
    return <TextTool spec={spec} />;
  }
  return TextToolComponent;
}
