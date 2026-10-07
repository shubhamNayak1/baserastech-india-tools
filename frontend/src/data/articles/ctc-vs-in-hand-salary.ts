import type { Article } from './index';

const article: Pick<Article, 'intro' | 'sections' | 'faq'> = {
  intro: [
    'An offer letter shows cost to company (CTC), the total your employer expects to spend on you in a year. What arrives in your bank account each month is noticeably smaller. Part of CTC never becomes salary at all, and part of your salary is deducted before it is paid.',
    'This guide walks through a typical Indian salary structure line by line, using a ₹12 lakh CTC as the example, so you can estimate your own take-home pay and compare offers properly.',
  ],
  sections: [
    {
      heading: 'The three layers of a salary',
      list: [
        'CTC: everything the employer spends, including its own PF contribution, gratuity provision and sometimes insurance premiums and variable pay.',
        'Gross salary: what is actually paid to you before deductions, made up of basic, HRA, special allowance and any bonus. It equals CTC minus the employer-side costs.',
        'In-hand (net) salary: gross salary minus your own PF contribution, professional tax and income tax deducted at source (TDS).',
      ],
    },
    {
      heading: 'Components that make up CTC',
      paragraphs: [
        'Basic salary is the anchor. Many employers set it at 40–50% of CTC. PF, gratuity and usually HRA are all calculated from it, so a higher basic means more retirement savings but a lower monthly payout.',
        'House rent allowance (HRA) is typically 40–50% of basic. It is fully taxable in the new regime. In the old regime part of it can be exempt if you pay rent.',
        'Special allowance is the balancing figure: whatever remains of the fixed CTC after the other components. It is fully taxable.',
        'Employer PF is the employer’s 12% contribution to your provident fund. Many companies apply it only to the first ₹15,000 of basic a month, which works out to ₹1,800 a month. It counts in your CTC but goes to your EPF account, not your bank account.',
        'Gratuity is commonly provisioned at 4.81% of basic, which equals 15 days’ pay for each year of service. It is paid only when you leave after at least five years of continuous service, so for most people it is not part of yearly income.',
        'Variable pay or performance bonus is paid only if targets are met, often once a year. Treat it separately from fixed pay when comparing offers.',
      ],
    },
    {
      heading: 'Deductions from gross salary',
      paragraphs: [
        'Employee PF is your own 12% contribution, matched to the same wage base as the employer’s. It is savings rather than an expense, but it reduces monthly cash in hand.',
        'Professional tax is a state tax on employment, capped at ₹2,500 a year. Many states charge ₹200 a month, while some states do not levy it at all.',
        'Income tax is deducted every month as TDS, based on your projected annual income and the regime you declare to your employer.',
      ],
    },
    {
      heading: 'Worked example: ₹12 lakh CTC',
      paragraphs: [
        'Assume basic is 50% of CTC, HRA is 40% of basic, PF is calculated on the ₹15,000 wage ceiling, gratuity is included in CTC at 4.81% of basic, professional tax is ₹2,400 a year and there is no variable pay.',
      ],
      table: {
        head: ['Component', 'Per year', 'Per month'],
        rows: [
          ['Basic salary', '₹6,00,000', '₹50,000'],
          ['HRA', '₹2,40,000', '₹20,000'],
          ['Special allowance', '₹3,09,540', '₹25,795'],
          ['Employer PF (not paid to you)', '₹21,600', '₹1,800'],
          ['Gratuity provision (not paid yearly)', '₹28,860', '₹2,405'],
          ['CTC', '₹12,00,000', '₹1,00,000'],
          ['Gross salary', '₹11,49,540', '₹95,795'],
          ['Less: employee PF', '₹21,600', '₹1,800'],
          ['Less: professional tax', '₹2,400', '₹200'],
          ['Less: income tax (new regime)', 'Nil', 'Nil'],
          ['In-hand salary', '₹11,25,540', '₹93,795'],
        ],
      },
    },
    {
      heading: 'How the choices change take-home pay',
      paragraphs: [
        'With the same ₹12 lakh CTC, the tax regime makes a large difference. Gross salary of ₹11.5 lakh is fully covered by the new regime’s rebate, so no tax is deducted. In the old regime, with no rent or investments beyond EPF, tax would be about ₹1,40,570 and monthly take-home falls to about ₹82,081.',
        'The PF wage base matters too. If your employer calculates PF on the full basic of ₹50,000 instead of the ₹15,000 ceiling, both contributions rise to ₹6,000 a month. Monthly take-home drops to about ₹85,395, but ₹1,44,000 a year goes into your provident fund and pension accounts (EPF and EPS) instead of ₹43,200.',
      ],
    },
    {
      heading: 'Comparing two job offers',
      list: [
        'Compare fixed pay first, then variable pay, and ask how much of the variable pay was actually paid last year.',
        'Look at in-hand salary as well as CTC. Two offers with the same CTC can differ by thousands a month depending on PF, gratuity and insurance.',
        'Count employer PF and gratuity as long-term savings, not spending money.',
        'Check benefits that are not in CTC, such as health insurance for parents, meal cards, joining bonuses that must be repaid if you leave early, and notice period.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why is my in-hand salary so much lower than CTC ÷ 12?',
      a: 'Because CTC includes amounts that are never paid monthly (employer PF and gratuity, and often variable pay), and because your own PF, professional tax and income tax are deducted before salary is credited.',
    },
    {
      q: 'Is a higher basic salary better?',
      a: 'It increases PF, gratuity and the HRA exemption limit, which builds long-term savings, but reduces monthly cash in hand when PF is calculated on the full basic. It is a trade-off between saving and spending money now.',
    },
    {
      q: 'Is gratuity part of my salary?',
      a: 'Gratuity is a lump sum paid when you leave after at least five years of continuous service, or earlier on death or disability. If your CTC includes it, that portion is not paid to you each month.',
    },
  ],
};

export default article;
