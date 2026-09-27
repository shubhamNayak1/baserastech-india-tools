import { Link } from 'react-router-dom';
import { SearchCombobox } from '@/components/search/SearchCombobox';
import { ToolGrid } from '@/components/tool/ToolCard';
import { Seo } from '@/seo/Seo';
import { POPULAR_TOOLS } from '@/tools/registry';

export function NotFoundPage() {
  return (
    <div className="container-page py-10">
      <Seo
        title="Page not found"
        description="The page you are looking for does not exist."
        path="/404"
        noindex
      />
      <h1 className="text-2xl sm:text-3xl">Page not found</h1>
      <p className="mt-2 text-slate-600">
        We couldn’t find that page. Try searching for a tool or go to the{' '}
        <Link to="/" className="text-brand-700 hover:underline">
          home page
        </Link>
        .
      </p>
      <div className="mt-6 max-w-xl">
        <SearchCombobox />
      </div>
      <h2 className="mb-3 mt-10 text-lg">Popular tools</h2>
      <ToolGrid tools={POPULAR_TOOLS.slice(0, 6)} />
    </div>
  );
}
