import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Hike percentage both ways',
      paragraphs: [
        'To find a new salary, multiply the current salary by one plus the hike: a 12% hike on ₹8,00,000 gives ₹8,00,000 × 1.12 = ₹8,96,000.',
        'To find the hike from two salaries, divide the difference by the old salary: moving from ₹8,00,000 to ₹10,00,000 is a ₹2,00,000 rise, or 25%. Always divide by the old figure; dividing by the new one understates the hike (20% in this example).',
      ],
    },
    {
      heading: 'Compare the right numbers',
      list: [
        'CTC vs fixed pay: a hike quoted on CTC may include a larger variable component. Compare fixed pay, and treat variable pay as a separate, uncertain amount.',
        'Gross vs take-home: income tax is progressive, so take-home usually rises by a smaller percentage than CTC. Run both salaries through the CTC to in-hand calculator.',
        'Joining bonus and retention bonus: one-time amounts that do not carry into next year’s salary or future hikes.',
        'Benefits: health cover for family, employer NPS, meal cards and leave encashment policies can be worth tens of thousands of rupees a year.',
      ],
    },
    {
      heading: 'Real hike after inflation',
      paragraphs: [
        'A hike only increases your buying power if it beats inflation. With consumer price inflation of 4–5%, an 8% hike is a real increase of only about 3–4%. Over several years, small real increases compound: a 3% real increase each year raises living standards by about 34% over a decade.',
      ],
    },
    {
      heading: 'Hikes compound',
      paragraphs: [
        'Each hike is applied to a salary that already includes the previous ones. Five annual hikes of 10% on ₹8,00,000 take you to about ₹12,88,000, a 61% total increase, not 50%. Equally, a hike that is 2 percentage points lower every year leaves a gap that widens over time, which is why the starting salary in a new job matters so much.',
      ],
    },
    {
      heading: 'Using the numbers in a negotiation',
      list: [
        'Know your current fixed, variable and take-home pay precisely.',
        'Research the salary range for the role, city and experience level from several sources.',
        'Ask for a figure based on the value of the role rather than a percentage over your current pay.',
        'Get the final offer in writing with the full salary structure before resigning from your current job.',
      ],
    },
  ],
  faq: [
    {
      q: 'Why does my take-home rise less than my hike?',
      a: 'The extra income may fall into a higher tax slab, and PF and other deductions linked to basic salary also rise. Near ₹12.75 lakh, crossing the new-regime rebate limit can also add tax suddenly, though marginal relief softens it.',
    },
    {
      q: 'What is a typical appraisal hike in India?',
      a: 'Annual appraisals commonly fall between about 5% and 12% depending on industry, company performance and individual rating. Job changes and promotions typically bring larger increases.',
    },
  ],
};

export default guide;
