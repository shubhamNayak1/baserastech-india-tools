import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'BMI categories for adults',
      paragraphs: [
        'Indian consensus guidelines use lower cut-offs than the international WHO scale, because South Asians tend to develop diabetes, high blood pressure and heart disease at lower body weights. The calculator shows both.',
      ],
      table: {
        head: ['Category', 'WHO (international)', 'Asian Indian guidelines'],
        rows: [
          ['Underweight', 'Below 18.5', 'Below 18.5'],
          ['Normal', '18.5 – 24.9', '18.5 – 22.9'],
          ['Overweight', '25 – 29.9', '23 – 24.9'],
          ['Obese', '30 and above', '25 and above'],
        ],
      },
    },
    {
      heading: 'Healthy weight for your height',
      paragraphs: [
        'Rearranging the formula gives a healthy weight range: weight = BMI × height². Using the Asian Indian normal range of 18.5 to 22.9:',
      ],
      table: {
        head: ['Height', 'Healthy weight range'],
        rows: [
          ['150 cm', '41.6 – 51.5 kg'],
          ['160 cm', '47.4 – 58.6 kg'],
          ['170 cm', '53.5 – 66.2 kg'],
          ['180 cm', '59.9 – 74.2 kg'],
        ],
      },
    },
    {
      heading: 'What BMI does not tell you',
      list: [
        'Body composition: muscular people can have a high BMI with little body fat, while some people with a normal BMI carry excess fat.',
        'Fat distribution: fat around the abdomen carries more health risk. For Indian adults, a waist circumference above 90 cm in men or 80 cm in women indicates higher risk, even with a normal BMI.',
        'Age and sex differences: older adults naturally lose muscle, and women generally have more body fat than men at the same BMI.',
        'Children and teenagers: BMI must be compared with age- and sex-specific growth charts, not the adult categories.',
        'Pregnancy: BMI is not meaningful during pregnancy; pre-pregnancy BMI is used instead.',
      ],
    },
    {
      heading: 'If your BMI is outside the normal range',
      paragraphs: [
        'Use BMI as a prompt for a conversation with a doctor, not as a diagnosis. A doctor may check blood sugar, blood pressure and cholesterol, and look at waist size and family history before suggesting changes.',
        'For gradual weight loss, a modest calorie deficit combined with regular physical activity is usually recommended. Even losing 5–10% of body weight improves blood sugar and blood pressure in many people.',
      ],
    },
  ],
  faq: [
    {
      q: 'Is BMI the same for men and women?',
      a: 'The formula and adult cut-offs are the same for men and women. Women typically have a higher percentage of body fat at the same BMI, which is one reason BMI is only a screening tool.',
    },
  ],
};

export default guide;
