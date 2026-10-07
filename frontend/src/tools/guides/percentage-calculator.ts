import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Everyday percentage problems',
      table: {
        head: ['Question', 'How to work it out', 'Example'],
        rows: [
          ['What is 18% of ₹2,500?', '2,500 × 18 ÷ 100', '₹450'],
          ['What percent is 42 of 60?', '42 ÷ 60 × 100', '70%'],
          ['₹360 is 15% of what?', '360 × 100 ÷ 15', '₹2,400'],
          [
            'From ₹40,000 to ₹46,000 is what change?',
            '(46,000 − 40,000) ÷ 40,000 × 100',
            '15% increase',
          ],
          ['₹1,200 after a 25% discount', '1,200 × (1 − 0.25)', '₹900'],
        ],
      },
    },
    {
      heading: 'Mental maths shortcuts',
      list: [
        '10% is the number divided by 10; 5% is half of that; 1% is the number divided by 100.',
        'Build other percentages from these: 15% = 10% + 5%; 18% = 20% − 2%.',
        'X% of Y equals Y% of X: 4% of 75 is the same as 75% of 4, which is 3.',
        'Doubling a percentage doubles the result: if 12% of a bill is ₹300, then 24% is ₹600.',
      ],
    },
    {
      heading: 'Mistakes to avoid',
      paragraphs: [
        'Percentage changes are not symmetric. A 20% fall followed by a 20% rise does not get you back: ₹100 falls to ₹80, and 20% of ₹80 brings it only to ₹96. After a 50% loss, you need a 100% gain to recover.',
        'Successive discounts multiply rather than add. “20% off plus an extra 10%” is 1 − (0.8 × 0.9) = 28% off, not 30%.',
        'Percentage points are not percentages. A loan rate rising from 8% to 9% is an increase of 1 percentage point, but 12.5% in relative terms.',
        'Always divide by the original value when calculating change. Dividing by the new value gives a different, usually wrong, answer.',
      ],
    },
    {
      heading: 'Percentages in Indian contexts',
      list: [
        'Marks: divide marks obtained by maximum marks and multiply by 100.',
        'GST: multiply the price before tax by the GST rate; to remove GST from an inclusive price, divide by (1 + rate) rather than subtracting a percentage of the total.',
        'Salary hikes and interest rates are quoted as percentages of the earlier amount or the principal.',
      ],
    },
  ],
  faq: [
    {
      q: 'How do I calculate a percentage on a phone calculator?',
      a: 'Multiply by the percentage and divide by 100, for example 2,500 × 18 ÷ 100. Many phone calculators also have a % key, but it behaves differently between models, so the explicit method is safer.',
    },
  ],
};

export default guide;
