import type { ContentMap } from '../define';

const gstFaq = [
  {
    q: 'What are the current GST rates?',
    a: 'Since 22 September 2025, most goods and services fall under 5% or 18%, with 40% for luxury and sin goods. Special rates of 0.25% and 3% apply to precious stones and metals. The 12% and 28% slabs remain selectable for older invoices.',
  },
  {
    q: 'When is IGST charged instead of CGST + SGST?',
    a: 'IGST applies when the supplier and the place of supply are in different states (and on imports). For supplies within the same state, the rate is split equally into CGST and SGST (or UTGST in union territories).',
  },
];

const content: ContentMap = {
  'gst-calculator': {
    description:
      'Add GST to a price or remove GST from a GST-inclusive price, with the CGST, SGST or IGST split for your invoice.',
    whatIs:
      'Goods and Services Tax (GST) is India’s indirect tax on the supply of goods and services. Prices may be quoted exclusive of GST (tax added on top) or inclusive of GST (tax already inside).',
    howItWorks:
      'To add GST, the calculator multiplies the taxable value by the rate. To remove GST from an inclusive price, it divides by (1 + rate). All amounts are rounded to the paisa, and the CGST/SGST halves always add back to the total GST.',
    formula: 'Add GST: GST = Value × Rate ÷ 100\nRemove GST: Value = Price × 100 ÷ (100 + Rate)',
    example:
      '₹10,000 + 18% GST = ₹11,800 (CGST ₹900 + SGST ₹900). Removing 18% from ₹11,800 gives back ₹10,000.',
    faq: gstFaq,
  },
  'gst-inclusive-calculator': {
    description:
      'Extract the taxable value and GST from a price that already includes GST, such as an MRP or a quote “inclusive of all taxes”.',
    whatIs:
      'A GST-inclusive price contains the tax. You often need the pre-tax value for invoices, input tax credit or accounting.',
    howItWorks:
      'The taxable value is the inclusive price divided by (1 + rate). GST is the difference between the inclusive price and the taxable value.',
    formula: 'Taxable value = Price × 100 ÷ (100 + Rate)\nGST = Price − Taxable value',
    example:
      'An inclusive price of ₹11,800 at 18% contains ₹10,000 of value and ₹1,800 GST. Note that GST is not 18% of ₹11,800.',
    faq: [
      {
        q: 'Why can’t I just take 18% of the inclusive price?',
        a: 'Because the tax was calculated on the pre-tax value. 18% of ₹11,800 is ₹2,124, which overstates the GST by ₹324.',
      },
      ...gstFaq,
    ],
  },
  'gst-exclusive-calculator': {
    description: 'Add GST to a price quoted exclusive of tax to get the final amount payable.',
    whatIs:
      'Business quotes are usually exclusive of GST (“+ GST”). The buyer pays the price plus GST.',
    howItWorks: 'GST = price × rate ÷ 100, and the total is price + GST.',
    formula: 'Total = Price × (1 + Rate ÷ 100)',
    example: '₹25,000 + 18% GST = ₹29,500.',
    faq: gstFaq,
  },
  'gst-reverse-calculator': {
    description:
      'Find the taxable value from a known GST amount, or work out which GST rate was charged from before and after prices.',
    whatIs:
      'Sometimes you know only the GST shown on a bill, or only the prices before and after tax. Reverse calculation recovers the missing figures.',
    howItWorks:
      'Taxable value = GST amount × 100 ÷ rate. The rate charged = (total − value) ÷ value × 100.',
    formula: 'Value = GST × 100 ÷ Rate\nRate = (Total − Value) ÷ Value × 100',
    example: '₹1,800 of GST at 18% means a taxable value of ₹10,000 and a total of ₹11,800.',
    faq: gstFaq,
  },
  'gst-split-calculator': {
    description:
      'Split a GST amount into CGST and SGST/UTGST for intra-state supplies, or show it as IGST for inter-state supplies.',
    whatIs:
      'GST collected on a supply within a state is shared between the Centre (CGST) and the State (SGST) or Union Territory (UTGST). Inter-state supplies carry Integrated GST (IGST).',
    howItWorks:
      'For intra-state supplies, each component is half of the rate; paise are assigned so the two halves sum exactly to the total. Inter-state supplies show the full amount as IGST.',
    formula: 'CGST = SGST = GST ÷ 2\nIGST = GST',
    example:
      '18% GST on ₹50,000 is ₹9,000 — ₹4,500 CGST + ₹4,500 SGST, or ₹9,000 IGST if the buyer is in another state.',
    faq: gstFaq,
  },
  'gst-amount-calculator': {
    description:
      'Calculate the GST on any value and compare the tax across all GST slabs at a glance.',
    whatIs: 'A quick way to find the GST payable on a taxable value.',
    howItWorks: 'GST = value × rate ÷ 100, shown for your chosen rate and every standard slab.',
    formula: 'GST = Value × Rate ÷ 100',
    example: 'On ₹25,000, GST is ₹1,250 at 5%, ₹4,500 at 18% and ₹10,000 at 40%.',
    faq: gstFaq,
  },
  'income-tax-calculator': {
    description:
      'Estimate your income tax for the selected financial year under both the new and old regimes, including the Section 87A rebate, surcharge and 4% cess.',
    whatIs:
      'Income tax is charged on your total income at slab rates. India offers two regimes: the new regime (default) with lower rates and few deductions, and the old regime with higher rates but deductions such as 80C, 80D, HRA and home loan interest.',
    howItWorks:
      'For each regime, taxable income = gross income − standard deduction (₹75,000 new / ₹50,000 old for salaried) − eligible deductions. Tax is calculated slab by slab, the 87A rebate is applied (with marginal relief just above ₹12 lakh in the new regime), then surcharge (with marginal relief) and 4% health & education cess. Rates are read from a versioned rules file for each financial year.',
    formula: 'Tax = Σ (income in slab × slab rate) − 87A rebate + surcharge + 4% cess',
    example:
      'FY 2025-26, salary ₹15 lakh: new regime taxable income ₹14.25 lakh → tax ₹97,500 (₹93,750 + cess). With ₹1.5 lakh 80C and ₹25,000 80D, the old regime tax is ₹2,02,800, so the new regime saves ₹1,05,300.',
    howToUse: [
      'Choose the financial year and your age group.',
      'Enter your gross salary and any other income.',
      'Enter deductions you claim — they only apply to the old regime (except employer NPS).',
      'Compare the two regimes and the slab-wise breakdown.',
    ],
    faq: [
      {
        q: 'Is income up to ₹12 lakh tax-free?',
        a: 'In the new regime for FY 2025-26, yes — the 87A rebate makes tax nil up to ₹12 lakh of taxable income (₹12.75 lakh salary after standard deduction). It does not apply to special-rate income like capital gains.',
      },
      {
        q: 'Can I switch regimes every year?',
        a: 'Salaried individuals without business income can choose each year when filing the return. Those with business income can switch back to the old regime only once.',
      },
      {
        q: 'What is marginal relief?',
        a: 'It ensures the extra tax just above a threshold (the ₹12 lakh rebate limit or a surcharge limit) is never more than the extra income.',
      },
    ],
  },
  'hra-tax-exemption-calculator': {
    description:
      'Calculate your HRA exemption under Section 10(13A) and the income tax it saves, compared with the new regime.',
    whatIs:
      'Salaried employees who receive HRA and pay rent can exempt part of the HRA from tax in the old regime.',
    howItWorks:
      'The exemption is the least of: HRA received; rent paid minus 10% of basic + DA; and 50% (metro) or 40% (non-metro) of basic + DA. The calculator computes old-regime tax with and without the exemption, and the new-regime tax for comparison.',
    formula: 'Exempt HRA = min(HRA, Rent − 10% × Salary, 50%/40% × Salary)',
    example:
      'Basic ₹6 lakh, HRA ₹2.4 lakh and rent ₹2.16 lakh in a metro: limits are ₹2.4 lakh, ₹1.56 lakh and ₹3 lakh, so ₹1.56 lakh is exempt.',
    faq: [
      {
        q: 'Can I claim HRA and home loan benefits together?',
        a: 'Yes, if you live in a rented house and the house you own is in another city or you have genuine reasons for not living in it.',
      },
      {
        q: 'What proof is needed?',
        a: 'Rent receipts or a rental agreement, and the landlord’s PAN if annual rent exceeds ₹1 lakh.',
      },
    ],
  },
  'tds-calculator': {
    description:
      'Calculate tax deducted at source (TDS) for common payments such as professional fees, contracts, rent, commission and interest, with current thresholds.',
    whatIs:
      'TDS is tax the payer deducts before making certain payments and deposits with the government on the payee’s behalf. The payee can claim credit for it when filing their return.',
    howItWorks:
      'Select the nature of payment. If the amount crosses the section’s threshold, TDS = amount × rate (or only on the excess for sections like 194N and 194Q). Without a PAN, the higher rate under Section 206AA applies. Rates and thresholds come from the versioned tax rules.',
    formula: 'TDS = Payment × Rate (if payment > threshold)',
    example:
      'Professional fees of ₹1,00,000 under 194J(b) attract 10% TDS: ₹10,000, so ₹90,000 is paid.',
    faq: [
      {
        q: 'Is TDS the final tax?',
        a: 'No. It is an advance tax. Your actual liability is calculated when you file your return, and excess TDS is refunded.',
      },
      {
        q: 'Is TDS calculated on the GST component?',
        a: 'If GST is shown separately on the invoice, TDS is deducted on the amount excluding GST.',
      },
    ],
  },
  'capital-gains-calculator': {
    description:
      'Calculate short-term and long-term capital gains tax on listed shares, mutual funds, property, gold and bonds under the rules effective from 23 July 2024.',
    whatIs:
      'A capital gain is the profit from selling a capital asset. Whether it is short-term or long-term depends on how long you held it, and each has different tax rates.',
    howItWorks:
      'Listed shares and equity funds are long-term after 12 months: STCG at 20% and LTCG at 12.5% above the ₹1.25 lakh annual exemption. Property, gold and unlisted shares are long-term after 24 months: LTCG at 12.5% without indexation. For land or buildings bought before 23 July 2024, individuals can instead pay 20% with indexation — the calculator shows whichever is lower. Debt funds bought after 1 April 2023 are always taxed at slab rates.',
    formula:
      'Gain = Sale value − Cost − Expenses\nIndexed cost = Cost × CII(sale year) ÷ CII(purchase year)',
    example:
      'Shares bought for ₹5 lakh and sold for ₹9 lakh after 3 years: gain ₹4 lakh, taxable after exemption ₹2.75 lakh, tax 12.5% = ₹34,375 plus cess.',
    faq: [
      {
        q: 'Is the ₹1.25 lakh exemption per sale?',
        a: 'No, it is per financial year across all listed equity and equity fund LTCG.',
      },
      {
        q: 'What is the Cost Inflation Index?',
        a: 'A yearly index notified by CBDT (2001-02 = 100, 2025-26 = 376) used to inflate the purchase cost for indexation.',
      },
    ],
  },
  'tax-saving-calculator': {
    description:
      'Find out how much additional tax you can save by using your remaining 80C, 80D and NPS limits — and whether the new regime is still better.',
    whatIs:
      'The old regime lets you reduce taxable income through deductions. Many people leave part of their limits unused.',
    howItWorks:
      'The calculator computes old-regime tax with your current deductions and with every limit fully used, and compares both with the new regime.',
    formula: 'Additional saving = Tax (current deductions) − Tax (maximum deductions)',
    example:
      'With ₹18 lakh income and ₹60,000 in 80C, filling 80C, 80D (₹25,000) and NPS (₹50,000) cuts old-regime tax by ₹51,480 — but compare it with the new regime before investing.',
    faq: [
      {
        q: 'Which 80C option is best?',
        a: 'It depends on your goals. ELSS has the shortest lock-in (3 years) and equity exposure; PPF is safe and tax-free; EPF contributions count automatically.',
      },
      {
        q: 'Do deductions help in the new regime?',
        a: 'Only a few, such as employer NPS contributions under 80CCD(2) and the standard deduction.',
      },
    ],
  },
};

export default content;
