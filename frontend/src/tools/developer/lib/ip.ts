export interface Ipv4Info {
  version: 4;
  address: string;
  prefix: number | null;
  type: string;
  binary: string;
  integer: number;
  network?: {
    network: string;
    broadcast: string;
    mask: string;
    wildcard: string;
    firstHost: string;
    lastHost: string;
    hosts: number;
    total: number;
  };
}

export interface Ipv6Info {
  version: 6;
  address: string;
  expanded: string;
  compressed: string;
  prefix: number | null;
  type: string;
}

const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.');

export function parseIpv4(s: string): number | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  if (parts.some((p, i) => p > 255 || (m[i + 1].length > 1 && m[i + 1].startsWith('0'))))
    return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function ipv4Type(n: number): string {
  const a = n >>> 24;
  const b = (n >>> 16) & 255;
  if (n === 0) return 'Unspecified (0.0.0.0)';
  if (a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168))
    return 'Private (RFC 1918)';
  if (a === 127) return 'Loopback';
  if (a === 169 && b === 254) return 'Link-local (APIPA)';
  if (a === 100 && b >= 64 && b <= 127) return 'Carrier-grade NAT (shared address space)';
  if (a >= 224 && a <= 239) return 'Multicast';
  if (n === 0xffffffff) return 'Broadcast';
  if (a >= 240) return 'Reserved';
  if (
    (a === 192 && b === 0 && ((n >>> 8) & 255) === 2) ||
    (a === 198 && b === 51) ||
    (a === 203 && b === 0)
  )
    return 'Documentation (TEST-NET)';
  return 'Public';
}

function expandIpv6(s: string): number[] | null {
  let str = s.toLowerCase();
  const zone = str.indexOf('%');
  if (zone >= 0) str = str.slice(0, zone);
  let tail: number[] = [];
  const v4 = /(\d+\.\d+\.\d+\.\d+)$/.exec(str);
  if (v4) {
    const n = parseIpv4(v4[1]);
    if (n === null) return null;
    tail = [n >>> 16, n & 0xffff];
    str = str.slice(0, str.length - v4[1].length);
    if (!str.endsWith('::')) {
      if (!str.endsWith(':')) return null;
      str = str.slice(0, -1);
    }
  }
  const halves = str.split('::');
  if (halves.length > 2) return null;
  const parse = (h: string) =>
    (h ? h.split(':') : []).map((g) => (/^[0-9a-f]{1,4}$/.test(g) ? parseInt(g, 16) : NaN));
  const head = parse(halves[0]);
  const rest = halves.length === 2 ? parse(halves[1]) : [];
  const groupsNeeded = 8 - tail.length;
  if (head.some(Number.isNaN) || rest.some(Number.isNaN)) return null;
  let groups: number[];
  if (halves.length === 2) {
    const fill = groupsNeeded - head.length - rest.length;
    if (fill < 1) return null;
    groups = [...head, ...Array(fill).fill(0), ...rest];
  } else {
    if (head.length !== groupsNeeded) return null;
    groups = head;
  }
  return [...groups, ...tail];
}

function compress(groups: number[]): string {
  let bestStart = -1;
  let bestLen = 0;
  for (let i = 0; i < 8;) {
    if (groups[i] === 0) {
      let j = i;
      while (j < 8 && groups[j] === 0) j++;
      if (j - i > bestLen && j - i > 1) {
        bestStart = i;
        bestLen = j - i;
      }
      i = j;
    } else i++;
  }
  const hex = groups.map((g) => g.toString(16));
  if (bestStart < 0) return hex.join(':');
  return `${hex.slice(0, bestStart).join(':')}::${hex.slice(bestStart + bestLen).join(':')}`;
}

function ipv6Type(g: number[]): string {
  if (g.every((x) => x === 0)) return 'Unspecified (::)';
  if (g.slice(0, 7).every((x) => x === 0) && g[7] === 1) return 'Loopback (::1)';
  if ((g[0] & 0xffc0) === 0xfe80) return 'Link-local';
  if ((g[0] & 0xfe00) === 0xfc00) return 'Unique local (private)';
  if ((g[0] & 0xff00) === 0xff00) return 'Multicast';
  if (g[0] === 0x2001 && g[1] === 0x0db8) return 'Documentation';
  if (g.slice(0, 5).every((x) => x === 0) && g[5] === 0xffff) return 'IPv4-mapped';
  if ((g[0] & 0xe000) === 0x2000) return 'Global unicast (public)';
  return 'Reserved';
}

export function analyzeIp(input: string): Ipv4Info | Ipv6Info {
  const s = input.trim();
  if (!s) throw new Error('Enter an IPv4 or IPv6 address.');
  const [addr, prefStr] = s.split('/');
  const prefix = prefStr === undefined ? null : Number(prefStr);
  const v4 = parseIpv4(addr);
  if (v4 !== null) {
    if (prefix !== null && !(Number.isInteger(prefix) && prefix >= 0 && prefix <= 32))
      throw new Error('IPv4 prefix length must be between 0 and 32.');
    const info: Ipv4Info = {
      version: 4,
      address: addr,
      prefix,
      type: ipv4Type(v4),
      binary: [24, 16, 8, 0]
        .map((sh) => ((v4 >>> sh) & 255).toString(2).padStart(8, '0'))
        .join('.'),
      integer: v4,
    };
    if (prefix !== null) {
      const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
      const network = (v4 & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;
      const total = 2 ** (32 - prefix);
      const usable = prefix >= 31 ? total : total - 2;
      info.network = {
        network: intToIp(network),
        broadcast: intToIp(broadcast),
        mask: intToIp(mask),
        wildcard: intToIp(~mask >>> 0),
        firstHost: intToIp(prefix >= 31 ? network : network + 1),
        lastHost: intToIp(prefix >= 31 ? broadcast : broadcast - 1),
        hosts: usable,
        total,
      };
    }
    return info;
  }
  const g = expandIpv6(addr);
  if (g && g.length === 8) {
    if (prefix !== null && !(Number.isInteger(prefix) && prefix >= 0 && prefix <= 128))
      throw new Error('IPv6 prefix length must be between 0 and 128.');
    return {
      version: 6,
      address: addr,
      expanded: g.map((x) => x.toString(16).padStart(4, '0')).join(':'),
      compressed: compress(g),
      prefix,
      type: ipv6Type(g),
    };
  }
  throw new Error(`“${s}” is not a valid IPv4 or IPv6 address.`);
}
