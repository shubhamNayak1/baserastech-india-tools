import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { analytics } from '@/analytics/AnalyticsService';
import { SearchCombobox } from '@/components/search/SearchCombobox';
import { ToolGrid } from '@/components/tool/ToolCard';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import { searchEngine } from '@/search';
import { Seo } from '@/seo/Seo';
import { POPULAR_TOOLS } from '@/tools/registry';
import type { CategoryId } from '@/types/tool';

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get('q') ?? '').slice(0, 100);
  const cat = (params.get('category') ?? 'all') as CategoryId | 'all';
  const all = useMemo(() => searchEngine.search(q), [q]);
  const hits =
    cat === 'all'
      ? all
      : all.filter((h) => h.tool.category === cat || h.tool.alsoIn?.includes(cat));
  const counts = useMemo(() => {
    const m = new Map<CategoryId, number>();
    all.forEach((h) =>
      [h.tool.category, ...(h.tool.alsoIn ?? [])].forEach((c) => m.set(c, (m.get(c) ?? 0) + 1)),
    );
    return m;
  }, [all]);

  useEffect(() => {
    if (q) analytics.track('search_completed', { query: q, results: all.length });
  }, [q, all.length]);

  const setCat = (c: string) => {
    const next = new URLSearchParams(params);
    if (c === 'all') next.delete('category');
    else next.set('category', c);
    setParams(next, { replace: true });
  };

  return (
    <div className="container-page py-6">
      <Seo
        title={q ? `Search results for “${q}”` : 'Search tools'}
        description="Search free online calculators and tools."
        path="/search"
        noindex
      />
      <div className="max-w-2xl">
        <SearchCombobox key={q} initialQuery={q} />
      </div>
      <h1 className="mt-6 text-2xl">{q ? <>Search results for “{q}”</> : 'Search tools'}</h1>
      {q && (
        <p className="mt-1 text-slate-600" role="status">
          {hits.length} {hits.length === 1 ? 'result' : 'results'}
        </p>
      )}

      {q && all.length > 0 && (
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-2"
          role="group"
          aria-label="Filter results by category"
        >
          <button
            type="button"
            className={`chip shrink-0 ${cat === 'all' ? 'chip-active' : ''}`}
            aria-pressed={cat === 'all'}
            onClick={() => setCat('all')}
          >
            All ({all.length})
          </button>
          {CATEGORIES.filter((c) => counts.has(c.id)).map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip shrink-0 ${cat === c.id ? 'chip-active' : ''}`}
              aria-pressed={cat === c.id}
              onClick={() => setCat(c.id)}
            >
              {c.shortName} ({counts.get(c.id)})
            </button>
          ))}
        </div>
      )}

      <div className="mt-4">
        {hits.length > 0 ? (
          <ToolGrid tools={hits.map((h) => h.tool)} />
        ) : (
          <div>
            {q && <p className="card p-6 text-slate-700">No tools found for “{q}”.</p>}
            <h2 className="mb-3 mt-8 text-lg">Popular tools</h2>
            <ToolGrid tools={POPULAR_TOOLS.slice(0, 6)} />
            <h2 className="mb-3 mt-8 text-lg">Browse categories</h2>
            <ul className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.id}/`} className="chip">
                    {CATEGORY_MAP[c.id].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
