import { ToolGrid } from '@/components/tool/ToolCard';
import { usePersistedList } from '@/hooks/usePersistedList';
import { Seo } from '@/seo/Seo';
import { favoriteTools, recentTools } from '@/services/storage';
import { getTools, POPULAR_TOOLS } from '@/tools/registry';

export function FavoritesPage() {
  const favs = getTools(usePersistedList(favoriteTools));
  const recent = getTools(usePersistedList(recentTools));
  return (
    <div className="container-page py-6">
      <Seo
        title="Your favourite & recent tools"
        description="Your saved and recently used tools."
        path="/favorites"
        noindex
      />
      <h1 className="text-2xl sm:text-3xl">Your tools</h1>
      <p className="mt-1 text-slate-600">
        Saved only in this browser — no account needed, nothing is sent to a server.
      </p>
      <section className="mt-8" aria-labelledby="fav-h">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="fav-h" className="text-lg">
            Favourites ({favs.length})
          </h2>
          {favs.length > 0 && (
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => favoriteTools.clear()}
            >
              Clear all
            </button>
          )}
        </div>
        {favs.length ? (
          <ToolGrid tools={favs} />
        ) : (
          <p className="card p-6 text-slate-600">Tap “Save” on any tool to add it here.</p>
        )}
      </section>
      <section className="mt-10" aria-labelledby="recent-h">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recent-h" className="text-lg">
            Recently used
          </h2>
          {recent.length > 0 && (
            <button type="button" className="btn-ghost btn-sm" onClick={() => recentTools.clear()}>
              Clear history
            </button>
          )}
        </div>
        {recent.length ? (
          <ToolGrid tools={recent} view="list" />
        ) : (
          <p className="card p-6 text-slate-600">Tools you open will appear here.</p>
        )}
      </section>
      {favs.length === 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg">Popular tools to get started</h2>
          <ToolGrid tools={POPULAR_TOOLS.slice(0, 6)} />
        </section>
      )}
    </div>
  );
}
