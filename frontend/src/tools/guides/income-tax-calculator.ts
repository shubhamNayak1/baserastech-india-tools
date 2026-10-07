import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'From salary to tax, step by step',
      list: [
        'Start with gross income: salary plus other income such as FD interest or rent.',
        'Subtract the standard deduction for salary: ₹75,000 in the new regime, ₹50,000 in the old.',
        'In the old regime, also subtract eligible deductions such as HRA exemption, 80C, 80D, NPS and home loan interest.',
        'Apply the slab rates to the remaining taxable income.',
        'Subtract the Section 87A rebate if taxable income is within the limit.',
        'Add surcharge if income exceeds ₹50 lakh, then 4% health and education cess on the total.',
      ],
    },
    {
      heading: 'New regime tax at common salaries',
      paragraphs: [
        'For a salaried person under 60 with no other income, using the rates for FY 2025-26 that this calculator also applies to tax year 2026-27:',
      ],
      table: {
        head: ['Annual salary', 'Taxable income', 'Tax including cess'],
        rows: [
          ['₹7,00,000', '₹6,25,000', 'Nil (rebate)'],
          ['₹10,00,000', '₹9,25,000', 'Nil (rebate)'],
          ['₹12,75,000', '₹12,00,000', 'Nil (rebate)'],
          ['₹13,00,000', '₹12,25,000', '₹26,000 (marginal relief)'],
          ['₹15,00,000', '₹14,25,000', '₹97,500'],
          ['₹20,00,000', '₹19,25,000', '₹1,92,400'],
          ['₹25,00,000', '₹24,25,000', '₹3,19,800'],
          ['₹30,00,000', '₹29,25,000', '₹4,75,800'],
        ],
      },
    },
    {
      heading: 'Marginal relief just above ₹12 lakh',
      paragraphs: [
        'Without relief, crossing ₹12 lakh of taxable income by a single rupee would suddenly create a tax bill of ₹60,000 or more. Marginal relief limits the tax to the amount by which income exceeds ₹12 lakh. At a salary of ₹12,80,000 (taxable ₹12,05,000), tax is only ₹5,200 rather than about ₹63,000.',
        'The relief fades out at around ₹12.7 lakh of taxable income, after which normal slab tax applies.',
      ],
    },
    {
      heading: 'Surcharge and cess',
      paragraphs: [
        'Surcharge is an additional percentage of tax for high incomes: 10% above ₹50 lakh, 15% above ₹1 crore, 25% above ₹2 crore, and 37% above ₹5 crore in the old regime only. The new regime caps surcharge at 25%. Marginal relief also applies at each surcharge threshold.',
        'Health and education cess of 4% is charged on income tax plus surcharge in both regimes.',
      ],
    },
    {
      heading: 'TDS, advance tax and filing',
      list: [
        'Your employer deducts TDS from salary every month based on the regime you declare and the proofs you submit.',
        'If you have significant other income, such as interest, rent or capital gains, you may need to pay advance tax in instalments by 15 June, 15 September, 15 December and 15 March.',
        'Income tax returns for salaried individuals are normally due by 31 July after the end of the financial year.',
        'Form 16 from your employer and Form 26AS or the Annual Information Statement (AIS) help you check that all TDS has been credited to your PAN.',
      ],
    },
  ],
  faq: [
    {
      q: 'Which tax year do these rules apply to?',
      a: 'The Income-tax Act, 2025 applies from 1 April 2026 and uses the term “tax year” in place of “previous year” and “assessment year”. This calculator applies the FY 2025-26 slabs to tax year 2026-27 and marks those figures provisional until the rates are confirmed.',
    },
    {
      q: 'Are senior citizens taxed differently?',
      a: 'In the new regime, the slabs are the same at every age. In the old regime, the basic exemption is ₹3 lakh for people aged 60 to 79 and ₹5 lakh for those 80 and above.',
    },
  ],
};

export default guide;
