import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'GST rate structure',
      paragraphs: [
        'Following the GST Council’s rate rationalisation that took effect on 22 September 2025, most goods and services fall into two main slabs, with a higher rate for a short list of luxury and sin goods:',
      ],
      table: {
        head: ['Rate', 'Typical examples'],
        rows: [
          [
            'Nil',
            'Fresh fruit and vegetables, milk, unbranded cereals, healthcare and education services',
          ],
          [
            '5%',
            'Many packaged foods and everyday essentials, economy-class air travel, many medicines',
          ],
          [
            '18%',
            'Most other goods and services, including electronics such as televisions and air conditioners, and professional services',
          ],
          ['40%', 'Selected luxury and sin goods'],
          ['0.25% and 3%', 'Rough diamonds and precious stones; gold, silver and jewellery'],
        ],
      },
      list: [
        'Rates depend on the exact HSN or SAC classification; check the CBIC rate notifications for a specific item.',
      ],
    },
    {
      heading: 'Adding and removing GST',
      paragraphs: [
        'When a price is quoted “plus GST”, multiply by the rate to find the tax: ₹10,000 plus 18% is ₹10,000 + ₹1,800 = ₹11,800.',
        'When a price already includes GST, do not simply take 18% of it. Divide by 1.18 to find the value before tax: ₹11,800 ÷ 1.18 = ₹10,000, so the GST inside is ₹1,800. Taking 18% of ₹11,800 would wrongly give ₹2,124.',
      ],
    },
    {
      heading: 'CGST, SGST and IGST',
      paragraphs: [
        'For a sale within one state, GST is split equally between the central government (CGST) and the state (SGST), or the union territory (UTGST). An 18% rate becomes 9% CGST plus 9% SGST.',
        'For a sale from one state to another, and on imports, the whole amount is charged as IGST. The total tax is the same; only the split and the government that receives it differ.',
      ],
      table: {
        head: ['₹50,000 at 18%', 'CGST', 'SGST', 'IGST', 'Total'],
        rows: [
          ['Within the state', '₹4,500', '₹4,500', '—', '₹59,000'],
          ['To another state', '—', '—', '₹9,000', '₹59,000'],
        ],
      },
    },
    {
      heading: 'For small businesses',
      list: [
        'GST registration is required once aggregate turnover crosses ₹40 lakh for most suppliers of goods, or ₹20 lakh for services, with lower limits in some special-category states.',
        'Registered businesses can claim input tax credit for GST paid on purchases used in the business and pay only the difference.',
        'The composition scheme lets small businesses pay a low flat rate on turnover with simpler returns, but they cannot charge GST to customers or claim input credit.',
        'A tax invoice must show the GSTIN of the supplier, the HSN or SAC code, the taxable value and the tax split.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is GST charged on the discounted price?',
      a: 'Yes, if the discount is shown on the invoice at the time of sale, GST is calculated on the price after discount.',
    },
    {
      q: 'Do I pay GST on a restaurant bill’s service charge?',
      a: 'If a service charge is billed, GST applies to it as part of the value. Under consumer protection guidelines, service charges are voluntary and cannot be added by default.',
    },
  ],
};

export default guide;
