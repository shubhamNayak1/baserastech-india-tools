import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Search, TrendingUp, X } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { CATEGORIES, CATEGORY_MAP } from '@/data/categories';
import { searchEngine, POPULAR_SEARCHES } from '@/search';
import { recentSearches } from '@/services/storage';
import { usePersistedList } from '@/hooks/usePersistedList';
import { ToolIcon } from '@/components/ui/icons';
import type { CategoryId } from '@/types/tool';

interface Props {
  variant?: 'hero' | 'palette' | 'inline';
  autoFocus?: boolean;
  initialQuery?: string;
  showCategoryFilters?: boolean;
  onNavigate?: () => void;
  placeholder?: string;
}

type Option =
  | { kind: 'tool'; slug: string }
  | { kind: 'query'; query: string }
  | { kind: 'all'; query: string };

export function SearchCombobox({
  variant = 'inline',
  autoFocus,
  initialQuery = '',
  showCategoryFilters,
  onNavigate,
  placeholder = 'What do you want to calculate?',
}: Props) {
  const navigate = useNavigate();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(variant === 'palette');
  const [active, setActive] = useState(0);
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  const recents = usePersistedList(recentSearches);
  const startedRef = useRef(false);

  const hits = useMemo(() => searchEngine.search(query, { category, limit: 8 }), [query, category]);
  const totalHits = useMemo(
    () => (query.trim() ? searchEngine.search(query, { category }).length : 0),
    [query, category],
  );

  const options: Option[] = query.trim()
    ? [
        ...hits.map((h) => ({ kind: 'tool' as const, slug: h.tool.slug })),
        ...(totalHits > 0 ? [{ kind: 'all' as const, query }] : []),
      ]
    : [
        ...recents.slice(0, 5),
        ...POPULAR_SEARCHES.filter((p) => !recents.includes(p.toLowerCase())),
      ]
        .slice(0, 8)
        .map((q) => ({ kind: 'query' as const, query: q }));

  useEffect(() => setActive(0), [query, category]);

  useEffect(() => {
    if (!query.trim()) return;
    const t = window.setTimeout(
      () => analytics.track('search_completed', { query, results: totalHits }),
      900,
    );
    return () => window.clearTimeout(t);
  }, [query, totalHits]);

  const go = (opt: Option, position: number) => {
    if (opt.kind === 'tool') {
      if (query.trim()) recentSearches.push(query.trim().toLowerCase());
      analytics.track('search_result_clicked', { tool: opt.slug, query, position: position + 1 });
      navigate(`/tools/${opt.slug}`);
      setOpen(variant === 'palette');
      onNavigate?.();
    } else if (opt.kind === 'all') {
      recentSearches.push(opt.query.trim().toLowerCase());
      navigate(
        `/search?q=${encodeURIComponent(opt.query.trim())}${category !== 'all' ? `&category=${category}` : ''}`,
      );
      onNavigate?.();
    } else {
      setQuery(opt.query);
      inputRef.current?.focus();
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (options.length ? (a + 1) % options.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (options.length ? (a - 1 + options.length) % options.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[active];
      if (opt && (open || variant === 'palette')) go(opt, active);
      else if (query.trim()) go({ kind: 'all', query }, 0);
    } else if (e.key === 'Escape' && variant !== 'palette') {
      setOpen(false);
    }
  };

  const showList = open && (variant === 'palette' || options.length > 0 || query.trim().length > 0);
  const big = variant === 'hero';
  const activeId = showList && options[active] ? `${listId}-opt-${active}` : undefined;

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ${big ? 'h-6 w-6' : 'h-5 w-5'}`}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          aria-label="Search tools"
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          value={query}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!startedRef.current && e.target.value) {
              startedRef.current = true;
              analytics.track('search_started');
            }
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => variant !== 'palette' && window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={onKeyDown}
          className={`w-full rounded-xl border border-slate-300 bg-white pr-12 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20 [&::-webkit-search-cancel-button]:hidden ${
            big ? 'h-14 pl-14 text-lg sm:h-16' : 'h-12 pl-12 text-base'
          }`}
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {showCategoryFilters && (
        <div
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter by category"
        >
          <button
            type="button"
            className={`chip shrink-0 ${category === 'all' ? 'chip-active' : ''}`}
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip shrink-0 ${category === c.id ? 'chip-active' : ''}`}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.shortName}
            </button>
          ))}
        </div>
      )}

      {showList && (
        <div
          className={`${variant === 'palette' ? 'mt-3' : 'absolute left-0 right-0 top-full z-40 mt-2 rounded-xl border border-slate-200 bg-white shadow-lg'} overflow-hidden`}
        >
          {!query.trim() && (
            <div className="px-4 pt-3 text-xs font-medium uppercase tracking-wide text-slate-500">
              {recents.length ? 'Recent & popular searches' : 'Popular searches'}
            </div>
          )}
          <ul
            id={listId}
            role="listbox"
            aria-label="Search suggestions"
            className="max-h-[60vh] overflow-y-auto py-2"
          >
            {options.map((opt, i) => {
              const isActive = i === active;
              const base = `flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left ${isActive ? 'bg-brand-50' : 'hover:bg-slate-50'}`;
              if (opt.kind === 'tool') {
                const t = hits.find((h) => h.tool.slug === opt.slug)!.tool;
                return (
                  <li
                    key={opt.slug}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={isActive}
                    className={base}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(opt, i)}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <ToolIcon name={t.icon} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{t.name}</span>
                      <span className="block truncate text-sm text-slate-500">
                        {t.shortDescription}
                      </span>
                    </span>
                    <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 sm:inline">
                      {CATEGORY_MAP[t.category].shortName}
                    </span>
                  </li>
                );
              }
              if (opt.kind === 'all') {
                return (
                  <li
                    key="all"
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={isActive}
                    className={`${base} border-t border-slate-100 text-brand-700`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(opt, i)}
                    onMouseEnter={() => setActive(i)}
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" /> See all {totalHits}{' '}
                    results for “{query.trim()}”
                  </li>
                );
              }
              const isRecent = recents.includes(opt.query);
              return (
                <li
                  key={opt.query}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={isActive}
                  className={base}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(opt, i)}
                  onMouseEnter={() => setActive(i)}
                >
                  {isRecent ? (
                    <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  )}
                  <span className="text-slate-700">{opt.query}</span>
                </li>
              );
            })}
          </ul>
          {query.trim() && hits.length === 0 && (
            <div className="px-4 pb-4 text-sm text-slate-600" role="status">
              No tools found for “{query.trim()}”. Try a simpler word like “loan”, “tax” or
              “convert”.
            </div>
          )}
          {variant === 'palette' && (
            <div className="hidden items-center gap-4 border-t border-slate-100 px-4 py-2 text-xs text-slate-500 sm:flex">
              <span>
                <kbd className="kbd">↑</kbd> <kbd className="kbd">↓</kbd> to navigate
              </span>
              <span>
                <kbd className="kbd">Enter</kbd> to open
              </span>
              <span>
                <kbd className="kbd">Esc</kbd> to close
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
