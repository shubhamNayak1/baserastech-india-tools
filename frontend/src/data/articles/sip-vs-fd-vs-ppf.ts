import type { Article } from './index';

const article: Pick<Article, 'intro' | 'sections' | 'faq'> = {
  intro: [
    'Mutual fund SIPs, bank fixed deposits and the Public Provident Fund are the three most common ways Indian households save. They are often compared on returns alone, but they differ just as much in risk, lock-in, liquidity and tax.',
    'This guide compares the three side by side and shows what ₹12,500 a month (₹1.5 lakh a year) could become in each over 15 years.',
  ],
  sections: [
    {
      heading: 'At a glance',
      table: {
        head: ['', 'Equity mutual fund SIP', 'Bank fixed deposit', 'PPF'],
        rows: [
          [
            'Return',
            'Market-linked, not guaranteed',
            'Fixed when you book',
            'Set by the government each quarter',
          ],
          [
            'Typical rate',
            'Long-run equity averages of 10–12% a year, with large swings',
            'About 6–7.5% a year',
            '7.1% a year at the time of writing',
          ],
          [
            'Risk',
            'High in the short term',
            'Low; deposits insured up to ₹5 lakh per bank',
            'Very low; government-backed',
          ],
          [
            'Lock-in',
            'None for most funds (3 years for ELSS)',
            'Chosen tenure; early exit with a penalty',
            '15 years; partial withdrawals from year 7',
          ],
          [
            'Minimum and maximum',
            'From ₹100–₹500 a month',
            'Usually from ₹1,000',
            '₹500 to ₹1,50,000 a year',
          ],
          [
            'Tax on returns',
            'Capital gains tax on redemption',
            'Interest taxed every year at your slab rate',
            'Tax-free',
          ],
        ],
      },
    },
    {
      heading: 'How each one grows',
      paragraphs: [
        'A SIP buys mutual fund units every month at the current price. The value of your holding rises and falls with the market. Over long periods, buying at many different prices smooths out the effect of any single bad month, but there is no guaranteed final amount.',
        'A fixed deposit locks a lump sum at a known rate. Most banks compound interest quarterly, so a 7% FD actually earns about 7.19% a year. To save monthly into a bank, you would use a recurring deposit, which works the same way.',
        'PPF accepts deposits once or several times a year. Interest is calculated on the lowest balance between the 5th and the end of each month and credited once a year. Depositing before the 5th of April lets the full year’s contribution earn interest for the whole year.',
      ],
    },
    {
      heading: '15-year comparison: ₹1.5 lakh a year',
      paragraphs: [
        'The table assumes ₹12,500 a month into a SIP or recurring deposit, or ₹1,50,000 deposited at the start of each year into PPF. Total invested is ₹22,50,000 in every case. SIP figures are illustrations at constant rates; real returns vary from year to year.',
      ],
      table: {
        head: ['Option', 'Assumed rate', 'Value after 15 years', 'Gain before tax'],
        rows: [
          ['PPF', '7.1%', '₹40,68,209', '₹18,18,209 (tax-free)'],
          ['Recurring deposit', '7%', '₹39,71,028', '₹17,21,028 (taxed yearly)'],
          ['SIP, cautious', '8%', '₹43,54,314', '₹21,04,314'],
          ['SIP, moderate', '10%', '₹52,24,053', '₹29,74,053'],
          ['SIP, long-run equity average', '12%', '₹63,07,200', '₹40,57,200'],
        ],
      },
    },
    {
      heading: 'Tax makes a bigger difference than it seems',
      paragraphs: [
        'PPF is exempt at all three stages. Deposits qualify for Section 80C in the old regime, interest is tax-free and the maturity amount is tax-free. In the new regime there is no 80C deduction, but the interest and maturity remain tax-free.',
        'FD and RD interest is added to your income every year and taxed at your slab rate, even if you do not withdraw it. For someone in the 30% bracket, a 7% deposit earns about 4.8% after tax, well below PPF. Banks deduct 10% TDS once interest crosses ₹50,000 a year (₹1 lakh for senior citizens).',
        'Equity mutual funds are taxed only when you redeem. Gains on units held over 12 months are long-term and taxed at 12.5% on the portion above ₹1.25 lakh a year. Gains on units held 12 months or less are taxed at 20%. Because you choose when to redeem, you can spread gains across years to stay within the exemption.',
      ],
    },
    {
      heading: 'Which one should you use?',
      list: [
        'Emergency fund and money needed within three years: fixed deposits or liquid funds, where the value will not fall when you need it.',
        'Safe long-term savings, especially in a higher tax bracket: PPF, up to its ₹1.5 lakh yearly limit.',
        'Long-term goals five or more years away, such as retirement or a child’s education: equity SIPs, accepting that the value will fall sharply in some years.',
        'Most people benefit from a mix: an FD for safety, PPF for tax-free stability and a SIP for long-term growth.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can a SIP lose money?',
      a: 'Yes. An equity SIP can show a loss for months or even a few years after a market fall. Losses become less likely the longer you stay invested, but no return is guaranteed.',
    },
    {
      q: 'Can I withdraw from PPF before 15 years?',
      a: 'Partial withdrawals are allowed from the seventh financial year, subject to limits. Premature closure after five years is allowed for specific reasons such as serious illness or higher education, with a 1% interest penalty. Loans against the balance are available in the earlier years.',
    },
    {
      q: 'Is FD interest really taxed if I do not withdraw it?',
      a: 'Yes. Interest on a cumulative FD accrues every year and must be reported as income each year, even though it is paid only at maturity.',
    },
  ],
};

export default article;
