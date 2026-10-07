import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Cumulative and payout FDs',
      paragraphs: [
        'In a cumulative FD, interest is added to the deposit, usually every quarter, and paid with the principal at maturity. Because interest earns interest, the effective yearly return is a little higher than the quoted rate: 7% compounded quarterly works out to about 7.19% a year.',
        'In a non-cumulative or payout FD, interest is paid out monthly, quarterly or yearly instead of being reinvested. This suits people who need regular income, such as retirees, but the total earned is lower.',
      ],
      table: {
        head: ['₹5 lakh, compounded quarterly', 'Maturity value', 'Interest earned'],
        rows: [
          ['6.5% for 1 year', '₹5,33,301', '₹33,301'],
          ['7% for 3 years', '₹6,15,720', '₹1,15,720'],
          ['7.25% for 5 years', '₹7,16,130', '₹2,16,130'],
          ['7.5% for 5 years (senior citizen rate)', '₹7,24,974', '₹2,24,974'],
        ],
      },
    },
    {
      heading: 'Tax and TDS on FD interest',
      paragraphs: [
        'FD interest is fully taxable at your slab rate. For a cumulative FD, interest is taxable each year as it accrues, not only at maturity.',
        'Banks deduct TDS at 10% when your interest from that bank crosses ₹50,000 in a financial year (₹1,00,000 for senior citizens), or 20% if the bank does not have your PAN. TDS is not the final tax: if your slab rate is higher you pay the difference, and if your income is below the taxable limit you can claim a refund.',
        'If your total income is below the taxable limit, submit Form 15G (or Form 15H if you are 60 or older) to the bank at the start of the year to stop TDS.',
      ],
    },
    {
      heading: 'Real return after tax and inflation',
      paragraphs: [
        'For someone in the 30% bracket, a 7% FD earns about 4.8% after tax (plus cess), which may be below inflation. In the new regime, many salaried people below ₹12 lakh of taxable income pay no tax, so FDs suit them better.',
        'Tax-saving FDs offer a Section 80C deduction in the old regime, but they lock money in for five years and their interest is still taxable.',
      ],
    },
    {
      heading: 'Safety and choosing a bank',
      list: [
        'Deposits are insured by DICGC up to ₹5 lakh per depositor per bank, including interest, across all accounts in the same capacity.',
        'Spread larger amounts across banks to stay within the insured limit.',
        'Small finance banks often offer higher rates, which reflects higher risk; the same ₹5 lakh insurance applies.',
        'Corporate and NBFC deposits are not covered by DICGC; check their credit rating.',
      ],
    },
  ],
  faq: [
    {
      q: 'What happens if I break an FD early?',
      a: 'Most banks pay the rate applicable for the period the deposit actually ran, minus a penalty of typically 0.5–1%. Tax-saving FDs cannot be broken before five years.',
    },
    {
      q: 'Should I choose a long FD to lock in a high rate?',
      a: 'When rates are expected to fall, longer deposits lock in today’s rate. When they are expected to rise, shorter deposits let you reinvest sooner. Splitting money across several maturities (laddering) balances the two.',
    },
  ],
};

export default guide;
