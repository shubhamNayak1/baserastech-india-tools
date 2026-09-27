import { webcrypto } from 'node:crypto';
import {
  base64Decode,
  base64Encode,
  htmlDecode,
  htmlEncode,
  urlDecode,
  urlEncode,
  utf8Encode,
} from './encoding';
import { md5 } from './md5';
import { hashText } from './hash';
import { decodeJwt, signJwt, verifyJwt } from './jwt';
import { formatJson, minifyJson, parseJson, jsonStats, highlightJson } from './json';
import { formatXml, parseXml } from './xml';
import { minifySql } from './sql';
import { nextRuns, parseCron } from './cron';
import { contrastRatio, parseColor, rgbToCmyk, rgbToHsl, toHexString } from './color';
import { parseUserAgent } from './ua';
import { analyzeIp } from './ip';
import { generatePassword, lorem, uuidV4, uuidV7 } from './generators';
import { runRegex } from './regex';

if (!globalThis.crypto?.subtle) Object.defineProperty(globalThis, 'crypto', { value: webcrypto });

describe('encoding', () => {
  it('base64 round-trips unicode', () => {
    expect(base64Encode('Hello')).toBe('SGVsbG8=');
    expect(base64Encode('नमस्ते ₹')).toBe('4KSo4KSu4KS44KWN4KSk4KWHIOKCuQ==');
    expect(base64Decode('4KSo4KSu4KS44KWN4KSk4KWHIOKCuQ==').text).toBe('नमस्ते ₹');
    expect(base64Encode('??>', true)).toBe('Pz8-');
    expect(base64Decode('Pz8-').text).toBe('??>');
    expect(() => base64Decode('abc$')).toThrow('not valid Base64');
    expect(base64Decode('/w==').text).toBeNull();
  });
  it('URL encodes components, URIs and forms', () => {
    expect(urlEncode('a b&c=d/é', 'component')).toBe('a%20b%26c%3Dd%2F%C3%A9');
    expect(urlEncode('https://x.com/a b?q=1', 'uri')).toBe('https://x.com/a%20b?q=1');
    expect(urlEncode('a b', 'form')).toBe('a+b');
    expect(urlDecode('a+b%20c', true)).toBe('a b c');
    expect(() => urlDecode('%E0%A4', false)).toThrow('invalid percent');
  });
  it('HTML entities', () => {
    expect(htmlEncode('<a href="x">Tom & Jerry</a>', 'minimal')).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&lt;/a&gt;',
    );
    expect(htmlEncode('₹ é', 'all')).toBe('&#8377; &#233;');
    expect(htmlDecode('&lt;b&gt; &amp;amp; &#8377; &#x1F600; &unknown;')).toBe(
      '<b> &amp; ₹ 😀 &unknown;',
    );
  });
});

describe('hashing', () => {
  it('MD5 matches RFC 1321 vectors', () => {
    expect(md5(utf8Encode(''))).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5(utf8Encode('abc'))).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5(utf8Encode('The quick brown fox jumps over the lazy dog'))).toBe(
      '9e107d9d372bb6826bd81d3542a419d6',
    );
    expect(md5(utf8Encode('a'.repeat(1000)))).toBe('cabe45dcc9ae5b66ba86600cca6b8ba8');
  });
  it('SHA and HMAC via Web Crypto', async () => {
    expect(await hashText('SHA-256', 'abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
    expect(await hashText('SHA-1', 'abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
    expect(
      await hashText('SHA-256', 'The quick brown fox jumps over the lazy dog', 'hex', 'key'),
    ).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });
});

describe('JWT', () => {
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
  it('decodes and verifies the jwt.io example', async () => {
    const d = decodeJwt(token);
    expect(d.header.alg).toBe('HS256');
    expect((d.payload as { name: string }).name).toBe('John Doe');
    expect(await verifyJwt(token, 'your-256-bit-secret')).toBe(true);
    expect(await verifyJwt(token, 'wrong')).toBe(false);
  });
  it('signs tokens that verify', async () => {
    const t = await signJwt({ alg: 'HS512', typ: 'JWT' }, { sub: 'x' }, 's3cret');
    expect(await verifyJwt(t, 's3cret')).toBe(true);
    expect(() => decodeJwt('abc')).toThrow('three parts');
  });
});

describe('JSON', () => {
  it('formats, minifies and reports errors with position', () => {
    expect(formatJson('{"b":1,"a":[1,2]}', 2, true)).toBe(
      '{\n  "a": [\n    1,\n    2\n  ],\n  "b": 1\n}',
    );
    expect(minifyJson('{ "a" : [ 1 , 2 ] }')).toBe('{"a":[1,2]}');
    const bad = parseJson('{\n  "a": 1,\n}');
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.error.line).toBe(3);
    expect(parseJson('').ok).toBe(false);
    expect(jsonStats(JSON.parse('{"a":{"b":[1,{"c":2}]}}')).depth).toBe(4);
    expect(highlightJson('{"a": true}')).toContain('text-fuchsia-300');
  });
});

describe('XML and SQL', () => {
  it('formats and validates XML', () => {
    expect(formatXml('<a><b x="1">t</b><c/></a>')).toBe('<a>\n  <b x="1">t</b>\n  <c/>\n</a>');
    expect(parseXml('<a><b></a>').ok).toBe(false);
    expect(parseXml('').ok).toBe(false);
  });
  it('minifies SQL while preserving strings', () => {
    expect(
      minifySql("SELECT  a, b -- comment\nFROM   t\nWHERE  name = 'x  -- y' /* c */ AND id = 1;"),
    ).toBe("SELECT a,b FROM t WHERE name = 'x  -- y' AND id = 1;");
    expect(() => minifySql("SELECT 'abc")).toThrow('Unterminated');
  });
});

describe('cron', () => {
  it('parses and finds next runs', () => {
    const c = parseCron('*/15 9-17 * * MON-FRI');
    expect([...c.sets[0]]).toEqual([0, 15, 30, 45]);
    expect([...c.sets[4]]).toEqual([1, 2, 3, 4, 5]);
    const runs = nextRuns(
      parseCron('0 9 * * 1'),
      new Date(Date.UTC(2026, 8, 27, 0, 0)),
      2,
      () => 0,
    );
    expect(runs.map((r) => r.toISOString())).toEqual([
      '2026-09-28T09:00:00.000Z',
      '2026-10-05T09:00:00.000Z',
    ]);
    const ist = nextRuns(parseCron('30 10 1 * *'), new Date(Date.UTC(2026, 8, 27)), 1, () => 330);
    expect(ist[0].toISOString()).toBe('2026-10-01T05:00:00.000Z');
    expect(parseCron('@daily').expression).toBe('0 0 * * *');
    expect(() => parseCron('61 * * * *')).toThrow('minute');
    expect(() => parseCron('* * *')).toThrow('5 fields');
  });
});

describe('colors', () => {
  it('parses and converts', () => {
    const c = parseColor('#1d5cf1');
    expect(c).toEqual({ r: 29, g: 92, b: 241, a: 1 });
    expect(toHexString(parseColor('rgb(255, 0, 0)'))).toBe('#ff0000');
    expect(rgbToHsl(parseColor('hsl(120, 100%, 50%)'))).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToCmyk(parseColor('#000'))).toEqual({ c: 0, m: 0, y: 0, k: 100 });
    expect(contrastRatio(parseColor('#fff'), parseColor('#000'))).toBeCloseTo(21, 5);
    expect(() => parseColor('blue-ish')).toThrow();
  });
});

describe('user agent & IP', () => {
  it('parses common user agents', () => {
    const chromeAndroid = parseUserAgent(
      'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
    );
    expect(chromeAndroid.browser.name).toBe('Chrome');
    expect(chromeAndroid.os).toEqual({ name: 'Android', version: '14' });
    expect(chromeAndroid.device).toEqual({ type: 'mobile', vendor: 'Samsung', model: 'SM-S918B' });
    const safari = parseUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    );
    expect(safari.browser).toEqual({ name: 'Safari', version: '17.5' });
    expect(safari.os).toEqual({ name: 'iOS', version: '17.5' });
    const edge = parseUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
    );
    expect(edge.browser.name).toBe('Microsoft Edge');
    expect(edge.os.name).toBe('Windows');
    expect(
      parseUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')
        .isBot,
    ).toBe(true);
  });
  it('analyses IPv4 subnets and IPv6', () => {
    const v4 = analyzeIp('192.168.1.10/24');
    expect(v4.version).toBe(4);
    if (v4.version === 4) {
      expect(v4.type).toBe('Private (RFC 1918)');
      expect(v4.network).toMatchObject({
        network: '192.168.1.0',
        broadcast: '192.168.1.255',
        mask: '255.255.255.0',
        firstHost: '192.168.1.1',
        lastHost: '192.168.1.254',
        hosts: 254,
      });
    }
    expect(analyzeIp('8.8.8.8').type).toBe('Public');
    const v6 = analyzeIp('2001:db8::1');
    expect(v6.version).toBe(6);
    if (v6.version === 6) {
      expect(v6.expanded).toBe('2001:0db8:0000:0000:0000:0000:0000:0001');
      expect(v6.compressed).toBe('2001:db8::1');
      expect(v6.type).toBe('Documentation');
    }
    const mapped = analyzeIp('::ffff:192.0.2.1');
    expect(mapped.type).toBe('IPv4-mapped');
    expect(() => analyzeIp('256.1.1.1')).toThrow();
    expect(() => analyzeIp('10.0.0.1/33')).toThrow();
  });
});

describe('generators and regex', () => {
  it('generates passwords with every selected set', () => {
    const p = generatePassword(16, {
      lower: true,
      upper: true,
      digits: true,
      symbols: true,
      excludeAmbiguous: true,
    });
    expect(p).toHaveLength(16);
    expect(p).toMatch(/[a-z]/);
    expect(p).toMatch(/[A-Z]/);
    expect(p).toMatch(/\d/);
    expect(p).not.toMatch(/[Il1O0o]/);
    expect(() =>
      generatePassword(8, {
        lower: false,
        upper: false,
        digits: false,
        symbols: false,
        excludeAmbiguous: false,
      }),
    ).toThrow();
  });
  it('generates UUIDs and lorem ipsum', () => {
    expect(uuidV4()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    const ts = Date.UTC(2026, 0, 1);
    const v7 = uuidV7(ts);
    const hex = ts.toString(16).padStart(12, '0');
    expect(v7.replace(/-/g, '').slice(0, 12)).toBe(hex);
    expect(v7[14]).toBe('7');
    expect(lorem('words', 5, true)).toBe('Lorem ipsum dolor sit amet');
    expect(lorem('paragraphs', 3, true).split('\n\n')).toHaveLength(3);
  });
  it('runs regexes with groups and replacement', () => {
    const r = runRegex('(?<y>\\d{4})-(\\d{2})', 'g', 'on 2026-09 and 2027-01', '$2/$<y>');
    expect(r.matches).toHaveLength(2);
    expect(r.matches[0].named.y).toBe('2026');
    expect(r.replaced).toBe('on 09/2026 and 01/2027');
    expect(() => runRegex('(', '', 'x')).toThrow();
    expect(() => runRegex('a', 'gg', 'x')).toThrow('Flags');
  });
});
