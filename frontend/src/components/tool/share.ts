import { SITE } from '@/config/site';
import type { ToolMeta } from '@/types/tool';

export function shareIntro(meta: ToolMeta | null): string {
  if (!meta) return `I used ${SITE.name}.`;
  const calc = /calculator|checker|countdown/i.test(meta.name);
  if (calc)
    return `I calculated my ${meta.shareSubject ?? meta.name.replace(/ Calculator$/, '')} using ${SITE.name}.`;
  return `I used the ${meta.name} on ${SITE.name}.`;
}

export function buildShareText(meta: ToolMeta | null, resultLines: string[], url: string): string {
  const lines = [shareIntro(meta)];
  if (resultLines.length) lines.push('', ...resultLines);
  lines.push('', url);
  return lines.join('\n');
}

export function currentUrl(): string {
  if (typeof window === 'undefined') return SITE.url;
  return window.location.href;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy approach */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
