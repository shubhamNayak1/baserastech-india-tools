export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9₹%+#]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tokenize(text: string): string[] {
  const n = normalize(text);
  return n ? n.split(' ') : [];
}

/** Words that carry little meaning on their own; ignored if they match nothing. */
export const SOFT_STOPWORDS = new Set([
  'calculator',
  'calculators',
  'calc',
  'calculate',
  'calculation',
  'converter',
  'convert',
  'conversion',
  'tool',
  'tools',
  'online',
  'free',
  'to',
  'the',
  'a',
  'an',
  'of',
  'for',
  'my',
  'in',
  'on',
  'how',
  'much',
  'is',
  'what',
  'and',
  'with',
  'india',
  'indian',
  'from',
  'into',
  'find',
  'get',
  'check',
  'checker',
  'generator',
  'me',
  'i',
  'by',
  'per',
  'vs',
  'or',
]);

/** Optimal-string-alignment (Damerau–Levenshtein) distance with an upper bound (returns bound + 1 when exceeded). */
export function boundedLevenshtein(a: string, b: string, bound: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > bound) return bound + 1;
  let prevPrev: number[] = [];
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        v = Math.min(v, prevPrev[j - 2] + 1);
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > bound) return bound + 1;
    prevPrev = prev;
    prev = cur;
  }
  return prev[b.length];
}
