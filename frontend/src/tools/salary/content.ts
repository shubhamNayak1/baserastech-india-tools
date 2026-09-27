import type { ContentMap } from '../define';

const content: ContentMap = {
  'ctc-to-in-hand-salary-calculator': {
    description:
      'Convert your cost-to-company (CTC) into the salary that actually reaches your bank account each month, with a full salary structure and tax under the regime you choose.',
    whatIs:
      'CTC is the total amount an employer spends on you in a year. It includes items you never receive as monthly cash, such as the employer’s PF contribution and gratuity. In-hand (take-home) salary is what remains after those items and your own deductions — employee PF, professional tax and income tax.',
    howItWorks:
      'The calculator splits CTC into basic, HRA, employer PF, gratuity (4.81% of basic, if part of CTC) and a special allowance that balances the total. It then deducts employee PF (12% of basic, capped at ₹15,000 wages if you choose), professional tax and income tax computed with the selected financial year’s rules.',
    formula:
      'Gross salary = CTC − Employer PF − Gratuity\nIn-hand = Gross − Employee PF − Professional tax − Income tax',
    example:
      'A ₹12 lakh CTC with 50% basic, capped PF and gratuity gives a gross salary of ₹11,49,540. Under the new regime for FY 2025-26 the tax is nil (taxable income is below ₹12 lakh after the ₹75,000 standard deduction), so monthly take-home is about ₹93,787.',
    faq: [
      {
        q: 'Why is my in-hand salary so much lower than CTC ÷ 12?',
        a: 'CTC includes the employer’s PF and gratuity, which you do not receive monthly, and your own PF, professional tax and income tax are deducted from gross salary.',
      },
      {
        q: 'Which tax regime should I choose?',
        a: 'The new regime has lower rates and a larger rebate but few deductions. The old regime can be better if you claim large deductions such as HRA, 80C, 80D and home loan interest. Use the Income Tax Calculator to compare both.',
      },
      {
        q: 'How is variable pay handled?',
        a: 'Variable pay is taxed when paid. The headline shows fixed monthly take-home; the hint shows the average including variable pay.',
      },
    ],
  },
  'in-hand-salary-calculator': {
    description:
      'Calculate your net monthly salary from gross salary after provident fund, ESI, professional tax, TDS and other deductions.',
    whatIs:
      'Gross salary is your total pay before deductions. In-hand salary is what is credited after statutory and voluntary deductions.',
    howItWorks:
      'Employee PF is 12% of basic (capped or full, per your choice). ESI of 0.75% applies when gross pay is ₹21,000 a month or less. Income tax is estimated for the whole year and spread evenly as monthly TDS.',
    formula: 'In-hand = Gross − PF − ESI − Professional tax − TDS − Other deductions',
    example:
      'A monthly gross of ₹80,000 with 50% basic and capped PF: PF ₹1,800, PT ₹200, and no income tax under the new regime (₹9.6 lakh a year is within the rebate), so in-hand is ₹78,000.',
    faq: [
      {
        q: 'Why does my employer deduct different TDS each month?',
        a: 'Employers re-estimate annual tax as your salary, bonuses and declared investments change, so monthly TDS can vary, especially in the last quarter.',
      },
      {
        q: 'Is professional tax the same everywhere?',
        a: 'No. It is a state tax, capped at ₹2,500 a year. Some states, such as Delhi and Uttar Pradesh, do not levy it.',
      },
    ],
  },
  'salary-hike-calculator': {
    description:
      'Calculate your new salary from a hike percentage, or the hike percentage between your current and new salary.',
    whatIs:
      'A salary hike is the increase in pay from an appraisal, promotion or job change, usually expressed as a percentage of current salary.',
    howItWorks:
      'New salary = current salary × (1 + hike% ÷ 100). If you already know the new salary, the hike percentage is (new − current) ÷ current × 100.',
    formula: 'New salary = Current × (1 + Hike%/100)\nHike% = (New − Current) ÷ Current × 100',
    example:
      'A 15% hike on ₹10,00,000 gives ₹11,50,000 — ₹1,50,000 more a year, or ₹12,500 more a month before tax.',
    faq: [
      {
        q: 'Is a hike on CTC the same as a hike in take-home?',
        a: 'Not exactly. Tax is progressive, so take-home usually rises by a smaller percentage than CTC. Use the CTC to In-Hand calculator on both figures.',
      },
      {
        q: 'What is a typical hike when switching jobs?',
        a: 'It varies by industry and role, but switches commonly bring 20–40% while annual appraisals are often in the 5–12% range.',
      },
    ],
  },
  'salary-increment-calculator': {
    description:
      'Project your salary several years ahead with a yearly increment and see whether it beats inflation.',
    whatIs:
      'An increment is the periodic raise in salary, usually annual. Compounded over years, even modest increments make a large difference.',
    howItWorks:
      'Each year’s salary is the previous year’s multiplied by (1 + increment%). Real growth adjusts the increment for inflation.',
    formula: 'Salaryₙ = Salary₀ × (1 + i)ⁿ\nReal growth = (1 + i) ÷ (1 + inflation) − 1',
    example:
      '₹8,00,000 with an 8% yearly increment grows to ₹11,75,462 in 5 years. With 6% inflation the real growth is about 1.89% a year.',
    faq: [
      {
        q: 'What if my increment is lower than inflation?',
        a: 'Your purchasing power falls even though the number goes up. The calculator flags negative real growth.',
      },
    ],
  },
  'salary-comparison-calculator': {
    description:
      'Compare two salaries paid on different bases — hourly, daily, weekly, monthly or yearly — on an equal annual footing.',
    whatIs:
      'Salaries quoted per hour and per year are hard to compare directly. Converting both to annual figures makes the comparison fair.',
    howItWorks:
      'Each salary is annualised using your weekly working hours and a 5-day week over 52 weeks. The calculator then shows the difference in rupees and percent.',
    formula: 'Annual = Hourly × hours/week × 52 = Daily × 5 × 52 = Monthly × 12',
    example:
      '₹75,000 a month (₹9,00,000 a year) versus ₹10,00,000 a year: Salary B is higher by ₹1,00,000 a year, or 11.11%.',
    faq: [
      {
        q: 'Does this include taxes or benefits?',
        a: 'No, it compares gross pay. For take-home and benefits, use the Offer Comparison Calculator.',
      },
    ],
  },
  'monthly-salary-calculator': {
    description:
      'Convert an annual package (LPA), weekly, daily or hourly pay into a monthly salary.',
    whatIs:
      'Offers in India are often quoted in lakhs per annum (LPA). This tool converts any pay rate into a monthly figure and other equivalents.',
    howItWorks:
      'Pay is first annualised (hours × 52 weeks, days × 5 × 52, or months × 12) and then divided back into monthly, weekly, daily and hourly figures.',
    formula: 'Monthly = Annual ÷ 12',
    example:
      'A ₹12 LPA package is ₹1,00,000 a month gross, ₹23,077 a week and about ₹577 an hour at 40 hours a week.',
    faq: [
      {
        q: 'Is monthly salary the same as in-hand?',
        a: 'No, this is gross pay. Use the CTC to In-Hand calculator to account for PF and taxes.',
      },
    ],
  },
  'annual-salary-calculator': {
    description: 'Convert monthly, weekly, daily or hourly pay into an annual salary figure.',
    whatIs:
      'Annual salary is the total gross pay for a year. It is the figure used for tax slabs and loan eligibility.',
    howItWorks:
      'Monthly pay × 12, weekly pay × 52, daily pay × working days per week × 52, or hourly pay × hours per week × 52.',
    formula: 'Annual = Monthly × 12',
    example: '₹75,000 a month is ₹9,00,000 a year (9 LPA).',
    faq: [
      {
        q: 'How many working days are in a year?',
        a: 'With a 5-day week and no unpaid leave, 260 days. Subtract public holidays and leave for a more precise count.',
      },
    ],
  },
  'daily-salary-calculator': {
    description:
      'Calculate your per-day salary and the loss-of-pay deduction for unpaid leave days.',
    whatIs:
      'Per-day salary is used for loss of pay (LOP), partial months and leave encashment. Employers commonly divide monthly salary by 30, 26 or the actual days in the month.',
    howItWorks:
      'Daily salary = monthly salary ÷ chosen days. LOP deduction = daily salary × unpaid days.',
    formula: 'Daily = Monthly ÷ Days\nLOP = Daily × Unpaid days',
    example:
      'With ₹50,000 a month on a 30-day basis, daily pay is ₹1,666.67; 2 LOP days reduce salary by ₹3,333.',
    faq: [
      {
        q: 'Which divisor is correct?',
        a: 'It depends on your company policy and contract. 30 days (calendar) and 26 days (excluding Sundays) are both common.',
      },
    ],
  },
  'hourly-salary-calculator': {
    description: 'Find your hourly rate from a monthly or annual salary and your working hours.',
    whatIs:
      'Your hourly rate shows what each hour of work is worth, which helps compare jobs with different hours or evaluate side projects.',
    howItWorks: 'Pay is annualised and divided by working hours per year (hours per week × 52).',
    formula: 'Hourly = Annual ÷ (Hours per week × 52)',
    example: '₹1,00,000 a month at 40 hours a week is ₹576.92 an hour.',
    faq: [
      {
        q: 'Should I count overtime?',
        a: 'If you regularly work longer hours unpaid, enter your real hours — your effective hourly rate will be lower.',
      },
    ],
  },
  'freelance-hourly-rate-calculator': {
    description:
      'Set a sustainable freelance hourly rate that covers your income goal, business expenses, taxes and non-billable time.',
    whatIs:
      'Freelancers pay their own expenses and taxes and cannot bill every hour. Pricing by salary ÷ 2,000 hours usually undercharges.',
    howItWorks:
      'Required revenue = desired take-home ÷ (1 − tax rate) + expenses. Billable hours = weekly hours × billable share × working weeks. Hourly rate = revenue ÷ billable hours.',
    formula: 'Rate = (Income ÷ (1 − tax) + Expenses) ÷ (Hours × Billable% × Weeks)',
    example:
      'For ₹15 lakh take-home, ₹1.5 lakh expenses, 10% tax, 40 hours a week, 70% billable and 6 weeks off, the minimum rate is about ₹1,411 an hour.',
    faq: [
      {
        q: 'Should I charge GST?',
        a: 'If your turnover from services exceeds ₹20 lakh (₹10 lakh in some special-category states), you must register and charge 18% GST on most services. Export of services can be zero-rated under LUT.',
      },
      {
        q: 'What is presumptive taxation?',
        a: 'Eligible professionals can declare 50% of gross receipts as income under Section 44ADA, which often keeps effective tax low.',
      },
    ],
  },
  'gratuity-calculator': {
    description:
      'Calculate gratuity payable on resignation or retirement under the Payment of Gratuity Act, 1972 and the portion that is tax-free.',
    whatIs:
      'Gratuity is a lump sum employers pay employees who complete at least five years of continuous service (earlier in case of death or disability).',
    howItWorks:
      'For employers covered by the Act, gratuity = 15 ÷ 26 × last drawn basic + DA × years of service, where a final part-year of 6 months or more counts as a full year. For employers not covered, 15 ÷ 30 and only completed years are used.',
    formula: 'Covered: 15/26 × Salary × Years\nNot covered: 15/30 × Salary × Completed years',
    example:
      'With ₹60,000 last drawn basic + DA and 10 years 7 months of service, 11 years count: 15/26 × 60,000 × 11 = ₹3,80,769.',
    faq: [
      {
        q: 'How much gratuity is tax-free?',
        a: 'For private-sector employees, up to ₹20 lakh over a career is exempt under Section 10(10).',
      },
      {
        q: 'Do I get gratuity if I resign after 4 years 8 months?',
        a: 'Several courts have held that 240 days of work in the fifth year counts as five years, so many employers pay it. Check your employer’s policy.',
      },
    ],
  },
  'epf-calculator': {
    description:
      'Project your Employees’ Provident Fund (EPF) balance at retirement, with salary increases, voluntary PF and the current EPF interest rate.',
    whatIs:
      'EPF is a retirement savings scheme run by EPFO. You contribute 12% of basic + DA, and your employer contributes 12%, of which 8.33% (up to ₹1,250 a month) goes to the Employees’ Pension Scheme and the rest to your EPF account.',
    howItWorks:
      'Contributions are added monthly and interest is calculated on the monthly running balance, credited once a year. Salary increases each year by the growth rate you enter.',
    formula:
      'Monthly credit = 12% × Basic + VPF + (12% × Basic − EPS)\nInterest = Σ monthly balance × rate ÷ 12',
    example:
      'Starting at age 28 with ₹30,000 basic, ₹2 lakh balance, 7% yearly salary growth and 8.25% interest, the corpus at 58 is about ₹2.32 crore.',
    faq: [
      {
        q: 'What is the current EPF interest rate?',
        a: 'EPFO declares the rate each year. It was 8.25% for FY 2024-25; update the rate field when a new one is announced.',
      },
      {
        q: 'Is EPF interest taxable?',
        a: 'Interest on employee contributions above ₹2.5 lakh a year (₹5 lakh where there is no employer contribution) is taxable.',
      },
    ],
  },
  'pf-calculator': {
    description:
      'Calculate the monthly provident fund contribution by you and your employer, and how the employer share is split between EPF and EPS.',
    whatIs:
      'Every month 12% of your basic + DA is deducted for PF, and your employer contributes a matching 12%. The employer’s share is divided between your EPF account and the Employees’ Pension Scheme (EPS).',
    howItWorks:
      'EPS gets 8.33% of wages up to ₹15,000 (maximum ₹1,250 a month); the rest of the employer’s 12% goes to EPF.',
    formula:
      'Employee = 12% × Wages\nEPS = 8.33% × min(Wages, 15,000)\nEmployer EPF = 12% × Wages − EPS',
    example:
      'On a ₹30,000 basic with PF capped at ₹15,000: employee ₹1,800, EPS ₹1,250, employer EPF ₹550 — so ₹2,350 reaches your EPF account each month.',
    faq: [
      {
        q: 'Can I contribute more than 12%?',
        a: 'Yes, through Voluntary Provident Fund (VPF). It earns the EPF rate, though the employer is not required to match it.',
      },
    ],
  },
  'employee-contribution-calculator': {
    description:
      'Calculate the statutory deductions from your salary — employee PF, VPF, ESI and professional tax.',
    whatIs: 'These are the contributions deducted from an employee’s pay before income tax.',
    howItWorks:
      'PF is 12% of basic + DA. ESI is 0.75% of gross wages if gross is ₹21,000 a month or less. Professional tax is a fixed state amount.',
    formula: 'Deductions = PF + VPF + ESI + PT',
    example:
      'A ₹20,000 gross salary with ₹10,000 basic: PF ₹1,200, ESI ₹150 and PT ₹200 — ₹1,550 in total.',
    faq: [
      {
        q: 'What does ESI cover?',
        a: 'ESI provides medical care, sickness, maternity and disability benefits to employees earning up to ₹21,000 a month.',
      },
    ],
  },
  'employer-contribution-calculator': {
    description:
      'Calculate the employer’s statutory costs on top of an employee’s gross salary: PF, EPS, EDLI, admin charges, ESI and gratuity provision.',
    whatIs:
      'Employers pay several contributions in addition to salary. Together they determine the real cost to company.',
    howItWorks:
      'Employer PF is 12% of wages (3.67% EPF + 8.33% EPS up to ₹1,250). EDLI is 0.5% of wages up to ₹15,000, EPF admin charges are 0.5%, ESI is 3.25% when gross is ₹21,000 or less, and gratuity is commonly provided at 4.81% of basic.',
    formula: 'Employer cost = PF + EDLI + Admin + ESI + Gratuity provision',
    example:
      'For ₹40,000 gross and ₹20,000 basic (PF capped): EPF ₹550, EPS ₹1,250, EDLI + admin ₹150, gratuity ₹962 — about ₹2,912 a month over gross.',
    faq: [
      {
        q: 'Why is gratuity 4.81%?',
        a: '15/26 of a month’s salary per year of service equals 57.7% of monthly basic a year, which is 4.81% of annual basic.',
      },
    ],
  },
  'hra-calculator': {
    description:
      'Calculate how much of your House Rent Allowance is tax-exempt and how much is taxable.',
    whatIs:
      'HRA is a salary component for rent. Under Section 10(13A), part of it is exempt from tax in the old regime if you live in a rented home.',
    howItWorks:
      'The exemption is the lowest of: actual HRA received; rent paid minus 10% of basic + DA; and 50% of basic + DA in Delhi, Mumbai, Kolkata or Chennai (40% elsewhere).',
    formula: 'Exempt HRA = min(HRA, Rent − 10% × Salary, 50%/40% × Salary)',
    example:
      'Basic ₹50,000, HRA ₹20,000 and rent ₹18,000 in a metro: limits are ₹20,000, ₹13,000 and ₹25,000, so ₹13,000 a month is exempt and ₹7,000 is taxable.',
    faq: [
      {
        q: 'Can I claim HRA in the new regime?',
        a: 'No. HRA exemption is available only under the old regime.',
      },
      {
        q: 'Can I pay rent to my parents?',
        a: 'Yes, if they own the property and declare the rent as income. Keep a rental agreement and bank transfers as proof.',
      },
    ],
  },
  'bonus-calculator': {
    description:
      'Calculate the statutory bonus under the Payment of Bonus Act, 1965, or estimate a performance bonus after tax.',
    whatIs:
      'The Payment of Bonus Act requires eligible establishments to pay a bonus of 8.33% to 20% of wages to employees earning up to ₹21,000 a month. Performance bonuses are discretionary and set by the employer.',
    howItWorks:
      'Statutory bonus is calculated on actual wages, capped at ₹7,000 a month or the scheduled minimum wage, whichever is higher, for the months worked. Performance bonus is a percentage of CTC, taxed at your marginal rate plus cess.',
    formula: 'Statutory bonus = min(Wage, max(7,000, Minimum wage)) × Months × Rate',
    example:
      'An employee on ₹15,000 a month for 12 months at 8.33% gets 7,000 × 12 × 8.33% = ₹6,997.',
    faq: [
      {
        q: 'Is bonus taxable?',
        a: 'Yes, all bonuses are part of salary income and taxed at your slab rate.',
      },
    ],
  },
  'leave-encashment-calculator': {
    description:
      'Calculate the value of your unused leave and how much of it is tax-exempt when you retire or resign.',
    whatIs:
      'Leave encashment is the payment for accumulated earned or privilege leave. It is fully taxable while in service, but partly exempt on retirement or resignation under Section 10(10AA).',
    howItWorks:
      'Encashment = (basic + DA ÷ 30 or 26) × leave days. For non-government employees, the exempt amount is the least of the amount received, ₹25 lakh, 10 months’ average salary, and cash equivalent of leave at 30 days for every completed year of service.',
    formula:
      'Encashment = Daily salary × Leave days\nExempt = min(Actual, ₹25L, 10 × Avg salary, Leave credit value)',
    example:
      '45 days on ₹60,000 basic (30-day basis) is ₹90,000, fully exempt at retirement after 15 years.',
    faq: [
      {
        q: 'What average salary is used?',
        a: 'Tax rules use the average of the last 10 months’ basic + DA (and commission linked to turnover). This calculator uses your current monthly figure.',
      },
    ],
  },
  'notice-period-calculator': {
    description:
      'Calculate your last working day and notice-period buyout or shortfall recovery from your resignation date.',
    whatIs:
      'The notice period is the time you must keep working after resigning, as per your employment contract. If you leave early, the employer may recover pay for the unserved days.',
    howItWorks:
      'The last working day is the resignation date plus the notice period (the resignation day counts as day one). Buyout is usually gross monthly salary ÷ 30 × unserved days.',
    formula:
      'Last day = Resignation date + Notice − 1 day\nBuyout = Monthly gross ÷ 30 × Unserved days',
    example: 'Resigning on 1 October with 60 days’ notice makes 29 November the last working day.',
    faq: [
      {
        q: 'Can I use leave to shorten notice?',
        a: 'Some employers let you adjust earned leave against notice, while others do not. Check your policy.',
      },
    ],
  },
  'experience-calculator': {
    description:
      'Calculate total work experience across multiple jobs, counting overlapping periods only once.',
    whatIs:
      'Recruiters and background checks often need your total experience in years and months.',
    howItWorks:
      'Each job’s start and end dates (both inclusive) are merged so overlaps are not double-counted, then the total days are converted to years and months.',
    formula: 'Experience = Σ merged days ÷ 365.25',
    example:
      'July 2018 – March 2021 plus April 2021 to today totals the combined span with no double-counting.',
    faq: [
      {
        q: 'Do internships count?',
        a: 'That depends on the employer asking. Add them as a separate job if they should count.',
      },
    ],
  },
  'offer-comparison-calculator': {
    description:
      'Compare two job offers on fixed monthly take-home salary and approximate first-year cash, including variable pay and joining bonus.',
    whatIs:
      'Two offers with similar CTC can produce very different take-home pay depending on variable pay, bonuses and structure.',
    howItWorks:
      'Each offer’s CTC is converted to in-hand salary using the same assumptions (basic %, HRA 40% of basic, capped PF, gratuity, ₹2,500 PT). Joining bonus is shown after an approximate 30% tax.',
    formula: 'First-year cash ≈ Take-home + Joining bonus × 0.7',
    example:
      'A ₹18 lakh CTC with ₹1.8 lakh variable can have a lower fixed monthly take-home than a ₹17 lakh fully fixed offer.',
    faq: [
      {
        q: 'Is joining bonus taxable?',
        a: 'Yes, as salary. Many offers also require you to repay it if you leave within a year.',
      },
    ],
  },
  'salary-breakup-calculator': {
    description:
      'Split your CTC into a salary structure — basic, HRA, LTA, special allowance, PF and gratuity — with monthly and annual values.',
    whatIs:
      'A salary breakup shows each component of CTC. The structure affects PF, gratuity, HRA exemption and your take-home.',
    howItWorks:
      'Basic is a share of fixed CTC; HRA is a share of basic; employer PF and gratuity are derived from basic; the special allowance absorbs the remainder.',
    formula: 'Special allowance = Fixed CTC − Basic − HRA − LTA − Employer PF − Gratuity',
    example:
      'On ₹10 lakh CTC with 50% basic: basic ₹5,00,000, HRA ₹2,00,000, employer PF ₹21,600, gratuity ₹24,050 and special allowance ₹2,54,350.',
    faq: [
      {
        q: 'Why should basic be at least 50%?',
        a: 'The new Labour Codes define wages so that allowances above 50% of total pay are added back to wages for PF and gratuity, which pushes employers towards a higher basic.',
      },
    ],
  },
};

export default content;
