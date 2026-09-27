import { STATIC_PAGES, type StaticPageKey } from '@/data/staticPages';
import { Seo } from '@/seo/Seo';

export function StaticPage({ page }: { page: StaticPageKey }) {
  const p = STATIC_PAGES[page];
  return (
    <div className="container-page max-w-3xl py-10">
      <Seo title={p.title} description={p.description} path={p.path} />
      <h1 className="text-2xl sm:text-3xl">{p.title}</h1>
      <div className="prose-tool mt-6 space-y-8">
        {p.sections.map((s, i) => (
          <section key={s.heading ?? i} className="space-y-3">
            {s.heading && <h2 className="text-lg">{s.heading}</h2>}
            {s.paragraphs.map((para) => (
              <p key={para}>{para}</p>
            ))}
            {s.links && (
              <ul className="list-disc space-y-1 pl-5">
                {s.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 hover:underline"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
