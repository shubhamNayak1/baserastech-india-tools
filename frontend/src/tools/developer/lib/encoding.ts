/** UTF-8 safe Base64 / URL / HTML entity helpers. */

export function utf8Encode(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}
export function utf8Decode(b: Uint8Array, fatal = true): string {
  return new TextDecoder('utf-8', { fatal }).decode(b);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk)
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

export function base64ToBytes(b64: string): Uint8Array {
  let s = b64.replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (s.startsWith('data:')) s = s.slice(s.indexOf(',') + 1);
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(s))
    throw new Error('Input contains characters that are not valid Base64.');
  const pad = s.length % 4;
  if (pad === 1) throw new Error('Base64 input has an invalid length.');
  if (pad) s += '='.repeat(4 - pad);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function base64Encode(text: string, urlSafe = false): string {
  const b = bytesToBase64(utf8Encode(text));
  return urlSafe ? b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : b;
}

export function base64Decode(b64: string): { text: string | null; bytes: Uint8Array } {
  const bytes = base64ToBytes(b64);
  try {
    return { text: utf8Decode(bytes), bytes };
  } catch {
    return { text: null, bytes };
  }
}

export function toHex(bytes: Uint8Array, sep = ''): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(sep);
}

export function urlEncode(text: string, mode: 'component' | 'uri' | 'form'): string {
  if (mode === 'uri') return encodeURI(text);
  const e = encodeURIComponent(text).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return mode === 'form' ? e.replace(/%20/g, '+') : e;
}

export function urlDecode(text: string, plusAsSpace: boolean): string {
  const s = plusAsSpace ? text.replace(/\+/g, ' ') : text;
  try {
    return decodeURIComponent(s);
  } catch {
    throw new Error(
      'The input contains an invalid percent-encoded sequence (for example a lone “%”).',
    );
  }
}

const NAMED_ENCODE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '\u00a0': '&nbsp;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '₹': '&#8377;',
  '€': '&euro;',
  '£': '&pound;',
  '—': '&mdash;',
  '–': '&ndash;',
  '…': '&hellip;',
};

export function htmlEncode(text: string, mode: 'minimal' | 'named' | 'all'): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (mode === 'minimal') out += '&<>"\''.includes(ch) ? NAMED_ENCODE[ch] : ch;
    else if (NAMED_ENCODE[ch]) out += NAMED_ENCODE[ch];
    else if (mode === 'all' && (cp > 126 || cp < 32) && ch !== '\n' && ch !== '\t' && ch !== '\r')
      out += `&#${cp};`;
    else out += ch;
  }
  return out;
}

const NAMED_DECODE: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  deg: '°',
  plusmn: '±',
  times: '×',
  divide: '÷',
  mdash: '—',
  ndash: '–',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
  middot: '·',
  laquo: '«',
  raquo: '»',
  frac12: '½',
  frac14: '¼',
  frac34: '¾',
  larr: '←',
  rarr: '→',
  uarr: '↑',
  darr: '↓',
  hearts: '♥',
  check: '✓',
  infin: '∞',
  ne: '≠',
  le: '≤',
  ge: '≥',
  para: '¶',
  iexcl: '¡',
  iquest: '¿',
  shy: '\u00ad',
  zwj: '\u200d',
  zwnj: '\u200c',
};

export function htmlDecode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]+);/gi, (m, body: string) => {
    if (body[0] === '#') {
      const cp =
        body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(cp) && cp >= 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    }
    return NAMED_DECODE[body] ?? NAMED_DECODE[body.toLowerCase()] ?? m;
  });
}
