import type { ToolGuide } from '@/types/tool';

const guide: ToolGuide = {
  reviewed: '2026-10-07',
  sections: [
    {
      heading: 'SGPA, CGPA and credits',
      paragraphs: [
        'SGPA (semester grade point average) measures a single semester. CGPA (cumulative grade point average) combines all semesters so far. Each course carries credits, and courses with more credits count more.',
        'To combine semesters correctly, weight each SGPA by that semester’s total credits. A simple average of SGPAs is accurate only when every semester has the same number of credits.',
      ],
    },
    {
      heading: 'How grade points are assigned',
      paragraphs: [
        'Most Indian universities following the UGC Choice Based Credit System use a 10-point scale in which each letter grade carries a fixed number of grade points. SGPA is the credit-weighted average of those grade points for one semester.',
      ],
      table: {
        head: ['Letter grade', 'Meaning', 'Grade points'],
        rows: [
          ['O', 'Outstanding', '10'],
          ['A+', 'Excellent', '9'],
          ['A', 'Very good', '8'],
          ['B+', 'Good', '7'],
          ['B', 'Above average', '6'],
          ['C', 'Average', '5'],
          ['P', 'Pass', '4'],
          ['F', 'Fail', '0'],
        ],
      },
      list: [
        'The marks needed for each grade differ between universities, and some use relative grading based on class performance. Your university’s regulations list the exact bands.',
      ],
    },
    {
      heading: 'Worked example',
      table: {
        head: ['Semester', 'SGPA', 'Credits', 'SGPA × credits'],
        rows: [
          ['1', '8.4', '22', '184.8'],
          ['2', '8.9', '24', '213.6'],
          ['3', '7.8', '23', '179.4'],
          ['4', '9.1', '21', '191.1'],
          ['Total', '', '90', '768.9'],
        ],
      },
      paragraphs: [
        'CGPA = 768.9 ÷ 90 = 8.54. A simple average of the four SGPAs would give 8.55, a small difference here, but it can be larger when credits differ more between semesters.',
      ],
    },
    {
      heading: 'Converting CGPA to percentage',
      paragraphs: [
        'There is no single national formula. Use the one your board or university specifies on the grade card or in its regulations.',
      ],
      table: {
        head: ['Rule', 'Formula', 'CGPA 8.54 becomes'],
        rows: [
          ['CBSE (Class 10 under the former CCE system)', 'CGPA × 9.5', '81.13%'],
          ['AICTE and several technical universities', '(CGPA − 0.75) × 10', '77.90%'],
          ['Some universities', 'CGPA × 10', '85.40%'],
        ],
      },
    },
    {
      heading: 'When you will need the conversion',
      list: [
        'Job applications and campus placements that set a minimum percentage, such as 60% throughout.',
        'Admissions to postgraduate programmes and some government exams that ask for percentage.',
        'Applications abroad, which often ask for the grading scale and may convert the CGPA themselves; attach the university’s official conversion certificate if one is issued.',
      ],
      paragraphs: [
        'Always quote the conversion formula you used. If the university provides an official percentage on the transcript or a conversion certificate, use that figure instead of a calculated one.',
      ],
    },
  ],
  faq: [
    {
      q: 'Do failed or repeated courses affect CGPA?',
      a: 'It depends on university rules. Some replace the failed grade when the course is cleared, others keep both attempts in the calculation. Check your university’s regulations.',
    },
  ],
};

export default guide;
