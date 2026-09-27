export interface JsonError {
  message: string;
  line: number;
  column: number;
}

/** Locate JSON.parse errors as line/column (V8 reports “position N”). */
export function jsonError(text: string, e: unknown): JsonError {
  const msg = e instanceof Error ? e.message : String(e);
  let pos = -1;
  const m = /position (\d+)/i.exec(msg);
  if (m) pos = Number(m[1]);
  const lc = /line (\d+) column (\d+)/i.exec(msg);
  if (lc) return { message: cleanMessage(msg), line: Number(lc[1]), column: Number(lc[2]) };
  if (pos < 0) pos = text.length;
  const before = text.slice(0, pos);
  const line = before.split('\n').length;
  const column = pos - before.lastIndexOf('\n');
  return { message: cleanMessage(msg), line, column };
}

function cleanMessage(msg: string): string {
  return msg
    .replace(/^JSON\.parse: /, '')
    .replace(/ in JSON at position \d+.*$/, '')
    .replace(/\s*\(line \d+ column \d+\)/, '');
}

export function parseJson(
  text: string,
): { ok: true; value: unknown } | { ok: false; error: JsonError } {
  if (!text.trim()) return { ok: false, error: { message: 'Input is empty.', line: 1, column: 1 } };
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (e) {
    return { ok: false, error: jsonError(text, e) };
  }
}

export function sortKeysDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortKeysDeep);
  if (v && typeof v === 'object')
    return Object.fromEntries(
      Object.keys(v as object)
        .sort()
        .map((k) => [k, sortKeysDeep((v as Record<string, unknown>)[k])]),
    );
  return v;
}

export function formatJson(text: string, indent: number | '\t', sortKeys = false): string {
  const r = parseJson(text);
  if (!r.ok) throw new Error(`${r.error.message} (line ${r.error.line}, column ${r.error.column})`);
  return JSON.stringify(sortKeys ? sortKeysDeep(r.value) : r.value, null, indent);
}

export function minifyJson(text: string): string {
  const r = parseJson(text);
  if (!r.ok) throw new Error(`${r.error.message} (line ${r.error.line}, column ${r.error.column})`);
  return JSON.stringify(r.value);
}

export function jsonStats(value: unknown) {
  let objects = 0;
  let arrays = 0;
  let keys = 0;
  let depth = 0;
  const walk = (v: unknown, d: number) => {
    depth = Math.max(depth, d);
    if (Array.isArray(v)) {
      arrays++;
      v.forEach((x) => walk(x, d + 1));
    } else if (v && typeof v === 'object') {
      objects++;
      Object.values(v).forEach((x) => {
        keys++;
        walk(x, d + 1);
      });
    }
  };
  walk(value, 0);
  return {
    objects,
    arrays,
    keys,
    depth,
    type: Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value,
  };
}

/** Escape and wrap JSON tokens in spans for syntax highlighting. */
export function highlightJson(pretty: string): string {
  const esc = pretty.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (m) => {
      let cls = 'text-amber-300';
      if (m.startsWith('"')) cls = m.endsWith(':') ? 'text-sky-300' : 'text-emerald-300';
      else if (/true|false/.test(m)) cls = 'text-fuchsia-300';
      else if (m === 'null') cls = 'text-slate-400';
      return `<span class="${cls}">${m}</span>`;
    },
  );
}
