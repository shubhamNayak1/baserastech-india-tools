import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'A ₹12 lakh CTC, line by line',
      paragraphs: [
        'With basic at 50% of CTC, HRA at 40% of basic, PF on the ₹15,000 wage ceiling, gratuity included in CTC and ₹2,400 a year of professional tax:',
      ],
      table: {
        head: ['Component', 'Per year', 'Per month'],
        rows: [
          ['Basic', '₹6,00,000', '₹50,000'],
          ['HRA', '₹2,40,000', '₹20,000'],
          ['Special allowance', '₹3,09,540', '₹25,795'],
          ['Employer PF', '₹21,600', '₹1,800'],
          ['Gratuity (4.81% of basic)', '₹28,860', '₹2,405'],
          ['Gross salary', '₹11,49,540', '₹95,795'],
          ['Employee PF', '−₹21,600', '−₹1,800'],
          ['Professional tax', '−₹2,400', '−₹200'],
          ['Income tax, new regime', 'Nil', 'Nil'],
          ['Take-home', '₹11,25,540', '₹93,795'],
        ],
      },
    },
    {
      heading: 'Settings that change the result',
      list: [
        'Basic percentage: a higher basic increases PF (if not capped), gratuity and the HRA limit, and lowers the special allowance.',
        'PF on the full basic or capped at ₹15,000: on a ₹50,000 basic, full PF takes ₹6,000 a month from each side instead of ₹1,800, cutting take-home by about ₹8,400 a month in this example while building retirement savings.',
        'Gratuity in CTC: some employers include it, others pay it on top. If it is included, that part never reaches you monthly.',
        'Tax regime: with the same CTC, the old regime without rent or investments would take about ₹1.4 lakh in tax.',
        'Variable pay: paid once or twice a year, if at all; the monthly figure excludes it.',
      ],
    },
    {
      heading: 'Professional tax by state',
      paragraphs: [
        'Professional tax is levied by states and capped at ₹2,500 a year. Karnataka, Maharashtra, West Bengal, Tamil Nadu, Telangana, Andhra Pradesh, Gujarat and several others levy it, with slabs and payment schedules that vary by state; ₹200 a month is common at typical salaries. Delhi, Haryana, Uttar Pradesh and Rajasthan do not. Enter 0 if your state has none.',
      ],
    },
    {
      heading: 'Using this when changing jobs',
      paragraphs: [
        'Run both offers through the calculator with the structures in the offer letters. Then compare monthly take-home, total employer contributions to PF and gratuity, the variable component, and benefits outside CTC such as health insurance for family members.',
        'A higher CTC can sometimes mean lower take-home, for example when more of it is variable or goes into PF on the full basic.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why does my payslip show slightly different tax?',
      a: 'Employers project your annual income and spread TDS over the remaining months, adjusting for declarations, proofs and mid-year changes. The total for the year should match the calculator if the inputs match.',
    },
    {
      q: 'Is employer NPS part of CTC?',
      a: 'If your employer offers NPS, its contribution is usually part of CTC. Employer NPS contributions are deductible under Section 80CCD(2) in both regimes, within the limit of 14% of basic in the new regime and 10% in the old regime.',
    },
  ],
};

export default guide;
