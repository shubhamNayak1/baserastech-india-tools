import { runRegex } from './regex';

self.onmessage = (
  e: MessageEvent<{
    id: number;
    pattern: string;
    flags: string;
    text: string;
    replacement?: string;
  }>,
) => {
  const { id, pattern, flags, text, replacement } = e.data;
  try {
    (self as unknown as Worker).postMessage({
      id,
      ok: true,
      result: runRegex(pattern, flags, text, replacement),
    });
  } catch (err) {
    (self as unknown as Worker).postMessage({
      id,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
