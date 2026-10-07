import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Where your PF contributions go',
      paragraphs: [
        'Both you and your employer contribute 12% of basic plus dearness allowance. All of your 12% goes into your EPF account. Your employer’s 12% is split: 8.33% goes to the Employees’ Pension Scheme (EPS), capped at ₹1,250 a month because pension contributions are calculated on wages of up to ₹15,000, and the rest goes to your EPF account.',
      ],
      table: {
        head: ['Basic ₹25,000 a month', 'PF on ₹15,000 ceiling', 'PF on full basic'],
        rows: [
          ['Your contribution (EPF)', '₹1,800', '₹3,000'],
          ['Employer to EPF', '₹550', '₹1,750'],
          ['Employer to EPS (pension)', '₹1,250', '₹1,250'],
          ['Credited to your EPF account', '₹2,350', '₹4,750'],
        ],
      },
    },
    {
      heading: 'How big can EPF grow?',
      paragraphs: [
        'EPF interest is calculated on the monthly running balance and credited once a year. Over a full career, interest makes up most of the final corpus.',
        'Starting at 25 with a basic salary of ₹30,000 a month, 5% yearly salary growth and 8.25% interest until 58, the projection gives:',
      ],
      table: {
        head: ['', 'PF on full basic', 'PF on ₹15,000 ceiling'],
        rows: [
          ['Your contributions', '₹34.6 lakh', '₹7.1 lakh'],
          ['Employer contributions to EPF', '₹29.6 lakh', '₹2.2 lakh'],
          ['Interest', '₹1.53 crore', '₹36.0 lakh'],
          ['Corpus at 58', '₹2.17 crore', '₹45.3 lakh'],
        ],
      },
    },
    {
      heading: 'Voluntary PF (VPF)',
      paragraphs: [
        'You can contribute more than 12% through your employer, up to 100% of basic plus DA, as Voluntary Provident Fund. VPF earns the same rate as EPF and is just as safe, but the employer does not match it. It is one of the highest safe, fixed returns available to salaried people.',
      ],
    },
    {
      heading: 'Tax on EPF',
      list: [
        'Old regime: your own contribution (including VPF) qualifies for the ₹1.5 lakh Section 80C deduction.',
        'Interest on employee contributions above ₹2.5 lakh a year (₹5 lakh if the employer does not contribute) is taxable each year.',
        'Employer contributions to EPF, NPS and superannuation together above ₹7.5 lakh a year are taxable, along with the interest on the excess.',
        'Withdrawal after five years of continuous service is tax-free. Earlier withdrawals are taxable, and TDS of 10% is deducted when the amount is ₹50,000 or more.',
      ],
    },
    {
      heading: 'Withdrawals and job changes',
      paragraphs: [
        'When you change jobs, transfer your EPF to the new employer’s account using your UAN rather than withdrawing it. Continuous service across transfers counts towards the five-year tax-free limit, and the money keeps compounding.',
        'Partial withdrawals are allowed for purposes such as buying or building a house, medical treatment, education and marriage, subject to service conditions and limits that EPFO sets.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the current EPF interest rate?',
      a: 'EPFO declares the rate for each financial year after the year ends. It was 8.25% for FY 2024-25. The calculator uses that rate by default; change it if a new rate has been declared.',
    },
    {
      q: 'Can I get a pension from EPS?',
      a: 'Members with at least 10 years of service can draw a monthly pension under EPS from age 58. With less than 10 years, the EPS amount can be withdrawn as a lump sum when leaving employment.',
    },
  ],
};

export default guide;
