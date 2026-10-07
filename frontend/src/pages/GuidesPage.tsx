import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/tool/Breadcrumbs';
import { ARTICLES, articlePath, GUIDES_DESCRIPTION, GUIDES_TITLE } from '@/data/articles';
import { breadcrumbSchema } from '@/seo/schema';
import { Seo } from '@/seo/Seo';
import { formatPublishDate } from '@/utils/date';

export function GuidesPage() {
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides/' },
  ];
  return (
    <div className="container-page max-w-3xl py-8">
      <Seo
        title={GUIDES_TITLE}
        description={GUIDES_DESCRIPTION}
        path="/guides/"
        jsonLd={[breadcrumbSchema(crumbs)]}
      />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-4 text-2xl sm:text-3xl">Guides</h1>
      <p className="mt-2 text-slate-600">{GUIDES_DESCRIPTION}</p>
      <ul className="mt-8 space-y-6">
        {ARTICLES.map((a) => (
          <li key={a.slug} className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg">
              <Link to={articlePath(a.slug)} className="text-brand-700 hover:underline">
                {a.title}
              </Link>
            </h2>
            <p className="mt-1 text-slate-600">{a.description}</p>
            <p className="mt-2 text-xs text-slate-500">
              Updated <time dateTime={a.updated}>{formatPublishDate(a.updated)}</time>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
