import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Calculator, RotateCcw } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { useToolMeta } from '@/components/tool/ToolContext';
import { ResultGrid, resultLines } from '@/components/tool/ResultPanel';
import { ShareBar } from '@/components/tool/ShareBar';
import { DataTable } from '@/components/tool/DataTable';
import { Chart } from '@/components/charts/Charts';
import { parseNumber } from '@/utils/number';
import { FieldInput } from './FieldInput';
import type { Field, FormToolSpec, FormValues, ToolResult } from './types';
import {
  fieldOptions,
  hasInvalidOutput,
  initialRaw,
  looseValues,
  resolveDefault,
  toErrorMessage,
  validateForm,
  type RawValues,
} from './validation';

type Outcome = { result: ToolResult } | { error: string; field?: string } | null;

function runCompute<V extends FormValues>(
  spec: FormToolSpec<V>,
  raw: RawValues,
): { outcome: Outcome; errors: Record<string, string> } {
  const v = validateForm(spec, raw);
  if (!v.values) {
    return { outcome: v.formError ? { error: v.formError } : null, errors: v.errors };
  }
  try {
    const result = spec.compute(v.values);
    const text = result.results.map((r) => r.value).join(' ');
    if (hasInvalidOutput(text) || result.results.length === 0) {
      return {
        outcome: {
          error:
            'These inputs produce a result that cannot be calculated. Please adjust the values.',
        },
        errors: {},
      };
    }
    return { outcome: { result }, errors: {} };
  } catch (e) {
    const err = toErrorMessage(e);
    return {
      outcome: { error: err.message, field: err.field },
      errors: err.field ? { [err.field]: err.message } : {},
    };
  }
}

export function FormTool<V extends FormValues>({ spec }: { spec: FormToolSpec<V> }) {
  const meta = useToolMeta();
  const instant = spec.instant ?? true;
  const urlState = spec.urlState ?? true;
  const fields = spec.fields as Field<FormValues>[];

  const [raw, setRaw] = useState<RawValues>(() =>
    initialRaw(
      spec,
      urlState && typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : undefined,
    ),
  );
  const [committed, setCommitted] = useState<RawValues>(raw);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const usedRef = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const source = instant ? raw : committed;
  const { outcome, errors } = useMemo(() => runCompute(spec, source), [spec, source]);
  const liveErrors = useMemo(
    () => (instant ? errors : runCompute(spec, raw).errors),
    [instant, errors, spec, raw],
  );
  const loose = useMemo(
    () => looseValues(spec as unknown as FormToolSpec<FormValues>, raw),
    [spec, raw],
  );

  // Keep the URL shareable: encode only values that differ from defaults.
  useEffect(() => {
    if (!urlState || !outcome || !('result' in outcome)) return;
    const t = window.setTimeout(() => {
      const params = new URLSearchParams();
      for (const f of fields) {
        const d = resolveDefault(f);
        const v = source[f.name];
        const numeric = f.type === 'number' || f.type === 'currency' || f.type === 'percent';
        const same = numeric ? parseNumber(v as string) === parseNumber(d as string) : v === d;
        if (
          !same &&
          !(f.showIf && !f.showIf(looseValues(spec as unknown as FormToolSpec<FormValues>, source)))
        ) {
          const pv = numeric ? parseNumber(v as string) : v;
          params.set(f.name, typeof pv === 'boolean' ? (pv ? '1' : '0') : String(pv ?? ''));
        }
      }
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
      if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(window.history.state, '', next);
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [outcome, source, fields, spec, urlState]);

  const markUsed = useCallback(() => {
    if (usedRef.current) return;
    usedRef.current = true;
    analytics.track('tool_used', { tool: meta?.slug, category: meta?.category });
  }, [meta]);

  const update = (name: string, value: string | boolean) => {
    markUsed();
    setRaw((r) => ({ ...r, [name]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // New object identity forces a recompute even when inputs are unchanged (e.g. random generators).
    setCommitted({ ...raw });
    const r = runCompute(spec, raw);
    if (r.outcome && 'result' in r.outcome) {
      analytics.track('calculation_completed', { tool: meta?.slug, category: meta?.category });
      if (window.matchMedia?.('(max-width: 1023px)').matches) {
        window.setTimeout(
          () => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
          50,
        );
      }
    }
  };

  const onReset = () => {
    const fresh = initialRaw(spec);
    setRaw(fresh);
    setCommitted(fresh);
    setTouched({});
    setSubmitted(false);
    if (urlState) window.history.replaceState(window.history.state, '', window.location.pathname);
  };

  const visibleFields = fields.filter((f) => !f.showIf || f.showIf(loose));
  const result = outcome && 'result' in outcome ? outcome.result : null;
  // Engine errors (including field-specific ones) are always explained in the result panel.
  const formError = outcome && 'error' in outcome ? outcome.error : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={onSubmit}
          noValidate
          className="card p-4 sm:p-6"
          aria-label={`${meta?.name ?? 'Calculator'} inputs`}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {visibleFields.map((f) => (
              <FieldInput
                key={f.name}
                field={
                  'unit' in f && typeof f.unit === 'function' ? { ...f, unit: f.unit(loose) } : f
                }
                value={raw[f.name]}
                options={fieldOptions(f, loose)}
                error={touched[f.name] || submitted ? liveErrors[f.name] : undefined}
                onChange={(v) => update(f.name, v)}
                onBlur={() => setTouched((t) => ({ ...t, [f.name]: true }))}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary flex-1 sm:flex-none">
              <Calculator className="h-4 w-4" aria-hidden="true" />
              {spec.submitLabel ?? 'Calculate'}
            </button>
            <button type="button" className="btn-secondary" onClick={onReset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
            </button>
          </div>
        </form>

        <section
          ref={resultRef}
          aria-labelledby="result-heading"
          className="card p-4 sm:p-6"
          id="tool-result"
        >
          <h2 id="result-heading" className="mb-4 text-lg">
            Result
          </h2>
          <div aria-live="polite" aria-atomic="false">
            {result ? (
              <ResultGrid items={result.results} />
            ) : formError ? (
              <p
                role="alert"
                className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
              >
                {formError}
              </p>
            ) : (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                Enter valid values to see the result.
              </p>
            )}
          </div>
          {result?.notes && result.notes.length > 0 && (
            <ul className="mt-4 space-y-1 text-sm text-slate-600">
              {result.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          )}
          {result && (
            <div className="mt-5">
              <ShareBar lines={resultLines(result)} />
            </div>
          )}
        </section>
      </div>

      {result?.chart && (
        <section className="card p-4 sm:p-6" aria-labelledby="chart-heading">
          <h2 id="chart-heading" className="mb-4 text-lg">
            Visual breakdown
          </h2>
          <Chart spec={result.chart} />
        </section>
      )}
      {result?.table && (
        <section className="card p-4 sm:p-6">
          <DataTable spec={result.table} />
        </section>
      )}
    </div>
  );
}

/** Wrap a spec as a lazy-loadable tool component. */
export function createFormTool<V extends FormValues>(spec: FormToolSpec<V>) {
  function FormToolComponent() {
    return <FormTool spec={spec} />;
  }
  return FormToolComponent;
}
