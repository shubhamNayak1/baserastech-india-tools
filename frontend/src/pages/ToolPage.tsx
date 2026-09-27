import {
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { MobileAd } from '@/components/ads/MobileAd';
import { Breadcrumbs } from '@/components/tool/Breadcrumbs';
import { Disclaimer } from '@/components/tool/Disclaimer';
import { FavoriteButton } from '@/components/tool/FavoriteButton';
import { ToolContext } from '@/components/tool/ToolContext';
import { ToolGrid } from '@/components/tool/ToolCard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToolIcon } from '@/components/ui/icons';
import { CATEGORY_MAP } from '@/data/categories';
import { usePersistedList } from '@/hooks/usePersistedList';
import {
  breadcrumbSchema,
  categoryPath,
  faqSchema,
  toolPath,
  webApplicationSchema,
} from '@/seo/schema';
import { Seo } from '@/seo/Seo';
import { recentTools } from '@/services/storage';
import { getTool, getTools, loadToolContent, POPULAR_TOOLS, relatedTools } from '@/tools/registry';
import type { ToolContent, ToolDefinition } from '@/types/tool';
import { NotFoundPage } from './NotFoundPage';

const componentCache = new Map<string, LazyExoticComponent<ComponentType>>();
function lazyTool(tool: ToolDefinition) {
  let c = componentCache.get(tool.slug);
  if (!c) {
    c = lazy(() => tool.load().then((Comp) => ({ default: Comp })));
    componentCache.set(tool.slug, c);
  }
  return c;
}

function ToolSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2" aria-busy="true" aria-label="Loading tool">
      <div className="card h-80 animate-pulse bg-slate-100/60" />
      <div className="card h-80 animate-pulse bg-slate-100/60" />
    </div>
  );
}

function ContentSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-24">
      <h2 id={id} className="mb-3 text-xl">
        {title}
      </h2>
      <div className="prose-tool">{children}</div>
    </section>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((p) => (
        <p key={p}>{p}</p>
      ))}
    </>
  );
}

export function ToolPage() {
  const { slug = '' } = useParams();
  const base = getTool(slug);
  const tool = base;
  const [content, setContent] = useState<ToolContent | undefined>();
  const recent = usePersistedList(recentTools);

  useEffect(() => {
    if (!tool) return;
    let cancelled = false;
    setContent(undefined);
    loadToolContent(tool)
      .then((c) => !cancelled && setContent(c))
      .catch(() => undefined);
    recentTools.push(tool.slug);
    analytics.track('tool_view', { tool: tool.slug, category: tool.category });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool?.slug]);

  const related = useMemo(() => (tool ? relatedTools(tool, 6) : []), [tool]);

  if (!tool || !tool.isActive) return <NotFoundPage />;

  const Comp = lazyTool(tool);
  const category = CATEGORY_MAP[tool.category];
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: category.shortName, path: categoryPath(category.id) },
    { name: tool.name, path: toolPath(tool.slug) },
  ];
  const recentOthers = getTools(recent.filter((s) => s !== tool.slug)).slice(0, 4);
  const popularOthers = POPULAR_TOOLS.filter(
    (t) => t.slug !== tool.slug && !related.some((r) => r.slug === t.slug),
  ).slice(0, 6);
  const faqs = content?.faq ?? [];
  const howToUse = content?.howToUse ?? [
    'Enter your values in the fields above — sensible defaults are pre-filled.',
    'Results update instantly; press the main button to confirm.',
    'Copy or share the result, or use Reset to start again.',
  ];

  return (
    <ToolContext.Provider value={tool}>
      <Seo
        title={tool.seoTitle}
        description={tool.seoDescription}
        path={toolPath(tool.slug)}
        jsonLd={[
          webApplicationSchema(tool, content?.description),
          breadcrumbSchema(crumbs),
          faqSchema(faqs),
        ]}
      />
      <div className="container-page py-6">
        <div>
          <article className="min-w-0">
            <Breadcrumbs items={crumbs} />
            <header className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="mt-1 hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 sm:flex">
                  <ToolIcon name={tool.icon} className="h-6 w-6" />
                </span>
                <div>
                  <h1 className="text-2xl sm:text-3xl">{tool.h1}</h1>
                  <p className="mt-1 max-w-3xl text-slate-600">
                    {content?.description ?? tool.shortDescription}
                  </p>
                  {tool.localOnly && (
                    <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800">
                      <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Runs locally — your
                      input never leaves your device
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <FavoriteButton slug={tool.slug} name={tool.name} />
              </div>
            </header>

            <div className="mt-6">
              <ErrorBoundary>
                <Suspense fallback={<ToolSkeleton />}>
                  <Comp />
                </Suspense>
              </ErrorBoundary>
            </div>

            {tool.disclaimer && (
              <div className="mt-4">
                <Disclaimer kind={tool.disclaimer} />
              </div>
            )}

            <MobileAd className="mt-8" />

            {content && (
              <div className="mt-10 space-y-8 rounded-xl border border-slate-200 bg-white p-4 sm:p-8">
                <ContentSection id="what-is" title={`What is the ${tool.name}?`}>
                  <Paragraphs text={content.whatIs} />
                </ContentSection>
                <ContentSection id="how-it-works" title="How does it work?">
                  <Paragraphs text={content.howItWorks} />
                </ContentSection>
                {content.formula && (
                  <ContentSection id="formula" title="Formula">
                    <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-sm text-slate-800">
                      {content.formula}
                    </pre>
                  </ContentSection>
                )}
                {content.example && (
                  <ContentSection id="example" title="Example">
                    <Paragraphs text={content.example} />
                  </ContentSection>
                )}
                <ContentSection id="how-to-use" title={`How to use the ${tool.name}`}>
                  <ol className="list-decimal space-y-1 pl-5">
                    {howToUse.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </ContentSection>
                {faqs.length > 0 && (
                  <section aria-labelledby="faq">
                    <h2 id="faq" className="mb-3 text-xl">
                      Frequently asked questions
                    </h2>
                    <div className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                      {faqs.map((f) => (
                        <details key={f.q} className="group p-4">
                          <summary className="cursor-pointer list-none font-medium text-slate-900 marker:hidden">
                            <span className="flex items-start justify-between gap-3">
                              {f.q}
                              <span
                                className="text-slate-400 transition-transform group-open:rotate-45"
                                aria-hidden="true"
                              >
                                +
                              </span>
                            </span>
                          </summary>
                          <p className="mt-2 text-slate-700">{f.a}</p>
                        </details>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            <section aria-labelledby="related" className="mt-10">
              <h2 id="related" className="mb-4 text-xl">
                Related tools
              </h2>
              <ToolGrid tools={related} label="Related tools" />
              <p className="mt-4 text-sm">
                <Link
                  to={categoryPath(category.id)}
                  className="font-medium text-brand-700 hover:underline"
                >
                  Browse all {category.name.toLowerCase()} tools →
                </Link>
              </p>
            </section>

            {recentOthers.length > 0 && (
              <section aria-labelledby="recent" className="mt-10">
                <h2 id="recent" className="mb-4 text-xl">
                  Recently used
                </h2>
                <ToolGrid tools={recentOthers} view="list" label="Recently used tools" />
              </section>
            )}

            <section aria-labelledby="popular" className="mt-10">
              <h2 id="popular" className="mb-4 text-xl">
                Popular tools
              </h2>
              <ToolGrid tools={popularOthers} view="list" label="Popular tools" />
            </section>
          </article>
        </div>
      </div>
    </ToolContext.Provider>
  );
}
