import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SearchCombobox } from './SearchCombobox';

type Listener = (open: boolean) => void;
const listeners = new Set<Listener>();

/** Open the global tool search from anywhere. */
export function openCommandPalette() {
  listeners.forEach((l) => l(true));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const restoreRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const show = useCallback((v: boolean) => {
    if (v) restoreRef.current = document.activeElement as HTMLElement | null;
    setOpen(v);
  }, []);

  useEffect(() => {
    listeners.add(show);
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        show(true);
      } else if (e.key === '/' && !typing) {
        e.preventDefault();
        show(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      listeners.delete(show);
      window.removeEventListener('keydown', onKey);
    };
  }, [show]);

  useEffect(() => {
    if (!open) {
      restoreRef.current?.focus?.();
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>(
          'input, button, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 p-0 sm:p-4 sm:pt-[10vh]"
      onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search tools"
        className="h-full w-full max-w-2xl overflow-hidden bg-white p-4 shadow-2xl sm:h-auto sm:rounded-2xl"
      >
        <div className="mb-2 flex items-center justify-between sm:hidden">
          <span className="font-medium">Search tools</span>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <SearchCombobox
          variant="palette"
          autoFocus
          showCategoryFilters
          onNavigate={() => setOpen(false)}
        />
      </div>
    </div>,
    document.body,
  );
}
