import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'How prepayment saves interest',
      paragraphs: [
        'Interest on a loan is charged each month on the outstanding principal. A prepayment reduces that principal immediately, so every future month’s interest is calculated on a smaller balance. The earlier in the loan you prepay, the more months of interest you avoid.',
        'After a prepayment, the lender either keeps your EMI the same and shortens the loan (reduce tenure) or recalculates a lower EMI over the remaining term (reduce EMI). The calculator shows both.',
      ],
    },
    {
      heading: 'Example: ₹50 lakh home loan at 8.5% for 20 years',
      paragraphs: [
        'Without prepayments, the EMI is ₹43,391 and total interest is about ₹54.14 lakh. Here is what different prepayment plans save.',
      ],
      table: {
        head: ['Plan', 'Option', 'Loan ends after', 'Interest saved'],
        rows: [
          ['₹5 lakh once, in month 36', 'Reduce tenure', '16 years 7 months', '₹13.2 lakh'],
          ['₹5 lakh once, in month 36', 'Reduce EMI to ₹38,750', '20 years', '₹4.5 lakh'],
          ['₹2 lakh every year', 'Reduce tenure', '11 years', '₹27.0 lakh'],
          ['₹2 lakh every year', 'Reduce EMI', 'About 17 years', '₹18.7 lakh'],
        ],
      },
    },
    {
      heading: 'Reduce tenure usually saves more',
      paragraphs: [
        'With reduce tenure you keep paying the original EMI on a smaller balance, so more of every EMI goes to principal and the loan closes years earlier. With reduce EMI the benefit is spread across a lower EMI for the full term, so interest keeps accruing for longer.',
        'Choose reduce EMI when cash flow matters more than total cost, for example if income is uncertain or the EMI is a large share of your pay.',
      ],
    },
    {
      heading: 'Before you prepay',
      list: [
        'Keep an emergency fund of at least six months’ expenses; money used to prepay a loan is hard to get back.',
        'Repay costlier debt first, such as credit card balances and personal loans.',
        'Check charges. Under RBI rules, floating-rate loans to individuals for non-business purposes carry no prepayment penalty. Fixed-rate and business loans may.',
        'Compare the loan rate with what the money would earn after tax elsewhere. Prepaying a 9% loan is a guaranteed 9% return.',
        'In the old tax regime, consider the home loan interest deduction under Section 24(b), which lowers the effective cost of the loan.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is a part-prepayment the same as foreclosure?',
      a: 'No. A part-prepayment reduces the principal while the loan continues. Foreclosure repays the entire outstanding amount and closes the loan.',
    },
    {
      q: 'Will the bank automatically reduce my tenure?',
      a: 'Practice varies by lender. Many default to reducing the tenure, while others reduce the EMI. State your choice in writing when you make the payment and check the revised schedule.',
    },
  ],
};

export default guide;
