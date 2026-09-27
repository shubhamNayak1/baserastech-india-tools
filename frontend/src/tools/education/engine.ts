import { InputError } from '@/utils/number';

export function parseLines(text: string, label: string, expectedParts: number): string[][] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) throw new InputError(`Enter at least one ${label}.`, 'data');
  if (lines.length > 200) throw new InputError('Please enter at most 200 lines.', 'data');
  return lines.map((l, i) => {
    const parts = l.split(/[\s,;:|]+/).filter(Boolean);
    if (parts.length !== expectedParts)
      throw new InputError(
        `Line ${i + 1} should have ${expectedParts} values, e.g. ${expectedParts === 2 ? '“8.5, 24”' : '“78”'}.`,
        'data',
      );
    return parts;
  });
}

export function weightedMean(pairs: { value: number; weight: number }[]) {
  const w = pairs.reduce((a, p) => a + p.weight, 0);
  if (w <= 0) throw new InputError('Total credits must be greater than zero.', 'data');
  return { mean: pairs.reduce((a, p) => a + p.value * p.weight, 0) / w, totalWeight: w };
}

export type CgpaConversion = 'cbse' | 'aicte' | 'custom';

export function cgpaToPercentage(cgpa: number, method: CgpaConversion, multiplier = 9.5): number {
  if (!(cgpa >= 0 && cgpa <= 10)) throw new InputError('CGPA must be between 0 and 10.', 'cgpa');
  if (method === 'cbse') return cgpa * 9.5;
  if (method === 'aicte') return Math.max(0, (cgpa - 0.75) * 10);
  return cgpa * multiplier;
}

export const GRADE_SCALES: Record<
  string,
  { label: string; points: Record<string, number>; max: number }
> = {
  ten: {
    label: '10-point (UGC / Indian universities)',
    max: 10,
    points: { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, P: 4, F: 0, AB: 0 },
  },
  four: {
    label: '4.0 scale (US)',
    max: 4,
    points: {
      'A+': 4,
      A: 4,
      'A-': 3.7,
      'B+': 3.3,
      B: 3,
      'B-': 2.7,
      'C+': 2.3,
      C: 2,
      'C-': 1.7,
      'D+': 1.3,
      D: 1,
      F: 0,
    },
  },
};

export function gradePoint(token: string, scale: keyof typeof GRADE_SCALES): number {
  const t = token.toUpperCase();
  const s = GRADE_SCALES[scale];
  if (t in s.points) return s.points[t];
  const n = Number(token);
  if (Number.isFinite(n) && n >= 0 && n <= s.max) return n;
  throw new InputError(`“${token}” is not a valid grade on the ${s.label} scale.`, 'data');
}

export interface GradeBand {
  min: number;
  grade: string;
  remark?: string;
}

export const GRADING_SYSTEMS: Record<string, { label: string; bands: GradeBand[] }> = {
  cbse: {
    label: 'CBSE (9-point, Class 10/12)',
    bands: [
      { min: 91, grade: 'A1', remark: 'Grade point 10' },
      { min: 81, grade: 'A2', remark: 'Grade point 9' },
      { min: 71, grade: 'B1', remark: 'Grade point 8' },
      { min: 61, grade: 'B2', remark: 'Grade point 7' },
      { min: 51, grade: 'C1', remark: 'Grade point 6' },
      { min: 41, grade: 'C2', remark: 'Grade point 5' },
      { min: 33, grade: 'D', remark: 'Grade point 4' },
      { min: 0, grade: 'E', remark: 'Needs improvement' },
    ],
  },
  ugc: {
    label: 'University 10-point (UGC CBCS)',
    bands: [
      { min: 90, grade: 'O', remark: 'Outstanding (10)' },
      { min: 80, grade: 'A+', remark: 'Excellent (9)' },
      { min: 70, grade: 'A', remark: 'Very good (8)' },
      { min: 60, grade: 'B+', remark: 'Good (7)' },
      { min: 50, grade: 'B', remark: 'Above average (6)' },
      { min: 45, grade: 'C', remark: 'Average (5)' },
      { min: 40, grade: 'P', remark: 'Pass (4)' },
      { min: 0, grade: 'F', remark: 'Fail (0)' },
    ],
  },
  us: {
    label: 'US letter grades',
    bands: [
      { min: 93, grade: 'A' },
      { min: 90, grade: 'A-' },
      { min: 87, grade: 'B+' },
      { min: 83, grade: 'B' },
      { min: 80, grade: 'B-' },
      { min: 77, grade: 'C+' },
      { min: 73, grade: 'C' },
      { min: 70, grade: 'C-' },
      { min: 67, grade: 'D+' },
      { min: 60, grade: 'D' },
      { min: 0, grade: 'F' },
    ],
  },
};

export function gradeFor(pct: number, system: string): GradeBand {
  const s = GRADING_SYSTEMS[system];
  if (!s) throw new InputError('Choose a grading system.', 'system');
  return s.bands.find((b) => pct >= b.min) ?? s.bands[s.bands.length - 1];
}

export function division(pct: number): string {
  if (pct >= 75) return 'First class with distinction';
  if (pct >= 60) return 'First class';
  if (pct >= 50) return 'Second class';
  if (pct >= 40) return 'Pass class';
  return 'Below pass marks';
}

export function attendance(attended: number, total: number, targetPct: number) {
  if (!(total > 0)) throw new InputError('Total classes must be greater than zero.', 'total');
  if (attended > total)
    throw new InputError('Classes attended cannot exceed total classes.', 'attended');
  if (!(targetPct > 0 && targetPct <= 100))
    throw new InputError('Target must be between 1% and 100%.', 'target');
  const pct = (attended / total) * 100;
  const t = targetPct / 100;
  // classes needed x: (a + x) / (n + x) >= t  →  x >= (t n − a) / (1 − t)
  const need =
    pct >= targetPct ? 0 : t === 1 ? Infinity : Math.ceil((t * total - attended) / (1 - t) - 1e-9);
  // classes that can be missed y: a / (n + y) >= t → y <= a / t − n
  const canSkip = pct >= targetPct ? Math.floor(attended / t - total + 1e-9) : 0;
  return { pct, need, canSkip };
}

export function requiredAttendance(
  totalInTerm: number,
  held: number,
  attended: number,
  targetPct: number,
) {
  if (held > totalInTerm)
    throw new InputError('Classes held so far cannot exceed the total for the term.', 'held');
  if (attended > held)
    throw new InputError('Classes attended cannot exceed classes held.', 'attended');
  const remaining = totalInTerm - held;
  const needTotal = Math.ceil((targetPct / 100) * totalInTerm - 1e-9);
  const needMore = Math.max(0, needTotal - attended);
  const maxPossible = ((attended + remaining) / totalInTerm) * 100;
  return {
    remaining,
    needTotal,
    needMore,
    feasible: needMore <= remaining,
    maxPossible,
    canMiss: Math.max(0, remaining - needMore),
  };
}
