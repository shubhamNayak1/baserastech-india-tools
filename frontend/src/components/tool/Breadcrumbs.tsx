import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-slate-500">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={it.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-slate-700">
                  {it.name}
                </span>
              ) : (
                <>
                  <Link to={it.path} className="hover:text-brand-700 hover:underline">
                    {it.name}
                  </Link>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
