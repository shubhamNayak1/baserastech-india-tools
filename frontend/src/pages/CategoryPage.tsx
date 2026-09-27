import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { Breadcrumbs } from '@/components/tool/Breadcrumbs';
import { Disclaimer } from '@/components/tool/Disclaimer';
import { ToolGrid } from '@/components/tool/ToolCard';
import { ToolIcon } from '@/components/ui/icons';
import { CATEGORY_MAP, getCategory } from '@/data/categories';
import { searchEngine } from '@/search';
import { breadcrumbSchema, categoryPath, itemListSchema } from '@/seo/schema';
import { Seo } from '@/seo/Seo';
import { toolsInCategory } from '@/tools/registry';
import { NotFoundPage } from './NotFoundPage';

export function CategoryPage() {
  const { id = '' } = useParams();
  const category = getCategory(id);
  const [q, setQ] = useState('');

  useEffect(() => {
    setQ('');
    if (category) analytics.track('category_viewed', { category: category.id });
  }, [category]);

  const all = useMemo(() => (category ? toolsInCategory(category.id) : []), [category]);
  const tools = useMemo(
    () =>
      category && q.trim()
        ? searchEngine.search(q, { category: category.id }).map((h) => h.tool)
        : all,
    [q, all, category],
  );

  if (!category) return <NotFoundPage />;
  const popular = all.filter((t) => t.isPopular || t.isFeatured).slice(0, 4);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: category.name, path: categoryPath(category.id) },
  ];

  return (
    <div className="container-page py-6">
      <Seo
        title={category.seoTitle}
        description={category.seoDescription}
        path={categoryPath(category.id)}
        jsonLd={[breadcrumbSchema(crumbs), itemListSchema(category, all)]}
      />
      <Breadcrumbs items={crumbs} />
      <header className="mt-4 flex items-start gap-3">
        <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <ToolIcon name={category.icon} className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl sm:text-3xl">{category.h1}</h1>
          <p className="mt-1 max-w-3xl text-slate-600">{category.description}</p>
        </div>
      </header>
      {category.disclaimer && (
        <div className="mt-4">
          <Disclaimer kind={category.disclaimer} />
        </div>
      )}

      {popular.length > 0 && (
        <section aria-labelledby="cat-popular" className="mt-8">
          <h2 id="cat-popular" className="mb-3 text-lg">
            Popular in {category.shortName}
          </h2>
          <ToolGrid tools={popular} showCategory={false} />
        </section>
      )}

      <section aria-labelledby="cat-all" className="mt-8">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="cat-all" className="text-lg">
            All {category.name.toLowerCase()} tools ({all.length})
          </h2>
          <div className="relative sm:w-72">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="cat-search" className="sr-only">
              Search {category.name}
            </label>
            <input
              id="cat-search"
              type="search"
              className="input pl-9"
              placeholder={`Search ${category.shortName.toLowerCase()} tools…`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        {tools.length ? (
          <ToolGrid tools={tools} showCategory={false} />
        ) : (
          <p className="card p-6 text-slate-600">
            No {category.shortName.toLowerCase()} tools match “{q}”.
          </p>
        )}
      </section>

      <section aria-labelledby="related-cats" className="mt-10">
        <h2 id="related-cats" className="mb-3 text-lg">
          Related categories
        </h2>
        <ul className="flex flex-wrap gap-2">
          {category.related.map((rid) => (
            <li key={rid}>
              <Link to={categoryPath(rid)} className="chip">
                <ToolIcon name={CATEGORY_MAP[rid].icon} className="mr-1.5 h-4 w-4" />{' '}
                {CATEGORY_MAP[rid].name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
