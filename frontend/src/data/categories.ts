import type { CategoryDefinition, CategoryId } from '@/types/tool';

export const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'finance',
    name: 'Finance',
    shortName: 'Finance',
    h1: 'Financial Calculators',
    description:
      'Free financial calculators for loans, investments, savings and returns — EMI, SIP, FD, PPF, retirement and more, built for Indian users.',
    seoTitle: 'Financial Calculators – EMI, SIP, FD, PPF & Loan Calculators',
    seoDescription:
      'Free online financial calculators for India: EMI, home loan, SIP, lump sum, FD, RD, PPF, NPS, CAGR, retirement and more. Instant results in ₹.',
    icon: 'bank',
    keywords: ['finance', 'loan', 'investment', 'savings', 'money', 'interest', 'returns', 'bank'],
    related: ['salary', 'tax', 'business'],
    disclaimer: 'finance',
  },
  {
    id: 'salary',
    name: 'Salary & Career',
    shortName: 'Salary',
    h1: 'Salary & Career Calculators',
    description:
      'Work out your in-hand salary, hike, PF, gratuity, HRA, bonus and compare job offers with calculators designed for Indian payroll.',
    seoTitle: 'Salary Calculators – CTC to In-Hand, Hike, PF, Gratuity, HRA',
    seoDescription:
      'Free salary calculators for India: CTC to in-hand, salary hike, EPF, gratuity, HRA, bonus, leave encashment and offer comparison.',
    icon: 'briefcase',
    keywords: ['salary', 'career', 'job', 'ctc', 'pay', 'payroll', 'employee', 'hr'],
    related: ['tax', 'finance', 'business'],
    disclaimer: 'finance',
  },
  {
    id: 'tax',
    name: 'Tax & GST',
    shortName: 'Tax',
    h1: 'Tax & GST Calculators',
    description:
      'Estimate income tax under the old and new regimes, calculate GST, TDS, HRA exemption and capital gains with rules versioned by financial year.',
    seoTitle: 'Income Tax & GST Calculators – Old vs New Regime, TDS, HRA',
    seoDescription:
      'Free income tax and GST calculators for India: new vs old regime, GST inclusive/exclusive, TDS, HRA exemption and capital gains.',
    icon: 'receipt',
    keywords: ['tax', 'gst', 'income tax', 'tds', 'itr', 'regime', 'deduction'],
    related: ['salary', 'business', 'finance'],
    disclaimer: 'tax',
  },
  {
    id: 'business',
    name: 'Business',
    shortName: 'Business',
    h1: 'Business Calculators',
    description:
      'Margins, markups, break-even, ROI, ROAS, pricing and GST invoices — practical calculators for shop owners, freelancers and startups.',
    seoTitle: 'Business Calculators – Margin, Markup, Break-even, ROI, GST Invoice',
    seoDescription:
      'Free business calculators: profit margin, markup, discount, break-even, ROI, ROAS, pricing, commission and GST invoice.',
    icon: 'building',
    keywords: ['business', 'profit', 'margin', 'sales', 'shop', 'startup', 'pricing'],
    related: ['tax', 'finance', 'math'],
  },
  {
    id: 'math',
    name: 'Math',
    shortName: 'Math',
    h1: 'Math Calculators',
    description:
      'Percentages, fractions, ratios, averages, roots, factorials, permutations and a full scientific calculator.',
    seoTitle: 'Math Calculators – Percentage, Fraction, Scientific & More',
    seoDescription:
      'Free online math calculators: percentage, fraction, ratio, average, scientific calculator, square root, GCD, LCM, factorial and more.',
    icon: 'sigma',
    keywords: ['math', 'maths', 'arithmetic', 'algebra', 'number'],
    related: ['education', 'converters', 'business'],
  },
  {
    id: 'date-time',
    name: 'Date & Time',
    shortName: 'Date & Time',
    h1: 'Date & Time Calculators',
    description:
      'Age, date difference, working days, week numbers, countdowns, time zones and Unix timestamps.',
    seoTitle: 'Date & Time Calculators – Age, Days Between Dates, Time Zones',
    seoDescription:
      'Free date and time calculators: age calculator, days between dates, working days, add days, time zone converter and Unix timestamp tools.',
    icon: 'calendar',
    keywords: ['date', 'time', 'days', 'calendar', 'clock', 'timestamp'],
    related: ['everyday', 'education', 'developer'],
  },
  {
    id: 'converters',
    name: 'Unit Converters',
    shortName: 'Converters',
    h1: 'Unit Converters',
    description:
      'Convert length, weight, temperature, area (including bigha, acre and gaj), volume, speed, data and more across metric, imperial, US and Indian units.',
    seoTitle: 'Unit Converters – Length, Weight, Area, Temperature & More',
    seoDescription:
      'Free unit converters with metric, imperial, US and Indian units: length, weight, height, temperature, area, volume, speed and more.',
    icon: 'swap',
    keywords: ['convert', 'converter', 'unit', 'units', 'conversion', 'metric', 'imperial'],
    related: ['math', 'everyday', 'health'],
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    shortName: 'Health',
    h1: 'Health & Fitness Calculators',
    description:
      'BMI, BMR, calories, macros, body fat, water intake and pregnancy due date estimates.',
    seoTitle: 'Health & Fitness Calculators – BMI, BMR, Calories, Macros',
    seoDescription:
      'Free health calculators: BMI (with Asian-Indian cut-offs), BMR, TDEE, calories, macros, protein, body fat, water intake and due date.',
    icon: 'heart',
    keywords: ['health', 'fitness', 'diet', 'weight', 'calories', 'body'],
    related: ['converters', 'everyday', 'education'],
    disclaimer: 'health',
  },
  {
    id: 'education',
    name: 'Education',
    shortName: 'Education',
    h1: 'Education Calculators',
    description:
      'CGPA, GPA, marks percentage, grades, attendance and exam planning tools for students in India.',
    seoTitle: 'Education Calculators – CGPA, GPA, Marks %, Attendance',
    seoDescription:
      'Free calculators for students: CGPA to percentage, GPA, marks percentage, grade, attendance, required attendance and exam countdown.',
    icon: 'graduation',
    keywords: ['education', 'student', 'exam', 'marks', 'school', 'college', 'university'],
    related: ['math', 'date-time', 'text'],
  },
  {
    id: 'developer',
    name: 'Developer Tools',
    shortName: 'Developer',
    h1: 'Developer Tools',
    description:
      'Format and validate JSON, SQL, HTML, CSS, XML and YAML; encode, decode, hash and generate — everything runs locally in your browser.',
    seoTitle: 'Developer Tools – JSON Formatter, Base64, JWT, Regex, Hash',
    seoDescription:
      'Free online developer tools that run in your browser: JSON formatter, Base64, URL encoder, JWT decoder, regex tester, hash, UUID and more.',
    icon: 'code',
    keywords: ['developer', 'dev', 'programming', 'code', 'coding', 'web'],
    related: ['text', 'date-time', 'math'],
  },
  {
    id: 'text',
    name: 'Text Tools',
    shortName: 'Text',
    h1: 'Text Tools',
    description:
      'Count words and characters, change case, clean, sort, compare and transform text instantly.',
    seoTitle: 'Text Tools – Word Counter, Case Converter, Text Compare',
    seoDescription:
      'Free online text tools: word counter, character counter, case converter, remove duplicate lines, find and replace, text compare and more.',
    icon: 'type',
    keywords: ['text', 'word', 'writing', 'string', 'content'],
    related: ['developer', 'education', 'everyday'],
  },
  {
    id: 'everyday',
    name: 'Everyday Tools',
    shortName: 'Everyday',
    h1: 'Everyday Calculators & Tools',
    description:
      'Handy tools for daily life — tips, bill splitting, fuel and electricity costs, cooking conversions, sleep timing and random pickers.',
    seoTitle: 'Everyday Calculators – Tip, Split Bill, Fuel Cost, Sleep',
    seoDescription:
      'Free everyday calculators: tip, split bill, fuel cost, mileage, electricity bill, cooking unit converter, sleep and wake-up time.',
    icon: 'utensils',
    keywords: ['everyday', 'daily', 'life', 'home', 'utility'],
    related: ['converters', 'date-time', 'business'],
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryDefinition> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, CategoryDefinition>;

export function getCategory(id: string): CategoryDefinition | undefined {
  return CATEGORY_MAP[id as CategoryId];
}
