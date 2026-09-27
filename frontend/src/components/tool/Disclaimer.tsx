import { Info } from 'lucide-react';
import { DISCLAIMERS } from '@/config/site';
import type { DisclaimerKind } from '@/types/tool';

export function Disclaimer({ kind }: { kind: DisclaimerKind }) {
  return (
    <p
      className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
      role="note"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{DISCLAIMERS[kind]}</span>
    </p>
  );
}
