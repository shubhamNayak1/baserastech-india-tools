import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { ToolPage } from '@/pages/ToolPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const AllToolsPage = lazy(() =>
  import('@/pages/AllToolsPage').then((m) => ({ default: m.AllToolsPage })),
);
const SearchPage = lazy(() =>
  import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
);
const FavoritesPage = lazy(() =>
  import('@/pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
);
const StaticPage = lazy(() =>
  import('@/pages/StaticPage').then((m) => ({ default: m.StaticPage })),
);

const wrap = (node: ReactNode) => (
  <Suspense fallback={<div className="container-page py-10" aria-busy="true" />}>{node}</Suspense>
);

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/tools', element: wrap(<AllToolsPage />) },
      { path: '/tools/:slug', element: <ToolPage /> },
      { path: '/category/:id', element: <CategoryPage /> },
      { path: '/search', element: wrap(<SearchPage />) },
      { path: '/favorites', element: wrap(<FavoritesPage />) },
      { path: '/favourites', element: <Navigate to="/favorites" replace /> },
      { path: '/about', element: wrap(<StaticPage page="about" />) },
      { path: '/privacy-policy', element: wrap(<StaticPage page="privacy" />) },
      { path: '/privacy', element: <Navigate to="/privacy-policy" replace /> },
      { path: '/disclaimer', element: wrap(<StaticPage page="disclaimer" />) },
      { path: '/contact', element: wrap(<StaticPage page="contact" />) },
      { path: '/terms', element: wrap(<StaticPage page="terms" />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes, {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
    },
  });
}
