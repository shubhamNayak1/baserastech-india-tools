import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'What decides your EMI',
      paragraphs: [
        'Three numbers set an EMI: the amount you borrow, the annual interest rate and the tenure. Indian banks use the reducing-balance method. Interest is charged each month only on the principal still outstanding, and the EMI stays constant while its split between interest and principal shifts over time.',
        'Of the three, tenure changes the result most. A longer tenure lowers the EMI but stretches the time over which interest accrues, so the total interest grows much faster than the EMI falls.',
      ],
      table: {
        head: ['₹10 lakh at 10%', 'EMI', 'Total interest', 'Total repaid'],
        rows: [
          ['1 year', '₹87,916', '₹54,992', '₹10,54,992'],
          ['3 years', '₹32,267', '₹1,61,612', '₹11,61,612'],
          ['5 years', '₹21,247', '₹2,74,820', '₹12,74,820'],
          ['10 years', '₹13,215', '₹5,85,800', '₹15,85,800'],
        ],
      },
    },
    {
      heading: 'Reading the amortisation schedule',
      paragraphs: [
        'The year-wise schedule shows how much of your payments went to interest and how much reduced the loan. In the early years interest dominates. Halfway through the tenure, well over half of the original principal is often still outstanding.',
        'This is why prepayments early in a loan save the most interest, and why the outstanding balance falls slowly at first even though you pay the same EMI every month.',
      ],
    },
    {
      heading: 'Flat rate vs reducing balance',
      paragraphs: [
        'Some lenders, particularly for consumer durables and some vehicle loans, quote a flat rate. Interest is then calculated on the original amount for the whole tenure, even as you repay it. A 7% flat rate over three years costs roughly the same as a reducing-balance rate of about 12.8%.',
        'Before you compare offers, ask whether the rate is flat or reducing, and compare the total amount repaid, including processing fees.',
      ],
    },
    {
      heading: 'Tips before you borrow',
      list: [
        'Keep total EMIs within about 40–50% of take-home pay. Lenders use a similar limit to decide eligibility.',
        'Choose the shortest tenure whose EMI you can comfortably afford.',
        'Check the processing fee, insurance bundled with the loan, and prepayment charges, not just the rate.',
        'For floating-rate loans, see what happens to the EMI if rates rise by 1–2 percentage points.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does the EMI change if interest rates change?',
      a: 'On a floating-rate loan, banks usually keep the EMI the same and change the tenure when the rate moves, unless the tenure would exceed limits. You can ask the bank to change the EMI instead. On a fixed-rate loan, the EMI stays the same for the fixed period.',
    },
    {
      q: 'Why does my bank’s EMI differ slightly from the calculator?',
      a: 'Banks may count interest on actual days in a month, round the EMI up to the next rupee, or charge broken-period interest for the days between disbursement and the first EMI date. Differences are usually a few rupees.',
    },
  ],
};

export default guide;
