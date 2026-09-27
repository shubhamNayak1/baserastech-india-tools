import { integerToIndianWords, rupeesInWords } from './words';
import { bisect, irr } from './solve';

describe('Indian number words', () => {
  it('handles units, lakhs and crores', () => {
    expect(integerToIndianWords(0)).toBe('Zero');
    expect(integerToIndianWords(15)).toBe('Fifteen');
    expect(integerToIndianWords(105)).toBe('One Hundred Five');
    expect(integerToIndianWords(123456)).toBe(
      'One Lakh Twenty Three Thousand Four Hundred Fifty Six',
    );
    expect(integerToIndianWords(10000000)).toBe('One Crore');
    expect(integerToIndianWords(1234567890)).toBe(
      'One Hundred Twenty Three Crore Forty Five Lakh Sixty Seven Thousand Eight Hundred Ninety',
    );
  });
  it('formats rupees and paise', () => {
    expect(rupeesInWords(11800)).toBe('Rupees Eleven Thousand Eight Hundred Only');
    expect(rupeesInWords(1.5)).toBe('Rupees One and Fifty Paise Only');
  });
  it('rejects invalid input', () => {
    expect(() => integerToIndianWords(-1)).toThrow();
    expect(() => integerToIndianWords(1.5)).toThrow();
  });
});

describe('solvers', () => {
  it('bisects to a root', () => {
    expect(bisect((x) => x * x - 2, 0, 2)).toBeCloseTo(Math.SQRT2, 9);
    expect(bisect((x) => x * x + 1, 0, 2)).toBeNull();
  });
  it('computes IRR', () => {
    expect(irr([-1000, 1100])).toBeCloseTo(0.1, 9);
    expect(irr([-100, 60, 60])).toBeCloseTo(0.1306623, 6);
  });
});
