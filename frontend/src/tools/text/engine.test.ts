import {
  cleanText,
  convertCase,
  diffLines,
  findReplace,
  formatMinutes,
  removeDuplicateLines,
  removeExtraSpaces,
  reverseText,
  slugify,
  sortLines,
  textStats,
  titleCase,
  words,
} from './engine';

describe('counting', () => {
  it('counts words, sentences and paragraphs', () => {
    const s = textStats('Hello world. This is BASERASTECH!\n\nSecond paragraph here? Yes.');
    expect(s.words).toBe(9);
    expect(s.sentences).toBe(4);
    expect(s.paragraphs).toBe(2);
    expect(s.lines).toBe(3);
    expect(textStats('').words).toBe(0);
    expect(textStats('   ').sentences).toBe(0);
  });
  it('handles Hindi and emoji', () => {
    expect(words('नमस्ते दुनिया, कैसे हो?')).toHaveLength(4);
    expect(textStats('👍🏽 ok').characters).toBe(4);
  });
  it('formats reading time', () => {
    expect(formatMinutes(0)).toBe('0 sec');
    expect(formatMinutes(1.5)).toBe('1 min 30 sec');
  });
});

describe('case conversion', () => {
  it('converts between cases', () => {
    expect(titleCase('the story of an EMI and the bank')).toBe('The Story of an EMI and the Bank');
    expect(convertCase('hello WORLD. how are you', 'sentence')).toBe('Hello world. How are you');
    expect(convertCase('Total Loan amount', 'camel')).toBe('totalLoanAmount');
    expect(convertCase('totalLoanAmount', 'snake')).toBe('total_loan_amount');
    expect(convertCase('Total loan amount', 'kebab')).toBe('total-loan-amount');
    expect(convertCase('total loan amount', 'constant')).toBe('TOTAL_LOAN_AMOUNT');
    expect(convertCase('XMLHttpRequest', 'kebab')).toBe('xml-http-request');
  });
});

describe('line tools', () => {
  it('removes duplicates', () => {
    const r = removeDuplicateLines('a\nB\nb\na\n\n\nc', {
      ignoreCase: true,
      trim: true,
      keepBlank: false,
    });
    expect(r.output).toBe('a\nB\n\nc');
    expect(r.removed).toBe(3);
  });
  it('removes extra spaces', () => {
    expect(
      removeExtraSpaces('  a   b \n\n\n\n c\t\td ', {
        trimLines: true,
        removeBlank: false,
        tabs: true,
        collapseBlank: true,
      }),
    ).toBe('a b\n\nc d');
  });
  it('sorts naturally', () => {
    expect(
      sortLines('item10\nitem2\nItem1', 'natural', {
        ignoreCase: true,
        unique: false,
        removeBlank: true,
      }),
    ).toBe('Item1\nitem2\nitem10');
    expect(sortLines('b\na\nb', 'az', { ignoreCase: false, unique: true, removeBlank: true })).toBe(
      'a\nb',
    );
  });
  it('reverses', () => {
    expect(reverseText('abc', 'characters')).toBe('cba');
    expect(reverseText('one two three', 'words')).toBe('three two one');
    expect(reverseText('hello world', 'eachWord')).toBe('olleh dlrow');
    // Grapheme-aware: combining marks stay attached, so reversing twice restores the text.
    const hindi = reverseText('नमस्ते', 'characters');
    expect(hindi.startsWith('\u094D')).toBe(false);
    expect(reverseText(hindi, 'characters')).toBe('नमस्ते');
  });
});

describe('cleaning, slugs, find & replace, diff', () => {
  it('cleans text', () => {
    const o = {
      html: true,
      urls: true,
      emails: true,
      emoji: true,
      nonAscii: false,
      punctuation: false,
      numbers: false,
      smartQuotes: true,
      zeroWidth: true,
      lineBreaks: false,
    };
    expect(cleanText('<p>Hi “there” 👋 visit https://x.com or a@b.com</p>', o)).toBe(
      'Hi "there" visit or',
    );
  });
  it('creates SEO slugs', () => {
    expect(
      slugify('Home Loan EMI Calculator – 2026 Guide!', {
        separator: '-',
        maxLength: 0,
        removeStopWords: false,
        lowercase: true,
      }),
    ).toBe('home-loan-emi-calculator-2026-guide');
    expect(
      slugify('Café & Crème: ₹100 off', {
        separator: '-',
        maxLength: 0,
        removeStopWords: false,
        lowercase: true,
      }),
    ).toBe('cafe-and-creme-rs-100-off');
    expect(
      slugify('The best way to save tax in India', {
        separator: '_',
        maxLength: 20,
        removeStopWords: true,
        lowercase: true,
      }),
    ).toBe('best_way_save_tax');
  });
  it('finds and replaces', () => {
    expect(
      findReplace('Cat cat catalog', 'cat', 'dog', {
        caseSensitive: false,
        wholeWord: true,
        regex: false,
      }),
    ).toEqual({ output: 'dog dog catalog', count: 2 });
    expect(
      findReplace('2026-09-27', '(\\d+)-(\\d+)-(\\d+)', '$3/$2/$1', {
        caseSensitive: true,
        wholeWord: false,
        regex: true,
      }).output,
    ).toBe('27/09/2026');
    expect(() =>
      findReplace('x', '(', '', { caseSensitive: true, wholeWord: false, regex: true }),
    ).toThrow('Invalid pattern');
  });
  it('diffs lines', () => {
    const d = diffLines('a\nb\nc', 'a\nc\nd', { ignoreCase: false, ignoreWhitespace: false });
    expect(d).toEqual([
      { type: 'same', text: 'a' },
      { type: 'del', text: 'b' },
      { type: 'same', text: 'c' },
      { type: 'add', text: 'd' },
    ]);
    expect(diffLines('A ', 'a', { ignoreCase: true, ignoreWhitespace: true })).toEqual([
      { type: 'same', text: 'a' },
    ]);
  });
});
