import type { Article } from './index';

const article: Pick<Article, 'intro' | 'sections' | 'faq'> = {
  intro: [
    'Every salaried taxpayer in India picks between two sets of income tax rules each year. The new regime has lower slab rates and a bigger rebate but takes away most deductions. The old regime keeps higher rates but lets you subtract HRA, Section 80C investments, health insurance, home loan interest and more.',
    'Since the new regime became the default, most people are better off staying in it. The old regime still wins for some, mainly people with a large home loan and high rent or other deductions. This guide shows both slab tables, explains what each regime allows, and gives the deduction total at which the old regime starts to pay off.',
    'The figures below use the rates for FY 2025-26, which this site also applies to tax year 2026-27 under the Income-tax Act, 2025. Check the latest notification before you file.',
  ],
  sections: [
    {
      heading: 'New regime slab rates',
      paragraphs: [
        'The new regime applies the same slabs at every age. Salaried taxpayers get a standard deduction of ₹75,000. A rebate under Section 87A cancels the tax entirely when taxable income is ₹12 lakh or less, so a salary of up to ₹12.75 lakh pays no income tax.',
      ],
      table: {
        head: ['Taxable income', 'Rate'],
        rows: [
          ['Up to ₹4,00,000', 'Nil'],
          ['₹4,00,001 – ₹8,00,000', '5%'],
          ['₹8,00,001 – ₹12,00,000', '10%'],
          ['₹12,00,001 – ₹16,00,000', '15%'],
          ['₹16,00,001 – ₹20,00,000', '20%'],
          ['₹20,00,001 – ₹24,00,000', '25%'],
          ['Above ₹24,00,000', '30%'],
        ],
      },
    },
    {
      heading: 'Old regime slab rates',
      paragraphs: [
        'The old regime has three slabs above the basic exemption, which rises for senior citizens (60–79) and super senior citizens (80+). The standard deduction is ₹50,000, and the Section 87A rebate only removes tax when taxable income is ₹5 lakh or less.',
      ],
      table: {
        head: ['Taxable income', 'Below 60', '60 to 79', '80 and above'],
        rows: [
          ['Up to ₹2,50,000', 'Nil', 'Nil', 'Nil'],
          ['₹2,50,001 – ₹3,00,000', '5%', 'Nil', 'Nil'],
          ['₹3,00,001 – ₹5,00,000', '5%', '5%', 'Nil'],
          ['₹5,00,001 – ₹10,00,000', '20%', '20%', '20%'],
          ['Above ₹10,00,000', '30%', '30%', '30%'],
        ],
      },
    },
    {
      heading: 'What each regime lets you deduct',
      paragraphs: [
        'The real difference between the regimes is the list of deductions. In the new regime, almost everything that reduces taxable income is switched off. The main exceptions are the standard deduction and your employer’s contribution to NPS under Section 80CCD(2).',
      ],
      table: {
        head: ['Deduction', 'Old regime', 'New regime'],
        rows: [
          ['Standard deduction (salary)', '₹50,000', '₹75,000'],
          ['HRA exemption', 'Yes', 'No'],
          [
            'Section 80C (EPF, PPF, ELSS, life insurance, principal repayment)',
            'Up to ₹1,50,000',
            'No',
          ],
          ['Section 80D (health insurance)', 'Up to ₹25,000 self, plus parents', 'No'],
          ['Section 80CCD(1B) (own NPS contribution)', 'Up to ₹50,000', 'No'],
          ['Home loan interest, self-occupied (Section 24(b))', 'Up to ₹2,00,000', 'No'],
          ['Employer NPS contribution (Section 80CCD(2))', 'Yes', 'Yes'],
          ['Professional tax', 'Yes', 'No'],
          ['Leave travel allowance', 'Yes', 'No'],
        ],
      },
    },
    {
      heading: 'Worked examples',
      paragraphs: [
        'Take a salaried person under 60 earning ₹15 lakh a year. In the new regime, taxable income is ₹14,25,000 after the standard deduction. Slab tax is ₹93,750 and, with 4% cess, the total is ₹97,500.',
        'In the old regime with only the usual deductions (₹1,50,000 under 80C and ₹25,000 of health insurance), taxable income is ₹12,72,500 and tax comes to ₹2,02,020. The new regime saves over ₹1 lakh.',
        'Now add the deductions of someone who rents in a metro and also invests in NPS: ₹1,80,000 HRA exemption and ₹50,000 under 80CCD(1B). Old-regime tax drops to ₹1,30,260, still higher than the new regime. Only when a ₹2,00,000 home loan interest deduction is added on top does the old regime win, at ₹84,240 against ₹97,500.',
      ],
      table: {
        head: [
          'Salary',
          'New regime tax',
          'Old regime: 80C + 80D only',
          'Old regime: + HRA + NPS + home loan',
        ],
        rows: [
          ['₹10,00,000', 'Nil', '₹69,680', 'Nil'],
          ['₹15,00,000', '₹97,500', '₹2,02,020', '₹84,240'],
          ['₹20,00,000', '₹1,92,400', '₹3,58,020', '₹2,23,860'],
          ['₹25,00,000', '₹3,19,800', '₹5,14,020', '₹3,79,860'],
        ],
      },
    },
    {
      heading: 'The break-even point',
      paragraphs: [
        'A simple way to decide is to add up every deduction you could actually claim in the old regime: HRA exemption, 80C, 80D, 80CCD(1B), home loan interest and professional tax. Leave out the standard deduction, which both regimes give. Then compare that total with the break-even figures below.',
      ],
      table: {
        head: ['Salary', 'Old regime wins only if deductions exceed about'],
        rows: [
          ['₹10,00,000', '₹4,50,000'],
          ['₹12,00,000', '₹6,50,000'],
          ['₹15,00,000', '₹5,45,000'],
          ['₹20,00,000', '₹7,10,000'],
          ['₹25,00,000 and above', '₹8,00,000'],
        ],
      },
    },
    {
      heading: 'Who should still consider the old regime',
      list: [
        'People repaying a home loan on a self-occupied house, who can claim up to ₹2 lakh of interest plus principal under 80C.',
        'Tenants in metro cities paying high rent relative to their basic salary, because HRA exemption can be large.',
        'Taxpayers who already use the full ₹1.5 lakh of 80C, ₹50,000 of NPS under 80CCD(1B) and health insurance for themselves and their parents.',
        'Senior citizens with large deductions, who also get a higher basic exemption in the old regime.',
      ],
      paragraphs: [
        'If your deductions are well below the break-even figure, the new regime is simpler and cheaper. Do not buy insurance or lock money into tax-saving products only to reach the old-regime break-even point; choose investments on their own merits.',
      ],
    },
    {
      heading: 'Switching between regimes',
      paragraphs: [
        'The new regime is the default. If you have only salary and other non-business income, you can choose either regime each year when you file your return, regardless of what you told your employer.',
        'Tell your employer your choice at the start of the year so that the right amount of TDS is deducted from your salary. If you pick the new regime at work but claim the old regime in your return, you will get a refund; the other way round, you may have tax left to pay.',
        'People with business or professional income have less flexibility. They can opt out of the new regime and return to it only once in their lifetime.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is income up to ₹12 lakh tax-free in the new regime?',
      a: 'Taxable income up to ₹12 lakh pays no tax because of the Section 87A rebate. For a salaried person, that means a gross salary of up to ₹12.75 lakh after the ₹75,000 standard deduction. Just above the limit, marginal relief ensures you never pay more tax than the income above ₹12 lakh.',
    },
    {
      q: 'Can I claim HRA in the new regime?',
      a: 'No. HRA exemption is available only in the old regime. In the new regime, the whole HRA you receive is taxable.',
    },
    {
      q: 'Does the rebate apply to capital gains?',
      a: 'The rebate does not apply to tax on special-rate income such as long-term capital gains on equity under Section 112A or short-term gains under Section 111A. Those are taxed at their own rates even if your total income is under the rebate limit.',
    },
  ],
};

export default article;
