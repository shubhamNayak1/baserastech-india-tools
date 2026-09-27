import {
  createTextTool,
  type Options,
  type TransformResult,
} from '@/components/text-tool/TextTool';
import type { ResultItem } from '@/components/form-tool/types';
import { formatNumber } from '@/utils/format';
import { formatInZone } from '@/utils/timezone';
import {
  base64Decode,
  base64Encode,
  htmlDecode,
  htmlEncode,
  toHex,
  urlDecode,
  urlEncode,
} from './lib/encoding';
import { HASH_ALGOS, hashText, type HashAlgo } from './lib/hash';
import { decodeJwt, signJwt, verifyJwt, type HsAlg } from './lib/jwt';
import { formatJson, highlightJson, jsonStats, minifyJson, parseJson } from './lib/json';
import { formatXml, minifyXml, parseXml } from './lib/xml';
import { minifySql } from './lib/sql';
import { parseUserAgent } from './lib/ua';
import {
  CHARSETS,
  generatePassword,
  lorem,
  passwordEntropy,
  strengthLabel,
  uuidV4,
  uuidV7,
} from './lib/generators';

const SAMPLE_JSON =
  '{"name":"BASERASTECH India Tools","version":2,"free":true,"categories":["finance","tax","developer"],"owner":{"country":"IN","gst":null},"rating":4.8}';

const INDENT_OPTION = {
  name: 'indent',
  label: 'Indent',
  type: 'select' as const,
  default: '2',
  options: [
    { value: '2', label: '2 spaces' },
    { value: '4', label: '4 spaces' },
    { value: 'tab', label: 'Tab' },
  ],
};
const indentOf = (o: Options) => (o.indent === 'tab' ? '\t' : Number(o.indent));

function jsonInfo(text: string): ResultItem[] {
  const r = parseJson(text);
  if (!r.ok) return [];
  const s = jsonStats(r.value);
  return [
    { label: 'Valid JSON', value: '✓ Yes', primary: true, hint: `Top-level ${s.type}` },
    { label: 'Objects', value: String(s.objects) },
    { label: 'Arrays', value: String(s.arrays) },
    { label: 'Keys', value: String(s.keys) },
    { label: 'Max depth', value: String(s.depth) },
  ];
}

// ---------------------------------------------------------------- JSON
export const JsonFormatter = createTextTool({
  input: { label: 'JSON input', sample: SAMPLE_JSON, placeholder: 'Paste JSON here' },
  outputLabel: 'Formatted JSON',
  downloadName: 'formatted.json',
  options: [
    INDENT_OPTION,
    { name: 'sort', label: 'Sort keys A–Z', type: 'toggle', default: false },
  ],
  transform: (text, o) =>
    text.trim() ? { output: formatJson(text, indentOf(o), Boolean(o.sort)) } : { output: '' },
});

export const JsonBeautifier = createTextTool({
  input: { label: 'JSON input', sample: SAMPLE_JSON, placeholder: 'Paste JSON here' },
  outputLabel: 'Beautified JSON (syntax highlighted)',
  downloadName: 'beautified.json',
  options: [INDENT_OPTION, { name: 'sort', label: 'Sort keys A–Z', type: 'toggle', default: true }],
  transform: (text, o) => {
    if (!text.trim()) return { output: '', html: '' };
    const pretty = formatJson(text, indentOf(o), Boolean(o.sort));
    return { output: pretty, html: highlightJson(pretty), info: jsonInfo(text) };
  },
});

export const JsonMinifier = createTextTool({
  input: { label: 'JSON input', sample: JSON.stringify(JSON.parse(SAMPLE_JSON), null, 2) },
  outputLabel: 'Minified JSON',
  downloadName: 'minified.json',
  transform: (text) => {
    if (!text.trim()) return { output: '' };
    const out = minifyJson(text);
    return {
      output: out,
      info: [
        {
          label: 'Size reduced',
          value: `${formatNumber(((text.length - out.length) / text.length) * 100, 1)}%`,
          primary: true,
          hint: `${text.length.toLocaleString('en-IN')} → ${out.length.toLocaleString('en-IN')} characters`,
        },
      ],
    };
  },
});

export const JsonValidator = createTextTool({
  input: {
    label: 'JSON to validate',
    sample: '{\n  "id": 101,\n  "tags": ["a", "b",],\n  "active": true\n}',
  },
  transform: (text) => {
    const r = parseJson(text);
    if (r.ok) return { info: jsonInfo(text) };
    return {
      info: [
        {
          label: 'Valid JSON',
          value: '✗ No',
          primary: true,
          hint: `Line ${r.error.line}, column ${r.error.column}: ${r.error.message}`,
        },
        { label: 'Error location', value: `Line ${r.error.line}, column ${r.error.column}` },
      ],
    };
  },
});

// ---------------------------------------------------------------- Base64 / URL / HTML
export const Base64Encoder = createTextTool({
  input: { label: 'Text to encode', sample: 'Hello, भारत! ₹100' },
  outputLabel: 'Base64',
  options: [
    { name: 'urlSafe', label: 'URL-safe (Base64URL, no padding)', type: 'toggle', default: false },
  ],
  transform: (text, o) => ({ output: base64Encode(text, Boolean(o.urlSafe)) }),
});

export const Base64Decoder = createTextTool({
  input: { label: 'Base64 to decode', sample: 'SGVsbG8sIOCkreCkvuCksOCkpCEg4oK5MTAw' },
  outputLabel: 'Decoded text',
  transform: (text) => {
    if (!text.trim()) return { output: '' };
    const r = base64Decode(text);
    if (r.text === null)
      return {
        output: toHex(r.bytes, ' '),
        info: [
          {
            label: 'Binary data',
            value: `${r.bytes.length} bytes`,
            primary: true,
            hint: 'Not valid UTF-8 text — shown as hexadecimal',
          },
        ],
      };
    return { output: r.text };
  },
});

export const UrlEncoder = createTextTool({
  input: {
    label: 'Text or URL to encode',
    sample: 'https://example.com/search?q=home loan & EMI&city=नई दिल्ली',
  },
  outputLabel: 'Encoded',
  options: [
    {
      name: 'mode',
      label: 'Mode',
      type: 'select',
      default: 'component',
      options: [
        { value: 'component', label: 'Component (encodeURIComponent)' },
        { value: 'uri', label: 'Full URL (encodeURI)' },
        { value: 'form', label: 'Form (spaces as +)' },
      ],
    },
  ],
  transform: (text, o) => ({ output: urlEncode(text, o.mode as 'component' | 'uri' | 'form') }),
});

export const UrlDecoder = createTextTool({
  input: {
    label: 'Encoded URL or text',
    sample:
      'https://example.com/search?q=home%20loan%20%26%20EMI&city=%E0%A4%A8%E0%A4%88+%E0%A4%A6%E0%A4%BF%E0%A4%B2%E0%A5%8D%E0%A4%B2%E0%A5%80',
  },
  outputLabel: 'Decoded',
  options: [{ name: 'plus', label: 'Treat + as space', type: 'toggle', default: true }],
  transform: (text, o) => {
    const out = urlDecode(text, Boolean(o.plus));
    const info: ResultItem[] = [];
    try {
      const u = new URL(text.trim());
      info.push(
        { label: 'Host', value: u.host },
        { label: 'Path', value: decodeURIComponent(u.pathname) },
      );
      u.searchParams.forEach((v, k) => info.push({ label: `?${k}`, value: v || '(empty)' }));
    } catch {
      /* not a full URL */
    }
    return { output: out, info };
  },
});

export const HtmlEntityEncoder = createTextTool({
  input: {
    label: 'Text or HTML',
    sample: '<p class="note">Price: ₹1,499 — Tom & Jerry\'s "deal"</p>',
  },
  outputLabel: 'Encoded',
  options: [
    {
      name: 'mode',
      label: 'Encode',
      type: 'select',
      default: 'minimal',
      options: [
        { value: 'minimal', label: 'Only & < > " \' (safe for HTML)' },
        { value: 'named', label: 'Also common symbols (©, ₹, —)' },
        { value: 'all', label: 'All non-ASCII characters' },
      ],
    },
  ],
  transform: (text, o) => ({ output: htmlEncode(text, o.mode as 'minimal' | 'named' | 'all') }),
});

export const HtmlEntityDecoder = createTextTool({
  input: {
    label: 'Text with HTML entities',
    sample: '&lt;p&gt;Price: &#8377;1,499 &mdash; Tom &amp; Jerry&#39;s &quot;deal&quot;&lt;/p&gt;',
  },
  outputLabel: 'Decoded',
  transform: (text) => ({ output: htmlDecode(text) }),
});

// ---------------------------------------------------------------- Generators
export const UuidGenerator = createTextTool({
  outputLabel: 'UUIDs',
  downloadName: 'uuids.txt',
  actionLabel: 'Generate new',
  options: [
    {
      name: 'version',
      label: 'Version',
      type: 'segmented',
      default: 'v4',
      options: [
        { value: 'v4', label: 'v4 (random)' },
        { value: 'v7', label: 'v7 (time-ordered)' },
      ],
    },
    { name: 'count', label: 'How many', type: 'number', default: 5, min: 1, max: 1000 },
    { name: 'upper', label: 'Uppercase', type: 'toggle', default: false },
    { name: 'hyphens', label: 'Hyphens', type: 'toggle', default: true },
  ],
  transform: (_t, o) => {
    const list = Array.from({ length: Number(o.count) }, (_, i) => {
      let u = o.version === 'v7' ? uuidV7(Date.now() + i) : uuidV4();
      if (!o.hyphens) u = u.replace(/-/g, '');
      return o.upper ? u.toUpperCase() : u;
    });
    return { output: list.join('\n') };
  },
});

export const PasswordGenerator = createTextTool({
  outputLabel: 'Passwords',
  actionLabel: 'Generate new',
  options: [
    { name: 'length', label: 'Length', type: 'number', default: 16, min: 4, max: 128 },
    { name: 'count', label: 'How many', type: 'number', default: 5, min: 1, max: 100 },
    { name: 'lower', label: 'a–z', type: 'toggle', default: true },
    { name: 'upper', label: 'A–Z', type: 'toggle', default: true },
    { name: 'digits', label: '0–9', type: 'toggle', default: true },
    { name: 'symbols', label: 'Symbols', type: 'toggle', default: true },
    {
      name: 'excludeAmbiguous',
      label: 'Avoid look-alikes (l, 1, O, 0)',
      type: 'toggle',
      default: true,
    },
  ],
  transform: (_t, o) => {
    const cfg = {
      lower: Boolean(o.lower),
      upper: Boolean(o.upper),
      digits: Boolean(o.digits),
      symbols: Boolean(o.symbols),
      excludeAmbiguous: Boolean(o.excludeAmbiguous),
    };
    const len = Number(o.length);
    const list = Array.from({ length: Number(o.count) }, () => generatePassword(len, cfg));
    const pool = (Object.keys(CHARSETS) as (keyof typeof CHARSETS)[])
      .filter((k) => cfg[k])
      .reduce(
        (a, k) =>
          a +
          (cfg.excludeAmbiguous ? CHARSETS[k].replace(/[Il1O0o|`'"]/g, '') : CHARSETS[k]).length,
        0,
      );
    const bits = passwordEntropy(len, pool);
    return {
      output: list.join('\n'),
      info: [
        {
          label: 'Strength',
          value: strengthLabel(bits),
          primary: true,
          hint: `${formatNumber(bits, 0)} bits of entropy`,
        },
        { label: 'Character pool', value: `${pool} characters` },
      ],
    };
  },
});

export const LoremIpsumGenerator = createTextTool({
  outputLabel: 'Placeholder text',
  mono: false,
  actionLabel: 'Generate new',
  options: [
    {
      name: 'kind',
      label: 'Generate',
      type: 'segmented',
      default: 'paragraphs',
      options: [
        { value: 'paragraphs', label: 'Paragraphs' },
        { value: 'sentences', label: 'Sentences' },
        { value: 'words', label: 'Words' },
      ],
    },
    { name: 'count', label: 'How many', type: 'number', default: 3, min: 1, max: 500 },
    {
      name: 'classic',
      label: 'Start with “Lorem ipsum dolor sit amet”',
      type: 'toggle',
      default: true,
    },
    { name: 'html', label: 'Wrap paragraphs in <p> tags', type: 'toggle', default: false },
  ],
  transform: (_t, o) => {
    const text = lorem(
      o.kind as 'paragraphs' | 'sentences' | 'words',
      Number(o.count),
      Boolean(o.classic),
    );
    const out =
      o.html && o.kind === 'paragraphs'
        ? text
            .split('\n\n')
            .map((p) => `<p>${p}</p>`)
            .join('\n')
        : text;
    return {
      output: out,
      info: [
        { label: 'Words', value: String(text.split(/\s+/).filter(Boolean).length) },
        { label: 'Characters', value: String(text.length) },
      ],
    };
  },
});

// ---------------------------------------------------------------- Hash & JWT
export const HashGenerator = createTextTool({
  input: { label: 'Text to hash', sample: 'BASERASTECH India Tools' },
  options: [
    {
      name: 'format',
      label: 'Output',
      type: 'segmented',
      default: 'hex',
      options: [
        { value: 'hex', label: 'Hex' },
        { value: 'base64', label: 'Base64' },
      ],
    },
    { name: 'useHmac', label: 'HMAC with a secret key', type: 'toggle', default: false },
    {
      name: 'key',
      label: 'Secret key',
      type: 'password',
      default: '',
      showIf: (o) => Boolean(o.useHmac),
      help: 'MD5 is not used for HMAC.',
    },
  ],
  transform: async (text, o) => {
    const key = o.useHmac ? String(o.key) : undefined;
    const rows = await Promise.all(
      HASH_ALGOS.filter((a) => !(key !== undefined && a === 'MD5')).map(async (a: HashAlgo) => ({
        label: key !== undefined ? `HMAC-${a}` : a,
        value: await hashText(a, text, o.format as 'hex' | 'base64', key),
      })),
    );
    return {
      info: rows,
      extra: (
        <p className="mt-4 text-xs text-slate-500">
          MD5 and SHA-1 are fine for checksums but must not be used for passwords or signatures.
        </p>
      ),
    };
  },
});

const tsLine = (label: string, v: unknown): ResultItem | null => {
  if (typeof v !== 'number') return null;
  const ms = v * 1000;
  const past = ms < Date.now();
  return {
    label,
    value: formatInZone(ms, 'Asia/Kolkata', { dateStyle: 'medium', timeStyle: 'medium' }),
    hint: label === 'Expires (exp)' ? (past ? 'Expired' : 'Not yet expired') : undefined,
  };
};

export const JwtDecoder = createTextTool({
  input: {
    label: 'JWT',
    sample:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    rows: 6,
  },
  outputLabel: 'Decoded header & payload',
  options: [
    {
      name: 'secret',
      label: 'Secret (optional, to verify HS256/384/512)',
      type: 'password',
      default: '',
    },
  ],
  transform: async (text, o): Promise<TransformResult> => {
    if (!text.trim()) return { output: '' };
    const d = decodeJwt(text);
    const p = (d.payload && typeof d.payload === 'object' ? d.payload : {}) as Record<
      string,
      unknown
    >;
    const info: ResultItem[] = [
      {
        label: 'Algorithm',
        value: String(d.header.alg ?? '—'),
        primary: true,
        hint: d.header.typ ? `Type ${String(d.header.typ)}` : undefined,
      },
    ];
    [
      tsLine('Issued at (iat)', p.iat),
      tsLine('Not before (nbf)', p.nbf),
      tsLine('Expires (exp)', p.exp),
    ].forEach((x) => x && info.push(x));
    if (String(o.secret)) {
      try {
        info.push({
          label: 'Signature',
          value: (await verifyJwt(text, String(o.secret)))
            ? '✓ Valid'
            : '✗ Invalid for this secret',
        });
      } catch (e) {
        info.push({ label: 'Signature', value: e instanceof Error ? e.message : 'Cannot verify' });
      }
    } else
      info.push({ label: 'Signature', value: 'Not verified', hint: 'Enter the secret to verify' });
    return {
      output: `// Header\n${JSON.stringify(d.header, null, 2)}\n\n// Payload\n${JSON.stringify(d.payload, null, 2)}`,
      info,
    };
  },
});

export const JwtEncoder = createTextTool({
  input: {
    label: 'Payload (JSON)',
    sample: JSON.stringify(
      { sub: 'user-123', name: 'Asha', role: 'admin', iat: 1767225600, exp: 1767312000 },
      null,
      2,
    ),
    rows: 8,
  },
  outputLabel: 'Signed JWT',
  options: [
    {
      name: 'alg',
      label: 'Algorithm',
      type: 'segmented',
      default: 'HS256',
      options: ['HS256', 'HS384', 'HS512'].map((a) => ({ value: a, label: a })),
    },
    {
      name: 'secret',
      label: 'Secret',
      type: 'password',
      default: 'change-me-to-a-long-random-secret',
    },
  ],
  transform: async (text, o) => {
    const r = parseJson(text);
    if (!r.ok)
      throw new Error(`Payload is not valid JSON: ${r.error.message} (line ${r.error.line}).`);
    if (!String(o.secret)) throw new Error('Enter a secret to sign the token.');
    const token = await signJwt({ alg: o.alg as HsAlg, typ: 'JWT' }, r.value, String(o.secret));
    return {
      output: token,
      info:
        String(o.secret).length < 32
          ? [
              {
                label: 'Warning',
                value: 'Short secret',
                hint: 'Use at least 32 random characters for HS256 in production.',
              },
            ]
          : [],
    };
  },
});

// ---------------------------------------------------------------- Formatters (lazy-loaded)
async function prettierFormat(code: string, parser: string, o: Options) {
  const prettier = await import('prettier/standalone');
  const plugins = await Promise.all(
    parser === 'babel'
      ? [import('prettier/plugins/babel'), import('prettier/plugins/estree')]
      : parser === 'typescript'
        ? [import('prettier/plugins/typescript'), import('prettier/plugins/estree')]
        : parser === 'html'
          ? [
              import('prettier/plugins/html'),
              import('prettier/plugins/postcss'),
              import('prettier/plugins/babel'),
              import('prettier/plugins/estree'),
            ]
          : parser === 'css'
            ? [import('prettier/plugins/postcss')]
            : [import('prettier/plugins/yaml')],
  );
  try {
    return await prettier.format(code, {
      parser,
      plugins: plugins.map((p) => ('default' in p ? p.default : p)) as never,
      tabWidth: o.indent === 'tab' ? 2 : Number(o.indent ?? 2),
      useTabs: o.indent === 'tab',
      semi: o.semi !== false,
      singleQuote: Boolean(o.singleQuote),
      printWidth: Number(o.printWidth ?? 80),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message.split('\n')[0] : 'Could not format the code.';
    throw new Error(`Syntax error: ${msg}`);
  }
}

const codeOptions = (js: boolean) => [
  INDENT_OPTION,
  {
    name: 'printWidth',
    label: 'Line width',
    type: 'number' as const,
    default: 80,
    min: 40,
    max: 200,
  },
  ...(js
    ? [
        { name: 'semi', label: 'Semicolons', type: 'toggle' as const, default: true },
        { name: 'singleQuote', label: 'Single quotes', type: 'toggle' as const, default: true },
      ]
    : []),
];

export const HtmlFormatter = createTextTool({
  input: {
    label: 'HTML',
    sample:
      '<!doctype html><html><head><title>Demo</title><style>body{margin:0;font-family:sans-serif}</style></head><body><div class="card"><h1>Hello</h1><p>Formatted by <b>BASERASTECH</b>.</p><ul><li>One</li><li>Two</li></ul></div><script>const x=[1,2,3].map(n=>n*2);console.log(x)</script></body></html>',
  },
  outputLabel: 'Formatted HTML',
  downloadName: 'formatted.html',
  options: codeOptions(false),
  transform: async (t, o) => ({ output: t.trim() ? await prettierFormat(t, 'html', o) : '' }),
});

export const CssFormatter = createTextTool({
  input: {
    label: 'CSS',
    sample:
      '.btn{display:inline-flex;padding:8px 16px;border-radius:8px;background:#1d5cf1;color:#fff}.btn:hover{background:#1547de}@media (max-width:640px){.btn{width:100%}}',
  },
  outputLabel: 'Formatted CSS',
  downloadName: 'formatted.css',
  options: [
    ...codeOptions(false),
    { name: 'minify', label: 'Minify instead', type: 'toggle', default: false },
  ],
  transform: async (t, o) => {
    if (!t.trim()) return { output: '' };
    const pretty = await prettierFormat(t, 'css', o);
    if (!o.minify) return { output: pretty };
    const min = pretty
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,>])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
    return { output: min };
  },
});

export const JavaScriptFormatter = createTextTool({
  input: {
    label: 'JavaScript',
    sample:
      'const emi=(p,r,n)=>{const m=r/1200;return p*m*Math.pow(1+m,n)/(Math.pow(1+m,n)-1)};export default function calc({amount,rate,years}){return {emi:Math.round(emi(amount,rate,years*12)),currency:"INR"}}',
  },
  outputLabel: 'Formatted JavaScript',
  downloadName: 'formatted.js',
  options: codeOptions(true),
  transform: async (t, o) => ({ output: t.trim() ? await prettierFormat(t, 'babel', o) : '' }),
});

export const TypeScriptFormatter = createTextTool({
  input: {
    label: 'TypeScript',
    sample:
      'interface Loan{amount:number;rate:number;months:number}export function emi({amount,rate,months}:Loan):number{const r=rate/1200;if(r===0)return amount/months;const f=(1+r)**months;return amount*r*f/(f-1)}',
  },
  outputLabel: 'Formatted TypeScript',
  downloadName: 'formatted.ts',
  options: codeOptions(true),
  transform: async (t, o) => ({ output: t.trim() ? await prettierFormat(t, 'typescript', o) : '' }),
});

export const YamlFormatter = createTextTool({
  input: {
    label: 'YAML',
    sample:
      'services:\n    web:\n        image: nginx:alpine\n        ports: [ "80:80" ]\n    api:\n      image: "baserastech/api:1.0"\n      environment:\n          - SPRING_PROFILES_ACTIVE=prod\n',
  },
  outputLabel: 'Formatted YAML',
  downloadName: 'formatted.yaml',
  options: [
    {
      name: 'indent',
      label: 'Indent',
      type: 'select',
      default: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
  ],
  transform: async (t, o) => ({ output: t.trim() ? await prettierFormat(t, 'yaml', o) : '' }),
});

export const SqlFormatter = createTextTool({
  input: {
    label: 'SQL',
    sample:
      "select c.id, c.name, sum(o.amount) as total from customers c join orders o on o.customer_id = c.id where o.created_at >= '2026-04-01' and c.state in ('KA','MH') group by c.id, c.name having sum(o.amount) > 100000 order by total desc limit 10;",
  },
  outputLabel: 'Formatted SQL',
  downloadName: 'formatted.sql',
  options: [
    {
      name: 'dialect',
      label: 'Dialect',
      type: 'select',
      default: 'sql',
      options: [
        { value: 'sql', label: 'Standard SQL' },
        { value: 'postgresql', label: 'PostgreSQL' },
        { value: 'mysql', label: 'MySQL' },
        { value: 'mariadb', label: 'MariaDB' },
        { value: 'tsql', label: 'SQL Server (T-SQL)' },
        { value: 'plsql', label: 'Oracle PL/SQL' },
        { value: 'sqlite', label: 'SQLite' },
        { value: 'bigquery', label: 'BigQuery' },
      ],
    },
    {
      name: 'keywordCase',
      label: 'Keywords',
      type: 'select',
      default: 'upper',
      options: [
        { value: 'upper', label: 'UPPERCASE' },
        { value: 'lower', label: 'lowercase' },
        { value: 'preserve', label: 'Preserve' },
      ],
    },
    {
      name: 'indent',
      label: 'Indent',
      type: 'select',
      default: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
      ],
    },
  ],
  transform: async (t, o) => {
    if (!t.trim()) return { output: '' };
    const { format } = await import('sql-formatter');
    try {
      return {
        output: format(t, {
          language: o.dialect as 'sql',
          keywordCase: o.keywordCase as 'upper',
          tabWidth: Number(o.indent),
        }),
      };
    } catch (e) {
      throw new Error(
        `Could not parse the SQL: ${e instanceof Error ? e.message.split('\n')[0] : ''}`,
      );
    }
  },
});

export const SqlMinifier = createTextTool({
  input: {
    label: 'SQL',
    sample:
      "-- Top customers\nSELECT\n  c.id,\n  c.name   -- display name\nFROM customers c\n/* only active */\nWHERE c.active = 1\n  AND c.city = 'New  Delhi';",
  },
  outputLabel: 'Minified SQL',
  options: [{ name: 'keep', label: 'Keep comments', type: 'toggle', default: false }],
  transform: (t, o) => {
    const out = minifySql(t, Boolean(o.keep));
    return {
      output: out,
      info: t
        ? [
            {
              label: 'Size reduced',
              value: `${formatNumber(((t.length - out.length) / t.length) * 100, 1)}%`,
            },
          ]
        : [],
    };
  },
});

export const XmlFormatter = createTextTool({
  input: {
    label: 'XML',
    sample:
      '<?xml version="1.0" encoding="UTF-8"?><invoice id="INV-001"><seller gstin="29ABCDE1234F1Z5">BASERASTECH</seller><items><item qty="2" rate="499.50">Mouse</item><item qty="1" rate="1000">Keyboard</item></items><!-- totals --><total currency="INR">1999</total></invoice>',
  },
  outputLabel: 'Formatted XML',
  downloadName: 'formatted.xml',
  options: [
    {
      name: 'indent',
      label: 'Indent',
      type: 'select',
      default: '2',
      options: [
        { value: '2', label: '2 spaces' },
        { value: '4', label: '4 spaces' },
        { value: 'tab', label: 'Tab' },
      ],
    },
    { name: 'minify', label: 'Minify instead', type: 'toggle', default: false },
  ],
  transform: (t, o) =>
    t.trim()
      ? {
          output: o.minify
            ? minifyXml(t)
            : formatXml(t, o.indent === 'tab' ? '\t' : ' '.repeat(Number(o.indent))),
        }
      : { output: '' },
});

export const XmlValidator = createTextTool({
  input: {
    label: 'XML to validate',
    sample:
      '<catalog>\n  <book id="1"><title>Arthashastra</title></book>\n  <book id="2"><title>Panchatantra</book>\n</catalog>',
  },
  transform: (t) => {
    const r = parseXml(t);
    if (r.ok && r.doc) {
      const root = r.doc.documentElement;
      return {
        info: [
          { label: 'Well-formed XML', value: '✓ Yes', primary: true },
          { label: 'Root element', value: `<${root.tagName}>` },
          { label: 'Elements', value: String(r.doc.getElementsByTagName('*').length) },
        ],
      };
    }
    return {
      info: [
        { label: 'Well-formed XML', value: '✗ No', primary: true, hint: r.error },
        ...(r.line ? [{ label: 'Error near line', value: String(r.line) }] : []),
      ],
    };
  },
});

// ---------------------------------------------------------------- Timestamps & user agents
function parseAnyDate(input: string): number {
  const t = input.trim();
  if (!t) throw new Error('Enter a timestamp or a date.');
  if (/^-?\d{1,16}(\.\d+)?$/.test(t)) {
    const n = Number(t);
    return Math.abs(n) >= 1e14 ? n / 1000 : Math.abs(n) >= 1e11 ? n : n * 1000;
  }
  const ms = Date.parse(t);
  if (Number.isNaN(ms))
    throw new Error(
      'Could not understand that date. Try ISO 8601 (2026-09-27T10:30:00+05:30), RFC 2822 or a Unix timestamp.',
    );
  return ms;
}

export const TimestampConverter = createTextTool({
  input: { label: 'Timestamp or date (any format)', sample: '2026-09-27T10:30:00+05:30', rows: 2 },
  transform: (t) => {
    const ms = parseAnyDate(t);
    if (Math.abs(ms) > 8.64e15) throw new Error('Date is out of range.');
    const d = new Date(ms);
    const diffDays = (ms - Date.now()) / 86_400_000;
    const start = Date.UTC(d.getUTCFullYear(), 0, 1);
    return {
      info: [
        { label: 'Unix timestamp (s)', value: String(Math.floor(ms / 1000)), primary: true },
        { label: 'Unix timestamp (ms)', value: String(Math.round(ms)) },
        { label: 'ISO 8601 (UTC)', value: d.toISOString() },
        { label: 'RFC 2822 / HTTP date', value: d.toUTCString() },
        {
          label: 'India (IST)',
          value: formatInZone(ms, 'Asia/Kolkata', { dateStyle: 'full', timeStyle: 'long' }),
        },
        { label: 'UTC', value: formatInZone(ms, 'UTC', { dateStyle: 'full', timeStyle: 'long' }) },
        {
          label: 'Relative',
          value: `${Math.abs(diffDays) < 1 ? `${formatNumber(Math.abs(diffDays * 24), 1)} hours` : `${formatNumber(Math.abs(diffDays), 1)} days`} ${diffDays >= 0 ? 'from now' : 'ago'}`,
        },
        { label: 'Day of year (UTC)', value: String(Math.floor((ms - start) / 86_400_000) + 1) },
      ],
    };
  },
});

export const UserAgentParser = createTextTool({
  input: {
    label: 'User agent string',
    sample:
      typeof navigator !== 'undefined'
        ? navigator.userAgent
        : 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Mobile Safari/537.36',
    rows: 4,
  },
  transform: (t) => {
    if (!t.trim()) throw new Error('Paste a user agent string.');
    const u = parseUserAgent(t);
    return {
      info: [
        {
          label: 'Browser',
          value: `${u.browser.name}${u.browser.version ? ` ${u.browser.version}` : ''}`,
          primary: true,
        },
        {
          label: 'Operating system',
          value: `${u.os.name}${u.os.version ? ` ${u.os.version}` : ''}`,
        },
        { label: 'Device type', value: u.device.type[0].toUpperCase() + u.device.type.slice(1) },
        {
          label: 'Device',
          value: [u.device.vendor, u.device.model].filter(Boolean).join(' ') || '—',
        },
        { label: 'Rendering engine', value: u.engine },
        { label: 'Bot / crawler', value: u.isBot ? 'Yes' : 'No' },
      ],
    };
  },
});
