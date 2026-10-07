import type { GuideSection } from '@/types/tool';

/** Renders long-form guide or article sections: heading, paragraphs, bullet list and table. */
export function GuideSections({
  sections,
  idPrefix,
}: {
  sections: GuideSection[];
  idPrefix: string;
}) {
  return (
    <>
      {sections.map((s, i) => {
        const id = `${idPrefix}-${i}`;
        return (
          <section key={s.heading} aria-labelledby={id} className="scroll-mt-24">
            <h2 id={id} className="mb-3 text-xl">
              {s.heading}
            </h2>
            <div className="prose-tool space-y-3">
              {s.paragraphs?.map((p) => (
                <p key={p}>{p}</p>
              ))}
              {s.list && (
                <ul className="list-disc space-y-1 pl-5">
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {s.table && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr>
                        {s.table.head.map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className="border-b border-slate-300 px-3 py-2 font-semibold"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {s.table.rows.map((row) => (
                        <tr key={row.join('|')} className="border-b border-slate-200">
                          {row.map((cell, j) => (
                            <td key={j} className="px-3 py-2 align-top">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </>
  );
}
