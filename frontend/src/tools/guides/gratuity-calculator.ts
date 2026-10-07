import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Why the formula uses 15/26',
      paragraphs: [
        'Under the Payment of Gratuity Act, gratuity is 15 days’ wages for every completed year of service. A month is treated as 26 working days, so 15 days’ wages equals 15/26 of a month’s salary. “Salary” here means the last drawn basic pay plus dearness allowance; HRA, bonuses and other allowances are excluded.',
        'Employers not covered by the Act are not legally bound to pay gratuity, but many do. In that case the usual formula is 15/30 of monthly salary for each completed year.',
      ],
    },
    {
      heading: 'How part-years are counted',
      paragraphs: [
        'For employers covered by the Act, a final part-year of more than six months counts as a full year. Service of 7 years 7 months counts as 8 years, while 7 years 4 months counts as 7.',
      ],
      table: {
        head: ['Last basic + DA ₹50,000 a month', 'Years counted', 'Gratuity'],
        rows: [
          ['7 years 4 months, covered employer', '7', '₹2,01,923'],
          ['7 years 7 months, covered employer', '8', '₹2,30,769'],
          ['7 years 7 months, employer not covered (15/30)', '7', '₹1,75,000'],
        ],
      },
    },
    {
      heading: 'Eligibility',
      list: [
        'Five years of continuous service with the same employer is normally required.',
        'The five-year condition does not apply on death or disablement.',
        'Several courts have held that 240 working days in the fifth year are enough to complete five years, so service of about 4 years 8 months may qualify. Practice varies; check with your employer.',
        'The Code on Social Security, which brings gratuity into the labour codes, allows fixed-term employees to receive gratuity after one year of service.',
      ],
    },
    {
      heading: 'Tax on gratuity',
      paragraphs: [
        'For government employees, gratuity is fully tax-free. For other employees, gratuity received is exempt up to ₹20 lakh over a lifetime; any amount above that is taxed as salary. The exemption is calculated as the least of the actual gratuity, ₹20 lakh, and the amount worked out by the statutory formula.',
        'Gratuity paid while you are still in service, rather than on leaving, is fully taxable.',
      ],
    },
    {
      heading: 'Gratuity in your CTC',
      paragraphs: [
        'Many employers include a gratuity provision in CTC, usually 4.81% of basic, which is 15/26 of a month’s basic spread over twelve months. If you leave before becoming eligible, that part of your CTC is never paid. The amount actually paid depends on your last drawn salary, not on the amounts shown in CTC over the years.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is there a maximum amount of gratuity?',
      a: 'Under the Payment of Gratuity Act, the maximum gratuity payable is ₹20 lakh. Employers may pay more under their own policy, but the excess is taxable.',
    },
    {
      q: 'How soon must the employer pay gratuity?',
      a: 'The employer must pay within 30 days of it becoming payable. Late payment attracts simple interest at the rate notified by the government.',
    },
  ],
};

export default guide;
