import type { Article } from './index';

const article: Pick<Article, 'intro' | 'sections' | 'faq'> = {
  intro: [
    'A home loan is usually the largest and longest debt a family takes on. In the early years most of each EMI goes to interest. Paying off part of the principal early therefore saves interest, often more than people expect.',
    'When you prepay, the bank asks whether to keep the EMI and shorten the loan, or keep the tenure and lower the EMI. This guide uses a typical ₹50 lakh loan to show what each choice saves and when prepaying is not the best use of spare money.',
  ],
  sections: [
    {
      heading: 'Why early payments are mostly interest',
      paragraphs: [
        'Banks calculate home loan interest every month on the outstanding balance, and the EMI stays the same. At the start the balance is large, so interest takes most of the EMI. As the balance falls, more of each EMI goes to principal.',
        'On a ₹50 lakh loan at 8.5% for 20 years, the EMI is ₹43,391. In the first month, ₹35,417 of it is interest and only ₹7,974 reduces the loan. Over the first year you pay about ₹4.21 lakh of interest. Over the full 20 years, interest adds up to about ₹54.1 lakh, more than the amount borrowed.',
      ],
    },
    {
      heading: 'Reduce tenure or reduce EMI?',
      paragraphs: [
        'With reduce tenure, the EMI stays at ₹43,391 and the loan ends earlier. Because you keep paying the higher EMI on a smaller balance, the loan shrinks faster and interest savings compound.',
        'With reduce EMI, the bank recalculates a lower EMI over the remaining original tenure. Your monthly outgo falls, but the loan still runs its full term, so the saving is smaller.',
        'The comparison below uses the same ₹50 lakh, 8.5%, 20-year loan.',
      ],
      table: {
        head: ['Prepayment', 'Option', 'Loan ends after', 'Total interest', 'Interest saved'],
        rows: [
          ['None', '—', '20 years', '₹54.14 lakh', '—'],
          [
            '₹5 lakh once, in month 36',
            'Reduce tenure',
            '16 years 7 months',
            '₹40.94 lakh',
            '₹13.2 lakh',
          ],
          [
            '₹5 lakh once, in month 36',
            'Reduce EMI (to ₹38,750)',
            '20 years',
            '₹49.67 lakh',
            '₹4.5 lakh',
          ],
          [
            '₹2 lakh every year from month 12',
            'Reduce tenure',
            '11 years',
            '₹27.13 lakh',
            '₹27.0 lakh',
          ],
          [
            '₹2 lakh every year from month 12',
            'Reduce EMI',
            'About 17 years',
            '₹35.45 lakh',
            '₹18.7 lakh',
          ],
        ],
      },
    },
    {
      heading: 'When reducing EMI makes sense',
      list: [
        'Your income is uncertain, or the EMI is a large share of take-home pay, and a lower fixed commitment gives breathing room.',
        'You want to free cash flow for another goal, such as a child’s school fees, without stopping prepayments altogether.',
        'You expect to take another loan soon and a lower EMI improves eligibility.',
      ],
      paragraphs: [
        'If none of these apply, reducing tenure usually saves more. Some banks reduce tenure by default; tell the bank your choice in writing when you prepay.',
      ],
    },
    {
      heading: 'Prepay, or invest the money instead?',
      paragraphs: [
        'Prepaying a loan at 8.5% is like earning a guaranteed, tax-free 8.5% return. Compare that with what the money would earn elsewhere after tax and with the risk involved.',
        'If you claim home loan interest under Section 24(b) in the old regime, up to ₹2 lakh of interest a year reduces your taxable income, so the effective cost of the loan is lower than its rate. That deduction does not exist in the new regime, which makes prepayment more attractive for most taxpayers.',
        'Before prepaying, keep an emergency fund of at least six months’ expenses, clear any costlier debt such as credit cards or personal loans, and make sure term life and health insurance are in place.',
      ],
    },
    {
      heading: 'Charges and paperwork',
      paragraphs: [
        'RBI rules prohibit banks and housing finance companies from charging prepayment or foreclosure penalties on floating-rate loans taken by individuals for non-business purposes. Fixed-rate loans may carry a charge on the amount prepaid; your loan agreement states the rate.',
        'After each prepayment, ask for an updated repayment schedule. When the loan is fully repaid, collect the original property documents and a no-dues certificate, and make sure the lender removes any charge registered on the property.',
      ],
    },
  ],
  faq: [
    {
      q: 'When is the best time to prepay a home loan?',
      a: 'As early as possible. Prepaying in the first few years removes principal that would otherwise attract interest for the longest time, so the same amount saves more interest early in the loan than near the end.',
    },
    {
      q: 'Does prepaying affect my tax benefits?',
      a: 'In the old regime, a smaller balance means less interest to claim under Section 24(b), and the prepaid principal can count towards the Section 80C limit of ₹1.5 lakh. In the new regime there is no deduction for a self-occupied home, so there is nothing to lose.',
    },
    {
      q: 'Is it better to prepay a little every year or a large amount once?',
      a: 'Regular prepayments add up to large savings because each one cuts the balance early. In the example above, ₹2 lakh a year halved the interest bill. Prepay whenever you have surplus money rather than waiting to build up a large sum.',
    },
  ],
};

export default article;
