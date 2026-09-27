import { env } from '@/config/site';
import type {
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsProps,
  AnalyticsProvider,
} from './events';

const MAX_QUERY_LEN = 60;

/** Strip anything that could carry personal data before an event leaves the page. */
export function sanitizeProps(props: AnalyticsProps): AnalyticsProps {
  const out: AnalyticsProps = {};
  if (props.tool) out.tool = props.tool.slice(0, 80);
  if (props.category) out.category = props.category.slice(0, 40);
  if (props.channel) out.channel = props.channel.slice(0, 20);
  if (props.path) out.path = props.path.split('?')[0].slice(0, 120);
  if (typeof props.results === 'number') out.results = props.results;
  if (typeof props.position === 'number') out.position = props.position;
  if (props.query) {
    // Search queries: lowercase, drop digit sequences that could be phone numbers or amounts.
    out.query = props.query
      .toLowerCase()
      .replace(/\d{4,}/g, '#')
      .replace(/[^\p{L}\p{N}\s#.-]/gu, '')
      .trim()
      .slice(0, MAX_QUERY_LEN);
  }
  return out;
}

type Gtag = (...args: unknown[]) => void;

/**
 * Google Analytics 4 via gtag.js. The script is loaded once, on first use, only when
 * VITE_GOOGLE_ANALYTICS_ID is configured. Events never include calculator inputs.
 */
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  readonly id = 'ga4';
  private gtag: Gtag | null = null;

  constructor(private readonly measurementId: string) {}

  private ensureLoaded(): Gtag | null {
    if (this.gtag) return this.gtag;
    if (typeof window === 'undefined' || typeof document === 'undefined') return null;
    const w = window as unknown as { dataLayer: unknown[]; gtag?: Gtag };
    w.dataLayer = w.dataLayer || [];
    w.gtag = function gtag() {
      // gtag.js expects the Arguments object itself.
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', this.measurementId, { send_page_view: false });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(this.measurementId)}`;
    document.head.appendChild(s);
    this.gtag = w.gtag;
    return this.gtag;
  }

  track(event: AnalyticsEvent) {
    const gtag = this.ensureLoaded();
    if (!gtag) return;
    if (event.name === 'page_view') gtag('event', 'page_view', { page_path: event.props.path });
    else gtag('event', event.name, event.props);
  }
}

export class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private enabled = true;

  register(provider: AnalyticsProvider) {
    this.providers.push(provider);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  get isActive() {
    return this.enabled && this.providers.length > 0;
  }

  track(name: AnalyticsEventName, props: AnalyticsProps = {}) {
    if (!this.enabled) return;
    const event: AnalyticsEvent = { name, props: sanitizeProps(props), ts: Date.now() };
    for (const p of this.providers) {
      try {
        p.track(event);
      } catch {
        /* isolate provider failures */
      }
    }
  }
}

const GA_ID = /^G-[A-Z0-9]{4,20}$/;

/** Disabled (no providers) unless a valid GA4 measurement ID is configured. */
export function createAnalytics(
  source: Record<string, string | undefined> = env,
): AnalyticsService {
  const service = new AnalyticsService();
  const id = source.VITE_GOOGLE_ANALYTICS_ID?.trim() ?? '';
  if (source.MODE === 'test' || !GA_ID.test(id)) return service;
  const nav =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { globalPrivacyControl?: boolean })
      : undefined;
  // Respect Do Not Track / Global Privacy Control.
  if (nav?.doNotTrack === '1' || nav?.globalPrivacyControl) return service;
  service.register(new GoogleAnalyticsProvider(id));
  return service;
}

export const analytics = createAnalytics();
