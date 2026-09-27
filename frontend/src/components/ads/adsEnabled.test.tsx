import { render } from '@testing-library/react';

// Simulates a production build with AdSense configured. The ID below is a test-only dummy, never shipped.
vi.mock('@/config/ads', async (orig) => {
  const actual = await orig<typeof import('@/config/ads')>();
  return {
    ...actual,
    ADS: actual.readAdsConfig({
      VITE_ADSENSE_ENABLED: 'true',
      VITE_ADSENSE_PUBLISHER_ID: 'ca-pub-0000000000000000',
      VITE_ADSENSE_TOP_SLOT: '1000000001',
      VITE_ADSENSE_BOTTOM_SLOT: '1000000002',
      VITE_ADSENSE_LEFT_SLOT: '1000000003',
      VITE_ADSENSE_RIGHT_SLOT: '1000000004',
    }),
  };
});

const { AdLayout } = await import('./AdLayout');
const { AdSense } = await import('./AdSense');

describe('AdSense enabled', () => {
  beforeEach(() => {
    window.adsbygoogle = [];
  });

  it('renders real ad units for top, bottom and both rails and requests each once', () => {
    render(
      <AdLayout routeKey="/tools/emi-calculator">
        <p>content</p>
      </AdLayout>,
    );
    const units = [...document.querySelectorAll('ins.adsbygoogle')];
    expect(units.map((u) => u.getAttribute('data-ad-slot')).sort()).toEqual([
      '1000000001',
      '1000000002',
      '1000000003',
      '1000000004',
    ]);
    expect(units.every((u) => u.getAttribute('data-ad-client') === 'ca-pub-0000000000000000')).toBe(
      true,
    );
    expect(window.adsbygoogle).toHaveLength(4);
    expect(document.querySelectorAll('[data-testid="ad-placeholder"]')).toHaveLength(0);
    // Side rails are desktop-only.
    expect(document.querySelector('[data-ad="left"]')).toHaveClass('hidden', 'min-[1400px]:block');
    expect(document.querySelector('[data-ad="right"]')).toHaveClass('hidden', 'min-[1400px]:block');
  });

  it('uses a vertical format for rails and responsive format for banners', () => {
    const { container, unmount } = render(<AdSense position="left" />);
    expect(container.querySelector('ins')).toHaveAttribute('data-ad-format', 'vertical');
    unmount();
    const top = render(<AdSense position="top" />);
    expect(top.container.querySelector('ins')).toHaveAttribute('data-ad-format', 'auto');
  });
});
