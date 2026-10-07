import type { GuideSection } from '@/types/tool';

/** Same sections as static HTML, for the prerendered crawler copy of a page. */
export function guideSectionsHtml(sections: GuideSection[], esc: (s: string) => string): string {
  return sections
    .map((s) => {
      const paras = (s.paragraphs ?? []).map((p) => `<p>${esc(p)}</p>`).join('');
      const list = s.list ? `<ul>${s.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
      const table = s.table
        ? `<table><thead><tr>${s.table.head.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${s.table.rows
            .map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`
        : '';
      return `<h2>${esc(s.heading)}</h2>${paras}${list}${table}`;
    })
    .join('');
}
