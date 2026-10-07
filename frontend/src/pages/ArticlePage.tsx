import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SITE } from '@/config/site';
import { GuideSections } from '@/components/content/GuideSections';
import { Breadcrumbs } from '@/components/tool/Breadcrumbs';
import { ToolGrid } from '@/components/tool/ToolCard';
import { ARTICLE_BY_SLUG, articlePath, loadArticle, type Article } from '@/data/articles';
import { articleSchema, breadcrumbSchema, faqSchema } from '@/seo/schema';
import { Seo } from '@/seo/Seo';
import { getTools } from '@/tools/registry';
import { formatPublishDate } from '@/utils/date';
import { NotFoundPage } from './NotFoundPage';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const meta = ARTICLE_BY_SLUG.get(slug);
  const [article, setArticle] = useState<Article | undefined>();

  useEffect(() => {
    let cancelled = false;
    setArticle(undefined);
    loadArticle(slug)
      .then((a) => !cancelled && setArticle(a))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!meta) return <NotFoundPage />;

  const path = articlePath(meta.slug);
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Guides', path: '/guides/' },
    { name: meta.title, path },
  ];
  const faqs = article?.faq ?? [];

  return (
    <div className="container-page max-w-3xl py-8">
      <Seo
        title={meta.title}
        description={meta.description}
        path={path}
        type="article"
        jsonLd={[articleSchema({ ...meta, path }), breadcrumbSchema(crumbs), faqSchema(faqs)]}
      />
      <Breadcrumbs items={crumbs} />
      <article className="mt-4">
        <h1 className="text-2xl sm:text-3xl">{meta.title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          By {SITE.brand} · Updated{' '}
          <time dateTime={meta.updated}>{formatPublishDate(meta.updated)}</time>
        </p>
        {article ? (
          <div className="mt-6 space-y-8">
            <div className="prose-tool space-y-3">
              {article.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <GuideSections sections={article.sections} idPrefix="article" />
            {faqs.length > 0 && (
              <section aria-labelledby="faq">
                <h2 id="faq" className="mb-3 text-xl">
                  Frequently asked questions
                </h2>
                <div className="prose-tool space-y-4">
                  {faqs.map((f) => (
                    <div key={f.q}>
                      <h3 className="font-semibold text-slate-900">{f.q}</h3>
                      <p>{f.a}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <p className="text-sm text-slate-500">
              This guide is general information, not financial or tax advice. Rules change; check
              the latest official notifications before acting.
            </p>
          </div>
        ) : (
          <div className="mt-6 h-96 animate-pulse rounded-xl bg-slate-100/60" aria-busy="true" />
        )}
      </article>
      <section aria-labelledby="calculators" className="mt-10">
        <h2 id="calculators" className="mb-4 text-xl">
          Calculators for this guide
        </h2>
        <ToolGrid tools={getTools(meta.relatedTools)} label="Calculators for this guide" />
        <p className="mt-4 text-sm">
          <Link to="/guides/" className="font-medium text-brand-700 hover:underline">
            ← All guides
          </Link>
        </p>
      </section>
    </div>
  );
}
