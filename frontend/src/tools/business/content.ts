import type { ContentMap } from '../define';

const content: ContentMap = {
  'profit-margin-calculator': {
    description:
      'Calculate profit, profit margin and markup from your cost price and selling price.',
    whatIs:
      'Profit margin is the share of the selling price that is profit. It tells you how much of every rupee of sales you keep.',
    howItWorks:
      'Profit = selling price − cost. Margin divides profit by the selling price; markup divides profit by the cost.',
    formula: 'Profit = SP − CP\nMargin % = Profit ÷ SP × 100\nMarkup % = Profit ÷ CP × 100',
    example:
      'Buying at ₹600 and selling at ₹1,000 gives ₹400 profit: a 40% margin and a 66.67% markup.',
    faq: [
      {
        q: 'What is the difference between margin and markup?',
        a: 'Both use the same profit, but margin is measured against the selling price and markup against the cost. A 25% markup equals a 20% margin.',
      },
      {
        q: 'What is a good profit margin?',
        a: 'It varies widely: grocery retail may run on 2–5% net margins, while software can exceed 20%. Compare with businesses in your industry.',
      },
    ],
  },
  'gross-margin-calculator': {
    description:
      'Calculate gross profit and gross margin from net sales and the cost of goods sold.',
    whatIs:
      'Gross margin shows how much revenue remains after direct production costs, before operating expenses, interest and tax.',
    howItWorks: 'Gross profit = revenue − COGS. Gross margin = gross profit ÷ revenue.',
    formula: 'Gross margin % = (Revenue − COGS) ÷ Revenue × 100',
    example:
      'Revenue of ₹10 lakh and COGS of ₹6.2 lakh give ₹3.8 lakh gross profit — a 38% gross margin.',
    faq: [
      {
        q: 'What goes into COGS?',
        a: 'Direct costs of making or buying what you sell: raw materials, purchase cost of goods, direct labour and freight-in. Rent and marketing are operating expenses.',
      },
    ],
  },
  'net-margin-calculator': {
    description:
      'Calculate net profit margin, along with gross and operating margin, from a simple profit and loss statement.',
    whatIs:
      'Net margin is the percentage of revenue left as profit after all expenses, interest and taxes — the “bottom line”.',
    howItWorks:
      'Gross profit = revenue − COGS; operating profit = gross profit − operating expenses; net profit = operating profit − interest − tax + other income.',
    formula: 'Net margin % = Net profit ÷ Revenue × 100',
    example:
      'Revenue ₹50 lakh, COGS ₹28 lakh, operating expenses ₹12 lakh, interest ₹1 lakh and tax ₹2.25 lakh leave ₹6.75 lakh net profit — a 13.5% net margin.',
    faq: [
      {
        q: 'Why can net margin be negative?',
        a: 'If expenses, interest and tax exceed gross profit, the business makes a net loss and the margin is negative.',
      },
    ],
  },
  'markup-calculator': {
    description:
      'Calculate the selling price from cost and markup, or work out the markup percentage from cost and selling price.',
    whatIs:
      'Markup is the amount added to cost to arrive at the selling price, expressed as a percentage of cost.',
    howItWorks:
      'Selling price = cost × (1 + markup ÷ 100). The calculator also shows the equivalent margin.',
    formula: 'SP = Cost × (1 + Markup%/100)\nMargin % = Markup ÷ (100 + Markup) × 100',
    example: 'A ₹800 item with 25% markup sells for ₹1,000, which is a 20% margin.',
    faq: [
      {
        q: 'Why is my margin lower than my markup?',
        a: 'Margin divides the same profit by the larger selling price, so it is always smaller than markup.',
      },
    ],
  },
  'discount-calculator': {
    description:
      'Calculate the price after a percentage or flat discount, your savings and the effective discount when offers are stacked.',
    whatIs:
      'A discount reduces the list price. When two discounts are applied one after another (for example a sale plus a bank offer), the second applies to the already reduced price.',
    howItWorks:
      'Final price = price × (1 − d₁) × (1 − d₂). The effective discount compares the final price with the original.',
    formula: 'Final = Price × (1 − d₁/100) × (1 − d₂/100)',
    example:
      '₹2,499 with 20% off costs ₹1,999.20. An extra 10% coupon brings it to ₹1,799.28 — an effective discount of 28%, not 30%.',
    faq: [
      {
        q: 'Is 20% + 10% the same as 30% off?',
        a: 'No. Successive discounts compound: 20% then 10% equals 28% off.',
      },
    ],
  },
  'break-even-calculator': {
    description:
      'Calculate the break-even point in units and sales, and the volume needed to reach a target profit.',
    whatIs:
      'The break-even point is the sales volume at which total revenue equals total costs, so profit is zero.',
    howItWorks:
      'Each unit sold contributes (price − variable cost) towards fixed costs. Dividing fixed costs (plus any target profit) by this contribution gives the units required.',
    formula: 'Break-even units = Fixed costs ÷ (Price − Variable cost per unit)',
    example:
      'With ₹2,00,000 fixed costs, a ₹500 price and ₹300 variable cost, each unit contributes ₹200, so you must sell 1,000 units (₹5 lakh in sales).',
    faq: [
      {
        q: 'How can I lower my break-even point?',
        a: 'Raise prices, cut variable costs or reduce fixed costs. Each increases contribution or reduces what must be covered.',
      },
    ],
  },
  'roi-calculator': {
    description:
      'Calculate the return on investment and the annualised ROI for any project or investment.',
    whatIs: 'ROI measures the gain or loss from an investment relative to its cost.',
    howItWorks:
      'ROI = (amount returned − amount invested) ÷ amount invested. If you enter a period, the annualised ROI uses the compound growth formula.',
    formula:
      'ROI % = (Return − Investment) ÷ Investment × 100\nAnnualised = (Return ÷ Investment)^(1/years) − 1',
    example:
      'Investing ₹1 lakh and getting back ₹1.5 lakh after 2 years is a 50% ROI, or 22.47% a year.',
    faq: [
      {
        q: 'Why annualise ROI?',
        a: 'A 50% return over 2 years is very different from 50% over 10 years. Annualising makes investments with different durations comparable.',
      },
    ],
  },
  'roas-calculator': {
    description:
      'Calculate return on ad spend (ROAS), your break-even ROAS and the profit left after advertising.',
    whatIs: 'ROAS is the revenue generated for every rupee spent on advertising.',
    howItWorks:
      'ROAS = revenue ÷ ad spend. Break-even ROAS = 1 ÷ gross margin, the ROAS at which gross profit exactly pays for the ads.',
    formula: 'ROAS = Revenue ÷ Ad spend\nBreak-even ROAS = 100 ÷ Margin%',
    example:
      '₹50,000 on ads bringing ₹2 lakh in sales is a 4× ROAS. At a 40% margin, break-even ROAS is 2.5×, and profit after ads is ₹30,000.',
    faq: [
      {
        q: 'Is a 3× ROAS good?',
        a: 'Only if it is above your break-even ROAS. A business with 25% margins needs at least 4× to make money on ads.',
      },
    ],
  },
  'revenue-calculator': {
    description:
      'Project monthly and total revenue from your price, starting sales volume and monthly growth rate.',
    whatIs: 'Revenue is the total money earned from sales before any costs are deducted.',
    howItWorks:
      'Monthly revenue = units × price. Units grow each month by the growth rate you enter.',
    formula: 'Revenueₘ = Price × Units₁ × (1 + g)^(m−1)',
    example:
      '500 units at ₹1,200 growing 5% a month produces about ₹95.5 lakh of revenue over 12 months.',
    faq: [
      {
        q: 'Is revenue the same as profit?',
        a: 'No. Profit is what remains after subtracting costs. Use the Net Margin Calculator to see profit.',
      },
    ],
  },
  'cost-calculator': {
    description:
      'Calculate total cost, average cost per unit and profit at a given production volume.',
    whatIs:
      'Total cost combines fixed costs, which don’t change with volume, and variable costs, which rise with each unit produced.',
    howItWorks:
      'Total cost = fixed costs + variable cost per unit × units. Average cost per unit falls as volume rises because fixed costs are spread over more units.',
    formula: 'Total cost = Fixed + Variable × Units\nAverage cost = Total ÷ Units',
    example:
      '₹1.5 lakh fixed costs and ₹220 per unit for 1,000 units: total cost ₹3.7 lakh, average cost ₹370 per unit.',
    faq: [
      {
        q: 'Why does average cost fall with volume?',
        a: 'Fixed costs are shared across more units — this is economies of scale.',
      },
    ],
  },
  'pricing-calculator': {
    description:
      'Calculate a selling price that covers your cost, marketplace or payment fees, GST and target profit margin.',
    whatIs:
      'Pricing for online sellers must account for fees that are a percentage of the selling price, which is easy to underestimate.',
    howItWorks:
      'Because fees are charged on the selling price, the price is cost ÷ (1 − margin − fee%). GST is then added on top for the customer-facing price.',
    formula: 'Price (excl. GST) = Cost ÷ (1 − (Margin% + Fee%)/100)\nMRP = Price × (1 + GST%)',
    example:
      'A ₹450 cost with a 30% margin and 2% fees needs a ₹661.76 price before GST, or ₹781 including 18% GST.',
    faq: [
      {
        q: 'Should the margin be on cost or on price?',
        a: 'This calculator uses margin on the selling price, which is how most businesses report profitability.',
      },
    ],
  },
  'business-loan-calculator': {
    description:
      'Calculate EMI, total interest and the effective annual cost (APR) of a business loan including the processing fee.',
    whatIs:
      'Business loans for MSMEs and self-employed borrowers often carry processing fees that raise the true cost above the quoted rate.',
    howItWorks:
      'EMI uses the reducing-balance formula. The APR is the internal rate of return of the loan: the amount actually received (loan minus fee) against all EMIs paid.',
    formula: 'APR = 12 × IRR(−(Loan − Fee), EMI, EMI, …)',
    example: '₹10 lakh at 14% for 36 months with a 2% fee: EMI ₹34,178 and an APR of about 15.4%.',
    faq: [
      {
        q: 'What documents are needed?',
        a: 'Usually KYC, GST returns, bank statements for 6–12 months, ITRs and business registration proof.',
      },
    ],
  },
  'gst-invoice-calculator': {
    description:
      'Create a GST invoice with multiple items, discounts and GST rates. It calculates line totals, the CGST/SGST or IGST summary, round-off and amount in words. Print it or save it as a PDF.',
    whatIs:
      'A tax invoice lists goods or services supplied with their taxable value and GST. Invoices with items at different GST rates need a rate-wise tax summary.',
    howItWorks:
      'For each line: taxable value = qty × rate − discount, GST = taxable × rate. Totals are summed in paise to avoid rounding errors, grouped by GST rate, and the grand total is rounded to the nearest rupee with the round-off shown.',
    formula: 'Line taxable = Qty × Rate × (1 − Discount%)\nLine GST = Taxable × GST%',
    example:
      'Design services of ₹25,000 at 18% plus 500 brochures at ₹12 with 10% discount at 5%: taxable ₹30,400, GST ₹4,770, total ₹35,170.',
    faq: [
      {
        q: 'Is my invoice data stored?',
        a: 'No. Everything stays in your browser. Nothing you type is sent to our servers.',
      },
      {
        q: 'What must a GST invoice contain?',
        a: 'Supplier and recipient details with GSTIN, invoice number and date, HSN/SAC codes, taxable value, rate and amount of each tax, place of supply and signature.',
      },
    ],
  },
  'commission-calculator': {
    description:
      'Calculate sales commission with a flat rate or a two-tier slab structure, plus total earnings.',
    whatIs:
      'Commission is pay linked to sales. Tiered plans pay a higher rate on sales above a threshold to reward top performers.',
    howItWorks:
      'Flat: commission = sales × rate. Tiered: the first slab earns the first rate and only the amount above it earns the higher rate.',
    formula: 'Tiered = min(Sales, T) × r₁ + max(0, Sales − T) × r₂',
    example: '₹5 lakh sales with 3% up to ₹2 lakh and 6% above: ₹6,000 + ₹18,000 = ₹24,000.',
    faq: [
      {
        q: 'Is TDS deducted on commission?',
        a: 'Businesses paying commission or brokerage deduct 2% TDS under Section 194H once payments exceed ₹20,000 in a financial year.',
      },
    ],
  },
  'percentage-increase-calculator': {
    description:
      'Calculate the percentage increase from one number to another, or increase a number by a given percentage.',
    whatIs: 'Percentage increase expresses growth relative to the original value.',
    howItWorks:
      'Subtract the original from the new value, divide by the original and multiply by 100.',
    formula: '% increase = (New − Original) ÷ |Original| × 100',
    example: 'A price rising from ₹80 to ₹100 is a 25% increase. Increasing 200 by 15% gives 230.',
    faq: [
      {
        q: 'Why is a 50% drop followed by a 50% rise not back to the start?',
        a: 'Because the rise is measured on the smaller value: 100 → 50 → 75.',
      },
    ],
  },
  'percentage-decrease-calculator': {
    description:
      'Calculate the percentage decrease between two numbers, or reduce a number by a percentage.',
    whatIs:
      'Percentage decrease measures how much a value has fallen relative to its original value.',
    howItWorks:
      'Subtract the new value from the original, divide by the original and multiply by 100.',
    formula: '% decrease = (Original − New) ÷ |Original| × 100',
    example: 'A fall from 120 to 90 is a 25% decrease. Reducing 500 by 15% gives 425.',
    faq: [
      {
        q: 'Can a decrease be more than 100%?',
        a: 'Only if the value goes below zero, for example a profit turning into a loss.',
      },
    ],
  },
};

export default content;
