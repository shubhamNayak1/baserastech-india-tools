import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { analytics } from '@/analytics/AnalyticsService';
import { CommandPalette } from '@/components/search/CommandPalette';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { AdLayout } from '@/components/ads/AdLayout';

export function RootLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    analytics.track('page_view', { path: pathname });
  }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main" className="flex-1" tabIndex={-1}>
        <AdLayout routeKey={pathname}>
          <Outlet />
        </AdLayout>
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}
