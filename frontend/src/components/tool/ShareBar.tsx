import { useState } from 'react';
import { Check, Copy, Link as LinkIcon, MessageCircle, Share2 } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { useToolMeta } from './ToolContext';
import { buildShareText, copyText, currentUrl } from './share';

interface Props {
  /** Lines describing the result, e.g. "Monthly EMI: ₹43,391". */
  lines: string[];
  /** Hide link sharing for tools whose state is not in the URL (e.g. local-only dev tools). */
  compact?: boolean;
}

export function ShareBar({ lines, compact = false }: Props) {
  const meta = useToolMeta();
  const [status, setStatus] = useState<string>('');
  const url = currentUrl();
  const text = buildShareText(meta, lines, url);
  const canWebShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const flash = (msg: string) => {
    setStatus(msg);
    window.setTimeout(() => setStatus(''), 2000);
  };

  const onCopyResult = async () => {
    const ok = await copyText(text);
    flash(ok ? 'Result copied' : 'Copy failed');
    if (ok) analytics.track('result_copied', { tool: meta?.slug });
  };
  const onCopyLink = async () => {
    const ok = await copyText(url);
    flash(ok ? 'Link copied' : 'Copy failed');
    if (ok) analytics.track('result_shared', { tool: meta?.slug, channel: 'link' });
  };
  const onShare = async () => {
    try {
      await navigator.share({ title: meta?.name, text, url });
      analytics.track('result_shared', { tool: meta?.slug, channel: 'native' });
    } catch {
      /* user cancelled */
    }
  };
  const waHref = `https://wa.me/?text=${encodeURIComponent(text)}`;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Share result">
      <button type="button" className="btn-secondary btn-sm" onClick={onCopyResult}>
        <Copy className="h-4 w-4" aria-hidden="true" /> Copy result
      </button>
      {canWebShare && (
        <button type="button" className="btn-secondary btn-sm" onClick={onShare}>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Share
        </button>
      )}
      <a
        className="btn-secondary btn-sm"
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => analytics.track('result_shared', { tool: meta?.slug, channel: 'whatsapp' })}
      >
        <MessageCircle className="h-4 w-4 text-green-600" aria-hidden="true" /> WhatsApp
      </a>
      {!compact && (
        <button type="button" className="btn-secondary btn-sm" onClick={onCopyLink}>
          <LinkIcon className="h-4 w-4" aria-hidden="true" /> Copy link
        </button>
      )}
      <span
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-1 text-sm text-green-700"
      >
        {status && <Check className="h-4 w-4" aria-hidden="true" />}
        {status}
      </span>
    </div>
  );
}
