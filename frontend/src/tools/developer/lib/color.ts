export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function parseColor(input: string): Rgba {
  const s = input.trim().toLowerCase();
  let m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4)
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
      a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
    };
  }
  m =
    /^rgba?\(\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*[, ]\s*([\d.]+%?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/.exec(
      s,
    );
  if (m) {
    const ch = (v: string) =>
      clamp(v.endsWith('%') ? (parseFloat(v) * 255) / 100 : parseFloat(v), 0, 255);
    const a =
      m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return {
      r: Math.round(ch(m[1])),
      g: Math.round(ch(m[2])),
      b: Math.round(ch(m[3])),
      a: clamp(a, 0, 1),
    };
  }
  m =
    /^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/.exec(
      s,
    );
  if (m) {
    const { r, g, b } = hslToRgb(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    const a =
      m[4] === undefined ? 1 : m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return { r, g, b, a: clamp(a, 0, 1) };
  }
  m = /^cmyk\(\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?\s*[, ]\s*([\d.]+)%?\s*\)$/.exec(
    s,
  );
  if (m) {
    const [c, mm, y, k] = m.slice(1, 5).map((x) => clamp(parseFloat(x), 0, 100) / 100);
    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - mm) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k)),
      a: 1,
    };
  }
  throw new Error(
    'Enter a colour as HEX (#1d5cf1), rgb(29, 92, 241), hsl(222, 88%, 53%) or cmyk(88, 62, 0, 5).',
  );
}

export function hslToRgb(h: number, s: number, l: number) {
  const hh = ((h % 360) + 360) % 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  const [r, g, b] =
    hh < 60
      ? [c, x, 0]
      : hh < 120
        ? [x, c, 0]
        : hh < 180
          ? [0, c, x]
          : hh < 240
            ? [0, x, c]
            : hh < 300
              ? [x, 0, c]
              : [c, 0, x];
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

export function rgbToHsl({ r, g, b }: Rgba) {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === rr) h = 60 * (((gg - bb) / d) % 6);
    else if (max === gg) h = 60 * ((bb - rr) / d + 2);
    else h = 60 * ((rr - gg) / d + 4);
  }
  return { h: Math.round((h + 360) % 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToHsv({ r, g, b }: Rgba) {
  const [rr, gg, bb] = [r / 255, g / 255, b / 255];
  const max = Math.max(rr, gg, bb);
  const d = max - Math.min(rr, gg, bb);
  const { h } = rgbToHsl({ r, g, b, a: 1 });
  return { h, s: Math.round((max === 0 ? 0 : d / max) * 100), v: Math.round(max * 100) };
}

export function rgbToCmyk({ r, g, b }: Rgba) {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const f = (v: number) => Math.round(((1 - v / 255 - k) / (1 - k)) * 100);
  return { c: f(r), m: f(g), y: f(b), k: Math.round(k * 100) };
}

export function toHexString({ r, g, b, a }: Rgba) {
  const h = (v: number) => Math.round(v).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}${a < 1 ? h(a * 255) : ''}`;
}

export function luminance({ r, g, b }: Rgba) {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(a: Rgba, b: Rgba) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
