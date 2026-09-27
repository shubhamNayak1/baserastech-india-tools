import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SearchCombobox } from '@/components/search/SearchCombobox';
import { ToolGrid } from '@/components/tool/ToolCard';
import { ToolIcon } from '@/components/ui/icons';
import { CATEGORIES } from '@/data/categories';
import { SITE } from '@/config/site';
import { usePersistedList } from '@/hooks/usePersistedList';
import { POPULAR_SEARCHES } from '@/search';
import { organizationSchema, websiteSchema } from '@/seo/schema';
import { Seo } from '@/seo/Seo';
import { recentTools } from '@/services/storage';
import {
  ACTIVE_TOOLS,
  FEATURED_TOOLS,
  getTools,
  recentlyAddedTools,
  toolsInCategory,
} from '@/tools/registry';

function Section({
  id,
  title,
  link,
  children,
}: {
  id: string;
  title: string;
  link?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id={id} className="text-xl sm:text-2xl">
          {title}
        </h2>
        {link && (
          <Link
            to={link.to}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
          >
            {link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const tools = ACTIVE_TOOLS;
  const popular = tools.filter((t) => t.isPopular).slice(0, 9);
  const featured = FEATURED_TOOLS.slice(0, 6);
  const recent = getTools(usePersistedList(recentTools)).slice(0, 6);

  return (
    <>
      <Seo
        title={`${SITE.name} – Free Online Calculators & Tools for India`}
        description={`${ACTIVE_TOOLS.length}+ free online calculators and tools for India: EMI, SIP, GST, income tax, salary, BMI, age, unit converters, JSON formatter and more. Instant results, no sign-up.`}
        path="/"
        jsonLd={[websiteSchema(), organizationSchema()]}
      />
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page py-10 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
            {SITE.name}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl sm:text-5xl">
            Free Online Calculators &amp; Tools
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-600">
            Calculate, convert and generate useful results instantly.
          </p>
          <div className="mt-6 max-w-2xl">
            <SearchCombobox variant="hero" />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Popular searches">
            <span className="text-sm text-slate-500">Popular:</span>
            {POPULAR_SEARCHES.map((q) => (
              <button
                key={q}
                type="button"
                className="chip"
                onClick={() => navigate(`/search?q=${encodeURIComponent(q)}`)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page">
        {recent.length > 0 && (
          <Section
            id="recently-used"
            title="Recently used"
            link={{ to: '/favorites', label: 'Your tools' }}
          >
            <ToolGrid tools={recent} view="list" />
          </Section>
        )}

        <Section
          id="popular-tools"
          title="Popular tools"
          link={{ to: '/tools?sort=popular', label: 'View all' }}
        >
          <ToolGrid tools={popular} />
        </Section>

        <Section
          id="categories"
          title="Browse by category"
          link={{ to: '/tools', label: `All ${ACTIVE_TOOLS.length} tools` }}
        >
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => {
              const list = toolsInCategory(c.id);
              return (
                <li key={c.id} className="card relative p-4 hover:border-brand-300">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                      <ToolIcon name={c.icon} />
                    </span>
                    <div>
                      <h3 className="text-base">
                        <Link
                          to={`/category/${c.id}`}
                          className="after:absolute after:inset-0 hover:text-brand-700"
                        >
                          {c.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-slate-500">{list.length} tools</p>
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {list
                      .slice(0, 4)
                      .map((t) => t.name.replace(/ Calculator$/, ''))
                      .join(' · ')}
                  </p>
                </li>
              );
            })}
          </ul>
        </Section>

        <Section id="featured-tools" title="Featured tools">
          <ToolGrid tools={featured} view="list" />
        </Section>

        <Section
          id="financial-tools"
          title="Financial calculators"
          link={{ to: '/category/finance', label: 'All finance tools' }}
        >
          <ToolGrid tools={toolsInCategory('finance').slice(0, 6)} showCategory={false} />
        </Section>

        <Section
          id="developer-tools"
          title="Developer tools"
          link={{ to: '/category/developer', label: 'All developer tools' }}
        >
          <ToolGrid tools={toolsInCategory('developer').slice(0, 6)} showCategory={false} />
        </Section>

        <Section
          id="recently-added"
          title="Recently added"
          link={{ to: '/tools?sort=new', label: 'See more' }}
        >
          <ToolGrid tools={recentlyAddedTools(6)} view="list" />
        </Section>

        <section
          className="mt-12 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
          aria-labelledby="why"
        >
          <h2 id="why" className="text-xl">
            Why use {SITE.name}?
          </h2>
          <ul className="mt-4 grid gap-4 text-sm text-slate-700 sm:grid-cols-3">
            <li>
              <strong className="block text-slate-900">Built for India</strong>
              Rupee formatting in lakh and crore, Indian tax rules by financial year, GST, PF,
              gratuity and Indian units like bigha and tola.
            </li>
            <li>
              <strong className="block text-slate-900">Private by design</strong>
              Calculations run in your browser. We don’t store what you type, and there is no
              sign-up.
            </li>
            <li>
              <strong className="block text-slate-900">Explained, not just answered</strong>
              Every tool shows the formula, a worked example and answers to common questions.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
