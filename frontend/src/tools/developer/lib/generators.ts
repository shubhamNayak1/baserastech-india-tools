const LOREM =
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum curabitur pretium tincidunt lacus nulla gravida orci a odio nullam varius turpis et commodo pharetra est eros bibendum elit nec luctus magna felis sollicitudin mauris integer in mauris eu nibh euismod gravida duis ac tellus et risus vulputate vehicula donec lobortis risus a elit etiam tempor ut ullamcorper ligula eu tempor congue eros est euismod turpis id tincidunt sapien risus a quam maecenas fermentum consequat mi donec fermentum pellentesque malesuada nulla a mi duis sapien sem aliquet nec commodo eget consequat quis neque aliquam faucibus elit ut dictum aliquet felis nisl adipiscing sapien sed malesuada diam lacus eget erat cras mollis scelerisque nunc nullam arcu aliquam consequat curabitur augue lorem dapibus quis laoreet et pretium ac nisi aenean magna nisl mollis quis molestie eu feugiat in orci in hac habitasse platea dictumst'.split(
    ' ',
  );

export function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const limit = Math.floor(0x1_0000_0000 / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % maxExclusive;
}

function sentence(minW = 6, maxW = 14): string {
  const n = minW + randomInt(maxW - minW + 1);
  const words = Array.from({ length: n }, () => LOREM[randomInt(LOREM.length)]);
  if (n > 8) words[3 + randomInt(n - 6)] += ',';
  const s = words.join(' ');
  return `${s[0].toUpperCase()}${s.slice(1)}.`;
}

export function lorem(
  kind: 'paragraphs' | 'sentences' | 'words',
  count: number,
  startClassic: boolean,
): string {
  const classic = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
  if (kind === 'words') {
    const words = Array.from({ length: count }, (_, i) =>
      startClassic && i < 5
        ? ['lorem', 'ipsum', 'dolor', 'sit', 'amet'][i]
        : LOREM[randomInt(LOREM.length)],
    );
    const s = words.join(' ');
    return s ? `${s[0].toUpperCase()}${s.slice(1)}` : '';
  }
  if (kind === 'sentences') {
    const list = Array.from({ length: count }, () => sentence());
    if (startClassic && count) list[0] = classic;
    return list.join(' ');
  }
  const paras = Array.from({ length: count }, () =>
    Array.from({ length: 4 + randomInt(4) }, () => sentence()).join(' '),
  );
  if (startClassic && count) paras[0] = `${classic} ${paras[0]}`;
  return paras.join('\n\n');
}

export const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>?/~',
};
const AMBIGUOUS = /[Il1O0o|`'"]/g;

export function generatePassword(
  length: number,
  opts: {
    lower: boolean;
    upper: boolean;
    digits: boolean;
    symbols: boolean;
    excludeAmbiguous: boolean;
  },
): string {
  const sets = (Object.keys(CHARSETS) as (keyof typeof CHARSETS)[])
    .filter((k) => opts[k])
    .map((k) => (opts.excludeAmbiguous ? CHARSETS[k].replace(AMBIGUOUS, '') : CHARSETS[k]));
  if (!sets.length) throw new Error('Select at least one character type.');
  if (length < sets.length)
    throw new Error(
      `Length must be at least ${sets.length} to include every selected character type.`,
    );
  const all = sets.join('');
  const chars = sets.map((s) => s[randomInt(s.length)]);
  while (chars.length < length) chars.push(all[randomInt(all.length)]);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

export function passwordEntropy(length: number, poolSize: number): number {
  return poolSize > 0 ? length * Math.log2(poolSize) : 0;
}

export function strengthLabel(bits: number): string {
  if (bits < 40) return 'Weak';
  if (bits < 60) return 'Fair';
  if (bits < 80) return 'Strong';
  return 'Very strong';
}

export function uuidV4(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

/** RFC 9562 UUIDv7: 48-bit Unix ms timestamp + random bits (time-sortable). */
export function uuidV7(now = Date.now()): string {
  const b = crypto.getRandomValues(new Uint8Array(16));
  const ts = BigInt(now);
  for (let i = 0; i < 6; i++) b[i] = Number((ts >> BigInt(8 * (5 - i))) & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
