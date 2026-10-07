import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'How car loans are structured',
      paragraphs: [
        'Car loans are secured by the vehicle itself. The lender’s name is recorded on the registration certificate (hypothecation) until the loan is repaid. Because of the security, rates are lower than personal loans, typically around 8.5–11% for new cars from banks, and higher for used cars.',
        'Banks usually finance up to 80–90% of the on-road or ex-showroom price, depending on the lender and model. Some offer 100% funding on selected models, which raises both EMI and interest.',
      ],
    },
    {
      heading: 'Tenure: the trade-off',
      paragraphs: [
        'Tenures range from one to seven years. Longer tenures make the EMI affordable, but a car loses value every year, and in the later years you may owe more than the car is worth.',
      ],
      table: {
        head: ['₹8 lakh at 9%', 'EMI', 'Total interest'],
        rows: [
          ['3 years', '₹25,440', '₹1,15,840'],
          ['5 years', '₹16,607', '₹1,96,420'],
          ['7 years', '₹12,871', '₹2,81,164'],
        ],
      },
    },
    {
      heading: 'Watch for flat-rate quotes',
      paragraphs: [
        'Some dealer-arranged loans quote a flat rate, where interest is charged on the full original amount for the whole tenure. A flat rate looks lower than a bank’s reducing-balance rate but costs much more. Ask which method is used, or compare the total amount repaid.',
        'Dealer schemes such as “zero interest” offers often recover the cost through a higher price, a processing fee or mandatory accessories. Compare the total cost with a bank loan on the plain price.',
      ],
    },
    {
      heading: 'A simple affordability rule',
      paragraphs: [
        'A common guideline is to put down at least 20%, keep the tenure to four years or less, and keep total vehicle costs, including EMI, fuel and insurance, under about 10–15% of monthly income. Use the calculator to find the loan amount whose EMI fits that budget.',
      ],
    },
    {
      heading: 'After the last EMI',
      list: [
        'Collect the no-objection certificate (NOC) and Form 35 from the lender.',
        'Apply to the RTO to remove hypothecation from the registration certificate.',
        'Ask your insurer to remove the lender’s name from the policy.',
      ],
    },
  ],
  faq: [
    {
      q: 'Can I prepay a car loan?',
      a: 'Yes, but fixed-rate car loans often carry a foreclosure charge, commonly a few percent of the outstanding amount, and some lenders do not allow prepayment in the first months. Check the sanction letter before prepaying.',
    },
    {
      q: 'Is car loan interest tax-deductible?',
      a: 'Not for a car used personally. A self-employed person or business using the car for work can claim interest and depreciation as business expenses. For electric vehicles, a separate deduction under Section 80EEB applied only to loans sanctioned between April 2019 and March 2023.',
    },
  ],
};

export default guide;
