import { Heart } from 'lucide-react';
import { analytics } from '@/analytics/AnalyticsService';
import { usePersistedList } from '@/hooks/usePersistedList';
import { favoriteTools } from '@/services/storage';

export function FavoriteButton({ slug, name }: { slug: string; name: string }) {
  const favs = usePersistedList(favoriteTools);
  const active = favs.includes(slug);
  return (
    <button
      type="button"
      className={`btn-secondary btn-sm ${active ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : ''}`}
      aria-pressed={active}
      onClick={() => {
        const added = favoriteTools.toggle(slug);
        analytics.track(added ? 'favorite_added' : 'favorite_removed', { tool: slug });
      }}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-current' : ''}`} aria-hidden="true" />
      {active ? 'Saved' : 'Save'}
      <span className="sr-only"> {name} to favourites</span>
    </button>
  );
}
