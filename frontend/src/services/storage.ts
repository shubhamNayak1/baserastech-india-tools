/** Safe localStorage wrapper: never throws (private mode, quota, SSR). */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      globalThis.localStorage?.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable – feature degrades gracefully */
    }
  },
  remove(key: string): void {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

type Listener = () => void;

/**
 * Tiny observable list persisted to localStorage, usable with useSyncExternalStore.
 * Used for recent tools, favourites and recent searches.
 */
export function createPersistedList(key: string, max: number) {
  let cache: string[] | null = null;
  const listeners = new Set<Listener>();
  const read = (): string[] => {
    if (cache === null) {
      const v = storage.get<unknown>(key, []);
      cache = Array.isArray(v)
        ? v.filter((x): x is string => typeof x === 'string').slice(0, max)
        : [];
    }
    return cache;
  };
  const write = (next: string[]) => {
    cache = next.slice(0, max);
    storage.set(key, cache);
    listeners.forEach((l) => l());
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        cache = null;
        listeners.forEach((l) => l());
      }
    });
  }
  return {
    get: read,
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    push(item: string) {
      write([item, ...read().filter((x) => x !== item)]);
    },
    remove(item: string) {
      write(read().filter((x) => x !== item));
    },
    toggle(item: string): boolean {
      const has = read().includes(item);
      if (has) write(read().filter((x) => x !== item));
      else write([item, ...read()]);
      return !has;
    },
    has(item: string) {
      return read().includes(item);
    },
    replace(items: string[]) {
      write(items);
    },
    clear() {
      write([]);
    },
    /** test helper */
    _reset() {
      cache = null;
    },
  };
}

export const recentTools = createPersistedList('baserastech_recent_tools', 12);
export const favoriteTools = createPersistedList('baserastech_favorite_tools', 200);
export const recentSearches = createPersistedList('baserastech_recent_searches', 8);
