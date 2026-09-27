import { useMemo, useState } from 'react';
import { Plus, Printer, RotateCcw, Trash2 } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { ResultGrid } from '@/components/tool/ResultPanel';
import { ShareBar } from '@/components/tool/ShareBar';
import { useToolMeta } from '@/components/tool/ToolContext';
import { Segmented } from '@/components/form-tool/FieldInput';
import { formatINR, formatNumber } from '@/utils/format';
import { parseNumber } from '@/utils/number';
import { todayISO } from '@/utils/date';
import { rupeesInWords } from '@/utils/words';
import { CURRENT_RULES } from '../tax/rules';
import { invoiceTotals, type InvoiceLine } from './engine';

interface Row {
  id: number;
  description: string;
  qty: string;
  rate: string;
  gstPct: string;
  discountPct: string;
}

const blank = (id: number): Row => ({
  id,
  description: '',
  qty: '1',
  rate: '',
  gstPct: '18',
  discountPct: '0',
});
const initialRows = (): Row[] => [
  {
    id: 1,
    description: 'Website design services',
    qty: '1',
    rate: '25000',
    gstPct: '18',
    discountPct: '0',
  },
  {
    id: 2,
    description: 'Printed brochures',
    qty: '500',
    rate: '12',
    gstPct: '5',
    discountPct: '10',
  },
];

export default function GstInvoiceCalculator() {
  const meta = useToolMeta();
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [supply, setSupply] = useState('intra');
  const [invoiceNo, setInvoiceNo] = useState('INV-001');
  const [date, setDate] = useState(todayISO());
  const [seller, setSeller] = useState('');
  const [buyer, setBuyer] = useState('');
  const [nextId, setNextId] = useState(3);

  const { lines, errors } = useMemo(() => {
    const errs: Record<number, string> = {};
    const parsed: InvoiceLine[] = [];
    rows.forEach((r, i) => {
      const qty = parseNumber(r.qty);
      const rate = parseNumber(r.rate);
      const gst = parseNumber(r.gstPct);
      const disc = parseNumber(r.discountPct) ?? 0;
      if (!r.description.trim() && !r.rate.trim()) return;
      if (qty === null || qty <= 0)
        errs[r.id] = `Line ${i + 1}: quantity must be greater than zero.`;
      else if (rate === null || rate < 0) errs[r.id] = `Line ${i + 1}: enter a valid rate.`;
      else if (gst === null || gst < 0 || gst > 100)
        errs[r.id] = `Line ${i + 1}: GST rate must be 0–100%.`;
      else if (disc < 0 || disc > 100) errs[r.id] = `Line ${i + 1}: discount must be 0–100%.`;
      else
        parsed.push({
          description: r.description.trim() || `Item ${i + 1}`,
          qty,
          rate,
          gstPct: gst,
          discountPct: disc,
        });
    });
    return { lines: parsed, errors: errs };
  }, [rows]);

  const totals = useMemo(() => invoiceTotals(lines, supply === 'inter'), [lines, supply]);
  const update = (id: number, key: keyof Row, value: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  const errorList = Object.values(errors);

  const summary = [
    {
      label: 'Invoice total',
      value: formatINR(totals.grandTotal),
      primary: true,
      hint: rupeesInWords(totals.grandTotal),
    },
    { label: 'Taxable value', value: formatINR(totals.taxable, 2) },
    { label: supply === 'inter' ? 'IGST' : 'CGST + SGST', value: formatINR(totals.tax, 2) },
    { label: 'Round off', value: formatINR(totals.roundOff, 2) },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-4 sm:p-6 print:hidden">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="inv-no">
              Invoice number
            </label>
            <input
              id="inv-no"
              className="input"
              value={invoiceNo}
              maxLength={40}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="inv-date">
              Invoice date
            </label>
            <input
              id="inv-date"
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="inv-seller">
              Seller name & GSTIN <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="inv-seller"
              className="input"
              value={seller}
              maxLength={120}
              onChange={(e) => setSeller(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="inv-buyer">
              Buyer name & GSTIN <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              id="inv-buyer"
              className="input"
              value={buyer}
              maxLength={120}
              onChange={(e) => setBuyer(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <span className="label" id="supply-label">
              Type of supply
            </span>
            <Segmented
              id="supply-label"
              label="Type of supply"
              value={supply}
              onChange={setSupply}
              options={[
                { value: 'intra', label: 'Within state (CGST + SGST)' },
                { value: 'inter', label: 'Inter-state (IGST)' },
              ]}
            />
          </div>
        </div>

        <h2 className="mb-3 mt-6 text-lg">Items</h2>
        <div className="space-y-3">
          {rows.map((r, i) => (
            <fieldset
              key={r.id}
              className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,3fr)_repeat(4,minmax(0,1fr))_auto] sm:items-end"
            >
              <legend className="sr-only">Item {i + 1}</legend>
              <div className="col-span-2 sm:col-span-1">
                <label className="label text-xs" htmlFor={`d-${r.id}`}>
                  Description
                </label>
                <input
                  id={`d-${r.id}`}
                  className="input"
                  value={r.description}
                  maxLength={200}
                  onChange={(e) => update(r.id, 'description', e.target.value)}
                />
              </div>
              <div>
                <label className="label text-xs" htmlFor={`q-${r.id}`}>
                  Qty
                </label>
                <input
                  id={`q-${r.id}`}
                  className="input"
                  inputMode="decimal"
                  value={r.qty}
                  onChange={(e) => update(r.id, 'qty', e.target.value)}
                />
              </div>
              <div>
                <label className="label text-xs" htmlFor={`r-${r.id}`}>
                  Rate (₹)
                </label>
                <input
                  id={`r-${r.id}`}
                  className="input"
                  inputMode="decimal"
                  value={r.rate}
                  onChange={(e) => update(r.id, 'rate', e.target.value)}
                />
              </div>
              <div>
                <label className="label text-xs" htmlFor={`g-${r.id}`}>
                  GST %
                </label>
                <select
                  id={`g-${r.id}`}
                  className="input"
                  value={r.gstPct}
                  onChange={(e) => update(r.id, 'gstPct', e.target.value)}
                >
                  {CURRENT_RULES.gstRates.map((g) => (
                    <option key={g.ratePct} value={String(g.ratePct)}>
                      {g.ratePct}%
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs" htmlFor={`x-${r.id}`}>
                  Disc. %
                </label>
                <input
                  id={`x-${r.id}`}
                  className="input"
                  inputMode="decimal"
                  value={r.discountPct}
                  onChange={(e) => update(r.id, 'discountPct', e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn-ghost btn-sm self-end"
                aria-label={`Remove item ${i + 1}`}
                onClick={() =>
                  setRows((rs) =>
                    rs.length > 1 ? rs.filter((x) => x.id !== r.id) : [blank(nextId)],
                  )
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </fieldset>
          ))}
        </div>
        {errorList.length > 0 && (
          <ul className="mt-3 space-y-1" role="alert">
            {errorList.map((e) => (
              <li key={e} className="field-error">
                {e}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setRows((rs) => [...rs, blank(nextId)]);
              setNextId((n) => n + 1);
            }}
            disabled={rows.length >= 50}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add item
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              analytics.track('calculation_completed', { tool: meta?.slug });
              window.print();
            }}
            disabled={!lines.length}
          >
            <Printer className="h-4 w-4" aria-hidden="true" /> Print / save as PDF
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setRows(initialRows());
              setSupply('intra');
              setSeller('');
              setBuyer('');
            }}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset
          </button>
        </div>
      </div>

      <section className="card p-4 sm:p-6 print:hidden" aria-labelledby="result-heading">
        <h2 id="result-heading" className="mb-4 text-lg">
          Result
        </h2>
        <div aria-live="polite">
          <ResultGrid items={summary} />
        </div>
        <div className="mt-5">
          <ShareBar lines={summary.map((s) => `${s.label}: ${s.value}`)} compact />
        </div>
      </section>

      <section className="print-area card overflow-x-auto p-4 sm:p-6" aria-label="Invoice preview">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="text-xl">Tax Invoice</h2>
            <p className="text-sm text-slate-600">
              No. {invoiceNo || '—'} · Date {date || '—'}
            </p>
          </div>
          <div className="text-right text-sm text-slate-700">
            {seller && (
              <p>
                <span className="text-slate-500">From:</span> {seller}
              </p>
            )}
            {buyer && (
              <p>
                <span className="text-slate-500">Bill to:</span> {buyer}
              </p>
            )}
          </div>
        </div>
        <table className="mt-4 min-w-full text-sm">
          <thead className="border-b border-slate-300 text-left">
            <tr>
              <th className="py-2 pr-2">#</th>
              <th className="py-2 pr-2">Description</th>
              <th className="py-2 pr-2 text-right">Qty</th>
              <th className="py-2 pr-2 text-right">Rate</th>
              <th className="py-2 pr-2 text-right">Disc.</th>
              <th className="py-2 pr-2 text-right">Taxable</th>
              <th className="py-2 pr-2 text-right">GST</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {totals.lines.map((l, i) => (
              <tr key={i}>
                <td className="py-2 pr-2">{i + 1}</td>
                <td className="py-2 pr-2">{l.description}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{formatNumber(l.qty, 3)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{formatINR(l.rate, 2)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{formatINR(l.discount, 2)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">{formatINR(l.taxable, 2)}</td>
                <td className="py-2 pr-2 text-right tabular-nums">
                  {formatINR(l.tax, 2)}{' '}
                  <span className="text-xs text-slate-500">({l.gstPct}%)</span>
                </td>
                <td className="py-2 text-right tabular-nums">{formatINR(l.total, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 className="mb-2 mt-6 text-base">Tax summary</h3>
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-300 text-left">
            <tr>
              <th className="py-1 pr-2">GST rate</th>
              <th className="py-1 pr-2 text-right">Taxable</th>
              {supply === 'inter' ? (
                <th className="py-1 pr-2 text-right">IGST</th>
              ) : (
                <>
                  <th className="py-1 pr-2 text-right">CGST</th>
                  <th className="py-1 pr-2 text-right">SGST</th>
                </>
              )}
              <th className="py-1 text-right">Total tax</th>
            </tr>
          </thead>
          <tbody>
            {totals.summary.map((s) => (
              <tr key={s.rate}>
                <td className="py-1 pr-2">{s.rate}%</td>
                <td className="py-1 pr-2 text-right tabular-nums">{formatINR(s.taxable, 2)}</td>
                {supply === 'inter' ? (
                  <td className="py-1 pr-2 text-right tabular-nums">{formatINR(s.igst, 2)}</td>
                ) : (
                  <>
                    <td className="py-1 pr-2 text-right tabular-nums">{formatINR(s.cgst, 2)}</td>
                    <td className="py-1 pr-2 text-right tabular-nums">{formatINR(s.sgst, 2)}</td>
                  </>
                )}
                <td className="py-1 text-right tabular-nums">{formatINR(s.tax, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="ml-auto mt-4 max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Taxable value</dt>
            <dd className="tabular-nums">{formatINR(totals.taxable, 2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Total GST</dt>
            <dd className="tabular-nums">{formatINR(totals.tax, 2)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Round off</dt>
            <dd className="tabular-nums">{formatINR(totals.roundOff, 2)}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-1 font-semibold">
            <dt>Grand total</dt>
            <dd className="tabular-nums">{formatINR(totals.grandTotal)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-slate-700">{rupeesInWords(totals.grandTotal)}</p>
      </section>
    </div>
  );
}
