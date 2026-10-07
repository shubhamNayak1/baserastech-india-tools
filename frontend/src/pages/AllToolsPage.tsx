import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, Search } from 'lucide-react';
import { ToolGrid } from '@/components/tool/ToolCard';
import { Breadcrumbs } from '@/components/tool/Breadcrumbs';
import { CATEGORIES } from '@/data/categories';
import { searchEngine } from '@/search';
import { Seo } from '@/seo/Seo';
import { breadcrumbSchema } from '@/seo/schema';
import { storage } from '@/services/storage';
import { ACTIVE_TOOLS } from '@/tools/registry';
import type { CategoryId } from '@/types/tool';

type Sort = 'az' | 'popular' | 'new';

export function AllToolsPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const cat = (params.get('category') ?? 'all') as CategoryId | 'all';
  const sort = (params.get('sort') ?? 'az') as Sort;
  const view = (params.get('view') ?? storage.get<string>('baserastech_tools_view', 'grid')) as
    'grid' | 'list';

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === '' || (k === 'category' && v === 'all') || (k === 'sort' && v === 'az'))
      next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
    if (k === 'view' && v) storage.set('baserastech_tools_view', v);
  };

  const tools = useMemo(() => {
    let list = q.trim()
      ? searchEngine.search(q, { category: cat }).map((h) => h.tool)
      : ACTIVE_TOOLS.filter((t) => cat === 'all' || t.category === cat || t.alsoIn?.includes(cat));
    if (!q.trim()) {
      if (sort === 'az') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
      if (sort === 'popular')
        list = [...list].sort(
          (a, b) =>
            Number(b.isPopular) - Number(a.isPopular) ||
            Number(b.isFeatured) - Number(a.isFeatured) ||
            a.name.localeCompare(b.name),
        );
      if (sort === 'new')
        list = [...list].reverse().sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    }
    return list;
  }, [q, cat, sort]);

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'All tools', path: '/tools/' },
  ];

  return (
    <div className="container-page py-6">
      <Seo
        title={`All ${ACTIVE_TOOLS.length} Free Online Calculators & Tools`}
        description={`Browse all ${ACTIVE_TOOLS.length} free calculators, converters and generators: finance, salary, tax, GST, business, math, date, health, education, developer and text tools.`}
        path="/tools/"
        jsonLd={[breadcrumbSchema(crumbs)]}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-4 text-2xl sm:text-3xl">All tools</h1>
      <p className="mt-1 text-slate-600">
        {ACTIVE_TOOLS.length} free calculators, converters and generators.
      </p>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <label htmlFor="tool-filter" className="sr-only">
            Filter tools
          </label>
          <input
            id="tool-filter"
            type="search"
            className="input pl-10"
            placeholder="Filter tools…"
            value={q}
            onChange={(e) => set('q', e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <label htmlFor="sort" className="sr-only">
            Sort
          </label>
          <select
            id="sort"
            className="input w-auto"
            value={sort}
            onChange={(e) => set('sort', e.target.value)}
            disabled={Boolean(q.trim())}
          >
            <option value="az">A–Z</option>
            <option value="popular">Most popular</option>
            <option value="new">Recently added</option>
          </select>
          <div className="segmented w-auto" role="radiogroup" aria-label="View">
            <button
              type="button"
              role="radio"
              aria-checked={view === 'grid'}
              className="segmented-btn"
              onClick={() => set('view', 'grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={view === 'list'}
              className="segmented-btn"
              onClick={() => set('view', 'list')}
              aria-label="List view"
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="mt-4 flex gap-2 overflow-x-auto pb-2"
        role="group"
        aria-label="Filter by category"
      >
        <button
          type="button"
          className={`chip shrink-0 ${cat === 'all' ? 'chip-active' : ''}`}
          aria-pressed={cat === 'all'}
          onClick={() => set('category', 'all')}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip shrink-0 ${cat === c.id ? 'chip-active' : ''}`}
            aria-pressed={cat === c.id}
            onClick={() => set('category', c.id)}
          >
            {c.shortName}
          </button>
        ))}
      </div>

      <p className="my-4 text-sm text-slate-600" role="status">
        Showing {tools.length} {tools.length === 1 ? 'tool' : 'tools'}
      </p>
      {tools.length ? (
        <ToolGrid tools={tools} view={view} />
      ) : (
        <p className="card p-6 text-slate-600">No tools match “{q}”.</p>
      )}
    </div>
  );
}
