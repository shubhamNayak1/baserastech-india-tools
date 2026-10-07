import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'How exact age is counted',
      paragraphs: [
        'Age in years, months and days is found by counting whole years from the date of birth, then whole months, then the remaining days. Months have different lengths, so the same number of days can mean a different number of months depending on the dates involved.',
        'When a month has no matching day, the calculator uses the last day of that month. One month after 31 January is 28 February (29 in a leap year), and someone born on 29 February completes a year on 28 February in non-leap years.',
      ],
    },
    {
      heading: 'Age “as on” a date for exams and jobs',
      paragraphs: [
        'Government recruitment and entrance exams usually state an age limit as on a fixed cut-off date, such as 1 January or 1 August of the exam year. Set the “Age on” field to that date rather than today’s date.',
        'Read the notification carefully: “not less than 21 and not more than 32 years as on 1 August” means you must have turned 21 on or before 1 August and must not have turned 33 by then. Notifications often state the eligible birth dates directly, such as “born not earlier than 2 August 1993 and not later than 1 August 2004”.',
      ],
    },
    {
      heading: 'Common age limits in India',
      table: {
        head: ['Purpose', 'Age rule'],
        rows: [
          [
            'Voter registration',
            '18 years on the qualifying date (1 January, 1 April, 1 July or 1 October)',
          ],
          ['Driving licence for cars and motorcycles', '18 years'],
          ['Gearless two-wheeler up to 50 cc', '16 years, with a parent’s consent'],
          ['Legal age of marriage', '21 for men, 18 for women'],
          ['Senior citizen for income tax', '60 years at any time during the financial year'],
          ['Super senior citizen for income tax', '80 years at any time during the financial year'],
        ],
      },
      list: [
        'Many government exams allow relaxation in the upper age limit for reserved categories, ex-servicemen and persons with disabilities. The relaxation is added to the upper limit before you compare.',
      ],
    },
    {
      heading: 'Other uses',
      list: [
        'Finding the number of days lived, or the date you will turn a certain age.',
        'Checking a child’s age for school admission, which many states set as on 31 March or 1 June of the admission year.',
        'Working out the age difference between two people by entering one birth date and setting “Age on” to the other.',
      ],
    },
  ],
  faq: [
    {
      q: 'Does the calculator count the birth date itself?',
      a: 'Age is counted from the birth date, so on your birth date you are 0 days old and on your first birthday exactly 1 year old. Total days lived equals the number of days between the two dates.',
    },
    {
      q: 'Why do two age calculators sometimes disagree by a day?',
      a: 'Some count the end date as an extra day, or treat month ends differently. This calculator follows the common legal and calendar convention described above.',
    },
  ],
};

export default guide;
