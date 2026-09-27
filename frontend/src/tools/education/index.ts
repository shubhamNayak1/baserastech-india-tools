import { defineCategory } from '../define';

const e = () => import('./tools');

export const educationTools = defineCategory('education', [
  {
    slug: 'cgpa-calculator',
    name: 'CGPA Calculator',
    shortDescription:
      'Calculate CGPA from semester SGPAs and convert CGPA to percentage (CBSE, AICTE).',
    keywords: [
      'cgpa',
      'sgpa',
      'cgpa to percentage',
      'cumulative gpa',
      'semester',
      'university',
      'grade point',
    ],
    aliases: ['cgpa to percentage', 'cgpa converter', 'sgpa to cgpa'],
    icon: 'graduation',
    isPopular: true,
    relatedTools: [
      'gpa-calculator',
      'marks-percentage-calculator',
      'grade-calculator',
      'percentage-calculator',
    ],
    load: () => e().then((m) => m.CgpaCalculator),
  },
  {
    slug: 'gpa-calculator',
    name: 'GPA Calculator',
    shortDescription:
      'Calculate credit-weighted GPA/SGPA from course grades on a 10-point or 4.0 scale.',
    keywords: ['gpa', 'sgpa', 'grade point average', 'credits', 'semester gpa', '4.0 scale'],
    aliases: ['sgpa calculator', 'semester gpa'],
    icon: 'graduation',
    relatedTools: ['cgpa-calculator', 'grade-calculator', 'weighted-average-calculator'],
    load: () => e().then((m) => m.GpaCalculator),
  },
  {
    slug: 'marks-percentage-calculator',
    name: 'Marks Percentage Calculator',
    shortDescription:
      'Convert total or subject-wise marks into a percentage with division and grade.',
    keywords: ['marks percentage', 'percentage of marks', 'board exam', 'result', 'marks'],
    aliases: ['marks to percentage', 'exam percentage', 'result percentage'],
    icon: 'percent',
    isPopular: true,
    relatedTools: [
      'percentage-calculator',
      'grade-calculator',
      'cgpa-calculator',
      'average-marks-calculator',
    ],
    load: () => e().then((m) => m.MarksPercentageCalculator),
  },
  {
    slug: 'grade-calculator',
    name: 'Grade Calculator',
    shortDescription: 'Find your grade from marks using CBSE, UGC 10-point or US letter grading.',
    keywords: ['grade', 'cbse grade', 'letter grade', 'grading system', 'marks to grade'],
    aliases: ['cbse grading', 'marks to grade'],
    icon: 'book',
    relatedTools: ['marks-percentage-calculator', 'gpa-calculator', 'cgpa-calculator'],
    load: () => e().then((m) => m.GradeCalculator),
  },
  {
    slug: 'attendance-calculator',
    name: 'Attendance Calculator',
    shortDescription:
      'Check your attendance percentage and how many classes you can miss or must attend.',
    keywords: ['attendance', 'attendance percentage', '75 percent attendance', 'bunk', 'classes'],
    aliases: ['bunk calculator', 'attendance percent'],
    icon: 'users',
    isPopular: true,
    relatedTools: [
      'required-attendance-calculator',
      'percentage-calculator',
      'study-time-calculator',
    ],
    load: () => e().then((m) => m.AttendanceCalculator),
  },
  {
    slug: 'required-attendance-calculator',
    name: 'Required Attendance Calculator',
    shortDescription:
      'Plan how many of the remaining classes you must attend to meet the minimum for the term.',
    keywords: [
      'required attendance',
      'minimum attendance',
      'attendance shortage',
      'detained',
      'term',
    ],
    aliases: ['attendance planner'],
    icon: 'target',
    relatedTools: ['attendance-calculator', 'exam-countdown', 'study-time-calculator'],
    load: () => e().then((m) => m.RequiredAttendanceCalculator),
  },
  {
    slug: 'study-time-calculator',
    name: 'Study Time Calculator',
    shortDescription:
      'Work out how many hours a day to study to finish your syllabus before the exam.',
    keywords: [
      'study time',
      'study plan',
      'study hours',
      'exam preparation',
      'syllabus',
      'timetable',
    ],
    aliases: ['study planner', 'study schedule'],
    icon: 'book',
    relatedTools: ['exam-countdown', 'attendance-calculator', 'time-duration-calculator'],
    load: () => e().then((m) => m.StudyTimeCalculator),
  },
  {
    slug: 'exam-countdown',
    name: 'Exam Countdown',
    shortDescription: 'Live countdown to your exam with days, weekends and study hours left.',
    keywords: [
      'exam countdown',
      'days left for exam',
      'board exam countdown',
      'jee',
      'neet',
      'upsc',
      'countdown',
    ],
    aliases: ['exam timer', 'days to exam'],
    icon: 'hourglass',
    relatedTools: ['study-time-calculator', 'countdown-calculator', 'days-between-dates'],
    load: () => e().then((m) => m.ExamCountdown),
  },
  {
    slug: 'average-marks-calculator',
    name: 'Average Marks Calculator',
    shortDescription:
      'Calculate average marks, total, highest, lowest and best-of-five across subjects.',
    keywords: ['average marks', 'mean marks', 'best of five', 'subject average', 'marks'],
    aliases: ['best of 5 calculator', 'average score'],
    icon: 'sigma',
    relatedTools: ['marks-percentage-calculator', 'average-calculator', 'grade-calculator'],
    load: () => e().then((m) => m.AverageMarksCalculator),
  },
]);
