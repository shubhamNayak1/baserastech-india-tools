import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'How RD interest is calculated',
      paragraphs: [
        'A recurring deposit is a series of small fixed deposits, one each month. Indian banks compound RD interest quarterly. The first instalment earns interest for the full tenure; the last earns it for only one month.',
        'That is why the interest on an RD is roughly half what a lump-sum FD of the same total would earn: on average, your money is deposited for only half the tenure.',
      ],
      table: {
        head: ['₹5,000 a month at 7%', 'Invested', 'Maturity value', 'Interest'],
        rows: [
          ['1 year', '₹60,000', '₹62,311', '₹2,311'],
          ['5 years', '₹3,00,000', '₹3,59,664', '₹59,664'],
        ],
      },
    },
    {
      heading: 'When an RD makes sense',
      list: [
        'Saving for a known expense within one to five years, such as a vacation, school fees or a down payment, without market risk.',
        'Building the habit of saving a fixed amount from each month’s salary.',
        'Investors who want certainty about the maturity amount.',
      ],
      paragraphs: [
        'For goals more than five years away, an equity SIP has historically grown faster, though with risk. For a lump sum already in hand, an FD earns more than an RD.',
      ],
    },
    {
      heading: 'Bank RD vs Post Office RD',
      paragraphs: [
        'Post Office RDs have a fixed five-year tenure, with the rate set by the government each quarter and compounded quarterly. Bank RDs offer tenures from six months to ten years at rates the bank sets. Both are low risk; bank deposits are insured by DICGC up to ₹5 lakh per bank, while post office schemes are backed by the government.',
      ],
    },
    {
      heading: 'Tax and missed instalments',
      paragraphs: [
        'RD interest is taxable at your slab rate, and banks deduct TDS on it in the same way as FD interest when your interest from the bank crosses ₹50,000 in a year (₹1 lakh for senior citizens).',
        'Missing an instalment usually attracts a small penalty, and several consecutive misses can lead the bank to close the RD. Set up an auto-debit on salary day to avoid this.',
      ],
    },
    {
      heading: 'Planning a goal with an RD',
      paragraphs: [
        'Work backwards from the amount you need. If you want ₹3,60,000 in five years for a down payment and the bank offers 7%, the table above shows that ₹5,000 a month gets you there. To reach a larger target, raise the instalment in proportion: ₹10,000 a month at the same rate and tenure would mature at about ₹7,19,000.',
        'Choose a tenure that ends a little before you need the money, and keep in mind that the rate is fixed only for the deposit you open; a new RD next year may earn a different rate.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can I withdraw an RD early?',
      a: 'Yes, most banks allow premature closure with a penalty, usually by paying a lower rate for the period completed. Partial withdrawals are generally not allowed.',
    },
  ],
};

export default guide;
