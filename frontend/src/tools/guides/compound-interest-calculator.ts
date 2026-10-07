import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Simple vs compound interest',
      paragraphs: [
        'Simple interest is calculated only on the original principal. Compound interest is calculated on the principal plus all interest added so far, so the amount grows faster every year.',
        '₹1,00,000 at 8% for 10 years becomes ₹1,80,000 with simple interest, but ₹2,15,892 with yearly compounding. The extra ₹35,892 is interest earned on interest.',
      ],
    },
    {
      heading: 'How compounding frequency changes the result',
      paragraphs: [
        'The more often interest is added, the sooner it starts earning interest itself. The difference is small compared with the effect of rate and time, but it is why banks quote an effective annual yield alongside the rate.',
      ],
      table: {
        head: ['₹1 lakh at 8% for 10 years', 'Final amount', 'Interest'],
        rows: [
          ['Simple interest', '₹1,80,000', '₹80,000'],
          ['Compounded yearly', '₹2,15,892', '₹1,15,892'],
          ['Compounded quarterly', '₹2,20,804', '₹1,20,804'],
          ['Compounded monthly', '₹2,21,964', '₹1,21,964'],
        ],
      },
    },
    {
      heading: 'The power of time',
      paragraphs: [
        'Compounding is slow at first and fast later. At 10% a year, ₹1 lakh becomes ₹1.61 lakh in 5 years, ₹2.59 lakh in 10, ₹6.73 lakh in 20 and ₹17.45 lakh in 30. The last ten years add more than the first twenty.',
        'A quick estimate is the Rule of 72: divide 72 by the annual rate to find roughly how many years money takes to double. At 8% that is about 9 years; at 12%, about 6.',
      ],
    },
    {
      heading: 'Compounding works against you too',
      paragraphs: [
        'The same mathematics applies to debt. Unpaid credit card balances in India typically attract interest of around 3–4% a month, which compounds to more than 40% a year. Inflation compounds as well: at 6% a year, prices roughly double every 12 years.',
      ],
    },
    {
      heading: 'Working backwards: the rate you actually earned',
      paragraphs: [
        'The same formula can be rearranged to find the yearly rate that turned one amount into another, called the compound annual growth rate (CAGR): CAGR = (final ÷ initial)^(1 ÷ years) − 1.',
        'If ₹2 lakh invested in 2016 is worth ₹4 lakh in 2026, the money doubled in 10 years, a CAGR of about 7.2% a year, not the 10% a year that “100% in 10 years” might suggest. Use CAGR to compare investments held for different lengths of time.',
      ],
    },
    {
      heading: 'Where you see compounding in India',
      list: [
        'Bank FDs and RDs: compounded quarterly.',
        'Savings accounts: interest calculated daily and credited quarterly or half-yearly.',
        'PPF and EPF: interest calculated monthly and credited yearly.',
        'Mutual funds and shares: no stated interest, but reinvested returns compound in the same way.',
      ],
    },
  ],
  faq: [
    {
      q: 'What is the difference between nominal and effective rate?',
      a: 'The nominal rate is the quoted yearly rate. The effective rate includes the effect of compounding within the year. For example, 8% compounded quarterly has an effective rate of about 8.24%.',
    },
  ],
};

export default guide;
