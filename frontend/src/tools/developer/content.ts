import type { ContentMap } from '../define';

const privacy = {
  q: 'Is my data sent to a server?',
  a: 'No. This tool runs entirely in your browser; nothing you paste is uploaded or stored.',
};
const jsonFaq = [
  privacy,
  {
    q: 'Why is my JSON invalid?',
    a: 'Common causes are trailing commas, single quotes instead of double quotes, unquoted keys, comments, and NaN or undefined values — none of which are allowed in JSON.',
  },
];

const content: ContentMap = {
  'json-formatter': {
    description:
      'Format minified or messy JSON into readable, indented JSON. Choose 2 spaces, 4 spaces or tabs and optionally sort keys alphabetically.',
    whatIs:
      'JSON (JavaScript Object Notation) is the most common format for APIs and configuration. Formatting adds line breaks and indentation so nested data is easy to read and review.',
    howItWorks:
      'Your input is parsed with the browser’s standards-compliant JSON parser and printed back with the chosen indentation. If parsing fails, the error message shows the line and column.',
    example: '{"a":1,"b":[1,2]} becomes a multi-line document with each key on its own line.',
    howToUse: [
      'Paste JSON into the input box.',
      'Choose indentation and whether to sort keys.',
      'Copy or download the formatted result.',
    ],
    faq: jsonFaq,
  },
  'json-validator': {
    description:
      'Check whether JSON is valid and see exactly where a syntax error is, by line and column, plus structure statistics for valid JSON.',
    whatIs:
      'A JSON validator confirms that text follows the JSON specification (RFC 8259) so it can be parsed by any program.',
    howItWorks:
      'The input is parsed strictly. On failure, the parser’s error position is converted to a line and column. On success, the tool counts objects, arrays, keys and nesting depth.',
    example:
      'A trailing comma in ["a", "b",] is reported as an error on the line where it appears.',
    faq: jsonFaq,
  },
  'json-minifier': {
    description:
      'Remove all unnecessary whitespace from JSON to make it as small as possible for storage or network transfer.',
    whatIs:
      'Minified JSON is semantically identical to formatted JSON but without spaces, tabs and line breaks.',
    howItWorks:
      'The JSON is parsed and re-serialised without indentation. Because it is parsed first, invalid JSON is caught rather than silently broken.',
    example:
      'A 1,200-character formatted document might shrink to 800 characters — a 33% reduction.',
    faq: jsonFaq,
  },
  'json-beautifier': {
    description:
      'Beautify JSON with syntax highlighting, sorted keys and a summary of its structure.',
    whatIs:
      'Beautifying makes JSON easy to scan: keys, strings, numbers, booleans and nulls are shown in different colours.',
    howItWorks:
      'The JSON is parsed, keys are optionally sorted recursively, then printed with indentation and escaped before colour highlighting — so no input is ever executed as HTML.',
    example: 'Keys appear in blue, strings in green, numbers in amber and booleans in pink.',
    faq: jsonFaq,
  },
  'base64-encoder': {
    description:
      'Encode any text — including Hindi and other Unicode scripts and emoji — to Base64 or URL-safe Base64URL.',
    whatIs:
      'Base64 represents binary data using 64 printable ASCII characters. It is used in data URIs, email attachments, HTTP Basic authentication and JWTs.',
    howItWorks:
      'Text is first converted to UTF-8 bytes, then every 3 bytes are encoded as 4 Base64 characters. URL-safe mode replaces + and / with - and _ and drops = padding.',
    formula: '3 bytes (24 bits) → 4 characters of 6 bits each',
    example: '“Hello” encodes to SGVsbG8=.',
    faq: [
      privacy,
      {
        q: 'Is Base64 encryption?',
        a: 'No. Anyone can decode it. Never use Base64 to protect secrets.',
      },
    ],
  },
  'base64-decoder': {
    description:
      'Decode Base64 or Base64URL strings back to readable text. Binary data is shown as hexadecimal.',
    whatIs: 'Decoding reverses Base64 encoding to recover the original bytes.',
    howItWorks:
      'URL-safe characters are normalised, missing padding is added, and the bytes are decoded as UTF-8. If they are not valid text, a hex dump is shown instead.',
    example: 'SGVsbG8= decodes to “Hello”.',
    faq: [
      privacy,
      {
        q: 'Why does my output look garbled?',
        a: 'The data is probably binary (an image or a compressed file) rather than text.',
      },
    ],
  },
  'url-encoder': {
    description:
      'Percent-encode text for safe use in URLs and query strings, with component, full-URL and form modes.',
    whatIs:
      'URLs can only contain certain ASCII characters. Others — spaces, &, =, non-English letters — must be percent-encoded as %XX bytes.',
    howItWorks:
      'Component mode encodes everything except unreserved characters (use it for parameter values). Full-URL mode keeps characters like / ? & that structure a URL. Form mode encodes spaces as +.',
    example: '“home loan & EMI” becomes home%20loan%20%26%20EMI.',
    faq: [
      privacy,
      {
        q: 'encodeURI or encodeURIComponent?',
        a: 'Use component mode for individual parameter values, and URI mode only for a whole URL you don’t want to break.',
      },
    ],
  },
  'url-decoder': {
    description:
      'Decode percent-encoded URLs and see the host, path and each query parameter separately.',
    whatIs: 'URL decoding converts %XX sequences back to the characters they represent.',
    howItWorks:
      'The input is decoded as UTF-8. If it is a full URL, it is also parsed to list its parameters.',
    example: 'q=home%20loan decodes to q=home loan.',
    faq: [
      privacy,
      {
        q: 'What does “invalid percent-encoded sequence” mean?',
        a: 'A % is not followed by two hex digits, or the bytes do not form valid UTF-8.',
      },
    ],
  },
  'uuid-generator': {
    description:
      'Generate universally unique identifiers — random version 4 or time-ordered version 7 — individually or in bulk.',
    whatIs:
      'A UUID is a 128-bit identifier that is practically guaranteed to be unique without a central authority. v4 is fully random; v7 starts with a timestamp so IDs sort by creation time, which suits database keys.',
    howItWorks:
      'Random bits come from the browser’s cryptographically secure generator. Version and variant bits are set as defined in RFC 9562.',
    example: '3f2b8c1e-9a4d-4f7b-8c2e-5d1a6b9e0f13 is a v4 UUID (the 4 marks the version).',
    faq: [
      privacy,
      {
        q: 'Can two UUIDs collide?',
        a: 'The chance for v4 is so small (122 random bits) that it can be ignored for practical purposes.',
      },
    ],
  },
  'password-generator': {
    description:
      'Create strong, random passwords of any length with lowercase, uppercase, numbers and symbols, and see their estimated strength.',
    whatIs:
      'A good password is long and random. Generated passwords avoid the predictable patterns people use.',
    howItWorks:
      'Characters are drawn with the browser’s cryptographically secure random generator, using rejection sampling to avoid bias. At least one character from each selected set is guaranteed, then the result is shuffled.',
    formula: 'Entropy (bits) = length × log₂(character pool size)',
    example:
      'A 16-character password from 84 characters has about 102 bits of entropy — very strong.',
    faq: [
      {
        q: 'Are generated passwords stored?',
        a: 'No. They are created in your browser and never sent anywhere.',
      },
      {
        q: 'How long should a password be?',
        a: 'At least 12–16 characters for important accounts. Use a password manager so you don’t have to remember them.',
      },
    ],
  },
  'hash-generator': {
    description:
      'Generate MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes of text, or HMACs with a secret key.',
    whatIs:
      'A cryptographic hash turns any input into a fixed-length fingerprint. The same input always gives the same hash, and any change produces a completely different one.',
    howItWorks:
      'SHA hashes and HMACs use the browser’s Web Crypto API. MD5 uses a verified JavaScript implementation for checksums. Text is hashed as UTF-8.',
    example: 'SHA-256 of “abc” is ba7816bf…f20015ad.',
    faq: [
      privacy,
      {
        q: 'Can a hash be reversed?',
        a: 'Not directly, but short or common inputs can be guessed. Store passwords with slow algorithms like bcrypt or Argon2, not plain SHA or MD5.',
      },
    ],
  },
  'jwt-decoder': {
    description:
      'Decode a JSON Web Token to read its header and payload, see issue and expiry times, and verify HS256/384/512 signatures with a secret.',
    whatIs:
      'A JWT is a compact, signed token used for authentication. It has three Base64URL parts: header, payload (claims) and signature.',
    howItWorks:
      'The header and payload are Base64URL-decoded and pretty-printed. If you enter the secret, the HMAC signature is recomputed with Web Crypto and compared.',
    example:
      'The jwt.io sample token decodes to {"sub":"1234567890","name":"John Doe","iat":1516239022}.',
    faq: [
      {
        q: 'Is it safe to paste production tokens here?',
        a: 'Decoding happens only in your browser. Still, treat live tokens like passwords and prefer expired or test tokens.',
      },
      {
        q: 'Does decoding prove the token is genuine?',
        a: 'No. Anyone can decode a JWT. Only signature verification with the correct key proves it was issued by the expected party.',
      },
    ],
  },
  'jwt-encoder': {
    description: 'Create a signed JSON Web Token from a JSON payload using HS256, HS384 or HS512.',
    whatIs: 'Signing a JWT lets a server verify later that the claims were not altered.',
    howItWorks:
      'The header and payload are serialised, Base64URL-encoded and joined with a dot. An HMAC of that string with your secret becomes the signature.',
    formula: 'signature = HMAC-SHA256(secret, base64url(header) + "." + base64url(payload))',
    example:
      'A payload with sub, role, iat and exp signed with HS256 produces a three-part token you can test in the JWT Decoder.',
    faq: [
      privacy,
      {
        q: 'Why not RS256?',
        a: 'RS256 needs a private key. Asymmetric signing is best done on your server; this tool focuses on HMAC for testing.',
      },
    ],
  },
  'regex-tester': {
    description:
      'Test JavaScript regular expressions against sample text with live highlighting, capture groups, named groups and replacement preview.',
    whatIs:
      'Regular expressions describe text patterns for searching, validating and replacing — for example Indian mobile numbers, PIN codes or GSTINs.',
    howItWorks:
      'The pattern runs in a separate Web Worker with a time limit, so a runaway pattern cannot freeze your browser. Matches are highlighted and listed with their groups.',
    example: '[6-9]\\d{9} matches 10-digit Indian mobile numbers that start with 6, 7, 8 or 9.',
    faq: [
      privacy,
      {
        q: 'Which regex flavour is used?',
        a: 'JavaScript (ECMAScript) regular expressions, as used in browsers and Node.js. Syntax differs slightly from PCRE, Python and Java.',
      },
    ],
  },
  'sql-formatter': {
    description:
      'Format SQL queries with consistent indentation and keyword case for PostgreSQL, MySQL, SQL Server, Oracle, SQLite, BigQuery and standard SQL.',
    whatIs:
      'Formatted SQL is easier to read, review and debug, especially for long joins and nested queries.',
    howItWorks:
      'The query is tokenised with a dialect-aware parser and re-printed with line breaks before clauses and indentation for nested expressions.',
    example:
      'A one-line SELECT with JOIN, WHERE and GROUP BY becomes a clearly structured multi-line query.',
    faq: [
      privacy,
      {
        q: 'Does it change what my query does?',
        a: 'No. Only whitespace and keyword case change.',
      },
    ],
  },
  'sql-minifier': {
    description:
      'Minify SQL by stripping comments and collapsing whitespace while preserving string literals and quoted identifiers exactly.',
    whatIs: 'Minified SQL is compact for embedding in code, logs or configuration.',
    howItWorks:
      'A small tokenizer walks the query, copying quoted strings unchanged, removing -- and /* */ comments, and reducing whitespace to single spaces.',
    example: "SELECT a -- id\nFROM t WHERE x = 'a  b' becomes SELECT a FROM t WHERE x = 'a  b'.",
    faq: [
      privacy,
      {
        q: 'Is it safe for strings with -- inside?',
        a: 'Yes. Comment markers inside quotes are part of the string and are left alone.',
      },
    ],
  },
  'html-formatter': {
    description:
      'Format and indent HTML documents and snippets, including embedded CSS and JavaScript, using Prettier.',
    whatIs: 'Formatted HTML makes nesting clear and diffs smaller.',
    howItWorks:
      'Prettier parses the HTML (and any <style> and <script> blocks) and prints it with consistent indentation and line length. The formatter is loaded only when you open this page.',
    example: 'A minified page becomes a readable tree with each element on its own line.',
    faq: [
      privacy,
      {
        q: 'Why did whitespace inside an element change?',
        a: 'HTML treats whitespace as significant only in some contexts. Prettier follows CSS display rules to keep rendering identical.',
      },
    ],
  },
  'css-formatter': {
    description: 'Format CSS with consistent indentation, or minify it for production.',
    whatIs:
      'Formatting puts each declaration on its own line; minifying removes whitespace and comments to reduce file size.',
    howItWorks:
      'CSS is parsed with Prettier’s PostCSS parser (so syntax errors are caught) and printed. Minify mode then removes comments and unnecessary spaces.',
    example: '.btn{padding:8px;color:#fff} becomes a readable rule block.',
    faq: [
      privacy,
      {
        q: 'Does it support SCSS or Less?',
        a: 'It is designed for standard CSS. Simple SCSS may work, but advanced syntax is not guaranteed.',
      },
    ],
  },
  'javascript-formatter': {
    description:
      'Format JavaScript and JSX code with Prettier — choose indentation, line width, semicolons and quote style.',
    whatIs: 'Consistent formatting removes style debates and makes code easier to review.',
    howItWorks:
      'The code is parsed into a syntax tree with Babel and re-printed by Prettier. Syntax errors are reported instead of producing broken output.',
    example: 'const f=(a,b)=>{return a+b} becomes neatly spaced, multi-line code.',
    faq: [
      privacy,
      {
        q: 'Does formatting change behaviour?',
        a: 'No. Prettier only changes formatting, never the meaning of the code.',
      },
    ],
  },
  'typescript-formatter': {
    description:
      'Format TypeScript and TSX code with Prettier using your preferred indentation and style options.',
    whatIs:
      'TypeScript adds types to JavaScript. Formatting keeps interfaces, generics and type annotations readable.',
    howItWorks:
      'The TypeScript parser builds a syntax tree that Prettier prints consistently. The parser is loaded on demand.',
    example: 'interface Loan{amount:number} becomes a properly indented interface.',
    faq: [
      privacy,
      {
        q: 'Does it type-check my code?',
        a: 'No. It only formats; use the TypeScript compiler for type errors.',
      },
    ],
  },
  'xml-formatter': {
    description: 'Pretty-print XML with your choice of indentation, or minify it.',
    whatIs:
      'XML is used in SOAP APIs, RSS feeds, e-invoicing, Office files and many configuration formats.',
    howItWorks:
      'The XML is parsed by the browser’s XML parser and the document tree is re-serialised with indentation. Elements with only short text stay on one line.',
    example: '<a><b>t</b></a> becomes three indented lines.',
    faq: [
      privacy,
      {
        q: 'Are comments and CDATA kept?',
        a: 'Yes, comments, CDATA sections and processing instructions are preserved.',
      },
    ],
  },
  'xml-validator': {
    description:
      'Check whether an XML document is well-formed and see the first error with its line number.',
    whatIs:
      'Well-formed XML has one root element, properly nested and closed tags, quoted attributes and escaped special characters.',
    howItWorks:
      'The browser’s XML parser reports the first error it encounters. This checks well-formedness, not validation against an XSD schema.',
    example: '<title>Panchatantra</book> fails because the closing tag does not match.',
    faq: [
      privacy,
      {
        q: 'Does it validate against XSD or DTD?',
        a: 'No, only well-formedness. Schema validation requires the schema file and a validating parser.',
      },
    ],
  },
  'yaml-formatter': {
    description:
      'Format YAML files — Docker Compose, Kubernetes manifests, GitHub Actions and more — with consistent indentation, catching syntax errors.',
    whatIs:
      'YAML is a human-friendly configuration format where indentation defines structure, so small mistakes break files.',
    howItWorks:
      'Prettier’s YAML parser validates the document and re-prints it with consistent indentation and spacing.',
    example: 'Inconsistently indented services are normalised to two spaces per level.',
    faq: [privacy, { q: 'Can YAML use tabs?', a: 'No. YAML indentation must use spaces.' }],
  },
  'timestamp-converter': {
    description:
      'Paste a Unix timestamp or a date in almost any format and see it as Unix seconds and milliseconds, ISO 8601, RFC 2822, IST and UTC.',
    whatIs:
      'Different systems represent time differently. This converter translates between the most common representations.',
    howItWorks:
      'Numeric input is treated as a Unix timestamp (unit detected by length). Text is parsed as ISO 8601 or RFC 2822. The instant is then formatted in every representation.',
    example:
      '2026-09-27T10:30:00+05:30 is Unix 1790485200 and 2026-09-27T05:00:00.000Z in ISO UTC.',
    faq: [
      privacy,
      {
        q: 'Which date formats are accepted?',
        a: 'ISO 8601 (recommended), RFC 2822 (e.g. “Sun, 27 Sep 2026 05:00:00 GMT”) and Unix timestamps. Ambiguous formats like 03/04/2026 are not reliable.',
      },
    ],
  },
  'cron-expression-generator': {
    description:
      'Build a cron expression with simple controls, read what it means in plain English and preview its next five run times in any time zone.',
    whatIs:
      'Cron schedules recurring jobs with five fields: minute, hour, day of month, month and day of week.',
    howItWorks:
      'Choose a schedule type or edit the expression directly. The expression is parsed and the next run times are calculated in the selected time zone. A plain-English description is generated for you.',
    formula:
      '┌ minute (0–59)\n│ ┌ hour (0–23)\n│ │ ┌ day of month (1–31)\n│ │ │ ┌ month (1–12)\n│ │ │ │ ┌ day of week (0–6, Sun = 0)\n* * * * *',
    example: '30 9 * * 1-5 runs at 9:30 AM Monday to Friday.',
    faq: [
      privacy,
      {
        q: 'What if both day of month and day of week are set?',
        a: 'Standard cron runs the job when either matches, which the preview follows.',
      },
    ],
  },
  'color-converter': {
    description:
      'Convert colours between HEX, RGB, HSL, HSV and CMYK, pick colours visually and check WCAG contrast with white and black text.',
    whatIs:
      'Designers and developers use different colour models: HEX and RGB for screens, HSL for adjusting hue and lightness, and CMYK for print.',
    howItWorks:
      'The input is parsed into RGB and converted with standard formulas. Contrast ratios use WCAG 2 relative luminance.',
    formula: 'Contrast = (L1 + 0.05) ÷ (L2 + 0.05)',
    example: '#1d5cf1 = rgb(29, 92, 241) = hsl(222, 88%, 53%).',
    faq: [
      privacy,
      {
        q: 'What contrast ratio do I need?',
        a: 'WCAG AA requires 4.5:1 for normal text and 3:1 for large text; AAA requires 7:1.',
      },
    ],
  },
  'lorem-ipsum-generator': {
    description:
      'Generate lorem ipsum placeholder text by paragraphs, sentences or words, optionally wrapped in HTML <p> tags.',
    whatIs:
      'Lorem ipsum is scrambled Latin used as filler so layouts can be reviewed without real content distracting from the design.',
    howItWorks:
      'Sentences are assembled randomly from a classic lorem ipsum vocabulary. You can start with the traditional “Lorem ipsum dolor sit amet”.',
    example: 'Three paragraphs of 4–7 sentences each, ready to paste into a mock-up.',
    faq: [
      {
        q: 'Should lorem ipsum go live?',
        a: 'No — replace it with real content before publishing. Search engines treat it as low-quality text.',
      },
    ],
  },
  'user-agent-parser': {
    description:
      'Parse a browser user-agent string to identify the browser, version, operating system, device type, model and rendering engine.',
    whatIs:
      'Browsers send a User-Agent header describing themselves. It is useful for debugging and analytics, though it can be spoofed.',
    howItWorks:
      'Pattern rules identify browsers (ordered carefully, since most include “Chrome” or “Safari”), operating systems, device vendors and bots. Your own user agent is pre-filled.',
    example:
      'An Android 14 Samsung phone running Chrome 129 is detected as Chrome 129, Android 14, mobile, Samsung SM-S918B.',
    faq: [
      privacy,
      {
        q: 'Why does Windows 11 show as “10 / 11”?',
        a: 'Windows 11 still reports “Windows NT 10.0” in the user agent; only Client Hints can distinguish them.',
      },
    ],
  },
  'ip-address-information-tool': {
    description:
      'Analyse any IPv4 or IPv6 address: its type, binary and integer forms and, for CIDR ranges, the network, broadcast, masks and usable hosts.',
    whatIs:
      'An IP address identifies a device on a network. CIDR notation like 192.168.1.0/24 describes a subnet — a block of addresses that share the same network prefix.',
    howItWorks:
      'Addresses are parsed and classified in your browser (private, public, loopback, multicast…). Subnet values are calculated with bit masks. Nothing is sent to a server.',
    formula: 'Usable hosts = 2^(32 − prefix) − 2',
    example: '192.168.1.10/24: network 192.168.1.0, broadcast 192.168.1.255, 254 usable hosts.',
    faq: [
      privacy,
      {
        q: 'How do I find my own public IP?',
        a: 'Your router’s status page shows it. Note that your device usually has a private address (like 192.168.x.x) behind the router; websites see the router’s public address.',
      },
    ],
  },
  'html-entity-encoder': {
    description:
      'Escape characters like <, >, & and quotes as HTML entities, optionally including symbols and all non-ASCII characters.',
    whatIs:
      'HTML entities let you display characters that would otherwise be interpreted as markup, which also prevents HTML injection when showing user text.',
    howItWorks:
      'Each character is replaced with its named entity (such as &lt;) or a numeric reference (such as &#8377;) depending on the mode.',
    example: '<b>Tom & Jerry</b> becomes &lt;b&gt;Tom &amp; Jerry&lt;/b&gt;.',
    faq: [
      privacy,
      {
        q: 'Is this enough to prevent XSS?',
        a: 'Escaping text content is essential, but attributes, URLs and scripts need context-specific encoding. Use your framework’s built-in escaping.',
      },
    ],
  },
  'html-entity-decoder': {
    description:
      'Decode named and numeric HTML entities such as &amp;, &lt;, &#8377; and &#x1F600; back into readable characters.',
    whatIs:
      'Text copied from web page source or APIs often contains entities instead of characters.',
    howItWorks:
      'Named entities are looked up in a table and numeric references (decimal or hex) are converted to Unicode code points. Unknown entities are left unchanged. Nothing is rendered as HTML.',
    example: '&lt;p&gt;&#8377;1,499&lt;/p&gt; decodes to <p>₹1,499</p>.',
    faq: [privacy],
  },
};

export default content;
