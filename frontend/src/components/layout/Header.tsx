import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Heart, LayoutGrid, Menu, Search, X } from 'lucide-react';
import { CATEGORIES } from '@/data/categories';
import { ToolIcon } from '@/components/ui/icons';
import { openCommandPalette } from '@/components/search/CommandPalette';
import { usePersistedList } from '@/hooks/usePersistedList';
import { favoriteTools } from '@/services/storage';
import { ACTIVE_TOOLS } from '@/tools/registry';

function isMac() {
  return (
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
  );
}

export function Logo() {
  return (
    <Link
      to="/"
      className="flex shrink-0 items-center gap-2"
      aria-label="BASERASTECH India Tools – home"
    >
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white"
        aria-hidden="true"
      >
        B
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold tracking-wide text-slate-900">BASERASTECH</span>
        <span className="block text-xs font-medium text-slate-500">India Tools</span>
      </span>
    </Link>
  );
}

function SearchTrigger({ className = '' }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className={`flex h-11 w-full items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 text-left text-slate-500 shadow-sm hover:border-brand-400 ${className}`}
      aria-label="Search tools"
      aria-keyshortcuts={isMac() ? 'Meta+K' : 'Control+K'}
    >
      <Search className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">Search {ACTIVE_TOOLS.length}+ calculators & tools…</span>
      <span className="hidden gap-1 sm:flex" aria-hidden="true">
        <kbd className="kbd">{isMac() ? '⌘' : 'Ctrl'}</kbd>
        <kbd className="kbd">K</kbd>
      </span>
    </button>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const favs = usePersistedList(favoriteTools);
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />
        {!isHome && <SearchTrigger className="mx-auto hidden max-w-xl md:flex" />}
        {isHome && <div className="hidden flex-1 md:block" />}
        <nav aria-label="Primary" className="ml-auto flex items-center gap-1">
          <NavLink
            to="/tools"
            end
            className={({ isActive }) =>
              `btn-ghost btn-sm hidden whitespace-nowrap sm:inline-flex ${isActive ? 'text-brand-700' : ''}`
            }
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" /> All tools
          </NavLink>
          <NavLink
            to="/favorites"
            className="btn-ghost btn-sm"
            aria-label={`Favourites (${favs.length})`}
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            <span className="hidden lg:inline">Favourites</span>
            {favs.length > 0 && (
              <span className="rounded-full bg-brand-100 px-1.5 text-xs text-brand-800">
                {favs.length}
              </span>
            )}
          </NavLink>
          <button
            type="button"
            className="btn-ghost btn-sm md:hidden"
            aria-label="Search tools"
            onClick={openCommandPalette}
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            aria-expanded={menuOpen}
            aria-controls="category-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
            <span className="hidden lg:inline">Categories</span>
            <span className="sr-only lg:hidden">Categories menu</span>
          </button>
        </nav>
      </div>
      {!isHome && (
        <div className="container-page pb-3 md:hidden">
          <SearchTrigger />
        </div>
      )}
      {menuOpen && (
        <div id="category-menu" className="border-t border-slate-200 bg-white">
          <ul className="container-page grid grid-cols-2 gap-1 py-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/category/${c.id}`}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <ToolIcon name={c.icon} className="h-4 w-4 text-brand-600" /> {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/tools"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-brand-700 hover:bg-slate-100"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" /> All tools
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
