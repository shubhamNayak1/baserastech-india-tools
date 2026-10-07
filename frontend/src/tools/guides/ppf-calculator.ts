import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Key rules of the Public Provident Fund',
      table: {
        head: ['Feature', 'Rule'],
        rows: [
          ['Deposit', '₹500 to ₹1,50,000 per financial year, in one or more instalments'],
          [
            'Tenure',
            '15 full financial years after the year of opening; extendable in blocks of 5 years',
          ],
          [
            'Interest rate',
            'Set by the government every quarter; 7.1% a year at the time of writing',
          ],
          [
            'Interest credit',
            'Calculated monthly on the lowest balance between the 5th and month-end, credited on 31 March',
          ],
          [
            'Tax',
            'Deposits deductible under Section 80C (old regime); interest and maturity tax-free',
          ],
          ['Accounts', 'One per person, at a post office or authorised bank'],
        ],
      },
    },
    {
      heading: 'Deposit before the 5th',
      paragraphs: [
        'Because interest for each month is calculated on the lowest balance between the 5th and the last day of the month, money deposited on the 6th earns nothing for that month. If you deposit once a year, do it between 1 and 5 April to earn interest for the full year. If you deposit monthly, do it before the 5th of each month.',
      ],
    },
    {
      heading: 'What ₹1.5 lakh a year grows to',
      paragraphs: ['Depositing the maximum ₹1,50,000 at the start of every year at 7.1%:'],
      table: {
        head: ['Years', 'Total deposited', 'Maturity value'],
        rows: [
          ['15', '₹22,50,000', '₹40,68,209'],
          ['20 (one extension)', '₹30,00,000', '₹66,58,288'],
          ['25 (two extensions)', '₹37,50,000', '₹1,03,08,015'],
        ],
      },
    },
    {
      heading: 'Withdrawals, loans and extension',
      list: [
        'Loans: available from the third to the sixth financial year, up to 25% of the balance at the end of the second preceding year, at 1% above the PPF rate.',
        'Partial withdrawal: allowed once a year from the seventh financial year, up to 50% of the balance at the end of the fourth preceding year or the preceding year, whichever is lower.',
        'Premature closure: allowed after five years for serious illness, higher education or a change of residency status, with a 1% interest penalty.',
        'At maturity: withdraw everything, extend for 5 years with fresh deposits (submit Form 4 within a year of maturity), or keep the balance earning interest without new deposits.',
      ],
    },
    {
      heading: 'Who PPF suits',
      paragraphs: [
        'PPF suits conservative long-term savers who want a guaranteed, tax-free return, particularly those in higher tax brackets for whom a taxable FD yields much less after tax. Its long lock-in means it should not hold your emergency fund.',
        'A minor’s PPF account can be opened by a parent. Deposits in your own and your minor children’s accounts together are capped at ₹1.5 lakh a year.',
      ],
    },
  ],
  faq: [
    {
      q: 'What happens if I miss the minimum ₹500 deposit?',
      a: 'The account becomes discontinued. It can be revived by paying ₹500 for each missed year plus a ₹50 penalty per year. A discontinued account cannot be used for loans or withdrawals until revived.',
    },
    {
      q: 'Is PPF useful in the new tax regime?',
      a: 'There is no 80C deduction in the new regime, but interest and maturity remain tax-free, so PPF is still an attractive safe, long-term option.',
    },
  ],
};

export default guide;
