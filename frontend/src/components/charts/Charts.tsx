import type { BarChart, ChartSpec, DonutChart, GaugeChart } from '@/components/form-tool/types';
import { formatINR, formatLakhCrore, formatNumber, formatPercent } from '@/utils/format';

const PALETTE = ['#1d5cf1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];
const TONES = { blue: '#3b82f6', green: '#10b981', amber: '#f59e0b', red: '#ef4444' } as const;

function fmt(v: number, f?: 'inr' | 'number' | 'percent') {
  if (f === 'inr') return formatINR(v);
  if (f === 'percent') return formatPercent(v);
  return formatNumber(v);
}

function Donut({ spec }: { spec: DonutChart }) {
  const data = spec.data.filter((d) => Number.isFinite(d.value) && d.value > 0);
  const total = data.reduce((a, d) => a + d.value, 0);
  if (total <= 0) return null;
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const label = data.map((d) => `${d.label} ${fmt(d.value, spec.format)}`).join(', ');
  return (
    <figure className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <svg
        viewBox="0 0 160 160"
        className="h-40 w-40 shrink-0"
        role="img"
        aria-label={`${spec.title ?? 'Breakdown'}: ${label}`}
      >
        <g transform="rotate(-90 80 80)">
          <circle cx="80" cy="80" r={r} fill="none" stroke="#e2e8f0" strokeWidth="22" />
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={d.label}
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke={PALETTE[i % PALETTE.length]}
                strokeWidth="22"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </g>
      </svg>
      <figcaption className="w-full space-y-2 text-sm">
        {spec.title && <div className="font-medium text-slate-900">{spec.title}</div>}
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-600">
              <span
                className="inline-block h-3 w-3 rounded-sm"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              {d.label}
            </span>
            <span className="font-medium tabular-nums text-slate-900">
              {fmt(d.value, spec.format)}{' '}
              <span className="text-slate-500">({formatNumber((d.value / total) * 100, 1)}%)</span>
            </span>
          </div>
        ))}
      </figcaption>
    </figure>
  );
}

function Bars({ spec }: { spec: BarChart }) {
  const n = spec.labels.length;
  if (!n) return null;
  const totals = spec.labels.map((_, i) =>
    spec.stacked
      ? spec.series.reduce((a, s) => a + Math.max(0, s.values[i] ?? 0), 0)
      : Math.max(...spec.series.map((s) => s.values[i] ?? 0)),
  );
  const max = Math.max(...totals, 1);
  const W = 600;
  const H = 220;
  const pad = { l: 8, r: 8, t: 10, b: 24 };
  const bw = (W - pad.l - pad.r) / n;
  const gap = Math.min(6, bw * 0.2);
  const labelEvery = Math.ceil(n / 12);
  const shortFmt = (v: number) => (spec.format === 'inr' ? formatLakhCrore(v) : formatNumber(v));
  return (
    <figure>
      {spec.title && (
        <figcaption className="mb-2 text-sm font-medium text-slate-900">{spec.title}</figcaption>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${spec.title ?? 'Chart'}; peak ${shortFmt(max)}`}
      >
        {spec.labels.map((lab, i) => {
          const x = pad.l + i * bw + gap / 2;
          const inner = bw - gap;
          let y = H - pad.b;
          return (
            <g key={lab + i}>
              {spec.stacked
                ? spec.series.map((s, si) => {
                    const v = Math.max(0, s.values[i] ?? 0);
                    const h = (v / max) * (H - pad.t - pad.b);
                    y -= h;
                    return (
                      <rect
                        key={s.name}
                        x={x}
                        y={y}
                        width={inner}
                        height={h}
                        fill={PALETTE[si % PALETTE.length]}
                        rx="2"
                      >
                        <title>{`${lab} – ${s.name}: ${fmt(v, spec.format)}`}</title>
                      </rect>
                    );
                  })
                : spec.series.map((s, si) => {
                    const v = Math.max(0, s.values[i] ?? 0);
                    const w = inner / spec.series.length;
                    const h = (v / max) * (H - pad.t - pad.b);
                    return (
                      <rect
                        key={s.name}
                        x={x + si * w}
                        y={H - pad.b - h}
                        width={w}
                        height={h}
                        fill={PALETTE[si % PALETTE.length]}
                        rx="2"
                      >
                        <title>{`${lab} – ${s.name}: ${fmt(v, spec.format)}`}</title>
                      </rect>
                    );
                  })}
              {i % labelEvery === 0 && (
                <text x={x + inner / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#64748b">
                  {lab}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
        {spec.series.map((s, i) => (
          <span key={s.name} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ background: PALETTE[i % PALETTE.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </figure>
  );
}

function Gauge({ spec }: { spec: GaugeChart }) {
  const span = spec.max - spec.min;
  const pct = Math.min(1, Math.max(0, (spec.value - spec.min) / span));
  let from = spec.min;
  return (
    <figure>
      {spec.title && (
        <figcaption className="mb-2 text-sm font-medium text-slate-900">{spec.title}</figcaption>
      )}
      <div className="relative" role="img" aria-label={`${spec.valueLabel}`}>
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {spec.bands.map((b) => {
            const w = ((Math.min(b.to, spec.max) - from) / span) * 100;
            from = b.to;
            return <div key={b.label} style={{ width: `${w}%`, background: TONES[b.tone] }} />;
          })}
        </div>
        <div
          className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded bg-slate-900"
          style={{ left: `${pct * 100}%` }}
        />
      </div>
      <div className="mt-2 flex justify-between text-xs text-slate-500">
        {spec.bands.map((b) => (
          <span key={b.label}>{b.label}</span>
        ))}
      </div>
    </figure>
  );
}

export function Chart({ spec }: { spec: ChartSpec }) {
  switch (spec.kind) {
    case 'donut':
      return <Donut spec={spec} />;
    case 'bars':
      return <Bars spec={spec} />;
    case 'gauge':
      return <Gauge spec={spec} />;
  }
}
