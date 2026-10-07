import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'Holding periods and rates',
      paragraphs: [
        'Whether a gain is short-term or long-term depends on how long you held the asset. These rates apply to transfers on or after 23 July 2024.',
      ],
      table: {
        head: ['Asset', 'Long-term after', 'Short-term rate', 'Long-term rate'],
        rows: [
          [
            'Listed shares, equity mutual funds',
            '12 months',
            '20%',
            '12.5% above ₹1.25 lakh a year',
          ],
          [
            'Land, building, house property',
            '24 months',
            'Slab rate',
            '12.5% (or 20% with indexation for property bought before 23 July 2024)',
          ],
          ['Physical gold, jewellery', '24 months', 'Slab rate', '12.5%'],
          ['Unlisted shares', '24 months', 'Slab rate', '12.5%'],
          [
            'Debt mutual funds bought on or after 1 April 2023',
            'Not applicable',
            'Slab rate',
            'Slab rate',
          ],
        ],
      },
      list: [
        'Cess of 4%, and surcharge for high incomes, apply on top. Surcharge on these capital gains is capped at 15%.',
      ],
    },
    {
      heading: 'Example: listed shares',
      paragraphs: [
        'You bought shares for ₹5,00,000 and sold them three years later for ₹9,00,000. The ₹4,00,000 gain is long-term. After the ₹1,25,000 yearly exemption, ₹2,75,000 is taxed at 12.5%: ₹34,375, plus 4% cess, ₹35,750 in total.',
        'Had you sold within 12 months, the whole ₹4,00,000 would be short-term and taxed at 20%: ₹80,000 plus cess.',
      ],
    },
    {
      heading: 'Property bought before 23 July 2024',
      paragraphs: [
        'For land or buildings, individuals and HUFs can choose the lower of two calculations: 12.5% on the gain without indexation, or 20% on the gain after indexing the purchase cost with the Cost Inflation Index (CII).',
        'Indexed cost = purchase price × CII of the year of sale ÷ CII of the year of purchase. For property held for many years, indexation often gives the lower tax. For property bought recently, 12.5% without indexation usually wins. The calculator works out both.',
      ],
    },
    {
      heading: 'Ways to reduce or save capital gains tax',
      list: [
        'Equity: realise up to ₹1.25 lakh of long-term gains each year to use the annual exemption, a practice often called tax-gain harvesting.',
        'Set off capital losses: short-term losses can be set off against both short- and long-term gains; long-term losses only against long-term gains. Unused losses can be carried forward for eight years if you file your return on time.',
        'Residential property: reinvest the long-term gain in another house in India within the time limits (Section 54) or in specified bonds within six months (Section 54EC), subject to the caps in the law.',
        'Keep records of purchase price, improvement costs and brokerage; they all reduce the taxable gain.',
      ],
    },
  ],
  faq: [
    {
      q: 'Do I pay capital gains tax if my income is below the taxable limit?',
      a: 'Resident individuals can use any unused basic exemption limit against short-term gains under Section 111A and long-term gains under Section 112A. In the new regime, the Section 87A rebate cannot be used against tax on these special-rate gains.',
    },
    {
      q: 'How are mutual fund SIPs treated?',
      a: 'Each SIP instalment is a separate purchase with its own holding period, so selling an entire SIP holding can create both short-term and long-term gains.',
    },
  ],
};

export default guide;
