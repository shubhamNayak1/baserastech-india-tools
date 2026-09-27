import { render, screen } from '@testing-library/react';
import { readAdsConfig } from '@/config/ads';
import { AdLayout } from './AdLayout';
import { loadAdSenseScript, ADSENSE_SCRIPT_ID } from './adsenseLoader';

describe('AdSense configuration', () => {
  it('is disabled by default and when the publisher ID is missing or malformed', () => {
    expect(readAdsConfig({}).enabled).toBe(false);
    expect(readAdsConfig({ VITE_ADSENSE_ENABLED: 'true' }).enabled).toBe(false);
    expect(
      readAdsConfig({ VITE_ADSENSE_ENABLED: 'true', VITE_ADSENSE_PUBLISHER_ID: 'pub-123' }).enabled,
    ).toBe(false);
  });
  it('enables with a well-formed publisher ID and maps slots', () => {
    const c = readAdsConfig({
      VITE_ADSENSE_ENABLED: 'true',
      VITE_ADSENSE_PUBLISHER_ID: 'ca-pub-0000000000000000',
      VITE_ADSENSE_TOP_SLOT: '111',
      VITE_ADSENSE_LEFT_SLOT: '222',
    });
    expect(c.enabled).toBe(true);
    expect(c.slots).toMatchObject({ top: '111', left: '222', bottom: '', mobile: '111' });
  });
});

describe('global AdSense script loader', () => {
  it('loads nothing when disabled', () => {
    expect(loadAdSenseScript(readAdsConfig({}), document)).toBe(false);
    expect(document.getElementById(ADSENSE_SCRIPT_ID)).toBeNull();
  });
  it('adds the script exactly once when enabled', () => {
    const cfg = readAdsConfig({
      VITE_ADSENSE_ENABLED: 'true',
      VITE_ADSENSE_PUBLISHER_ID: 'ca-pub-0000000000000000',
    });
    loadAdSenseScript(cfg, document);
    loadAdSenseScript(cfg, document);
    const scripts = document.querySelectorAll(`#${ADSENSE_SCRIPT_ID}`);
    expect(scripts).toHaveLength(1);
    expect(scripts[0].getAttribute('src')).toBe(
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000',
    );
    scripts[0].remove();
  });
});

describe('ad layout', () => {
  it('renders placeholders for top, bottom and both rails around the content', () => {
    render(
      <AdLayout routeKey="/x">
        <p>Tool content</p>
      </AdLayout>,
    );
    expect(screen.getByText('Tool content')).toBeInTheDocument();
    expect(screen.getAllByTestId('ad-placeholder')).toHaveLength(4);
    for (const pos of ['top', 'bottom', 'left', 'right'])
      expect(document.querySelector(`[data-ad="${pos}"]`)).not.toBeNull();
    // Rails are hidden below the wide-desktop breakpoint.
    expect(document.querySelector('[data-ad="left"]')).toHaveClass('hidden');
  });
});

describe('build-time AdSense head tags', () => {
  it('are empty when disabled and include script + meta when enabled', async () => {
    const { adsenseHeadHtml } = await import('./adsenseHead');
    expect(adsenseHeadHtml(readAdsConfig({}))).toBe('');
    const html = adsenseHeadHtml(
      readAdsConfig({
        VITE_ADSENSE_ENABLED: 'true',
        VITE_ADSENSE_PUBLISHER_ID: 'ca-pub-0000000000000000',
      }),
    );
    expect(html).toContain(
      '<meta name="google-adsense-account" content="ca-pub-0000000000000000" />',
    );
    expect(html).toContain(
      'src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000" crossorigin="anonymous"',
    );
  });
});
