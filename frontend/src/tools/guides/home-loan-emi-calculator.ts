import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'How much a home loan really costs',
      paragraphs: [
        'Because home loans run for 15 to 30 years, total interest often exceeds the amount borrowed. A ₹50 lakh loan at 8.5% for 20 years has an EMI of ₹43,391, and you repay about ₹1.04 crore in total.',
        'Small changes in rate or tenure move that total by lakhs, so it is worth checking a few combinations before you sign.',
      ],
      table: {
        head: ['₹50 lakh loan', 'EMI', 'Total interest'],
        rows: [
          ['8.0% for 20 years', '₹41,822', '₹50.37 lakh'],
          ['8.5% for 20 years', '₹43,391', '₹54.14 lakh'],
          ['9.0% for 20 years', '₹44,986', '₹57.97 lakh'],
          ['8.5% for 15 years', '₹49,237', '₹38.63 lakh'],
          ['8.5% for 25 years', '₹40,261', '₹70.78 lakh'],
          ['8.5% for 30 years', '₹38,446', '₹88.41 lakh'],
        ],
      },
    },
    {
      heading: 'How much can you borrow?',
      paragraphs: [
        'Banks lend up to a percentage of the property value, known as loan-to-value. RBI caps it at 90% for loans up to ₹30 lakh, 80% for loans above ₹30 lakh and up to ₹75 lakh, and 75% above ₹75 lakh. Stamp duty and registration charges are generally not financed, so plan for the down payment plus these costs.',
        'Lenders also look at income. Most keep all EMIs, including the new one, within about 40–60% of net monthly income, depending on income level and the lender. A longer tenure raises eligibility but costs more interest.',
      ],
    },
    {
      heading: 'Floating rates and repo-linked loans',
      paragraphs: [
        'Most home loans in India are floating-rate and linked to an external benchmark, usually the RBI repo rate. When the repo rate changes, your loan rate is reset, typically at the next quarterly reset date.',
        'Banks usually keep the EMI unchanged and adjust the tenure. If rates rise, the tenure can stretch by years without you noticing. Check your loan statement after every rate change, and ask the bank to raise the EMI rather than extend the tenure if you can afford it.',
      ],
    },
    {
      heading: 'Tax benefits on a home loan',
      list: [
        'Old regime, self-occupied house: interest up to ₹2 lakh a year under Section 24(b), and principal repayment within the ₹1.5 lakh limit of Section 80C.',
        'Old and new regime, let-out house: interest is deductible against rental income. A loss from house property can be set off against other income only in the old regime, up to ₹2 lakh a year.',
        'New regime, self-occupied house: no deduction for interest or principal.',
        'Interest paid during construction is deductible in five equal instalments starting from the year construction is completed, within the same ₹2 lakh limit.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is a longer tenure ever better?',
      a: 'A longer tenure lowers the EMI and improves eligibility, which can help early in your career. Since floating-rate home loans have no prepayment penalty, you can take a longer tenure for safety and prepay when income rises.',
    },
    {
      q: 'Should I choose a joint home loan?',
      a: 'A joint loan with a co-owner who has income improves eligibility. In the old regime, each co-borrower who is also a co-owner can claim the interest and principal deductions separately, within their own limits.',
    },
  ],
};

export default guide;
