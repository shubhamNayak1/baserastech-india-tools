import type { ContentMap } from '../define';

const content: ContentMap = {
  'bmi-calculator': {
    description:
      'Calculate your Body Mass Index and see where it falls on both the WHO scale and the lower cut-offs recommended for Asian Indians, plus the healthy weight range for your height.',
    whatIs:
      'BMI is a screening measure that relates weight to height. Research shows that Asian Indians face higher risk of diabetes and heart disease at lower BMIs, so Indian guidelines use lower thresholds for overweight (23) and obesity (25).',
    howItWorks:
      'BMI is weight in kilograms divided by height in metres squared. Imperial inputs are converted first.',
    formula: 'BMI = weight (kg) ÷ height (m)²',
    example:
      '70 kg at 175 cm: 70 ÷ 1.75² = 22.9 — normal on both scales, just below the Asian-Indian overweight cut-off of 23.',
    faq: [
      {
        q: 'Why are there two BMI categories?',
        a: 'WHO cut-offs (25 overweight, 30 obese) were based mainly on European populations. Indian consensus guidelines recommend 23 and 25 for Asian Indians.',
      },
      {
        q: 'Is BMI accurate for athletes?',
        a: 'No. Muscular people can have a high BMI with low body fat. Waist circumference or body fat percentage adds useful context.',
      },
    ],
  },
  'bmr-calculator': {
    description:
      'Estimate the calories your body burns at complete rest using the Mifflin-St Jeor, revised Harris-Benedict or Katch-McArdle equations.',
    whatIs:
      'Basal metabolic rate is the energy needed for basic functions like breathing, circulation and cell repair. It is usually 60–70% of daily energy use.',
    howItWorks:
      'Each equation uses weight, height, age and sex (Katch-McArdle uses lean body mass instead). Mifflin-St Jeor is generally the most accurate for most people.',
    formula:
      'Mifflin-St Jeor: 10W + 6.25H − 5A + 5 (men) or − 161 (women)\nW = kg, H = cm, A = years',
    example: 'A 30-year-old man, 70 kg and 175 cm: 700 + 1,093.75 − 150 + 5 = 1,649 kcal/day.',
    faq: [
      {
        q: 'Why does BMR fall with age?',
        a: 'Muscle mass tends to decline with age, and muscle burns more energy at rest than fat.',
      },
    ],
  },
  'tdee-calculator': {
    description:
      'Calculate total daily energy expenditure — the calories you burn in a day including activity — to find your maintenance calories.',
    whatIs:
      'TDEE is BMR plus the energy used for movement, exercise and digesting food. Eating at your TDEE keeps weight stable.',
    howItWorks:
      'BMR (Mifflin-St Jeor) is multiplied by an activity factor from 1.2 (sedentary) to 1.9 (extra active).',
    formula: 'TDEE = BMR × activity factor',
    example: 'A BMR of 1,649 kcal with moderate activity (1.55) gives a TDEE of about 2,556 kcal.',
    faq: [
      {
        q: 'Which activity level should I pick?',
        a: 'Most office workers who exercise 3–4 times a week fit “moderately active”. If unsure, pick the lower level and adjust based on weight trends.',
      },
    ],
  },
  'calorie-calculator': {
    description: 'Find how many calories you should eat each day to maintain, lose or gain weight.',
    whatIs:
      'Weight change depends on the balance between calories eaten and burned. A deficit of about 500 kcal a day leads to roughly 0.5 kg of loss per week.',
    howItWorks:
      'Maintenance calories (TDEE) are adjusted by your goal. Targets are never set below 1,200 kcal for women or 1,500 kcal for men.',
    formula: 'Target = TDEE ± goal adjustment',
    example: 'With a TDEE of 2,556 kcal, a 0.5 kg/week loss target is about 2,056 kcal a day.',
    faq: [
      {
        q: 'Do all calories count the same?',
        a: 'For weight change, calories matter most, but protein, fibre and whole foods help with fullness and health.',
      },
    ],
  },
  'ideal-weight-calculator': {
    description:
      'Estimate a healthy target weight for your height using BMI ranges and four classic ideal body weight formulas.',
    whatIs:
      'Ideal body weight formulas were developed for medical dosing. They give a single number, while a BMI-based range reflects that healthy weight varies.',
    howItWorks:
      'Each formula adds a fixed amount per inch of height over 5 feet. The healthy range uses BMI 18.5–22.9 (Asian-Indian) and 18.5–24.9 (WHO).',
    formula:
      'Devine (men): 50 kg + 2.3 kg per inch over 5 ft\nDevine (women): 45.5 kg + 2.3 kg per inch over 5 ft',
    example:
      'A 6 ft (182.9 cm) man: Devine 77.6 kg, Robinson 74.8 kg; Asian-Indian healthy range 61.9–76.6 kg.',
    faq: [
      {
        q: 'Which formula is best?',
        a: 'None is perfect. The BMI range is a practical target; the formulas give a reference point.',
      },
    ],
  },
  'body-fat-calculator': {
    description:
      'Estimate body fat percentage with a tape measure using the U.S. Navy method, plus fat mass, lean mass and waist-to-height ratio.',
    whatIs: 'Body fat percentage describes body composition better than weight or BMI alone.',
    howItWorks:
      'The Navy method uses logarithms of neck, waist (and hip for women) circumferences and height, calibrated against underwater weighing.',
    formula: 'Men: 495 ÷ (1.0324 − 0.19077 log(waist − neck) + 0.15456 log(height)) − 450',
    example:
      'A man 178 cm tall with a 38 cm neck and 86 cm waist has about 16–17% body fat — the “fitness” range.',
    faq: [
      {
        q: 'How accurate is it?',
        a: 'Typically within 3–4 percentage points of lab methods when measured carefully. Measure in the morning, relaxed, with the tape snug but not tight.',
      },
    ],
  },
  'water-intake-calculator': {
    description: 'Estimate your daily water needs from body weight, exercise and weather.',
    whatIs:
      'Water needs vary with body size, activity and temperature. Hot Indian summers increase fluid loss through sweat.',
    howItWorks:
      'A base of 35 ml per kg is increased by about 350 ml per 30 minutes of exercise and 500 ml for hot weather.',
    formula: 'Water = 35 ml × kg + 350 ml × (exercise min ÷ 30) + 500 ml (hot)',
    example:
      '70 kg with 30 minutes of exercise: 2,450 + 350 = 2.8 litres; 3.3 litres in hot weather.',
    faq: [
      {
        q: 'Do tea and coffee count?',
        a: 'Yes, moderately. Food, milk, tea and other drinks all contribute to hydration.',
      },
    ],
  },
  'macro-calculator': {
    description:
      'Convert your daily calorie target into grams of protein, carbohydrates and fat using a preset or custom split.',
    whatIs:
      'Macronutrients are protein, carbohydrates and fat. Protein and carbs provide 4 kcal per gram and fat provides 9 kcal per gram.',
    howItWorks: 'Calories are divided by the chosen percentages and converted to grams.',
    formula: 'Protein g = kcal × P% ÷ 4\nCarbs g = kcal × C% ÷ 4\nFat g = kcal × F% ÷ 9',
    example: '2,000 kcal at 30/40/30: 150 g protein, 200 g carbs and 67 g fat.',
    faq: [
      {
        q: 'What is a typical Indian diet split?',
        a: 'Traditional Indian diets are high in carbohydrates — often around 60% — with about 15% protein.',
      },
    ],
  },
  'protein-calculator': {
    description:
      'Calculate how many grams of protein you need each day based on body weight and goals.',
    whatIs:
      'Protein builds and repairs tissue. The ICMR-NIN recommended dietary allowance for Indian adults is about 0.83 g per kg; active people need more.',
    howItWorks: 'Body weight is multiplied by a goal-specific range of grams per kilogram.',
    formula: 'Protein (g) = weight (kg) × g/kg',
    example:
      'A 70 kg sedentary adult needs about 58–70 g a day; someone strength training needs 112–154 g.',
    faq: [
      {
        q: 'Can vegetarians get enough protein?',
        a: 'Yes, by combining dals, legumes, dairy, soy, nuts and seeds through the day.',
      },
    ],
  },
  'calorie-deficit-calculator': {
    description:
      'Estimate how long it will take to reach your target weight with a chosen daily calorie deficit.',
    whatIs:
      'A calorie deficit means eating less energy than you burn, so the body uses stored fat.',
    howItWorks:
      'About 7,700 kcal corresponds to 1 kg of body fat. The total deficit is divided by your daily deficit to estimate days.',
    formula: 'Days = (current − target kg) × 7,700 ÷ daily deficit',
    example:
      'Losing 8 kg needs a total deficit of 61,600 kcal. At 500 kcal a day that takes about 124 days (roughly 18 weeks).',
    faq: [
      {
        q: 'Why does weight loss slow down over time?',
        a: 'As you lose weight, your TDEE falls, so the same intake creates a smaller deficit. Recalculate every few kilograms.',
      },
    ],
  },
  'pregnancy-due-date-calculator': {
    description:
      'Estimate your baby’s due date from your last menstrual period, conception date or IVF transfer date, and see how many weeks pregnant you are.',
    whatIs:
      'The estimated due date (EDD) is 40 weeks from the first day of the last menstrual period, assuming a 28-day cycle.',
    howItWorks:
      'Naegele’s rule adds 280 days to the LMP, adjusted for longer or shorter cycles. Conception adds 266 days; IVF transfers add 263 (day 3) or 261 (day 5) days.',
    formula: 'EDD = LMP + 280 days + (cycle length − 28)',
    example: 'An LMP of 1 January 2026 with a 28-day cycle gives a due date of 8 October 2026.',
    faq: [
      {
        q: 'Will my doctor’s date differ?',
        a: 'Often slightly. An early ultrasound can refine the due date, and your doctor’s date should be used for care decisions.',
      },
    ],
  },
};

export default content;
