import { AnalyticsService, createAnalytics, sanitizeProps } from './AnalyticsService';
import type { AnalyticsEvent } from './events';

describe('AnalyticsService', () => {
  it('fans out sanitized events to providers', () => {
    const svc = new AnalyticsService();
    const seen: AnalyticsEvent[] = [];
    svc.register({ id: 'test', track: (e) => seen.push(e) });
    svc.track('search_completed', { query: 'EMI for 9876543210 <b>', results: 3 });
    expect(seen).toHaveLength(1);
    expect(seen[0].props.query).toBe('emi for # b');
    expect(seen[0].props.results).toBe(3);
  });
  it('can be disabled and isolates failing providers', () => {
    const svc = new AnalyticsService();
    const seen: string[] = [];
    svc.register({
      id: 'bad',
      track: () => {
        throw new Error('x');
      },
    });
    svc.register({ id: 'ok', track: (e) => seen.push(e.name) });
    svc.track('tool_view', { tool: 'emi-calculator' });
    svc.setEnabled(false);
    svc.track('tool_view', { tool: 'emi-calculator' });
    expect(seen).toEqual(['tool_view']);
  });
  it('strips query strings from paths', () => {
    expect(sanitizeProps({ path: '/tools/emi?p=5000000' }).path).toBe('/tools/emi');
  });
  it('is disabled without a valid GA4 measurement ID and never loads a script', () => {
    expect(createAnalytics({}).isActive).toBe(false);
    expect(createAnalytics({ VITE_GOOGLE_ANALYTICS_ID: 'not-an-id' }).isActive).toBe(false);
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
  });
  it('registers GA4 when configured and loads gtag once on first event', () => {
    const svc = createAnalytics({ VITE_GOOGLE_ANALYTICS_ID: 'G-TEST12345' });
    expect(svc.isActive).toBe(true);
    svc.track('tool_view', { tool: 'emi-calculator' });
    svc.track('page_view', { path: '/tools/emi-calculator' });
    expect(
      document.querySelectorAll('script[src*="googletagmanager.com/gtag/js?id=G-TEST12345"]'),
    ).toHaveLength(1);
    const dl = (window as unknown as { dataLayer: IArguments[] }).dataLayer;
    expect(Array.from(dl.at(-1)!)).toEqual([
      'event',
      'page_view',
      { page_path: '/tools/emi-calculator' },
    ]);
  });
});
