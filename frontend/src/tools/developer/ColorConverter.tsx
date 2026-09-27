import { useMemo, useState } from 'react';
import { ResultGrid } from '@/components/tool/ResultPanel';
import { ShareBar } from '@/components/tool/ShareBar';
import { contrastRatio, parseColor, rgbToCmyk, rgbToHsl, rgbToHsv, toHexString } from './lib/color';

const WHITE = { r: 255, g: 255, b: 255, a: 1 };
const BLACK = { r: 0, g: 0, b: 0, a: 1 };
const grade = (r: number) =>
  r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA large text only' : 'Fails';

export default function ColorConverter() {
  const [input, setInput] = useState('#1d5cf1');
  const parsed = useMemo(() => {
    try {
      return { c: parseColor(input), error: '' };
    } catch (e) {
      return { c: null, error: (e as Error).message };
    }
  }, [input]);

  const c = parsed.c;
  const items = c
    ? (() => {
        const hsl = rgbToHsl(c);
        const hsv = rgbToHsv(c);
        const cmyk = rgbToCmyk(c);
        const alpha = c.a < 1 ? `, ${Number(c.a.toFixed(2))}` : '';
        const cw = contrastRatio(c, WHITE);
        const cb = contrastRatio(c, BLACK);
        return [
          { label: 'HEX', value: toHexString(c), primary: true },
          {
            label: 'RGB',
            value: c.a < 1 ? `rgba(${c.r}, ${c.g}, ${c.b}${alpha})` : `rgb(${c.r}, ${c.g}, ${c.b})`,
          },
          {
            label: 'HSL',
            value:
              c.a < 1
                ? `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%${alpha})`
                : `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
          },
          { label: 'HSV / HSB', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
          { label: 'CMYK', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
          {
            label: 'Contrast with white text',
            value: `${cw.toFixed(2)} : 1`,
            hint: `WCAG ${grade(cw)}`,
          },
          {
            label: 'Contrast with black text',
            value: `${cb.toFixed(2)} : 1`,
            hint: `WCAG ${grade(cb)}`,
          },
        ];
      })()
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="card space-y-4 p-4 sm:p-6">
        <div>
          <label htmlFor="color-input" className="label">
            Colour (HEX, RGB, HSL or CMYK)
          </label>
          <input
            id="color-input"
            className={`input font-mono ${parsed.error ? 'input-error' : ''}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={Boolean(parsed.error)}
            spellCheck={false}
          />
          {parsed.error && (
            <p className="field-error" role="alert">
              {parsed.error}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="color-picker" className="label">
            Or pick a colour
          </label>
          <input
            id="color-picker"
            type="color"
            className="h-12 w-full cursor-pointer rounded-lg border border-slate-300"
            value={c ? toHexString({ ...c, a: 1 }) : '#000000'}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        {c && (
          <div
            className="grid grid-cols-2 gap-2 text-center text-sm font-medium"
            aria-hidden="true"
          >
            <div className="rounded-lg p-4" style={{ background: toHexString(c), color: '#fff' }}>
              White text
            </div>
            <div className="rounded-lg p-4" style={{ background: toHexString(c), color: '#000' }}>
              Black text
            </div>
          </div>
        )}
      </div>
      <section className="card p-4 sm:p-6" aria-labelledby="result-heading">
        <h2 id="result-heading" className="mb-4 text-lg">
          Result
        </h2>
        <div aria-live="polite">
          {items.length ? (
            <ResultGrid items={items} />
          ) : (
            <p className="text-sm text-slate-600">Enter a valid colour.</p>
          )}
        </div>
        {items.length > 0 && (
          <div className="mt-5">
            <ShareBar lines={items.slice(0, 5).map((i) => `${i.label}: ${i.value}`)} compact />
          </div>
        )}
      </section>
    </div>
  );
}
