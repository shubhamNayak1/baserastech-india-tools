import type { ContentMap } from '../define';

const content: ContentMap = {
  'emi-calculator': {
    description:
      'Find the equated monthly instalment (EMI) for any loan along with the total interest you will pay over the tenure and a year-by-year repayment schedule.',
    whatIs:
      'An EMI is the fixed amount you pay your lender every month until a loan is fully repaid. Each EMI contains two parts: interest on the outstanding balance and a repayment of principal. Early EMIs are mostly interest; later EMIs are mostly principal.',
    howItWorks:
      'The calculator uses the standard reducing-balance formula used by Indian banks and NBFCs. Interest is charged monthly on the outstanding principal, so as you repay, the interest portion shrinks. The EMI is rounded to the nearest rupee and total payment is EMI × number of months.',
    formula:
      'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)\nP = loan amount, r = annual rate ÷ 12 ÷ 100, n = tenure in months',
    example:
      'A ₹50,00,000 loan at 8.5% for 20 years (240 months): r = 0.0070833. EMI = ₹43,391. Total payment = ₹43,391 × 240 = ₹1,04,13,840, so total interest = ₹54,13,840.',
    faq: [
      {
        q: 'Does a longer tenure reduce my EMI?',
        a: 'Yes, a longer tenure lowers the EMI but increases the total interest you pay, sometimes substantially. Compare a few tenures before deciding.',
      },
      {
        q: 'Is the EMI the same every month?',
        a: 'For a fixed-rate loan, yes. For floating-rate loans, lenders usually keep the EMI unchanged and adjust the tenure when rates change, unless you ask them to revise the EMI.',
      },
      {
        q: 'Does the EMI include processing fees or insurance?',
        a: 'No. Processing fees, insurance premiums and other charges are separate. Use the Home Loan or Personal Loan EMI calculators to include the processing fee.',
      },
      {
        q: 'What happens at 0% interest?',
        a: 'The EMI is simply the loan amount divided by the number of months, as in many no-cost EMI offers.',
      },
    ],
  },
  'home-loan-emi-calculator': {
    description:
      'Calculate your home loan EMI, total interest, processing fee and the full cost of borrowing for a house or flat.',
    whatIs:
      'A home loan EMI calculator shows the monthly instalment for a housing loan. Home loans are usually large and long (15–30 years), so small rate differences have a big impact on total interest.',
    howItWorks:
      'Enter the loan amount (property price minus your down payment), the interest rate offered and the tenure. The calculator applies the reducing-balance EMI formula and adds the processing fee plus 18% GST to show the full cost.',
    formula:
      'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)\nProcessing fee cost = P × fee% × 1.18 (GST)',
    example:
      '₹50 lakh at 8.5% for 20 years gives an EMI of ₹43,391. A 0.5% processing fee adds ₹25,000 + GST = ₹29,500 upfront.',
    howToUse: [
      'Enter the loan amount you need, not the property price.',
      'Enter the rate offered by your bank.',
      'Choose a tenure in years or months.',
      'Optionally enter the processing fee to see total cost.',
    ],
    faq: [
      {
        q: 'How much home loan can I get?',
        a: 'Banks typically fund 75–90% of the property value and cap your total EMIs at about 50–60% of net monthly income. Use the Loan Eligibility Calculator for an estimate.',
      },
      {
        q: 'Are home loan EMIs tax-deductible?',
        a: 'Under the old tax regime, principal repayment qualifies under Section 80C (up to ₹1.5 lakh) and interest on a self-occupied home under Section 24(b) (up to ₹2 lakh). The new regime does not allow these for self-occupied property.',
      },
      {
        q: 'Should I choose a shorter tenure?',
        a: 'A shorter tenure raises the EMI but saves a lot of interest. Many borrowers pick a comfortable tenure and make prepayments when possible.',
      },
    ],
  },
  'personal-loan-emi-calculator': {
    description:
      'Calculate the EMI, total interest and effective cost of a personal loan including the upfront processing fee.',
    whatIs:
      'A personal loan is an unsecured loan for any purpose, typically for 1–7 years at higher rates than secured loans. The processing fee is deducted upfront and increases your real cost.',
    howItWorks:
      'The EMI is calculated with the reducing-balance method. The processing fee (plus 18% GST) is added to the interest to show the total cost of the loan.',
    formula: 'EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)',
    example:
      '₹5,00,000 at 11% for 3 years: EMI ≈ ₹16,369, total interest ≈ ₹89,284. A 2% fee adds ₹10,000 + ₹1,800 GST.',
    faq: [
      {
        q: 'Is a flat-rate personal loan cheaper?',
        a: 'Usually not. A 10% flat rate is roughly equivalent to an 18% reducing-balance rate because interest is charged on the original principal throughout.',
      },
      {
        q: 'Can I prepay a personal loan?',
        a: 'Most lenders allow prepayment after 6–12 EMIs, sometimes with a foreclosure charge of 2–5%. Check your loan agreement.',
      },
    ],
  },
  'car-loan-emi-calculator': {
    description:
      'Estimate the EMI for a new or used car loan from the on-road price and your down payment.',
    whatIs:
      'A car loan finances part of a vehicle’s on-road price (ex-showroom price plus registration, insurance and other charges). Lenders commonly fund 80–100% of the ex-showroom price for 1–7 years.',
    howItWorks:
      'Loan amount = on-road price − down payment. The EMI is then calculated with the reducing-balance formula, and the total cost of the car adds the down payment to all EMIs.',
    formula: 'Loan = On-road price − Down payment\nEMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1)',
    example:
      'A ₹10,00,000 car with ₹2,00,000 down payment, 9% for 5 years: loan ₹8,00,000, EMI ≈ ₹16,607, total interest ≈ ₹1,96,420.',
    faq: [
      {
        q: 'How much down payment should I make?',
        a: 'A down payment of at least 20% keeps the EMI and interest manageable. A common rule of thumb is to keep the car EMI below 10–15% of monthly income.',
      },
      {
        q: 'Is a longer car loan a good idea?',
        a: 'Cars depreciate quickly. A long tenure means you may owe more than the car is worth for several years, so shorter tenures are usually better.',
      },
    ],
  },
  'education-loan-emi-calculator': {
    description:
      'Calculate education loan EMI after the moratorium period, including the interest that accrues while you study.',
    whatIs:
      'Education loans usually come with a moratorium — the course duration plus 6–12 months — during which you don’t pay EMIs. Interest still accrues, typically as simple interest, and is added to the loan unless you pay it.',
    howItWorks:
      'If interest is added to the loan, the calculator adds simple interest for the moratorium to the principal and computes the EMI on that higher amount. If you pay interest monthly while studying, the principal stays unchanged.',
    formula:
      'Moratorium interest = P × rate × moratorium years ÷ 100\nEMI on (P + moratorium interest) over the repayment tenure',
    example:
      '₹10 lakh at 10% with a 4-year moratorium: ₹4 lakh interest accrues, so repayment starts on ₹14 lakh. Over 7 years the EMI is about ₹23,242.',
    faq: [
      {
        q: 'Is education loan interest tax-deductible?',
        a: 'Yes, under the old tax regime, the entire interest paid is deductible under Section 80E for up to 8 years from the start of repayment. There is no upper limit.',
      },
      {
        q: 'Should I pay interest during the moratorium?',
        a: 'If you can, paying interest during studies keeps the principal from growing and reduces your future EMI noticeably.',
      },
    ],
  },
  'loan-eligibility-calculator': {
    description:
      'Estimate the maximum loan you could be eligible for based on your income, existing EMIs, interest rate and tenure.',
    whatIs:
      'Lenders limit how much of your income can go towards EMIs using the Fixed Obligation to Income Ratio (FOIR). The loan you can get is the amount whose EMI fits within that limit.',
    howItWorks:
      'Available EMI = net monthly income × FOIR − existing EMIs. The calculator then finds the loan amount whose EMI equals that figure at your rate and tenure.',
    formula: 'Max EMI = Income × FOIR − Existing EMIs\nLoan = EMI × (1 − (1 + r)^−n) ÷ r',
    example:
      'With ₹1,00,000 income, no existing EMIs and 50% FOIR, the maximum EMI is ₹50,000. At 8.5% for 20 years, that supports a loan of about ₹57.6 lakh.',
    faq: [
      {
        q: 'What FOIR do banks use?',
        a: 'Typically 40–50% for lower incomes and up to 60–65% for higher incomes. It varies by lender and your profile.',
      },
      {
        q: 'How can I improve eligibility?',
        a: 'Close small loans, add a co-applicant with income, choose a longer tenure or improve your credit score to get better rates.',
      },
    ],
  },
  'loan-tenure-calculator': {
    description:
      'Find out how many months it will take to repay a loan with a fixed EMI you can afford.',
    whatIs:
      'If you know the EMI you can comfortably pay, this calculator works backwards to the tenure needed to clear the loan.',
    howItWorks:
      'It solves the EMI formula for n. The EMI must be higher than the first month’s interest, otherwise the balance never reduces.',
    formula: 'n = −ln(1 − P × r ÷ EMI) ÷ ln(1 + r)',
    example:
      '₹25 lakh at 9% with an EMI of ₹30,000 takes 132 months (11 years). The last EMI is smaller than the others.',
    faq: [
      {
        q: 'Why does the calculator say the loan never gets repaid?',
        a: 'If your EMI is less than or equal to the monthly interest (P × r), the principal never goes down. Increase the EMI.',
      },
      {
        q: 'Why is the last EMI smaller?',
        a: 'Tenure is rounded up to whole months, so the final instalment only needs to clear the small remaining balance.',
      },
    ],
  },
  'loan-prepayment-calculator': {
    description:
      'Calculate the interest saved by making a one-time, yearly or monthly prepayment on your loan, and choose between a shorter tenure or a lower EMI.',
    whatIs:
      'A prepayment (part payment) reduces your outstanding principal ahead of schedule. Because interest is charged on the outstanding balance, every rupee prepaid early saves interest for the rest of the tenure.',
    howItWorks:
      'The calculator builds two month-by-month schedules — with and without prepayment — and compares the total interest. You can keep the EMI and finish sooner (reduce tenure), or keep the tenure and lower the EMI.',
    formula: 'Interest saved = Interest (original schedule) − Interest (schedule with prepayments)',
    example:
      'On a ₹50 lakh, 8.5%, 20-year loan, prepaying ₹5 lakh in month 12 and keeping the EMI saves about ₹16 lakh of interest and closes the loan 4 years earlier (192 months instead of 240).',
    faq: [
      {
        q: 'Reduce tenure or reduce EMI — which is better?',
        a: 'Reducing tenure saves more interest. Reducing EMI improves monthly cash flow. If the EMI is already comfortable, choose reduce tenure.',
      },
      {
        q: 'Are there prepayment charges?',
        a: 'RBI rules do not allow foreclosure or prepayment penalties on floating-rate loans to individuals. Fixed-rate loans may carry charges.',
      },
    ],
  },
  'loan-amortization-calculator': {
    description:
      'Generate a complete month-by-month or year-by-year amortization schedule for your loan with EMI dates.',
    whatIs:
      'An amortization schedule lists every EMI with its split between principal and interest and the balance remaining afterwards.',
    howItWorks:
      'For each month, interest = outstanding balance × monthly rate, principal = EMI − interest, and the new balance = old balance − principal. The final instalment is adjusted to close out rounding differences.',
    formula:
      'Interest_m = Balance_(m−1) × r\nPrincipal_m = EMI − Interest_m\nBalance_m = Balance_(m−1) − Principal_m',
    example:
      'For ₹20 lakh at 9% for 10 years, the first EMI of ₹25,335 contains ₹15,000 interest and ₹10,335 principal. By the last year, most of each EMI goes to principal.',
    faq: [
      {
        q: 'Why is so much of the early EMI interest?',
        a: 'Interest is charged on the outstanding balance, which is highest at the start. As principal is repaid, the interest portion falls.',
      },
      {
        q: 'Can I use this for tax planning?',
        a: 'Yes. The yearly view shows principal and interest paid each year, which is useful for Section 80C and 24(b) claims under the old regime. Match years to your EMI start date.',
      },
    ],
  },
  'sip-calculator': {
    description:
      'Estimate how much your monthly SIP in a mutual fund could grow to, with total invested amount and estimated returns.',
    whatIs:
      'A Systematic Investment Plan (SIP) invests a fixed amount in a mutual fund every month. Regular investing averages your purchase cost and lets compounding work over time.',
    howItWorks:
      'The calculator assumes a constant expected annual return compounded monthly, with each instalment invested at the start of the month (the convention used in AMC illustrations). Actual mutual fund returns vary and are not guaranteed.',
    formula:
      'FV = P × [((1 + i)^n − 1) ÷ i] × (1 + i)\nP = monthly SIP, i = annual return ÷ 12 ÷ 100, n = months',
    example:
      '₹5,000 per month for 10 years at 12% expected return: invested ₹6,00,000, estimated value ₹11,61,695, gains ₹5,61,695.',
    faq: [
      {
        q: 'Are SIP returns guaranteed?',
        a: 'No. Mutual fund returns depend on market performance. The calculator shows an illustration based on the return you enter.',
      },
      {
        q: 'What return should I assume?',
        a: 'Use conservative estimates: long-term equity funds are often illustrated at 10–12%, debt funds at 6–7%. Past performance does not guarantee future returns.',
      },
      {
        q: 'Can I increase my SIP every year?',
        a: 'Yes. Use the SIP Returns Calculator to model an annual step-up.',
      },
    ],
  },
  'sip-returns-calculator': {
    description:
      'Project the returns of a step-up (top-up) SIP and see the maturity value in today’s money after inflation.',
    whatIs:
      'A step-up SIP increases your monthly investment by a fixed percentage each year, usually in line with salary hikes. Even small annual increases significantly boost the final corpus.',
    howItWorks:
      'The SIP amount increases once every 12 months by the step-up percentage. Each instalment compounds monthly at the expected return. The inflation-adjusted value divides the maturity by (1 + inflation)^years.',
    formula:
      'Instalment in year k = P × (1 + step-up)^(k−1)\nValue_m = (Value_(m−1) + Instalment) × (1 + i)',
    example:
      '₹10,000 per month with a 10% yearly step-up for 15 years at 12% grows to about ₹86.8 lakh, versus about ₹50.5 lakh without step-up.',
    faq: [
      {
        q: 'What is a good step-up percentage?',
        a: 'Many investors match it to expected salary growth, typically 5–10% per year.',
      },
      {
        q: 'Why show value in today’s money?',
        a: 'Inflation reduces purchasing power. The real value tells you what the corpus would buy at today’s prices.',
      },
    ],
  },
  'lump-sum-calculator': {
    description:
      'Calculate the future value of a one-time investment in mutual funds or any instrument with an expected annual return.',
    whatIs:
      'A lump sum investment puts a single amount to work at once, instead of spreading it over months as in a SIP.',
    howItWorks: 'The investment compounds annually at the expected rate of return.',
    formula: 'FV = P × (1 + r)^t',
    example: '₹1,00,000 invested for 10 years at 12% grows to ₹3,10,585.',
    faq: [
      {
        q: 'Lump sum or SIP — which is better?',
        a: 'Lump sums benefit most when markets rise steadily after investing; SIPs reduce timing risk. For large amounts in equity, an STP can spread entry over months.',
      },
    ],
  },
  'swp-calculator': {
    description:
      'Plan a Systematic Withdrawal Plan and see how long your investment lasts with regular monthly withdrawals.',
    whatIs:
      'An SWP withdraws a fixed amount from a mutual fund every month while the rest stays invested. It is commonly used to generate regular income in retirement.',
    howItWorks:
      'Each month the withdrawal is taken first, then the remaining balance grows at the expected monthly return. If you enter an annual increase, withdrawals rise each year to offset inflation.',
    formula: 'Balance_m = (Balance_(m−1) − Withdrawal) × (1 + i)',
    example:
      '₹50 lakh with ₹30,000 monthly withdrawals at 8% expected return still leaves a balance after 20 years, because withdrawals (7.2% a year) are below the return.',
    faq: [
      {
        q: 'How much can I withdraw safely?',
        a: 'Withdrawing less than the expected return keeps the corpus intact. With inflation-linked increases, a starting withdrawal rate of 3–5% a year is commonly considered sustainable.',
      },
      {
        q: 'How are SWP withdrawals taxed?',
        a: 'Each withdrawal redeems units, and only the gains portion is taxed as capital gains, which is often more tax-efficient than interest income.',
      },
    ],
  },
  'stp-calculator': {
    description:
      'Estimate the value of a Systematic Transfer Plan that moves money monthly from a liquid or debt fund into an equity fund.',
    whatIs:
      'An STP parks a lump sum in a low-risk fund and transfers a fixed amount each month into a target fund, spreading market entry over time while the parked money earns returns.',
    howItWorks:
      'Each month the transfer moves from the source fund to the target fund; then both balances grow at their respective expected monthly returns.',
    formula: 'Source_m = (Source_(m−1) − T) × (1 + i_s)\nTarget_m = (Target_(m−1) + T) × (1 + i_t)',
    example:
      '₹12 lakh transferred at ₹1 lakh a month for 12 months, with 6.5% on the liquid fund and 12% on equity, ends at roughly ₹13.2 lakh.',
    faq: [
      {
        q: 'Why use an STP instead of investing a lump sum?',
        a: 'It reduces the risk of investing everything at a market peak, while the money waiting to be transferred still earns returns.',
      },
    ],
  },
  'fd-calculator': {
    description:
      'Calculate fixed deposit maturity value and interest with quarterly, monthly, half-yearly or yearly compounding, including senior citizen rates.',
    whatIs:
      'A fixed deposit locks money with a bank or NBFC for a fixed tenure at a fixed interest rate. Most Indian banks compound FD interest quarterly.',
    howItWorks:
      'Cumulative FDs reinvest interest and pay it at maturity using compound interest. Deposits shorter than 6 months usually earn simple interest. Non-cumulative FDs pay interest monthly or quarterly instead.',
    formula: 'A = P × (1 + r/n)^(n × t)\nn = compounding periods per year, t = years',
    example:
      '₹1,00,000 at 7% for 5 years compounded quarterly matures to ₹1,41,478 — interest of ₹41,478 and an effective yield of 7.19%.',
    faq: [
      {
        q: 'Is FD interest taxable?',
        a: 'Yes, FD interest is added to your income and taxed at your slab rate. Banks deduct TDS once interest crosses the annual threshold unless you submit Form 15G/15H where eligible.',
      },
      {
        q: 'Do senior citizens get higher rates?',
        a: 'Most banks offer 0.25–0.75% extra to senior citizens. Toggle the senior citizen option to add 0.50%.',
      },
      {
        q: 'What about tax-saver FDs?',
        a: 'Tax-saver FDs have a 5-year lock-in and qualify under Section 80C in the old regime. Use a 5-year tenure to estimate their maturity.',
      },
    ],
  },
  'rd-calculator': {
    description:
      'Calculate the maturity amount and interest on a bank or post office recurring deposit.',
    whatIs:
      'A recurring deposit lets you deposit a fixed amount every month for a fixed tenure and earn fixed-deposit-like interest.',
    howItWorks:
      'Indian banks compound RD interest quarterly. Each monthly instalment earns interest for the months it remains deposited, so the first instalment earns the most.',
    formula: 'M = Σ R × (1 + r/400)^(months remaining ÷ 3)',
    example:
      '₹5,000 a month for 60 months at 6.7% matures to about ₹3.57 lakh on deposits of ₹3 lakh.',
    faq: [
      {
        q: 'What if I miss an RD instalment?',
        a: 'Banks usually charge a small penalty per missed instalment, and repeated defaults can lead to premature closure.',
      },
      {
        q: 'Is RD interest taxable?',
        a: 'Yes, at your slab rate, and TDS applies above the threshold, just like FDs.',
      },
    ],
  },
  'ppf-calculator': {
    description:
      'Calculate PPF maturity value, total interest and a year-wise balance for 15 years and extensions.',
    whatIs:
      'The Public Provident Fund is a government-backed savings scheme with a 15-year lock-in, extendable in 5-year blocks. Deposits, interest and maturity are tax-free (EEE status).',
    howItWorks:
      'Interest is calculated on the lowest balance between the 5th and the last day of each month and credited yearly. Depositing before 5 April earns interest for the full year, which this calculator assumes.',
    formula: 'Balance_y = (Balance_(y−1) + Deposit) × (1 + r)',
    example:
      'Investing ₹1,50,000 every year for 15 years at 7.1% gives a maturity value of ₹40,68,209 on deposits of ₹22,50,000.',
    faq: [
      {
        q: 'What is the current PPF interest rate?',
        a: 'The rate is set by the government every quarter. Enter the latest notified rate; the default is 7.1%.',
      },
      {
        q: 'Can I withdraw early?',
        a: 'Partial withdrawals are allowed from the 7th financial year, and loans against PPF from the 3rd to 6th year, subject to limits.',
      },
    ],
  },
  'nps-calculator': {
    description:
      'Estimate your NPS corpus at 60, the tax-free lump sum you can withdraw and the monthly pension from the annuity.',
    whatIs:
      'The National Pension System is a market-linked retirement scheme regulated by PFRDA. At 60, at least 40% of the corpus must be used to buy an annuity that pays a pension; up to 60% can be withdrawn tax-free.',
    howItWorks:
      'Monthly contributions compound until age 60 at the expected return. The corpus is then split into the annuity portion (which pays a pension at the annuity rate) and the lump sum.',
    formula:
      'Corpus = P × [((1 + i)^n − 1) ÷ i] × (1 + i)\nPension = Corpus × Annuity% × Annuity rate ÷ 12',
    example:
      '₹5,000 a month from age 30 at 10% builds about ₹1.14 crore at 60. With 40% in an annuity at 6%, the pension is about ₹22,800 a month.',
    faq: [
      {
        q: 'What tax benefits does NPS offer?',
        a: 'Under the old regime, contributions qualify under 80CCD(1) within the ₹1.5 lakh 80C limit plus an extra ₹50,000 under 80CCD(1B). Employer contributions under 80CCD(2) are deductible in both regimes, within limits.',
      },
      {
        q: 'Is the pension taxable?',
        a: 'Yes, annuity income is taxable at your slab rate in the year you receive it.',
      },
    ],
  },
  'cagr-calculator': {
    description:
      'Calculate the Compound Annual Growth Rate between a starting and ending value over any number of years.',
    whatIs:
      'CAGR is the constant yearly rate at which an investment would have grown from its starting value to its ending value. It smooths out year-to-year volatility.',
    howItWorks:
      'The calculator takes the ratio of final to initial value, raises it to the power of 1 ÷ years and subtracts 1.',
    formula: 'CAGR = (Final ÷ Initial)^(1 ÷ years) − 1',
    example:
      '₹1,00,000 growing to ₹2,50,000 in 5 years gives a CAGR of 20.11%, even though the absolute return is 150%.',
    faq: [
      {
        q: 'What is the difference between CAGR and absolute return?',
        a: 'Absolute return is total growth regardless of time. CAGR annualises it so you can compare investments held for different periods.',
      },
      {
        q: 'Can CAGR be used for SIPs?',
        a: 'Not directly, because money is invested at different times. For SIPs, XIRR is the right measure.',
      },
    ],
  },
  'simple-interest-calculator': {
    description:
      'Calculate simple interest and the total amount payable or receivable for any principal, rate and time period.',
    whatIs:
      'Simple interest is charged only on the original principal, not on accumulated interest.',
    howItWorks:
      'Interest is principal × rate × time. Time can be entered in years, months or days (365-day year).',
    formula: 'SI = P × R × T ÷ 100\nAmount = P + SI',
    example:
      '₹1,00,000 at 8% for 3 years earns ₹24,000 in simple interest; the total amount is ₹1,24,000.',
    faq: [
      {
        q: 'Where is simple interest used?',
        a: 'Short-term deposits, some gold and vehicle loans, and education loan interest during the moratorium commonly use simple interest.',
      },
    ],
  },
  'compound-interest-calculator': {
    description:
      'Calculate compound interest with yearly, half-yearly, quarterly, monthly or daily compounding and optional monthly additions.',
    whatIs:
      'Compound interest earns interest on previously earned interest. The more frequently interest is compounded, the higher the final amount.',
    howItWorks:
      'The principal grows at (1 + r/n) each compounding period. Monthly additions grow at the equivalent monthly rate from the month they are added.',
    formula: 'A = P × (1 + r/n)^(n × t)',
    example:
      '₹1,00,000 at 8% compounded quarterly for 10 years grows to ₹2,20,804, earning ₹40,804 more than simple interest (₹80,000).',
    faq: [
      {
        q: 'What is the effective annual rate?',
        a: 'It is the true yearly yield after compounding: (1 + r/n)^n − 1. For 8% compounded quarterly it is 8.24%.',
      },
    ],
  },
  'inflation-calculator': {
    description:
      'See how much something will cost in the future and how much your money will be worth after inflation.',
    whatIs:
      'Inflation is the general rise in prices over time. It means the same amount of money buys less in the future.',
    howItWorks:
      'Future cost = today’s cost grown at the inflation rate. Purchasing power = today’s amount discounted by inflation.',
    formula: 'Future cost = C × (1 + i)^n\nPurchasing power = C ÷ (1 + i)^n',
    example:
      'At 6% inflation, something costing ₹1,00,000 today will cost ₹1,79,085 in 10 years; ₹1 lakh will buy what ₹55,839 buys today.',
    faq: [
      {
        q: 'What inflation rate should I use?',
        a: 'India’s long-run CPI inflation has averaged roughly 5–7%. Education and healthcare costs often rise faster, around 8–10%.',
      },
    ],
  },
  'retirement-calculator': {
    description:
      'Estimate the retirement corpus you need and the monthly SIP required to build it, accounting for inflation and returns.',
    whatIs:
      'A retirement plan works out how much money you need on the day you retire to cover expenses until life expectancy, and how much to invest each month until then.',
    howItWorks:
      'Your current monthly expense is inflated to your retirement age. The corpus is the present value of those expenses — rising with inflation each year — discounted at the post-retirement return. Existing savings are grown to retirement, and the remaining gap is funded by a monthly SIP.',
    formula:
      'Corpus = E × (1 − ((1+g)/(1+r))^N) ÷ (1 − (1+g)/(1+r))\nE = annual expense at retirement, g = inflation, r = post-retirement return, N = retirement years',
    example:
      'A 30-year-old spending ₹50,000 a month, retiring at 60 with 6% inflation, needs about ₹2.87 lakh a month at retirement and a corpus of roughly ₹7.7 crore.',
    faq: [
      {
        q: 'Why is the corpus so large?',
        a: 'Inflation roughly doubles costs every 12 years at 6%, and the corpus must last for decades while expenses keep rising.',
      },
      {
        q: 'Should I include EPF and PPF?',
        a: 'Yes, include the current balance of retirement-dedicated savings in “Current retirement savings”.',
      },
    ],
  },
  'retirement-corpus-calculator': {
    description:
      'Find the corpus required to fund monthly expenses throughout retirement, with an emergency and health buffer.',
    whatIs:
      'The retirement corpus is the amount you need at retirement so that withdrawals, growing with inflation, last for your full retirement.',
    howItWorks:
      'The corpus is the present value of a growing annuity: annual expenses rise with inflation and the remaining corpus earns the expected return.',
    formula: 'Corpus = E × (1 − ((1+g)/(1+r))^N) ÷ (1 − (1+g)/(1+r)) + buffer',
    example:
      '₹1 lakh a month for 25 years with 6% inflation and 7% returns needs about ₹2.69 crore, plus the buffer.',
    faq: [
      {
        q: 'What if returns equal inflation?',
        a: 'Then the corpus simply equals annual expense × number of years, because real returns are zero.',
      },
    ],
  },
  'net-worth-calculator': {
    description:
      'Calculate your personal net worth by adding up everything you own and subtracting everything you owe.',
    whatIs:
      'Net worth is total assets minus total liabilities. Tracking it yearly is one of the simplest ways to measure financial progress.',
    howItWorks:
      'Enter current market values of assets and outstanding balances of loans. The calculator totals them (in paise, for exactness) and shows your asset allocation.',
    formula: 'Net worth = Total assets − Total liabilities',
    example: 'Assets of ₹18 lakh and loans of ₹1.7 lakh give a net worth of ₹16.3 lakh.',
    faq: [
      {
        q: 'Should I include my home?',
        a: 'Yes, at a realistic market value, along with the home loan outstanding. Many people also track net worth excluding the home they live in.',
      },
    ],
  },
  'investment-return-calculator': {
    description:
      'Calculate the total and annualised return on any investment, including dividends or interest received.',
    whatIs:
      'Investment return measures how much you gained or lost relative to the amount you invested.',
    howItWorks:
      'Total value = sale or current value + income received. Total return is the percentage gain; annualised return uses the CAGR formula over the holding period.',
    formula:
      'Total return = (Value + Income − Invested) ÷ Invested\nAnnualised = (Total ÷ Invested)^(1/years) − 1',
    example:
      '₹2,00,000 invested and now worth ₹2,90,000 after 3 years: 45% total return, 13.19% annualised.',
    faq: [
      {
        q: 'Does this include taxes and charges?',
        a: 'No. Subtract brokerage, taxes and fees from the final value to see net return.',
      },
    ],
  },
  'future-value-calculator': {
    description:
      'Calculate what a sum of money — plus optional regular payments — will be worth in the future.',
    whatIs:
      'Future value (FV) is the value of money at a future date after it earns a given rate of return per period.',
    howItWorks:
      'The present value compounds for the number of periods. Regular payments are added as an ordinary annuity (end of period) or annuity due (start of period).',
    formula: 'FV = PV × (1 + r)^n + PMT × ((1 + r)^n − 1) ÷ r × (1 + r if paid at start)',
    example: '₹1,00,000 at 8% for 10 years grows to ₹2,15,892.50.',
    faq: [
      {
        q: 'What is a period?',
        a: 'Any consistent interval — a year, quarter or month. Make sure the rate you enter is per period.',
      },
    ],
  },
  'present-value-calculator': {
    description:
      'Calculate today’s value of a future amount or a series of future payments using a discount rate.',
    whatIs:
      'Present value (PV) answers the question: how much is a future amount worth in today’s money, given a rate of return you could otherwise earn?',
    howItWorks:
      'A future amount is divided by (1 + r)^n. For regular payments, the calculator uses the present value of an annuity.',
    formula: 'PV = FV ÷ (1 + r)^n\nPV (annuity) = PMT × (1 − (1 + r)^−n) ÷ r',
    example: '₹10,00,000 received in 10 years, discounted at 7%, is worth ₹5,08,349.29 today.',
    faq: [
      {
        q: 'Which discount rate should I use?',
        a: 'Use the return you could reasonably earn on an alternative investment of similar risk, or the inflation rate to see real value.',
      },
    ],
  },
  'rule-of-72-calculator': {
    description:
      'Quickly estimate how many years it takes for money to double, triple or quadruple — or the return needed to double in a given time.',
    whatIs:
      'The Rule of 72 is a mental-math shortcut: divide 72 by the annual return to estimate the years to double your money.',
    howItWorks:
      'The calculator shows the Rule of 72 estimate alongside the exact answer using logarithms, plus the Rule of 114 (triple) and Rule of 144 (quadruple).',
    formula: 'Years to double ≈ 72 ÷ rate\nExact = ln(2) ÷ ln(1 + rate)',
    example: 'At 8% a year, money doubles in about 72 ÷ 8 = 9 years (exactly 9.01 years).',
    faq: [
      {
        q: 'How accurate is the Rule of 72?',
        a: 'It is very accurate for rates between 6% and 10%. For much higher or lower rates, rely on the exact figure.',
      },
    ],
  },
};

export default content;
