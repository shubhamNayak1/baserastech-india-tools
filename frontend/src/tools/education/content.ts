import type { ContentMap } from '../define';

const content: ContentMap = {
  'cgpa-calculator': {
    description:
      'Calculate your cumulative grade point average from semester SGPAs weighted by credits, and convert CGPA to percentage using the CBSE or AICTE formula.',
    whatIs:
      'CGPA (Cumulative Grade Point Average) summarises performance across semesters on a 10-point scale. Employers and universities often ask for its percentage equivalent.',
    howItWorks:
      'CGPA is the credit-weighted average of SGPAs. Conversion uses CGPA × 9.5 (CBSE) or (CGPA − 0.75) × 10 (AICTE and several technical universities), or a custom multiplier.',
    formula:
      'CGPA = Σ(SGPA × credits) ÷ Σcredits\nCBSE: % = CGPA × 9.5\nAICTE: % = (CGPA − 0.75) × 10',
    example:
      'SGPAs 8.4, 8.9, 7.8 and 9.1 with 22, 24, 23 and 21 credits give a CGPA of 8.54 — 81.16% on the CBSE formula.',
    faq: [
      {
        q: 'Why multiply by 9.5 for CBSE?',
        a: 'CBSE found that the average of the top performers’ marks was about 9.5 times their grade point, so it adopted 9.5 as the conversion factor.',
      },
      {
        q: 'Which formula does my university use?',
        a: 'It varies. Many engineering colleges follow AICTE’s (CGPA − 0.75) × 10; others use CGPA × 10 or their own rule. Check your grade card or regulations.',
      },
    ],
  },
  'gpa-calculator': {
    description:
      'Calculate your semester GPA (SGPA) from course grades and credits on the Indian 10-point scale or the US 4.0 scale.',
    whatIs:
      'GPA is the credit-weighted average of grade points earned in each course during a term.',
    howItWorks:
      'Each letter grade is converted to grade points (for example A+ = 9 on the 10-point scale), multiplied by course credits, summed and divided by total credits.',
    formula: 'GPA = Σ(grade point × credits) ÷ Σcredits',
    example:
      'A+ (4 credits), O (3), A (4), B+ (3) and A+ (2): (36 + 30 + 32 + 21 + 18) ÷ 16 = 8.56.',
    faq: [
      {
        q: 'Can I enter grade points instead of letters?',
        a: 'Yes. Enter numbers like 8.5 directly as the grade.',
      },
    ],
  },
  'marks-percentage-calculator': {
    description:
      'Calculate the percentage of marks from total or subject-wise scores, with class/division and CBSE grade.',
    whatIs: 'Marks percentage expresses your total score as a share of the maximum possible marks.',
    howItWorks: 'Add marks obtained and maximum marks across subjects, divide and multiply by 100.',
    formula: 'Percentage = Marks obtained ÷ Maximum marks × 100',
    example: '437 out of 500 is 87.4% — first class with distinction.',
    faq: [
      {
        q: 'How do boards calculate percentage from best five?',
        a: 'Many boards and colleges use the best five subjects. Use the Average Marks Calculator to see the best-of-five average.',
      },
    ],
  },
  'grade-calculator': {
    description:
      'Convert marks into a grade using the CBSE 9-point system, UGC 10-point CBCS system or US letter grades.',
    whatIs:
      'Grading systems map percentage bands to letters or grade points so results are easier to compare.',
    howItWorks:
      'Your percentage is matched to the highest band whose minimum it meets in the selected system.',
    formula: 'Grade = band containing (marks ÷ maximum × 100)',
    example: '78 out of 100 is B1 in CBSE, A in the UGC system and C+ in US grading.',
    faq: [
      {
        q: 'Are CBSE grades relative or absolute?',
        a: 'CBSE assigns grades on positional bands within passing candidates for board exams; this calculator shows the commonly used fixed percentage bands.',
      },
    ],
  },
  'attendance-calculator': {
    description:
      'Calculate your attendance percentage and find how many classes you can skip — or must attend — to stay above 75%.',
    whatIs: 'Most Indian colleges and universities require at least 75% attendance to sit exams.',
    howItWorks:
      'Attendance = attended ÷ held. To reach the target you need x more consecutive classes where (a + x) ÷ (n + x) ≥ target; if you are above it you can skip y where a ÷ (n + y) ≥ target.',
    formula: 'Classes needed = ⌈(t × n − a) ÷ (1 − t)⌉\nCan skip = ⌊a ÷ t − n⌋',
    example: '42 of 60 classes is 70%. You need 12 more classes in a row to reach 75%.',
    faq: [
      {
        q: 'Is 74.5% rounded up to 75%?',
        a: 'That depends on your institution’s rules; many do not round up. Aim for a small buffer.',
      },
    ],
  },
  'required-attendance-calculator': {
    description:
      'Find how many of the remaining classes in the term you must attend to finish with the minimum attendance required.',
    whatIs:
      'Planning ahead with the whole term’s class count shows whether your target is still achievable and how much flexibility you have.',
    howItWorks:
      'Required classes = target × total classes in the term (rounded up). Subtract classes already attended to see how many of the remaining ones you need.',
    formula: 'Needed from now = ⌈t × Total⌉ − Attended',
    example:
      'With 120 classes in the term, 50 held and 35 attended, you need 90 in total — 55 of the remaining 70. You can miss 15.',
    faq: [
      {
        q: 'What if the target is not reachable?',
        a: 'The calculator shows the best attendance you can still achieve. Ask your department about medical certificates or condonation rules.',
      },
    ],
  },
  'study-time-calculator': {
    description:
      'Estimate how many hours you must study each day to cover your syllabus before the exam, including revision time and rest days.',
    whatIs: 'A simple study plan helps you see early whether your pace is enough.',
    howItWorks:
      'Total hours = topics × hours per topic × (1 + revision%). Study days = days left minus rest days. Hours per day = total hours ÷ study days.',
    formula: 'Hours per day = Topics × Hours per topic × (1 + revision) ÷ Study days',
    example:
      '30 topics at 3 hours each plus 25% revision is 112.5 hours. With 45 days left and 1 rest day a week (38 study days) you need about 3 hours a day.',
    faq: [
      {
        q: 'How many hours should I study daily?',
        a: 'Quality matters more than hours. Short focused sessions with breaks and regular revision work better than long unfocused ones.',
      },
    ],
  },
  'exam-countdown': {
    description:
      'A live countdown to your exam showing days, hours and minutes left, weekends remaining and the study hours available at your daily pace.',
    whatIs: 'An exam countdown keeps the deadline visible so you can pace your preparation.',
    howItWorks:
      'The exam date is compared with the current time every second. Study hours = full days left × your daily study hours. The link saves your exam so you can bookmark or share it.',
    formula: 'Study hours available = Days left × Hours per day',
    example: '60 days before an exam at 4 hours a day leaves 240 study hours and 8 weekends.',
    faq: [
      {
        q: 'Can I set a countdown for JEE, NEET or UPSC?',
        a: 'Yes. Enter the exam name and the official date and time from the notification.',
      },
    ],
  },
  'average-marks-calculator': {
    description:
      'Find the average of your marks across subjects along with total, highest, lowest and best-of-five average.',
    whatIs:
      'Average marks summarise performance across subjects, and best-of-five is used by many boards and admissions.',
    howItWorks:
      'Marks are added and divided by the number of subjects. Best-of-five sorts marks and averages the top five.',
    formula: 'Average = Σmarks ÷ number of subjects',
    example: '78, 85, 91, 66 and 88 out of 100 average 81.6 (81.6%).',
    faq: [
      {
        q: 'Is average marks the same as percentage?',
        a: 'When every subject has the same maximum, yes — the average out of 100 equals the percentage.',
      },
    ],
  },
};

export default content;
