import { createFormTool } from '@/components/form-tool/FormTool';
import { formatNumber } from '@/utils/format';
import { InputError } from '@/utils/number';
import {
  addDays,
  daysBetween,
  formatLongDate,
  parseISODate,
  todayISO,
  toISODate,
} from '@/utils/date';
import { Countdown } from '../date-time/Countdown';
import {
  attendance,
  cgpaToPercentage,
  division,
  gradeFor,
  gradePoint,
  GRADE_SCALES,
  GRADING_SYSTEMS,
  parseLines,
  requiredAttendance,
  weightedMean,
  type CgpaConversion,
} from './engine';

type CgpaValues = { mode: string; data: string; cgpa: number; method: string; multiplier: number };
export const CgpaCalculator = createFormTool<CgpaValues>({
  fields: [
    {
      name: 'mode',
      label: 'Calculate',
      type: 'segmented',
      default: 'semesters',
      full: true,
      options: [
        { value: 'semesters', label: 'CGPA from semester SGPAs' },
        { value: 'convert', label: 'CGPA to percentage' },
      ],
    },
    {
      name: 'data',
      label: 'SGPA and credits for each semester',
      type: 'textarea',
      default: '8.4, 22\n8.9, 24\n7.8, 23\n9.1, 21',
      rows: 6,
      help: 'One semester per line: SGPA, credits. Use the same credits for every line if your university does not weight by credits.',
      showIf: (v) => v.mode === 'semesters',
      maxLength: 10000,
    },
    {
      name: 'cgpa',
      label: 'CGPA',
      type: 'number',
      default: 8.2,
      min: 0,
      max: 10,
      showIf: (v) => v.mode === 'convert',
    },
    {
      name: 'method',
      label: 'Conversion formula',
      type: 'select',
      default: 'cbse',
      options: [
        { value: 'cbse', label: 'CBSE: CGPA × 9.5' },
        { value: 'aicte', label: 'AICTE / VTU: (CGPA − 0.75) × 10' },
        { value: 'custom', label: 'Custom multiplier' },
      ],
    },
    {
      name: 'multiplier',
      label: 'Multiplier',
      type: 'number',
      default: 10,
      min: 1,
      max: 20,
      showIf: (v) => v.method === 'custom',
    },
  ],
  compute: (v) => {
    let cgpa = v.cgpa;
    const extra = [];
    if (v.mode === 'semesters') {
      const rows = parseLines(v.data, 'semester', 2).map(([g, c], i) => {
        const value = Number(g);
        const weight = Number(c);
        if (!(value >= 0 && value <= 10))
          throw new InputError(`Line ${i + 1}: SGPA must be between 0 and 10.`, 'data');
        if (!(weight > 0))
          throw new InputError(`Line ${i + 1}: credits must be greater than zero.`, 'data');
        return { value, weight };
      });
      const r = weightedMean(rows);
      cgpa = r.mean;
      extra.push(
        { label: 'Total credits', value: formatNumber(r.totalWeight, 1) },
        { label: 'Semesters', value: String(rows.length) },
      );
    }
    const pct = cgpaToPercentage(cgpa, v.method as CgpaConversion, v.multiplier);
    return {
      results: [
        v.mode === 'semesters'
          ? { label: 'CGPA', value: formatNumber(cgpa, 2), primary: true }
          : { label: 'Percentage', value: `${formatNumber(pct, 2)}%`, primary: true },
        ...(v.mode === 'semesters'
          ? [{ label: 'Equivalent percentage', value: `${formatNumber(pct, 2)}%` }]
          : []),
        { label: 'Division', value: division(pct) },
        ...extra,
      ],
      notes: [
        'Universities publish their own conversion formula — always check your institution’s rule for official documents.',
      ],
    };
  },
});

type GpaValues = { scale: string; data: string };
export const GpaCalculator = createFormTool<GpaValues>({
  fields: [
    {
      name: 'scale',
      label: 'Grading scale',
      type: 'select',
      default: 'ten',
      full: true,
      options: Object.entries(GRADE_SCALES).map(([k, s]) => ({ value: k, label: s.label })),
    },
    {
      name: 'data',
      label: 'Grade and credits for each course',
      type: 'textarea',
      default: 'A+, 4\nO, 3\nA, 4\nB+, 3\nA+, 2',
      rows: 7,
      help: 'One course per line: grade (letter or points), credits.',
      maxLength: 10000,
    },
  ],
  compute: (v) => {
    const rows = parseLines(v.data, 'course', 2).map(([g, c], i) => {
      const weight = Number(c);
      if (!(weight > 0))
        throw new InputError(`Line ${i + 1}: credits must be greater than zero.`, 'data');
      return { value: gradePoint(g, v.scale), weight };
    });
    const r = weightedMean(rows);
    const max = GRADE_SCALES[v.scale].max;
    return {
      results: [
        {
          label: v.scale === 'ten' ? 'SGPA / GPA' : 'GPA',
          value: formatNumber(r.mean, 2),
          primary: true,
          hint: `out of ${max}`,
        },
        { label: 'Total credits', value: formatNumber(r.totalWeight, 1) },
        { label: 'Total grade points', value: formatNumber(r.mean * r.totalWeight, 1) },
        ...(v.scale === 'ten'
          ? [{ label: 'Approx. percentage (× 9.5)', value: `${formatNumber(r.mean * 9.5, 2)}%` }]
          : []),
      ],
    };
  },
});

type MarksValues = { mode: string; obtained: number; total: number; data: string };
export const MarksPercentageCalculator = createFormTool<MarksValues>({
  fields: [
    {
      name: 'mode',
      label: 'Enter marks',
      type: 'segmented',
      default: 'total',
      full: true,
      options: [
        { value: 'total', label: 'Total marks' },
        { value: 'subjects', label: 'Subject-wise' },
      ],
    },
    {
      name: 'obtained',
      label: 'Marks obtained',
      type: 'number',
      default: 437,
      min: 0,
      max: 1e6,
      showIf: (v) => v.mode === 'total',
    },
    {
      name: 'total',
      label: 'Maximum marks',
      type: 'number',
      default: 500,
      min: 1,
      max: 1e6,
      showIf: (v) => v.mode === 'total',
    },
    {
      name: 'data',
      label: 'Marks obtained and maximum per subject',
      type: 'textarea',
      default: '88, 100\n92, 100\n79, 100\n85, 100\n93, 100',
      rows: 6,
      help: 'One subject per line: obtained, maximum.',
      showIf: (v) => v.mode === 'subjects',
      maxLength: 10000,
    },
  ],
  compute: (v) => {
    let obtained = v.obtained;
    let total = v.total;
    if (v.mode === 'subjects') {
      const rows = parseLines(v.data, 'subject', 2).map(([o, m], i) => {
        const a = Number(o);
        const b = Number(m);
        if (!(b > 0))
          throw new InputError(`Line ${i + 1}: maximum marks must be greater than zero.`, 'data');
        if (!(a >= 0 && a <= b))
          throw new InputError(
            `Line ${i + 1}: marks obtained must be between 0 and the maximum.`,
            'data',
          );
        return [a, b];
      });
      obtained = rows.reduce((s, r) => s + r[0], 0);
      total = rows.reduce((s, r) => s + r[1], 0);
    }
    if (obtained > total)
      throw new InputError('Marks obtained cannot exceed maximum marks.', 'obtained');
    const pct = (obtained / total) * 100;
    return {
      results: [
        { label: 'Percentage', value: `${formatNumber(pct, 2)}%`, primary: true },
        { label: 'Marks', value: `${formatNumber(obtained, 2)} / ${formatNumber(total, 2)}` },
        { label: 'Division', value: division(pct) },
        { label: 'CBSE grade', value: gradeFor(pct, 'cbse').grade },
        { label: 'Equivalent CGPA (÷ 9.5)', value: formatNumber(Math.min(10, pct / 9.5), 2) },
      ],
    };
  },
});

type GradeValues = { obtained: number; total: number; system: string };
export const GradeCalculator = createFormTool<GradeValues>({
  fields: [
    { name: 'obtained', label: 'Marks obtained', type: 'number', default: 78, min: 0, max: 1e6 },
    { name: 'total', label: 'Maximum marks', type: 'number', default: 100, min: 1, max: 1e6 },
    {
      name: 'system',
      label: 'Grading system',
      type: 'select',
      default: 'cbse',
      full: true,
      options: Object.entries(GRADING_SYSTEMS).map(([k, s]) => ({ value: k, label: s.label })),
    },
  ],
  validate: (v) =>
    v.obtained > v.total
      ? { field: 'obtained', message: 'Marks obtained cannot exceed maximum marks.' }
      : null,
  compute: (v) => {
    const pct = (v.obtained / v.total) * 100;
    const g = gradeFor(pct, v.system);
    const bands = GRADING_SYSTEMS[v.system].bands;
    return {
      results: [
        { label: 'Grade', value: g.grade, primary: true, hint: g.remark },
        { label: 'Percentage', value: `${formatNumber(pct, 2)}%` },
      ],
      table: {
        title: 'Grading scale',
        columns: ['Grade', 'Minimum %', 'Remark'],
        rows: bands.map((b) => [b.grade, `${b.min}%`, b.remark ?? '']),
      },
    };
  },
});

type AttValues = { attended: number; total: number; target: number };
export const AttendanceCalculator = createFormTool<AttValues>({
  fields: [
    {
      name: 'attended',
      label: 'Classes attended',
      type: 'number',
      default: 42,
      min: 0,
      max: 10000,
      integer: true,
    },
    {
      name: 'total',
      label: 'Total classes held',
      type: 'number',
      default: 60,
      min: 1,
      max: 10000,
      integer: true,
    },
    {
      name: 'target',
      label: 'Required attendance',
      type: 'percent',
      default: 75,
      min: 1,
      max: 100,
    },
  ],
  compute: (v) => {
    const a = attendance(v.attended, v.total, v.target);
    const ok = a.pct >= v.target;
    return {
      results: [
        {
          label: 'Current attendance',
          value: `${formatNumber(a.pct, 2)}%`,
          primary: true,
          hint: ok ? `Above ${v.target}%` : `Below ${v.target}%`,
        },
        ok
          ? {
              label: 'Classes you can miss',
              value: formatNumber(a.canSkip, 0),
              hint: `and still stay at or above ${v.target}%`,
            }
          : {
              label: 'Classes to attend in a row',
              value: Number.isFinite(a.need) ? formatNumber(a.need, 0) : 'Not possible',
              hint: `to reach ${v.target}%`,
            },
        { label: 'Classes missed', value: formatNumber(v.total - v.attended, 0) },
      ],
    };
  },
});

type ReqValues = { term: number; held: number; attended: number; target: number };
export const RequiredAttendanceCalculator = createFormTool<ReqValues>({
  fields: [
    {
      name: 'term',
      label: 'Total classes in the term',
      type: 'number',
      default: 120,
      min: 1,
      max: 10000,
      integer: true,
    },
    {
      name: 'held',
      label: 'Classes held so far',
      type: 'number',
      default: 50,
      min: 0,
      max: 10000,
      integer: true,
    },
    {
      name: 'attended',
      label: 'Classes attended so far',
      type: 'number',
      default: 35,
      min: 0,
      max: 10000,
      integer: true,
    },
    {
      name: 'target',
      label: 'Minimum attendance required',
      type: 'percent',
      default: 75,
      min: 1,
      max: 100,
    },
  ],
  compute: (v) => {
    const r = requiredAttendance(v.term, v.held, v.attended, v.target);
    return {
      results: [
        {
          label: 'Classes you must attend from now',
          value: r.feasible ? `${r.needMore} of ${r.remaining}` : 'Target not reachable',
          primary: true,
          hint: r.feasible
            ? `You can miss up to ${r.canMiss} more`
            : `Maximum possible attendance is ${formatNumber(r.maxPossible, 1)}%`,
        },
        { label: 'Total classes needed for the term', value: formatNumber(r.needTotal, 0) },
        {
          label: 'Current attendance',
          value: v.held ? `${formatNumber((v.attended / v.held) * 100, 1)}%` : '—',
        },
        { label: 'Best achievable attendance', value: `${formatNumber(r.maxPossible, 1)}%` },
      ],
      notes: r.feasible
        ? undefined
        : ['Speak to your department about medical or condonation provisions.'],
    };
  },
});

type StudyValues = {
  exam: string;
  topics: number;
  hoursPerTopic: number;
  revision: number;
  available: number;
  offDays: number;
};
export const StudyTimeCalculator = createFormTool<StudyValues>({
  fields: [
    {
      name: 'exam',
      label: 'Exam date',
      type: 'date',
      default: () => toISODate(addDays(parseISODate(todayISO()), 45)),
    },
    {
      name: 'topics',
      label: 'Topics / chapters left',
      type: 'number',
      default: 30,
      min: 1,
      max: 1000,
      integer: true,
    },
    {
      name: 'hoursPerTopic',
      label: 'Hours needed per topic',
      type: 'number',
      default: 3,
      min: 0.25,
      max: 100,
      unit: 'hours',
    },
    {
      name: 'revision',
      label: 'Revision time',
      type: 'percent',
      default: 25,
      min: 0,
      max: 200,
      help: 'Extra time for revision and mock tests, as % of study time.',
    },
    {
      name: 'available',
      label: 'Hours you can study per day',
      type: 'number',
      default: 4,
      min: 0.5,
      max: 16,
      unit: 'hours',
    },
    {
      name: 'offDays',
      label: 'Rest days per week',
      type: 'number',
      default: 1,
      min: 0,
      max: 6,
      integer: true,
      unit: 'days',
    },
  ],
  compute: (v) => {
    const today = parseISODate(todayISO());
    const exam = parseISODate(v.exam, 'Exam date');
    const days = daysBetween(today, exam);
    if (days <= 0) throw new InputError('The exam date must be in the future.', 'exam');
    const studyDays = Math.floor((days * (7 - v.offDays)) / 7);
    if (studyDays <= 0)
      throw new InputError('There are no study days left with these rest days.', 'offDays');
    const hoursNeeded = v.topics * v.hoursPerTopic * (1 + v.revision / 100);
    const perDay = hoursNeeded / studyDays;
    const finishDays = Math.ceil((hoursNeeded / v.available) * (7 / (7 - v.offDays)));
    const onTrack = perDay <= v.available;
    return {
      results: [
        {
          label: 'Study hours needed per day',
          value: `${formatNumber(perDay, 1)} hours`,
          primary: true,
          hint: onTrack
            ? 'Within your available time ✔'
            : `More than your ${v.available} hours – plan to prioritise`,
        },
        { label: 'Total hours needed', value: `${formatNumber(hoursNeeded, 0)} hours` },
        { label: 'Study days left', value: `${studyDays} of ${days} days` },
        {
          label: 'At your pace you finish on',
          value: formatLongDate(addDays(today, finishDays)),
          hint:
            finishDays <= days
              ? `${days - finishDays} days before the exam`
              : `${finishDays - days} days after the exam`,
        },
        { label: 'Topics per study day', value: formatNumber(v.topics / studyDays, 2) },
      ],
    };
  },
});

export function ExamCountdown() {
  const year = new Date().getFullYear();
  const now = new Date();
  const target = new Date(Date.UTC(now.getMonth() >= 2 ? year + 1 : year, 1, 15));
  return (
    <Countdown
      defaultName="Board exams"
      nameLabel="Exam name"
      defaultTarget={`${toISODate(target)}T10:30`}
      exam
    />
  );
}

type AvgMarksValues = { data: string; max: number };
export const AverageMarksCalculator = createFormTool<AvgMarksValues>({
  fields: [
    {
      name: 'data',
      label: 'Marks (one per subject)',
      type: 'textarea',
      default: '78, 85, 91, 66, 88',
      rows: 4,
      placeholder: 'Separate with commas, spaces or new lines',
      maxLength: 10000,
    },
    {
      name: 'max',
      label: 'Maximum marks per subject',
      type: 'number',
      default: 100,
      min: 1,
      max: 10000,
    },
  ],
  compute: (v) => {
    const marks = v.data
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((x) => {
        const n = Number(x);
        if (!Number.isFinite(n)) throw new InputError(`“${x}” is not a number.`, 'data');
        if (n < 0 || n > v.max) throw new InputError(`${x} is outside 0–${v.max}.`, 'data');
        return n;
      });
    if (!marks.length) throw new InputError('Enter at least one mark.', 'data');
    const sum = marks.reduce((a, b) => a + b, 0);
    const avg = sum / marks.length;
    const best5 = [...marks].sort((a, b) => b - a).slice(0, 5);
    return {
      results: [
        {
          label: 'Average marks',
          value: `${formatNumber(avg, 2)} / ${formatNumber(v.max, 0)}`,
          primary: true,
          hint: `${formatNumber((avg / v.max) * 100, 2)}%`,
        },
        {
          label: 'Total',
          value: `${formatNumber(sum, 2)} / ${formatNumber(v.max * marks.length, 0)}`,
        },
        { label: 'Highest', value: formatNumber(Math.max(...marks), 2) },
        { label: 'Lowest', value: formatNumber(Math.min(...marks), 2) },
        ...(marks.length > 5
          ? [
              {
                label: 'Best of five average',
                value: `${formatNumber(best5.reduce((a, b) => a + b, 0) / 5, 2)}`,
              },
            ]
          : []),
      ],
    };
  },
});
