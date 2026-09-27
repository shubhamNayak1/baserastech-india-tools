import {
  attendance,
  cgpaToPercentage,
  division,
  gradeFor,
  gradePoint,
  requiredAttendance,
  weightedMean,
  parseLines,
} from './engine';

describe('grades', () => {
  it('converts CGPA to percentage', () => {
    expect(cgpaToPercentage(8.2, 'cbse')).toBeCloseTo(77.9, 10);
    expect(cgpaToPercentage(8.2, 'aicte')).toBeCloseTo(74.5, 10);
    expect(cgpaToPercentage(8, 'custom', 10)).toBe(80);
    expect(() => cgpaToPercentage(11, 'cbse')).toThrow();
  });
  it('maps letters to grade points', () => {
    expect(gradePoint('a+', 'ten')).toBe(9);
    expect(gradePoint('B-', 'four')).toBe(2.7);
    expect(gradePoint('8.5', 'ten')).toBe(8.5);
    expect(() => gradePoint('Z', 'ten')).toThrow();
  });
  it('credit-weighted means', () => {
    expect(
      weightedMean([
        { value: 9, weight: 4 },
        { value: 7, weight: 2 },
      ]).mean,
    ).toBeCloseTo(8.3333, 4);
    expect(parseLines('8.5, 24\n9 22', 'semester', 2)).toEqual([
      ['8.5', '24'],
      ['9', '22'],
    ]);
    expect(() => parseLines('8.5', 'semester', 2)).toThrow('Line 1');
  });
  it('assigns grades and divisions', () => {
    expect(gradeFor(91, 'cbse').grade).toBe('A1');
    expect(gradeFor(90.5, 'cbse').grade).toBe('A2');
    expect(gradeFor(85, 'ugc').grade).toBe('A+');
    expect(gradeFor(12, 'us').grade).toBe('F');
    expect(division(76)).toBe('First class with distinction');
    expect(division(55)).toBe('Second class');
  });
});

describe('attendance', () => {
  it('computes classes needed and skippable', () => {
    const low = attendance(30, 50, 75);
    expect(low.pct).toBe(60);
    expect(low.need).toBe(30);
    const high = attendance(45, 50, 75);
    expect(high.canSkip).toBe(10);
    expect(attendance(3, 4, 75).canSkip).toBe(0);
    expect(() => attendance(60, 50, 75)).toThrow();
  });
  it('plans required attendance for the term', () => {
    const r = requiredAttendance(100, 40, 28, 75);
    expect(r.needTotal).toBe(75);
    expect(r.needMore).toBe(47);
    expect(r.feasible).toBe(true);
    expect(r.canMiss).toBe(13);
    expect(requiredAttendance(100, 90, 60, 75).feasible).toBe(false);
  });
});
