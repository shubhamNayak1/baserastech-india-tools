import { useEffect, useState } from 'react';
import { ResultGrid } from '@/components/tool/ResultPanel';
import { ShareBar } from '@/components/tool/ShareBar';
import { formatNumber } from '@/utils/format';
import { addDays, parseISODate, todayISO, toISODate } from '@/utils/date';
import { formatInZone, zonedWallTimeToUtc, browserZone } from '@/utils/timezone';

interface Props {
  defaultName: string;
  defaultTarget?: string;
  nameLabel?: string;
  /** Extra study-planning outputs for exams. */
  exam?: boolean;
}

function readParams() {
  if (typeof window === 'undefined') return {} as Record<string, string>;
  const p = new URLSearchParams(window.location.search);
  return { to: p.get('to') ?? '', name: p.get('name') ?? '', hours: p.get('hours') ?? '' };
}

export function Countdown({
  defaultName,
  defaultTarget,
  nameLabel = 'Event name',
  exam = false,
}: Props) {
  const initial = readParams();
  const fallback = defaultTarget ?? `${toISODate(addDays(parseISODate(todayISO()), 60))}T09:00`;
  const [name, setName] = useState(initial.name || defaultName);
  const [target, setTarget] = useState(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(initial.to) ? initial.to : fallback,
  );
  const [hoursPerDay, setHoursPerDay] = useState(initial.hours || '4');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    p.set('to', target);
    if (name) p.set('name', name.slice(0, 80));
    if (exam) p.set('hours', hoursPerDay);
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}?${p.toString()}`,
    );
  }, [target, name, hoursPerDay, exam]);

  let targetMs: number | null = null;
  let error = '';
  try {
    targetMs = zonedWallTimeToUtc(target, browserZone());
  } catch {
    error = 'Please enter a valid date and time.';
  }

  const diff = targetMs === null ? 0 : targetMs - now;
  const past = diff < 0;
  const abs = Math.abs(diff);
  const d = Math.floor(abs / 86_400_000);
  const h = Math.floor((abs % 86_400_000) / 3_600_000);
  const m = Math.floor((abs % 3_600_000) / 60_000);
  const s = Math.floor((abs % 60_000) / 1000);
  const hpd = Math.max(0, Math.min(24, Number(hoursPerDay) || 0));
  const studyHours = Math.floor(abs / 86_400_000) * hpd;

  const results = error
    ? []
    : [
        {
          label: past
            ? `Time since ${name || 'the event'}`
            : `Time left until ${name || 'the event'}`,
          value: `${d}d ${h}h ${m}m ${s}s`,
          primary: true,
          hint: targetMs
            ? formatInZone(targetMs, browserZone(), { dateStyle: 'full', timeStyle: 'short' })
            : undefined,
        },
        { label: 'Total days', value: formatNumber(abs / 86_400_000, 1) },
        { label: 'Weeks', value: `${Math.floor(d / 7)} weeks ${d % 7} days` },
        { label: 'Total hours', value: formatNumber(Math.floor(abs / 3_600_000), 0) },
        ...(exam && !past
          ? [
              {
                label: 'Study hours available',
                value: formatNumber(studyHours, 0),
                hint: `at ${hpd} hours a day`,
              },
              { label: 'Weekends left', value: formatNumber(Math.floor(d / 7), 0) },
            ]
          : []),
      ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-4 p-4 sm:p-6">
        <div>
          <label htmlFor="cd-name" className="label">
            {nameLabel}
          </label>
          <input
            id="cd-name"
            className="input"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="cd-target" className="label">
            Date and time
          </label>
          <input
            id="cd-target"
            type="datetime-local"
            className={`input ${error ? 'input-error' : ''}`}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
          <p className="help-text">In your local time zone ({browserZone()}).</p>
        </div>
        {exam && (
          <div>
            <label htmlFor="cd-hours" className="label">
              Study hours per day
            </label>
            <input
              id="cd-hours"
              className="input"
              inputMode="decimal"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
            />
          </div>
        )}
      </div>
      <section className="card p-4 sm:p-6" aria-labelledby="result-heading">
        <h2 id="result-heading" className="mb-4 text-lg">
          Countdown
        </h2>
        {!error && (
          <div className="mb-4 grid grid-cols-4 gap-2 text-center" aria-hidden="true">
            {[
              ['Days', d],
              ['Hours', h],
              ['Minutes', m],
              ['Seconds', s],
            ].map(([l, n]) => (
              <div key={l as string} className="rounded-lg bg-slate-900 p-3 text-white">
                <div className="font-mono text-2xl tabular-nums sm:text-3xl">
                  {String(n).padStart(2, '0')}
                </div>
                <div className="text-xs text-slate-300">{l}</div>
              </div>
            ))}
          </div>
        )}
        <div aria-live="off">
          <ResultGrid items={results} />
        </div>
        {!error && (
          <div className="mt-5">
            <ShareBar lines={[`${results[0]?.label}: ${d} days`]} />
          </div>
        )}
      </section>
    </div>
  );
}

export default function CountdownCalculator() {
  const year = new Date().getFullYear() + 1;
  return <Countdown defaultName={`New Year ${year}`} defaultTarget={`${year}-01-01T00:00`} />;
}
