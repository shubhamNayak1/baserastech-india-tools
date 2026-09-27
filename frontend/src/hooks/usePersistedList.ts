import { useSyncExternalStore } from 'react';
import type { createPersistedList } from '@/services/storage';

export function usePersistedList(list: ReturnType<typeof createPersistedList>): string[] {
  return useSyncExternalStore(list.subscribe, list.get, list.get);
}
