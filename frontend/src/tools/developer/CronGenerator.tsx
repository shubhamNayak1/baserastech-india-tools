import { useEffect, useMemo, useState } from 'react';
import { ResultGrid } from '@/components/tool/ResultPanel';
import { ShareBar } from '@/components/tool/ShareBar';
import { Segmented } from '@/components/form-tool/FieldInput';
import { formatInZone, TIME_ZONES, zoneOffsetMinutes } from '@/utils/timezone';
import { nextRuns, parseCron } from './lib/cron';

const PRESETS = [
  { value: 'minute', label: 'Every N minutes' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' },
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CronGenerator() {
  const [mode, setMode] = useState('daily');
  const [n, setN] = useState('15');
  const [minute, setMinute] = useState('30');
  const [hour, setHour] = useState('9');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [dom, setDom] = useState('1');
  const [custom, setCustom] = useState('0 9 * * 1-5');
  const [zone, setZone] = useState('Asia/Kolkata');
  const [description, setDescription] = useState('');

  const expression = useMemo(() => {
    const m = String(Math.min(59, Math.max(0, Number(minute) || 0)));
    const h = String(Math.min(23, Math.max(0, Number(hour) || 0)));
    switch (mode) {
      case 'minute':
        return `*/${Math.min(59, Math.max(1, Number(n) || 1))} * * * *`;
      case 'hourly':
        return `${m} * * * *`;
      case 'daily':
        return `${m} ${h} * * *`;
      case 'weekly':
        return `${m} ${h} * * ${days.length ? [...days].sort().join(',') : '*'}`;
      case 'monthly':
        return `${m} ${h} ${Math.min(31, Math.max(1, Number(dom) || 1))} * *`;
      default:
        return custom;
    }
  }, [mode, n, minute, hour, days, dom, custom]);

  const parsed = useMemo(() => {
    try {
      const c = parseCron(expression);
      const runs = nextRuns(c, new Date(), 5, (t) => zoneOffsetMinutes(zone, t));
      return { runs, error: '' };
    } catch (e) {
      return { runs: [], error: (e as Error).message };
    }
  }, [expression, zone]);

  useEffect(() => {
    let cancelled = false;
    if (parsed.error) return setDescription('');
    import('cronstrue')
      .then(
        (m) =>
          !cancelled &&
          setDescription(
            m.default.toString(expression, { use24HourTimeFormat: false, verbose: true }),
          ),
      )
      .catch(() => !cancelled && setDescription(''));
    return () => {
      cancelled = true;
    };
  }, [expression, parsed.error]);

  const field = (
    id: string,
    label: string,
    value: string,
    set: (v: string) => void,
    max: number,
    min = 0,
  ) => (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        className="input"
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-4 p-4 sm:p-6">
        <div>
          <span id="cron-mode" className="label">
            Schedule
          </span>
          <Segmented
            id="cron-mode"
            label="Schedule"
            options={PRESETS}
            value={mode}
            onChange={setMode}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {mode === 'minute' && field('cron-n', 'Every N minutes', n, setN, 59, 1)}
          {['hourly', 'daily', 'weekly', 'monthly'].includes(mode) &&
            field('cron-min', 'At minute', minute, setMinute, 59)}
          {['daily', 'weekly', 'monthly'].includes(mode) &&
            field('cron-hour', 'At hour (0–23)', hour, setHour, 23)}
          {mode === 'monthly' && field('cron-dom', 'Day of month', dom, setDom, 31, 1)}
        </div>
        {mode === 'weekly' && (
          <fieldset>
            <legend className="label">On days</legend>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((d, i) => (
                <label
                  key={d}
                  className={`chip cursor-pointer ${days.includes(i) ? 'chip-active' : ''}`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={days.includes(i)}
                    onChange={() =>
                      setDays((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]))
                    }
                  />
                  {d}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {mode === 'custom' && (
          <div>
            <label htmlFor="cron-custom" className="label">
              Cron expression (minute hour day month weekday)
            </label>
            <input
              id="cron-custom"
              className={`input font-mono ${parsed.error ? 'input-error' : ''}`}
              value={custom}
              spellCheck={false}
              onChange={(e) => setCustom(e.target.value)}
            />
          </div>
        )}
        <div>
          <label htmlFor="cron-zone" className="label">
            Show next runs in
          </label>
          <select
            id="cron-zone"
            className="input"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            {TIME_ZONES.map((z) => (
              <option key={z.zone} value={z.zone}>
                {z.label}
              </option>
            ))}
          </select>
          <p className="help-text">Cron runs in the server’s time zone — make sure it matches.</p>
        </div>
      </div>
      <section className="card p-4 sm:p-6" aria-labelledby="result-heading">
        <h2 id="result-heading" className="mb-4 text-lg">
          Result
        </h2>
        <div aria-live="polite">
          {parsed.error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {parsed.error}
            </p>
          ) : (
            <ResultGrid
              items={[
                { label: 'Cron expression', value: expression, primary: true, hint: description },
              ]}
            />
          )}
        </div>
        {!parsed.error && (
          <>
            <h3 className="mb-2 mt-5 text-sm font-medium text-slate-700">Next 5 runs</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
              {parsed.runs.map((r) => (
                <li key={r.getTime()}>
                  {formatInZone(r.getTime(), zone, { dateStyle: 'full', timeStyle: 'short' })}
                </li>
              ))}
            </ol>
            <div className="mt-5">
              <ShareBar lines={[`Cron: ${expression}`, description]} compact />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
