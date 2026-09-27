interface Props {
  minHeight: number;
  width?: number;
  className?: string;
}

/** Shown while AdSense is disabled (development / before approval). Same footprint as the real unit. */
export function AdPlaceholder({ minHeight, width, className = '' }: Props) {
  return (
    <div
      className={`flex w-full items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-100/60 text-xs uppercase tracking-wider text-slate-400 ${className}`}
      style={{ minHeight, maxWidth: width }}
      data-testid="ad-placeholder"
    >
      Advertisement
    </div>
  );
}
