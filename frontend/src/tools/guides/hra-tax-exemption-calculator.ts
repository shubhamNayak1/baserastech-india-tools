import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'The three limits, explained',
      paragraphs: [
        'HRA exemption is the lowest of three amounts, each calculated for the period you actually paid rent:',
      ],
      list: [
        'The HRA your employer actually paid you.',
        'Rent paid minus 10% of your salary (basic plus dearness allowance that counts for retirement benefits).',
        '50% of salary if you live in Delhi, Mumbai, Kolkata or Chennai, or 40% elsewhere.',
      ],
    },
    {
      heading: 'Worked examples',
      paragraphs: [
        'Metro: basic ₹6,00,000 a year, HRA ₹3,00,000 and rent ₹3,00,000 (₹25,000 a month) in Mumbai. The limits are ₹3,00,000 (HRA received), ₹2,40,000 (rent minus 10% of basic) and ₹3,00,000 (50% of basic). The exemption is ₹2,40,000 and the remaining ₹60,000 of HRA is taxable.',
        'Non-metro: basic ₹4,80,000, HRA ₹1,92,000 and rent ₹2,16,000 (₹18,000 a month) in Pune. The limits are ₹1,92,000, ₹1,68,000 and ₹1,92,000 (40% of basic). The exemption is ₹1,68,000.',
        'In both cases the rent-based limit decides the answer. Paying higher rent raises the exemption only until it reaches one of the other two limits.',
      ],
    },
    {
      heading: 'HRA in the new regime',
      paragraphs: [
        'HRA exemption is available only in the old tax regime. In the new regime the full HRA is taxable, though lower slab rates and the larger rebate often make the new regime cheaper anyway. This calculator shows both so you can compare.',
        'If HRA is your main deduction, compare the old-regime tax saving with the break-even deduction figures in our guide to the old and new regimes.',
      ],
    },
    {
      heading: 'Documents and common situations',
      list: [
        'Submit rent receipts to your employer. If annual rent is above ₹1 lakh, the landlord’s PAN is also required.',
        'Paying rent to parents: allowed if they own the house and actually receive the rent, which they must show as income in their own returns. Rent paid to a spouse is generally not accepted.',
        'Changing cities during the year: calculate each period separately with the correct metro or non-metro percentage and add them up.',
        'Not receiving HRA at all: self-employed people and employees without HRA may be able to claim a deduction for rent under Section 80GG in the old regime, subject to lower limits.',
        'If you forgot to submit proofs to your employer, you can still claim the exemption when filing your return, as long as you keep the evidence.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is Bengaluru or Hyderabad a metro for HRA?',
      a: 'No. For HRA, only Delhi, Mumbai, Kolkata and Chennai get the 50% limit. All other cities, including Bengaluru, Hyderabad and Pune, use 40%.',
    },
    {
      q: 'Does HRA exemption depend on my CTC?',
      a: 'No. It depends on basic salary plus eligible DA, the HRA component and the rent you pay. A higher basic raises both the 10% deduction and the 40% or 50% limit.',
    },
  ],
};

export default guide;
