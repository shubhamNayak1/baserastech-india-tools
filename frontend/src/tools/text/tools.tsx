import { createTextTool } from '@/components/text-tool/TextTool';
import type { ResultItem } from '@/components/form-tool/types';
import { formatNumber } from '@/utils/format';
import {
  cleanText,
  convertCase,
  findReplace,
  formatMinutes,
  lines,
  removeDuplicateLines,
  removeExtraSpaces,
  reverseText,
  slugify,
  sortLines,
  textStats,
  type CaseKind,
  type ReverseMode,
  type SortMode,
} from './engine';

const SAMPLE = `India is the world’s most populous country and one of its fastest-growing major economies. Millions of people use online calculators every day to plan loans, taxes and savings.

Good tools explain their results. They show the formula, give an example and answer common questions — so people can make confident decisions.`;

const n = (v: number) => formatNumber(v, 0);

export const WordCounter = createTextTool({
  input: { label: 'Your text', sample: SAMPLE, rows: 12 },
  mono: false,
  transform: (t) => {
    const s = textStats(t);
    const info: ResultItem[] = [
      { label: 'Words', value: n(s.words), primary: true },
      { label: 'Characters', value: n(s.characters) },
      { label: 'Characters (no spaces)', value: n(s.charactersNoSpaces) },
      { label: 'Sentences', value: n(s.sentences) },
      { label: 'Paragraphs', value: n(s.paragraphs) },
      { label: 'Reading time', value: formatMinutes(s.readingMinutes) },
      { label: 'Speaking time', value: formatMinutes(s.speakingMinutes) },
      { label: 'Unique words', value: n(s.uniqueWords) },
    ];
    return {
      info,
      extra: s.topWords.length ? (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-medium text-slate-700">Most frequent words</h3>
          <ul className="flex flex-wrap gap-2">
            {s.topWords.map(([w, c]) => (
              <li key={w} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {w} <span className="text-slate-500">× {c}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : undefined,
    };
  },
});

export const CharacterCounter = createTextTool({
  input: {
    label: 'Your text',
    sample: 'Get your free EMI, GST and salary calculators at BASERASTECH India Tools! 🚀',
    rows: 8,
  },
  mono: false,
  options: [
    {
      name: 'limit',
      label: 'Character limit to check',
      type: 'select',
      default: '280',
      options: [
        { value: '0', label: 'None' },
        { value: '160', label: '160 (SMS)' },
        { value: '280', label: '280 (X / Twitter)' },
        { value: '160m', label: '160 (meta description)' },
        { value: '60', label: '60 (page title)' },
        { value: '2200', label: '2,200 (Instagram caption)' },
      ],
    },
  ],
  transform: (t, o) => {
    const s = textStats(t);
    const limit = parseInt(String(o.limit), 10);
    return {
      info: [
        {
          label: 'Characters',
          value: n(s.characters),
          primary: true,
          hint: limit
            ? `${limit - s.characters >= 0 ? n(limit - s.characters) + ' left' : n(s.characters - limit) + ' over the limit'} of ${limit}`
            : undefined,
        },
        { label: 'Without spaces', value: n(s.charactersNoSpaces) },
        { label: 'Letters', value: n(s.letters) },
        { label: 'Words', value: n(s.words) },
        { label: 'Lines', value: n(s.lines) },
        {
          label: 'Size in UTF-8',
          value: `${n(s.bytes)} bytes`,
          hint: 'Emoji and Indian scripts use 3–4 bytes per character',
        },
      ],
    };
  },
});

export const SentenceCounter = createTextTool({
  input: { label: 'Your text', sample: SAMPLE, rows: 10 },
  mono: false,
  transform: (t) => {
    const s = textStats(t);
    return {
      info: [
        { label: 'Sentences', value: n(s.sentences), primary: true },
        {
          label: 'Average words per sentence',
          value: s.sentences ? formatNumber(s.words / s.sentences, 1) : '0',
          hint:
            s.sentences && s.words / s.sentences > 25
              ? 'Long sentences – consider splitting'
              : 'Readable length',
        },
        { label: 'Words', value: n(s.words) },
        { label: 'Paragraphs', value: n(s.paragraphs) },
      ],
    };
  },
});

export const ParagraphCounter = createTextTool({
  input: { label: 'Your text', sample: SAMPLE, rows: 10 },
  mono: false,
  transform: (t) => {
    const s = textStats(t);
    return {
      info: [
        { label: 'Paragraphs', value: n(s.paragraphs), primary: true },
        {
          label: 'Average sentences per paragraph',
          value: s.paragraphs ? formatNumber(s.sentences / s.paragraphs, 1) : '0',
        },
        {
          label: 'Average words per paragraph',
          value: s.paragraphs ? formatNumber(s.words / s.paragraphs, 0) : '0',
        },
        { label: 'Sentences', value: n(s.sentences) },
        { label: 'Words', value: n(s.words) },
      ],
    };
  },
});

export const ReadingTimeCalculator = createTextTool({
  input: { label: 'Article or script', sample: SAMPLE, rows: 10 },
  mono: false,
  options: [
    {
      name: 'wpm',
      label: 'Reading speed (words per minute)',
      type: 'number',
      default: 238,
      min: 50,
      max: 1000,
    },
  ],
  transform: (t, o) => {
    const s = textStats(t);
    return {
      info: [
        {
          label: 'Reading time',
          value: formatMinutes(s.words / Number(o.wpm)),
          primary: true,
          hint: `at ${o.wpm} words per minute`,
        },
        {
          label: 'Speaking / presentation time',
          value: formatMinutes(s.speakingMinutes),
          hint: 'at 130 words per minute',
        },
        { label: 'Skimming time', value: formatMinutes(s.words / 450) },
        { label: 'Words', value: n(s.words) },
      ],
    };
  },
});

const CASES: { value: CaseKind; label: string }[] = [
  { value: 'sentence', label: 'Sentence case' },
  { value: 'lower', label: 'lowercase' },
  { value: 'upper', label: 'UPPERCASE' },
  { value: 'title', label: 'Title Case' },
  { value: 'capitalized', label: 'Capitalized Each Word' },
  { value: 'camel', label: 'camelCase' },
  { value: 'pascal', label: 'PascalCase' },
  { value: 'snake', label: 'snake_case' },
  { value: 'kebab', label: 'kebab-case' },
  { value: 'constant', label: 'CONSTANT_CASE' },
  { value: 'alternating', label: 'aLtErNaTiNg' },
  { value: 'inverse', label: 'iNVERSE' },
];

export const CaseConverter = createTextTool({
  input: { label: 'Text', sample: 'the quick guide to home loan EMI in india', rows: 6 },
  mono: false,
  outputLabel: 'Converted text',
  options: [
    { name: 'kind', label: 'Convert to', type: 'select', default: 'title', options: CASES },
  ],
  transform: (t, o) => ({ output: convertCase(t, o.kind as CaseKind) }),
});

const fixedCase = (kind: CaseKind, sample: string) =>
  createTextTool({
    input: { label: 'Text', sample, rows: 6 },
    mono: false,
    outputLabel: 'Converted text',
    transform: (t) => ({ output: convertCase(t, kind) }),
  });
export const UppercaseConverter = fixedCase(
  'upper',
  'Gst registration number and pan card details',
);
export const LowercaseConverter = fixedCase(
  'lower',
  'PLEASE DO NOT WRITE IN ALL CAPS — IT FEELS LIKE SHOUTING.',
);
export const TitleCaseConverter = fixedCase(
  'title',
  'a beginner’s guide to the new tax regime and what it means for you',
);

export const RemoveDuplicateLines = createTextTool({
  input: {
    label: 'Lines',
    sample: 'apple\nbanana\nApple\ncherry\nbanana\n  cherry  \ndate',
    rows: 10,
  },
  outputLabel: 'Unique lines',
  options: [
    { name: 'ignoreCase', label: 'Ignore case', type: 'toggle', default: true },
    { name: 'trim', label: 'Trim spaces', type: 'toggle', default: true },
    { name: 'keepBlank', label: 'Keep blank lines', type: 'toggle', default: false },
  ],
  transform: (t, o) => {
    const r = removeDuplicateLines(t, {
      ignoreCase: Boolean(o.ignoreCase),
      trim: Boolean(o.trim),
      keepBlank: Boolean(o.keepBlank),
    });
    return {
      output: r.output,
      info: [
        { label: 'Duplicates removed', value: n(r.removed), primary: true },
        { label: 'Lines kept', value: n(r.kept) },
      ],
    };
  },
});

export const RemoveExtraSpaces = createTextTool({
  input: {
    label: 'Text',
    sample: 'This   text  has    too many     spaces.\n\n\n\n   And   extra blank   lines.   ',
    rows: 8,
  },
  mono: false,
  outputLabel: 'Cleaned text',
  options: [
    { name: 'trimLines', label: 'Trim each line', type: 'toggle', default: true },
    { name: 'tabs', label: 'Convert tabs to spaces', type: 'toggle', default: true },
    {
      name: 'collapseBlank',
      label: 'Collapse multiple blank lines',
      type: 'toggle',
      default: true,
    },
    { name: 'removeBlank', label: 'Remove all blank lines', type: 'toggle', default: false },
  ],
  transform: (t, o) => {
    const out = removeExtraSpaces(t, {
      trimLines: Boolean(o.trimLines),
      removeBlank: Boolean(o.removeBlank),
      tabs: Boolean(o.tabs),
      collapseBlank: Boolean(o.collapseBlank),
    });
    return {
      output: out,
      info: [{ label: 'Characters removed', value: n(t.length - out.length), primary: true }],
    };
  },
});

export const TextSorter = createTextTool({
  input: {
    label: 'Lines to sort',
    sample: 'Mumbai\nDelhi\nBengaluru\nchennai\nKolkata\nHyderabad\nPune\nAhmedabad',
    rows: 10,
  },
  outputLabel: 'Sorted lines',
  options: [
    {
      name: 'mode',
      label: 'Sort',
      type: 'select',
      default: 'az',
      options: [
        { value: 'az', label: 'A → Z' },
        { value: 'za', label: 'Z → A' },
        { value: 'natural', label: 'Natural (2 before 10)' },
        { value: 'length', label: 'Shortest first' },
        { value: 'lengthDesc', label: 'Longest first' },
        { value: 'reverse', label: 'Reverse order' },
        { value: 'random', label: 'Shuffle randomly' },
      ],
    },
    { name: 'ignoreCase', label: 'Ignore case', type: 'toggle', default: true },
    { name: 'unique', label: 'Remove duplicates', type: 'toggle', default: false },
    { name: 'removeBlank', label: 'Remove blank lines', type: 'toggle', default: true },
  ],
  transform: (t, o) => ({
    output: sortLines(t, o.mode as SortMode, {
      ignoreCase: Boolean(o.ignoreCase),
      unique: Boolean(o.unique),
      removeBlank: Boolean(o.removeBlank),
    }),
  }),
});

export const TextReverser = createTextTool({
  input: { label: 'Text', sample: 'Was it a car or a cat I saw?', rows: 6 },
  mono: false,
  outputLabel: 'Reversed',
  options: [
    {
      name: 'mode',
      label: 'Reverse',
      type: 'segmented',
      default: 'characters',
      options: [
        { value: 'characters', label: 'Characters' },
        { value: 'words', label: 'Word order' },
        { value: 'eachWord', label: 'Each word' },
        { value: 'lines', label: 'Line order' },
      ],
    },
  ],
  transform: (t, o) => ({ output: reverseText(t, o.mode as ReverseMode) }),
});

export const TextCleaner = createTextTool({
  input: {
    label: 'Messy text',
    sample:
      '<p>Check out “our” new offer 🎉🎉 at https://example.com — write to help@example.com…</p>\u200b',
    rows: 8,
  },
  mono: false,
  outputLabel: 'Clean text',
  options: [
    { name: 'html', label: 'Strip HTML tags', type: 'toggle', default: true },
    { name: 'smartQuotes', label: 'Straighten quotes & dashes', type: 'toggle', default: true },
    { name: 'zeroWidth', label: 'Remove invisible characters', type: 'toggle', default: true },
    { name: 'emoji', label: 'Remove emoji', type: 'toggle', default: true },
    { name: 'urls', label: 'Remove URLs', type: 'toggle', default: false },
    { name: 'emails', label: 'Remove email addresses', type: 'toggle', default: false },
    {
      name: 'nonAscii',
      label: 'Remove non-ASCII (accents, scripts)',
      type: 'toggle',
      default: false,
    },
    { name: 'punctuation', label: 'Remove punctuation', type: 'toggle', default: false },
    { name: 'numbers', label: 'Remove numbers', type: 'toggle', default: false },
    { name: 'lineBreaks', label: 'Join lines', type: 'toggle', default: false },
  ],
  transform: (t, o) => ({
    output: cleanText(t, {
      html: Boolean(o.html),
      urls: Boolean(o.urls),
      emails: Boolean(o.emails),
      emoji: Boolean(o.emoji),
      nonAscii: Boolean(o.nonAscii),
      punctuation: Boolean(o.punctuation),
      numbers: Boolean(o.numbers),
      smartQuotes: Boolean(o.smartQuotes),
      zeroWidth: Boolean(o.zeroWidth),
      lineBreaks: Boolean(o.lineBreaks),
    }),
  }),
});

export const SlugGenerator = createTextTool({
  input: {
    label: 'Title or text',
    sample: 'Home Loan EMI Calculator – Complete Guide for 2026!',
    rows: 3,
  },
  outputLabel: 'URL slug',
  options: [
    {
      name: 'separator',
      label: 'Separator',
      type: 'segmented',
      default: '-',
      options: [
        { value: '-', label: 'Hyphen -' },
        { value: '_', label: 'Underscore _' },
      ],
    },
    {
      name: 'maxLength',
      label: 'Max length (0 = none)',
      type: 'number',
      default: 60,
      min: 0,
      max: 200,
    },
    {
      name: 'removeStopWords',
      label: 'Remove stop words (a, the, of…)',
      type: 'toggle',
      default: false,
    },
    { name: 'lowercase', label: 'Lowercase', type: 'toggle', default: true },
    { name: 'perLine', label: 'One slug per line', type: 'toggle', default: false },
  ],
  transform: (t, o) => {
    const cfg = {
      separator: String(o.separator),
      maxLength: Number(o.maxLength),
      removeStopWords: Boolean(o.removeStopWords),
      lowercase: Boolean(o.lowercase),
    };
    const out = o.perLine
      ? lines(t)
          .filter((l) => l.trim())
          .map((l) => slugify(l, cfg))
          .join('\n')
      : slugify(t, cfg);
    return { output: out };
  },
});

export const FindAndReplace = createTextTool({
  input: {
    label: 'Text',
    sample: 'Our GST rate is 18%. The GST is added to the invoice. gst applies to services too.',
    rows: 8,
  },
  mono: false,
  outputLabel: 'Result',
  options: [
    { name: 'find', label: 'Find', type: 'text', default: 'GST' },
    { name: 'replace', label: 'Replace with', type: 'text', default: 'Goods and Services Tax' },
    { name: 'caseSensitive', label: 'Match case', type: 'toggle', default: false },
    { name: 'wholeWord', label: 'Whole words only', type: 'toggle', default: true },
    { name: 'regex', label: 'Regular expression', type: 'toggle', default: false },
  ],
  transform: (t, o) => {
    const r = findReplace(t, String(o.find), String(o.replace), {
      caseSensitive: Boolean(o.caseSensitive),
      wholeWord: Boolean(o.wholeWord),
      regex: Boolean(o.regex),
    });
    return {
      output: r.output,
      info: [{ label: 'Replacements made', value: n(r.count), primary: true }],
    };
  },
});

export const LineCounter = createTextTool({
  input: {
    label: 'Text or code',
    sample: 'line one\nline two\n\nline four is a bit longer\n',
    rows: 10,
  },
  transform: (t) => {
    const ls = lines(t);
    const nonEmpty = ls.filter((l) => l.trim());
    const longest = ls.reduce((a, l) => Math.max(a, l.length), 0);
    return {
      info: [
        { label: 'Total lines', value: n(ls.length), primary: true },
        { label: 'Non-empty lines', value: n(nonEmpty.length) },
        { label: 'Blank lines', value: n(ls.length - nonEmpty.length) },
        { label: 'Longest line', value: `${n(longest)} characters` },
        {
          label: 'Average line length',
          value: nonEmpty.length
            ? `${formatNumber(nonEmpty.reduce((a, l) => a + l.length, 0) / nonEmpty.length, 1)} characters`
            : '0',
        },
      ],
    };
  },
});
