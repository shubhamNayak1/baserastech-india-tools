export interface RegexMatch {
  index: number;
  match: string;
  groups: (string | undefined)[];
  named: Record<string, string | undefined>;
}

export interface RegexOutput {
  matches: RegexMatch[];
  replaced?: string;
  truncated: boolean;
}

export const MAX_MATCHES = 1000;

export function runRegex(
  pattern: string,
  flags: string,
  text: string,
  replacement?: string,
): RegexOutput {
  if (!pattern) throw new Error('Enter a regular expression.');
  if (!/^[dgimsuyv]*$/.test(flags) || new Set(flags).size !== flags.length)
    throw new Error('Flags may only contain d, g, i, m, s, u, v and y, each once.');
  let re: RegExp;
  try {
    re = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
  } catch (e) {
    throw new Error(
      e instanceof Error
        ? e.message.replace(/^Invalid regular expression: /, '')
        : 'Invalid regular expression.',
    );
  }
  const matches: RegexMatch[] = [];
  let truncated = false;
  for (const m of text.matchAll(re)) {
    matches.push({
      index: m.index ?? 0,
      match: m[0],
      groups: m.slice(1),
      named: { ...(m.groups ?? {}) },
    });
    if (!flags.includes('g')) break;
    if (matches.length >= MAX_MATCHES) {
      truncated = true;
      break;
    }
  }
  let replaced: string | undefined;
  if (replacement !== undefined) {
    const r2 = new RegExp(pattern, flags);
    replaced = text.replace(r2, replacement);
  }
  return { matches, replaced, truncated };
}
