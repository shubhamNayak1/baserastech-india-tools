import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Why personal loans cost more',
      paragraphs: [
        'A personal loan is unsecured: there is no house, car or deposit backing it. Lenders price that risk into the rate, which usually ranges from about 10.5% for salaried borrowers with high credit scores at large banks to well above 20% at some lenders and apps.',
        'Your rate depends mainly on your credit score, employer category, income and existing EMIs. Getting quotes from your salary-account bank and two or three other lenders often makes a difference of several percentage points.',
      ],
      table: {
        head: ['₹5 lakh over 5 years', 'EMI', 'Total interest'],
        rows: [
          ['10.5%', '₹10,747', '₹1,44,820'],
          ['12%', '₹11,122', '₹1,67,320'],
          ['14%', '₹11,634', '₹1,98,040'],
          ['16%', '₹12,159', '₹2,29,540'],
        ],
      },
    },
    {
      heading: 'Short tenure or long tenure?',
      paragraphs: [
        'Personal loans usually run from one to five years. A shorter tenure means a higher EMI but much less interest. At 11%, a ₹5 lakh loan costs ₹59,296 in interest over two years and ₹1,52,260 over five.',
      ],
      table: {
        head: ['₹5 lakh at 11%', 'EMI', 'Total interest'],
        rows: [
          ['2 years', '₹23,304', '₹59,296'],
          ['3 years', '₹16,369', '₹89,284'],
          ['4 years', '₹12,923', '₹1,20,304'],
          ['5 years', '₹10,871', '₹1,52,260'],
        ],
      },
    },
    {
      heading: 'Costs beyond the interest rate',
      list: [
        'Processing fee: commonly 1–3% of the loan plus GST, deducted from the amount you receive.',
        'Prepayment and foreclosure charges: many lenders charge 2–5% of the outstanding amount, or do not allow prepayment for the first 6–12 months.',
        'Bundled insurance: some lenders add a loan protection policy. It is optional unless the sanction letter says otherwise; ask for it to be removed if you do not want it.',
        'Late payment fees and penal charges, which also hurt your credit score.',
      ],
      paragraphs: [
        'Compare offers by the annual percentage rate (APR) shown in the Key Fact Statement, which lenders must give you before you sign. The APR includes fees, so it reflects the true cost better than the headline rate.',
      ],
    },
    {
      heading: 'Alternatives worth checking first',
      list: [
        'A loan against a fixed deposit, usually at 1–2% above the FD rate, without breaking the deposit.',
        'A top-up on an existing home loan, typically priced close to home loan rates.',
        'A loan against PPF balance in years three to six of the account, at 1% above the PPF rate.',
        'An employer salary advance, often interest-free.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does a personal loan affect my credit score?',
      a: 'Each application leads to a hard enquiry, and several in a short time can lower your score. Paying EMIs on time builds your credit history, while a missed EMI is reported to credit bureaus and stays on your report.',
    },
    {
      q: 'Is personal loan interest tax-deductible?',
      a: 'Generally no. The interest can be deductible if the money is used for business, or to buy, build or renovate a house, subject to the same conditions as home loan interest. You need records showing how the money was used.',
    },
  ],
};

export default guide;
