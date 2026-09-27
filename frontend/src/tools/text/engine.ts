/** Text analysis & transformation helpers (Unicode-aware; works for Hindi and other scripts). */

type Segmenter = { segment: (s: string) => Iterable<{ segment: string; isWordLike?: boolean }> };
function segmenter(granularity: 'word' | 'grapheme' | 'sentence'): Segmenter | null {
  const S = (
    Intl as unknown as { Segmenter?: new (l: string, o: { granularity: string }) => Segmenter }
  ).Segmenter;
  return S ? new S('en', { granularity }) : null;
}

export function words(text: string): string[] {
  const seg = segmenter('word');
  if (seg)
    return Array.from(seg.segment(text))
      .filter((s) => s.isWordLike)
      .map((s) => s.segment);
  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

export function graphemes(text: string): string[] {
  const seg = segmenter('grapheme');
  return seg ? Array.from(seg.segment(text), (s) => s.segment) : Array.from(text);
}

export function sentences(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  return t
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?।॥])\s+(?=[\p{Lu}\p{N}"“'‘(\p{Script=Devanagari}])/u)
    .map((s) => s.trim())
    .filter((s) => words(s).length > 0);
}

export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function lines(text: string): string[] {
  return text === '' ? [] : text.split(/\r\n|\r|\n/);
}

export const READING_WPM = 238;
export const SPEAKING_WPM = 130;

export function textStats(text: string) {
  const w = words(text);
  const g = graphemes(text);
  const ls = lines(text);
  const freq = new Map<string, number>();
  w.forEach((x) => {
    const k = x.toLowerCase();
    if (k.length > 3 && !STOP_WORDS.has(k)) freq.set(k, (freq.get(k) ?? 0) + 1);
  });
  return {
    words: w.length,
    characters: g.length,
    charactersNoSpaces: g.filter((c) => !/\s/.test(c)).length,
    letters: g.filter((c) => /\p{L}/u.test(c)).length,
    sentences: sentences(text).length,
    paragraphs: paragraphs(text).length,
    lines: ls.length,
    nonEmptyLines: ls.filter((l) => l.trim()).length,
    uniqueWords: new Set(w.map((x) => x.toLowerCase())).size,
    avgWordLength: w.length ? w.reduce((a, x) => a + graphemes(x).length, 0) / w.length : 0,
    readingMinutes: w.length / READING_WPM,
    speakingMinutes: w.length / SPEAKING_WPM,
    topWords: [...freq.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 10),
    bytes: new TextEncoder().encode(text).length,
  };
}

export function formatMinutes(min: number): string {
  if (min < 1 / 60) return '0 sec';
  const total = Math.max(1, Math.round(min * 60));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m ? `${m} min${s ? ` ${s} sec` : ''}` : `${s} sec`;
}

const STOP_WORDS = new Set(
  'the a an and or but if then of to in on at by for with from as is are was were be been being this that these those it its into over under than too very can will just not no yes you your we our they their he she his her them there here what which who whom whose when where why how all any both each few more most other some such only own same so also about after before again further once'.split(
    ' ',
  ),
);
const SMALL = new Set(
  'a an the and but or for nor on at to from by of in with as vs via per'.split(' '),
);

function wordsOf(s: string): string[] {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

export type CaseKind =
  | 'sentence'
  | 'lower'
  | 'upper'
  | 'title'
  | 'capitalized'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant'
  | 'alternating'
  | 'inverse';

export function titleCase(text: string): string {
  return text.replace(/[^\n]+/g, (line) => {
    const tokens = line.split(/(\s+)/);
    const wordIdx = tokens.map((t, i) => (/\S/.test(t) ? i : -1)).filter((i) => i >= 0);
    return tokens
      .map((t, i) => {
        if (!/\S/.test(t)) return t;
        const lower = t.toLowerCase();
        const first = i === wordIdx[0];
        const last = i === wordIdx[wordIdx.length - 1];
        if (!first && !last && SMALL.has(lower.replace(/[^\p{L}]/gu, ''))) return lower;
        if (/^[A-Z0-9]{2,}$/.test(t)) return t; // keep acronyms like GST, EMI
        return lower.replace(
          /^(\P{L}*)(\p{L})/u,
          (_m, pre: string, c: string) => pre + c.toUpperCase(),
        );
      })
      .join('');
  });
}

export function convertCase(text: string, kind: CaseKind): string {
  switch (kind) {
    case 'lower':
      return text.toLowerCase();
    case 'upper':
      return text.toUpperCase();
    case 'title':
      return titleCase(text);
    case 'capitalized':
      return text
        .toLowerCase()
        .replace(/(^|[\s\-/(“"'])(\p{L})/gu, (_m, p: string, c: string) => p + c.toUpperCase());
    case 'sentence':
      return text
        .toLowerCase()
        .replace(
          /(^\s*|[.!?।]\s+|\n\s*)(\p{L})/gu,
          (_m, p: string, c: string) => p + c.toUpperCase(),
        )
        .replace(/\bi\b/g, 'I');
    case 'camel': {
      const w = wordsOf(text);
      return w
        .map((x, i) => (i === 0 ? x.toLowerCase() : x[0].toUpperCase() + x.slice(1).toLowerCase()))
        .join('');
    }
    case 'pascal':
      return wordsOf(text)
        .map((x) => x[0].toUpperCase() + x.slice(1).toLowerCase())
        .join('');
    case 'snake':
      return wordsOf(text)
        .map((x) => x.toLowerCase())
        .join('_');
    case 'kebab':
      return wordsOf(text)
        .map((x) => x.toLowerCase())
        .join('-');
    case 'constant':
      return wordsOf(text)
        .map((x) => x.toUpperCase())
        .join('_');
    case 'alternating': {
      let i = 0;
      return Array.from(text, (c) =>
        /\p{L}/u.test(c) ? (i++ % 2 ? c.toUpperCase() : c.toLowerCase()) : c,
      ).join('');
    }
    case 'inverse':
      return Array.from(text, (c) =>
        c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(),
      ).join('');
  }
}

export function removeDuplicateLines(
  text: string,
  o: { ignoreCase: boolean; trim: boolean; keepBlank: boolean },
) {
  const seen = new Set<string>();
  const out: string[] = [];
  let removed = 0;
  for (const line of lines(text)) {
    const key0 = o.trim ? line.trim() : line;
    const key = o.ignoreCase ? key0.toLowerCase() : key0;
    if (!key0 && o.keepBlank) {
      out.push(line);
      continue;
    }
    if (seen.has(key)) {
      removed++;
      continue;
    }
    seen.add(key);
    out.push(o.trim ? key0 : line);
  }
  return { output: out.join('\n'), removed, kept: out.length };
}

export function removeExtraSpaces(
  text: string,
  o: { trimLines: boolean; removeBlank: boolean; tabs: boolean; collapseBlank: boolean },
) {
  let t = text.replace(/[ \u00a0\u2000-\u200a\u3000]+/g, ' ');
  if (o.tabs) t = t.replace(/\t+/g, ' ').replace(/ {2,}/g, ' ');
  let ls = lines(t);
  if (o.trimLines) ls = ls.map((l) => l.trim());
  if (o.removeBlank) ls = ls.filter((l) => l.trim());
  let out = ls.join('\n');
  if (o.collapseBlank && !o.removeBlank) out = out.replace(/\n{3,}/g, '\n\n');
  return out.trim();
}

export type SortMode = 'az' | 'za' | 'natural' | 'length' | 'lengthDesc' | 'random' | 'reverse';

export function sortLines(
  text: string,
  mode: SortMode,
  o: { ignoreCase: boolean; unique: boolean; removeBlank: boolean },
): string {
  let ls = lines(text);
  if (o.removeBlank) ls = ls.filter((l) => l.trim());
  if (o.unique) ls = [...new Map(ls.map((l) => [o.ignoreCase ? l.toLowerCase() : l, l])).values()];
  const collator = new Intl.Collator('en', {
    sensitivity: o.ignoreCase ? 'base' : 'variant',
    numeric: mode === 'natural',
  });
  switch (mode) {
    case 'az':
    case 'natural':
      ls.sort(collator.compare);
      break;
    case 'za':
      ls.sort((a, b) => collator.compare(b, a));
      break;
    case 'length':
      ls.sort((a, b) => a.length - b.length || collator.compare(a, b));
      break;
    case 'lengthDesc':
      ls.sort((a, b) => b.length - a.length || collator.compare(a, b));
      break;
    case 'reverse':
      ls.reverse();
      break;
    case 'random':
      for (let i = ls.length - 1; i > 0; i--) {
        const j = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 2 ** 32) * (i + 1));
        [ls[i], ls[j]] = [ls[j], ls[i]];
      }
  }
  return ls.join('\n');
}

export type ReverseMode = 'characters' | 'words' | 'lines' | 'eachWord';

export function reverseText(text: string, mode: ReverseMode): string {
  switch (mode) {
    case 'characters':
      return graphemes(text).reverse().join('');
    case 'words':
      return lines(text)
        .map((l) => l.split(/(\s+)/).reverse().join(''))
        .join('\n');
    case 'lines':
      return lines(text).reverse().join('\n');
    case 'eachWord':
      return text.replace(/\S+/g, (w) => graphemes(w).reverse().join(''));
  }
}

export interface CleanOptions {
  html: boolean;
  urls: boolean;
  emails: boolean;
  emoji: boolean;
  nonAscii: boolean;
  punctuation: boolean;
  numbers: boolean;
  smartQuotes: boolean;
  zeroWidth: boolean;
  lineBreaks: boolean;
}

export function cleanText(text: string, o: CleanOptions): string {
  let t = text;
  if (o.html)
    t = t
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
  if (o.urls) t = t.replace(/\bhttps?:\/\/\S+|\bwww\.\S+/gi, '');
  if (o.emails) t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '');
  if (o.zeroWidth) t = t.replace(/[\u200b-\u200f\u2060\ufeff]/g, '');
  if (o.smartQuotes)
    t = t
      .replace(/[\u2018\u2019\u201a\u201b]/g, "'")
      .replace(/[\u201c\u201d\u201e\u201f]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/\u00a0/g, ' ');
  // Flags, ZWJ and VS16 are listed individually on purpose.
  // eslint-disable-next-line no-misleading-character-class
  const EMOJI = /[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{200D}]/gu;
  // eslint-disable-next-line no-control-regex
  const NON_ASCII = /[^\x00-\x7F]/g;
  if (o.emoji) t = t.replace(EMOJI, '');
  if (o.nonAscii)
    t = t
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(NON_ASCII, '');
  if (o.punctuation) t = t.replace(/[\p{P}\p{S}]/gu, '');
  if (o.numbers) t = t.replace(/\p{N}/gu, '');
  if (o.lineBreaks) t = t.replace(/\s*\n\s*/g, ' ');
  return t
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +\n/g, '\n')
    .trim();
}

export function slugify(
  text: string,
  o: { separator: string; maxLength: number; removeStopWords: boolean; lowercase: boolean },
): string {
  let t = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
  t = t.replace(/&/g, ' and ').replace(/₹/g, ' rs ').replace(/%/g, ' percent ');
  let parts = t.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  if (o.removeStopWords && parts.length > 2)
    parts = parts.filter((p) => !STOP_WORDS.has(p.toLowerCase()) || /\d/.test(p));
  let slug = parts.join(o.separator);
  if (o.lowercase) slug = slug.toLowerCase();
  if (o.maxLength > 0 && slug.length > o.maxLength) {
    slug = slug.slice(0, o.maxLength);
    const cut = slug.lastIndexOf(o.separator);
    if (cut > o.maxLength * 0.6) slug = slug.slice(0, cut);
  }
  return slug.replace(new RegExp(`^\\${o.separator}+|\\${o.separator}+$`, 'g'), '');
}

export function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function findReplace(
  text: string,
  find: string,
  replace: string,
  o: { caseSensitive: boolean; wholeWord: boolean; regex: boolean },
) {
  if (!find) return { output: text, count: 0 };
  let source = o.regex ? find : escapeRegExp(find);
  if (o.wholeWord) source = `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])`;
  let re: RegExp;
  try {
    re = new RegExp(source, `g${o.caseSensitive ? '' : 'i'}u`);
  } catch (e) {
    throw new Error(
      `Invalid pattern: ${e instanceof Error ? e.message.replace(/^Invalid regular expression: /, '') : ''}`,
    );
  }
  let count = 0;
  const output = text.replace(re, (...args) => {
    count++;
    if (!o.regex) return replace;
    const m = args[0] as string;
    return m.replace(new RegExp(source, o.caseSensitive ? 'u' : 'iu'), replace);
  });
  return { output, count };
}

export type DiffOp = { type: 'same' | 'add' | 'del'; text: string };

/** Line diff using LCS (O(n·m) with a size guard). */
export function diffLines(
  a: string,
  b: string,
  o: { ignoreCase: boolean; ignoreWhitespace: boolean },
): DiffOp[] {
  const A = lines(a);
  const B = lines(b);
  if (A.length * B.length > 25_000_000)
    throw new Error('The texts are too large to compare in the browser (limit ~5,000 lines each).');
  const norm = (s: string) => {
    let x = o.ignoreWhitespace ? s.replace(/\s+/g, ' ').trim() : s;
    if (o.ignoreCase) x = x.toLowerCase();
    return x;
  };
  const a2 = A.map(norm);
  const b2 = B.map(norm);
  const n = A.length;
  const m = B.length;
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a2[i] === b2[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a2[i] === b2[j]) {
      ops.push({ type: 'same', text: B[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) ops.push({ type: 'del', text: A[i++] });
    else ops.push({ type: 'add', text: B[j++] });
  }
  while (i < n) ops.push({ type: 'del', text: A[i++] });
  while (j < m) ops.push({ type: 'add', text: B[j++] });
  return ops;
}
