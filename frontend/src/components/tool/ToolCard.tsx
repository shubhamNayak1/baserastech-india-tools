import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ToolIcon } from '@/components/ui/icons';
import { CATEGORY_MAP } from '@/data/categories';
import type { ToolMeta } from '@/types/tool';

function ctaLabel(t: ToolMeta) {
  if (/calculator|checker|countdown/i.test(t.name)) return 'Use calculator';
  if (/converter/i.test(t.name)) return 'Open converter';
  if (/generator/i.test(t.name)) return 'Open generator';
  return 'Open tool';
}

export function ToolCard({
  tool,
  view = 'grid',
  showCategory = true,
}: {
  tool: ToolMeta;
  view?: 'grid' | 'list';
  showCategory?: boolean;
}) {
  if (view === 'list') {
    return (
      <li className="card relative flex items-center gap-3 p-3 hover:border-brand-300">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <ToolIcon name={tool.icon} />
        </span>
        <div className="min-w-0 flex-1">
          <Link
            to={`/tools/${tool.slug}`}
            className="font-medium text-slate-900 after:absolute after:inset-0 hover:text-brand-700"
          >
            {tool.name}
          </Link>
          <p className="truncate text-sm text-slate-600">{tool.shortDescription}</p>
        </div>
        {showCategory && (
          <span className="hidden shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 sm:inline">
            {CATEGORY_MAP[tool.category].shortName}
          </span>
        )}
      </li>
    );
  }
  return (
    <li className="card group relative flex flex-col p-4 transition-colors hover:border-brand-300">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
          <ToolIcon name={tool.icon} />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">
            <Link
              to={`/tools/${tool.slug}`}
              className="after:absolute after:inset-0 group-hover:text-brand-700"
            >
              {tool.name}
            </Link>
          </h3>
          {showCategory && (
            <span className="text-xs text-slate-500">{CATEGORY_MAP[tool.category].shortName}</span>
          )}
        </div>
      </div>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{tool.shortDescription}</p>
      <span
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700"
        aria-hidden="true"
      >
        {ctaLabel(tool)}{' '}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </li>
  );
}

export function ToolGrid({
  tools,
  view = 'grid',
  showCategory = true,
  label,
}: {
  tools: ToolMeta[];
  view?: 'grid' | 'list';
  showCategory?: boolean;
  label?: string;
}) {
  return (
    <ul
      aria-label={label}
      className={
        view === 'grid' ? 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'grid gap-2'
      }
    >
      {tools.map((t) => (
        <ToolCard key={t.slug} tool={t} view={view} showCategory={showCategory} />
      ))}
    </ul>
  );
}
