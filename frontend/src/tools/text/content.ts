import type { ContentMap } from '../define';

const privacy = {
  q: 'Is my text uploaded anywhere?',
  a: 'No. All processing happens in your browser, so your text never leaves your device.',
};

const content: ContentMap = {
  'word-counter': {
    description:
      'Count words, characters, sentences and paragraphs as you type, with reading and speaking time and the most frequent words.',
    whatIs:
      'A word counter measures the length of essays, articles, assignments and social posts, many of which have strict word limits.',
    howItWorks:
      'Words are detected with the browser’s language-aware segmenter, so Hindi and other Indian scripts are counted correctly. Reading time assumes 238 words per minute.',
    formula: 'Reading time = words ÷ 238 words per minute',
    example: 'A 1,200-word blog post takes about 5 minutes to read and 9 minutes to speak.',
    faq: [
      privacy,
      {
        q: 'Are numbers and hyphenated words counted?',
        a: 'Yes. Numbers count as words and hyphenated words like “well-known” count as one.',
      },
    ],
  },
  'character-counter': {
    description:
      'Count characters with and without spaces, letters and bytes, and check against limits for SMS, X, titles and meta descriptions.',
    whatIs:
      'Many platforms limit characters: SMS (160), X posts (280), SEO titles (~60) and meta descriptions (~160).',
    howItWorks:
      'Characters are counted as user-perceived characters (graphemes), so an emoji with a skin tone counts once. UTF-8 bytes are shown separately because some systems limit bytes.',
    example: 'A 75-character message leaves 205 characters for an X post.',
    faq: [
      privacy,
      {
        q: 'Why does an SMS in Hindi allow fewer characters?',
        a: 'Non-Latin SMS use Unicode (UCS-2) encoding, which allows 70 characters per message instead of 160.',
      },
    ],
  },
  'sentence-counter': {
    description: 'Count sentences and see the average sentence length to keep your writing clear.',
    whatIs:
      'Sentence length strongly affects readability. Most readers find 15–20 words per sentence comfortable.',
    howItWorks:
      'Text is split at full stops, question and exclamation marks (and the Devanagari danda ।) followed by a new sentence.',
    formula: 'Average sentence length = words ÷ sentences',
    example: 'Two sentences with 30 words have an average of 15 words per sentence.',
    faq: [
      privacy,
      {
        q: 'Why is “e.g.” sometimes counted as a sentence break?',
        a: 'Abbreviations followed by a capital letter can look like sentence ends. The count is an estimate.',
      },
    ],
  },
  'paragraph-counter': {
    description: 'Count paragraphs and see average paragraph length.',
    whatIs:
      'Short paragraphs are easier to read on mobile screens. Web writers often aim for 2–4 sentences per paragraph.',
    howItWorks: 'Paragraphs are separated by one or more blank lines.',
    example: 'An article with 12 paragraphs and 1,200 words averages 100 words per paragraph.',
    faq: [
      privacy,
      {
        q: 'Does a single line break start a new paragraph?',
        a: 'No, a blank line is needed. Single line breaks are treated as part of the same paragraph.',
      },
    ],
  },
  'reading-time-calculator': {
    description:
      'Estimate reading time for articles and emails, and speaking time for speeches, presentations and videos.',
    whatIs:
      'Reading time helps readers decide whether to start an article, and speaking time helps you fit a talk into a time slot.',
    howItWorks:
      'Word count is divided by an average speed: 238 words per minute for silent reading (adjustable) and 130 for speaking.',
    formula: 'Time = words ÷ words per minute',
    example: 'A 650-word speech takes about 5 minutes to deliver.',
    faq: [
      privacy,
      {
        q: 'How fast do people read?',
        a: 'Adults typically read English non-fiction at 200–260 words per minute; technical content is slower.',
      },
    ],
  },
  'case-converter': {
    description:
      'Change text between sentence case, Title Case, UPPERCASE, lowercase, camelCase, PascalCase, snake_case, kebab-case and more.',
    whatIs:
      'Different contexts need different letter cases — headings, legal text, code variables and URLs all have conventions.',
    howItWorks:
      'For programming cases, text is split into words (including splitting existing camelCase), then rejoined with the chosen style.',
    example:
      '“Total loan amount” → totalLoanAmount (camel), total_loan_amount (snake), total-loan-amount (kebab).',
    faq: [
      privacy,
      {
        q: 'What is the difference between Title Case and Capitalized Each Word?',
        a: 'Title Case keeps small words like “of” and “the” lowercase in the middle of a title; Capitalized capitalises every word.',
      },
    ],
  },
  'uppercase-converter': {
    description: 'Convert any text to UPPERCASE capital letters.',
    whatIs: 'Uppercase is used for acronyms, form entries like PAN and IFSC, and short emphasis.',
    howItWorks:
      'Each letter is converted using Unicode case rules, so accented letters convert correctly.',
    example: '“gst number” → “GST NUMBER”.',
    faq: [
      privacy,
      {
        q: 'Does it affect Hindi?',
        a: 'Devanagari has no letter case, so Hindi text is unchanged.',
      },
    ],
  },
  'lowercase-converter': {
    description: 'Convert any text to lowercase small letters.',
    whatIs:
      'Lowercase is handy for fixing text typed with Caps Lock on, or normalising emails and usernames.',
    howItWorks: 'Every letter is converted with Unicode lowercase rules.',
    example: '“PLEASE READ THIS” → “please read this”.',
    faq: [privacy],
  },
  'title-case-converter': {
    description:
      'Convert headings and titles to proper Title Case, keeping articles and short prepositions lowercase and preserving acronyms.',
    whatIs:
      'Title case capitalises the major words of a title. Style guides keep minor words (a, an, the, and, of, in…) lowercase unless they start or end the title.',
    howItWorks:
      'The first and last words are always capitalised; minor words in between are lowercased; words already in all caps (like EMI or GST) are kept.',
    example: '“the story of an EMI and the bank” → “The Story of an EMI and the Bank”.',
    faq: [privacy],
  },
  'remove-duplicate-lines': {
    description:
      'Remove repeated lines from lists, keeping the first occurrence and the original order.',
    whatIs: 'Useful for cleaning email lists, keywords, product codes or any list with repeats.',
    howItWorks:
      'Each line is compared (optionally ignoring case and surrounding spaces) with lines already seen; repeats are dropped.',
    example: 'apple, banana, Apple, banana → apple, banana (ignoring case).',
    faq: [privacy],
  },
  'remove-extra-spaces': {
    description:
      'Collapse multiple spaces into one, trim lines, convert tabs and tidy up blank lines.',
    whatIs: 'Text copied from PDFs and websites often contains extra spaces, tabs and empty lines.',
    howItWorks:
      'Runs of spaces (including non-breaking spaces) become a single space; lines can be trimmed and blank lines collapsed or removed.',
    example: '“This   has    spaces” → “This has spaces”.',
    faq: [privacy],
  },
  'text-sorter': {
    description:
      'Sort lines A–Z or Z–A, naturally (item2 before item10), by length, reverse their order or shuffle them.',
    whatIs: 'Sorting organises lists of names, cities, keywords or data.',
    howItWorks:
      'Sorting uses a locale-aware collator. Natural sort compares numbers inside text by value. Shuffle uses a secure random generator.',
    example: 'item10, item2, item1 → item1, item2, item10 (natural sort).',
    faq: [privacy],
  },
  'text-reverser': {
    description:
      'Reverse text by characters, word order, each word or line order — safely handling emoji and Indian scripts.',
    whatIs: 'Reversing text is used for puzzles, palindromes, testing and fun.',
    howItWorks:
      'Characters are reversed by user-perceived characters (graphemes), so emoji and combined letters in Hindi are not broken apart.',
    example: '“hello world” → “dlrow olleh”; word order → “world hello”.',
    faq: [privacy],
  },
  'text-cleaner': {
    description:
      'Clean text by stripping HTML tags, emoji, smart quotes, invisible characters, URLs, emails, punctuation or numbers.',
    whatIs:
      'Text pasted from websites, Word documents and chat apps often carries hidden formatting that breaks forms and code.',
    howItWorks:
      'Each selected rule is applied in a safe order, then spaces are tidied. Invisible zero-width characters are removed too.',
    example: '<p>“Offer” 🎉</p> → "Offer".',
    faq: [privacy],
  },
  'slug-generator': {
    description:
      'Generate clean, lowercase, hyphenated URL slugs from titles for blogs, products and pages.',
    whatIs:
      'A slug is the readable part of a URL, like /tools/emi-calculator. Good slugs are short, descriptive and contain keywords.',
    howItWorks:
      'Accents are removed, symbols like & and ₹ become words, everything else that is not a letter or number becomes a separator, and the result is trimmed to your maximum length at a word boundary.',
    example:
      '“Home Loan EMI Calculator – Complete Guide for 2026!” → home-loan-emi-calculator-complete-guide-for-2026.',
    faq: [
      privacy,
      { q: 'Hyphens or underscores?', a: 'Google recommends hyphens to separate words in URLs.' },
    ],
  },
  'find-and-replace': {
    description:
      'Find and replace words or phrases in text, with options for matching case, whole words only and regular expressions.',
    whatIs: 'Bulk replacement saves time when editing long documents, lists and code.',
    howItWorks:
      'Your search is escaped (or used as a regex), optionally wrapped in word boundaries that work for Unicode, and every match is replaced. The number of replacements is shown.',
    example:
      'Replacing whole word “GST” with “Goods and Services Tax” leaves words like “GSTIN” unchanged.',
    faq: [
      privacy,
      {
        q: 'Can I use capture groups?',
        a: 'Yes, in regular-expression mode: use $1, $2 in the replacement.',
      },
    ],
  },
  'text-compare': {
    description:
      'Compare two versions of text line by line and see exactly which lines were added, removed or unchanged.',
    whatIs:
      'A diff shows changes between two texts — useful for contracts, code, configuration and documents.',
    howItWorks:
      'The longest common subsequence algorithm aligns the two texts and marks lines only in the original as removed and lines only in the new text as added.',
    example: 'Changing “Status: Pending” to “Status: Paid” shows one line removed and one added.',
    faq: [
      privacy,
      {
        q: 'Is there a size limit?',
        a: 'To keep your browser responsive, texts up to about 5,000 lines each can be compared.',
      },
    ],
  },
  'line-counter': {
    description:
      'Count lines in text or code, including non-empty and blank lines, with the longest and average line length.',
    whatIs:
      'Line counts are used for lines-of-code estimates, CSV row counts and checking list lengths.',
    howItWorks:
      'Text is split on Windows, Mac or Unix line breaks. Blank lines contain only whitespace.',
    example: 'A file with 120 lines, 20 of them blank, has 100 non-empty lines.',
    faq: [privacy],
  },
};

export default content;
