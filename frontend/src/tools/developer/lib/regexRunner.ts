import { runRegex, type RegexOutput } from './regex';

const TIMEOUT_MS = 1500;

/**
 * Run a regex in a Web Worker so a catastrophic-backtracking pattern cannot freeze the page.
 * Falls back to the main thread where workers are unavailable (tests, very old browsers).
 */
export function runRegexSafely(
  pattern: string,
  flags: string,
  text: string,
  replacement?: string,
): Promise<RegexOutput> {
  if (typeof Worker === 'undefined')
    return Promise.resolve().then(() => runRegex(pattern, flags, text, replacement));
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./regex.worker.ts', import.meta.url), { type: 'module' });
    const timer = setTimeout(() => {
      worker.terminate();
      reject(
        new Error(
          `The pattern took longer than ${TIMEOUT_MS / 1000}s and was stopped. It may cause catastrophic backtracking — try simplifying nested quantifiers like (a+)+.`,
        ),
      );
    }, TIMEOUT_MS);
    worker.onmessage = (e: MessageEvent<{ ok: boolean; result?: RegexOutput; error?: string }>) => {
      clearTimeout(timer);
      worker.terminate();
      if (e.data.ok && e.data.result) resolve(e.data.result);
      else reject(new Error(e.data.error ?? 'Regex failed.'));
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      reject(new Error('The regex could not be evaluated.'));
    };
    worker.postMessage({ id: 1, pattern, flags, text, replacement });
  });
}
