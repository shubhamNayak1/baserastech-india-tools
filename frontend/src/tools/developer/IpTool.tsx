import { useMemo, useState } from 'react';
import { ResultGrid } from '@/components/tool/ResultPanel';
import type { ResultItem } from '@/components/form-tool/types';
import { analyzeIp } from './lib/ip';

export default function IpTool() {
  const [input, setInput] = useState('192.168.1.10/24');
  const analysed = useMemo(() => {
    try {
      const a = analyzeIp(input);
      const items: ResultItem[] = [
        { label: 'IP version', value: `IPv${a.version}`, primary: true, hint: a.type },
        { label: 'Address type', value: a.type },
      ];
      if (a.version === 4) {
        items.push(
          { label: 'Binary', value: a.binary },
          { label: 'Integer', value: String(a.integer) },
        );
        if (a.network) {
          items.push(
            { label: 'Network address', value: `${a.network.network}/${a.prefix}` },
            { label: 'Broadcast address', value: a.network.broadcast },
            { label: 'Subnet mask', value: a.network.mask },
            { label: 'Wildcard mask', value: a.network.wildcard },
            { label: 'Usable host range', value: `${a.network.firstHost} – ${a.network.lastHost}` },
            {
              label: 'Usable hosts',
              value: a.network.hosts.toLocaleString('en-IN'),
              hint: `${a.network.total.toLocaleString('en-IN')} addresses in total`,
            },
          );
        }
      } else {
        items.push(
          { label: 'Expanded', value: a.expanded },
          { label: 'Compressed', value: a.compressed },
        );
        if (a.prefix !== null) items.push({ label: 'Prefix', value: `/${a.prefix}` });
      }
      return { items, error: '' };
    } catch (e) {
      return { items: [], error: (e as Error).message };
    }
  }, [input]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-4 p-4 sm:p-6">
        <div>
          <label htmlFor="ip-input" className="label">
            IP address (optionally with /prefix)
          </label>
          <input
            id="ip-input"
            className={`input font-mono ${analysed.error ? 'input-error' : ''}`}
            value={input}
            spellCheck={false}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={Boolean(analysed.error)}
          />
          {analysed.error && (
            <p className="field-error" role="alert">
              {analysed.error}
            </p>
          )}
          <p className="help-text">Examples: 8.8.8.8, 10.0.0.0/8, 2001:db8::1, fe80::1/64</p>
        </div>
        <p className="text-sm text-slate-600">
          Everything is calculated in your browser. This tool does not look up or send any IP
          address to a server — to find your own public IP, check your router or your operating
          system’s network settings.
        </p>
      </div>
      <section className="card p-4 sm:p-6" aria-labelledby="result-heading">
        <h2 id="result-heading" className="mb-4 text-lg">
          Result
        </h2>
        <div aria-live="polite">
          {analysed.items.length ? <ResultGrid items={analysed.items} /> : null}
        </div>
      </section>
    </div>
  );
}
