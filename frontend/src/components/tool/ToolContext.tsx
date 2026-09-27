import { createContext, useContext } from 'react';
import type { ToolMeta } from '@/types/tool';

export const ToolContext = createContext<ToolMeta | null>(null);

export function useToolMeta(): ToolMeta | null {
  return useContext(ToolContext);
}
