import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Time matters more than the amount',
      paragraphs: [
        'A SIP compounds: returns earned in early years earn returns of their own later. That is why the last few years of a long SIP add more value than the first decade.',
        'At an assumed 12% a year, ₹10,000 a month grows to about ₹23 lakh after 10 years, but to about ₹1 crore after 20 years, even though you have only invested twice as much.',
      ],
      table: {
        head: ['₹10,000 a month at 12%', 'Invested', 'Estimated value'],
        rows: [
          ['5 years', '₹6,00,000', '₹8,24,864'],
          ['10 years', '₹12,00,000', '₹23,23,391'],
          ['15 years', '₹18,00,000', '₹50,45,760'],
          ['20 years', '₹24,00,000', '₹99,91,479'],
          ['25 years', '₹30,00,000', '₹1,89,76,351'],
        ],
      },
    },
    {
      heading: 'Choosing a realistic return',
      paragraphs: [
        'The expected return is an assumption, not a promise. Broad Indian equity indices have delivered roughly 10–13% a year over long periods, with large differences between decades and some years of steep losses. Debt funds typically return closer to fixed-deposit rates.',
        'It is sensible to plan with a conservative figure and treat anything above it as a bonus. Over 20 years, ₹10,000 a month becomes about ₹59 lakh at 8%, ₹77 lakh at 10%, ₹1 crore at 12% and ₹1.32 crore at 14%.',
      ],
    },
    {
      heading: 'Step-up SIPs',
      paragraphs: [
        'A step-up (top-up) SIP raises the monthly amount every year, usually in line with salary increases. Starting at ₹10,000 and increasing it by 10% each year, you would invest about ₹68.7 lakh over 20 years and, at 12%, build about ₹1.99 crore, roughly double the flat SIP.',
      ],
    },
    {
      heading: 'Inflation and goals',
      paragraphs: [
        'A corpus that looks large today will buy less in future. At 6% inflation, prices roughly double every 12 years, so ₹1 crore in 20 years is worth about ₹31 lakh in today’s money. Size the SIP for the inflated cost of the goal, not today’s cost.',
      ],
    },
    {
      heading: 'How SIP gains are taxed',
      list: [
        'Each instalment is treated as a separate purchase, with its own holding period.',
        'Equity funds: units held over 12 months give long-term gains, taxed at 12.5% on the total above ₹1.25 lakh a year; units held 12 months or less are taxed at 20%.',
        'Debt funds bought on or after 1 April 2023: gains are added to income and taxed at your slab rate, whatever the holding period.',
        'ELSS funds qualify for Section 80C in the old regime, with a three-year lock-in for each instalment.',
      ],
    },
  ],
  faq: [
    {
      q: 'What happens if I miss a SIP instalment?',
      a: 'Usually nothing except the missed investment. Most fund houses cancel a SIP after three consecutive failed debits, and your bank may charge a fee for a bounced auto-debit.',
    },
    {
      q: 'Is it better to invest a lump sum or through a SIP?',
      a: 'If markets rise steadily, a lump sum invested early does better. A SIP spreads purchases over time, which reduces the risk of investing everything just before a fall. For monthly savings from salary, a SIP is the natural choice.',
    },
  ],
};

export default guide;
