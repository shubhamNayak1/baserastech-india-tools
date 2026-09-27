import { CATEGORY_MAP } from '@/data/categories';
import type { CategoryId, ToolMeta } from '@/types/tool';
import { SOFT_STOPWORDS, boundedLevenshtein, normalize, tokenize } from './normalize';

interface IndexedTool {
  tool: ToolMeta;
  name: string;
  nameCore: string;
  nameTokens: Set<string>;
  phrases: string[]; // keywords + aliases (normalized)
  phraseTokens: Set<string>;
  categoryTokens: Set<string>;
  descTokens: Set<string>;
  fuzzyPool: string[];
  categories: CategoryId[];
}

export interface SearchHit {
  tool: ToolMeta;
  score: number;
}

export interface SearchOptions {
  category?: CategoryId | 'all';
  limit?: number;
}

const SUFFIX = /\s(calculator|converter|generator|checker|counter|tool|formatter)$/;

function buildEntry(tool: ToolMeta): IndexedTool {
  const name = normalize(tool.name);
  const phrases = [...tool.keywords, ...tool.aliases].map(normalize).filter(Boolean);
  const categories = [tool.category, ...(tool.alsoIn ?? [])];
  const categoryTokens = new Set<string>();
  categories.forEach((c) => {
    const def = CATEGORY_MAP[c];
    [c, def.name, def.shortName, ...def.keywords].forEach((t) =>
      tokenize(t).forEach((x) => categoryTokens.add(x)),
    );
  });
  const nameTokens = new Set(tokenize(tool.name));
  const phraseTokens = new Set(phrases.flatMap((p) => p.split(' ')));
  return {
    tool,
    name,
    nameCore: name.replace(SUFFIX, ''),
    nameTokens,
    phrases,
    phraseTokens,
    categoryTokens,
    descTokens: new Set(tokenize(tool.shortDescription)),
    fuzzyPool: [...new Set([...nameTokens, ...phraseTokens])].filter((t) => t.length >= 3),
    categories,
  };
}

function tokenScore(e: IndexedTool, t: string): number {
  if (e.nameTokens.has(t)) return 60;
  if (e.phraseTokens.has(t)) return 50;
  if (t.length >= 2) {
    for (const n of e.nameTokens) if (n.startsWith(t)) return 45;
    for (const p of e.phraseTokens) if (p.startsWith(t)) return 35;
  }
  if (e.categoryTokens.has(t)) return 30;
  if (t.length >= 3) for (const c of e.categoryTokens) if (c.startsWith(t)) return 20;
  if (e.descTokens.has(t)) return 12;
  if (t.length >= 4) for (const d of e.descTokens) if (d.startsWith(t)) return 8;
  if (t.length >= 4) {
    const bound = t.length >= 7 ? 2 : 1;
    let best = bound + 1;
    for (const f of e.fuzzyPool) {
      const d = boundedLevenshtein(t, f, bound);
      if (d < best) best = d;
      if (best === 1) break;
    }
    if (best <= bound) return best === 1 ? 25 : 18;
  }
  return 0;
}

function phraseScore(e: IndexedTool, q: string): number {
  if (e.name === q) return 1000;
  if (e.nameCore === q) return 950;
  let best = 0;
  for (const p of e.phrases) {
    if (p === q) best = Math.max(best, 800);
    else if (p.startsWith(q)) best = Math.max(best, 600);
    else if (q.length >= 3 && p.includes(q)) best = Math.max(best, 450);
  }
  if (e.name.startsWith(q)) best = Math.max(best, 700);
  else if (q.length >= 3 && e.name.includes(q)) best = Math.max(best, 500);
  return best;
}

export class SearchEngine {
  private readonly entries: IndexedTool[];

  constructor(tools: ToolMeta[]) {
    this.entries = tools.filter((t) => t.isActive).map(buildEntry);
  }

  search(query: string, opts: SearchOptions = {}): SearchHit[] {
    const q = normalize(query);
    const pool =
      opts.category && opts.category !== 'all'
        ? this.entries.filter((e) => e.categories.includes(opts.category as CategoryId))
        : this.entries;
    if (!q) return [];
    const tokens = q.split(' ');
    const meaningful = tokens.filter((t) => !SOFT_STOPWORDS.has(t));
    const hits: SearchHit[] = [];
    for (const e of pool) {
      const phrase = phraseScore(e, q);
      let tokenTotal = 0;
      let failed = false;
      for (const t of tokens) {
        const s = tokenScore(e, t);
        if (s === 0 && !(SOFT_STOPWORDS.has(t) && meaningful.length > 0)) {
          failed = true;
          break;
        }
        tokenTotal += s;
      }
      if (failed && phrase === 0) continue;
      const score =
        phrase +
        (failed ? 0 : tokenTotal) +
        (e.tool.isPopular ? 6 : 0) +
        (e.tool.isFeatured ? 3 : 0);
      if (score > 0) hits.push({ tool: e.tool, score });
    }
    hits.sort(
      (a, b) =>
        b.score - a.score ||
        a.tool.name.length - b.tool.name.length ||
        a.tool.name.localeCompare(b.tool.name),
    );
    return opts.limit ? hits.slice(0, opts.limit) : hits;
  }
}
