import { evaluate, ExpressionError, factorial } from './expression';
import {
  combinations,
  describeBig,
  factorialBig,
  factorize,
  fracOp,
  fracToString,
  gcdMany,
  isPrime,
  lcmMany,
  nextPrime,
  parseFraction,
  permutations,
  prevPrime,
  ratioSimplify,
  simplifyRadical,
  stats,
  toMixed,
  weightedAverage,
} from './engine';

describe('expression evaluator', () => {
  it('respects precedence and associativity', () => {
    expect(evaluate('2+3*4')).toBe(14);
    expect(evaluate('(2+3)*4')).toBe(20);
    expect(evaluate('2^3^2')).toBe(512);
    expect(evaluate('-2^2')).toBe(-4);
    expect(evaluate('10/4')).toBe(2.5);
    expect(evaluate('0.1+0.2')).toBe(0.3);
  });
  it('supports functions, constants and implicit multiplication', () => {
    expect(evaluate('sin(30)')).toBe(0.5);
    expect(evaluate('cos(180)')).toBe(-1);
    expect(evaluate('sin(pi/2)', 'rad')).toBe(1);
    expect(evaluate('2pi')).toBeCloseTo(6.283185307, 8);
    expect(evaluate('sqrt(16)+log(1000)+ln(e)')).toBe(8);
    expect(evaluate('5!')).toBe(120);
    expect(evaluate('50%')).toBe(0.5);
    expect(evaluate('2(3+4)')).toBe(14);
    expect(evaluate('√9 × 2 ÷ 3')).toBe(2);
    expect(evaluate('log2(8)')).toBe(3);
  });
  it('reports readable errors', () => {
    expect(() => evaluate('1/0')).toThrow('Division by zero');
    expect(() => evaluate('(1+2')).toThrow('parentheses');
    expect(() => evaluate('sqrt(-1)')).toThrow(ExpressionError);
    expect(() => evaluate('foo(2)')).toThrow('Unknown function');
    expect(() => evaluate('3+')).toThrow('incomplete');
    expect(() => evaluate('tan(90)')).toThrow('undefined');
    expect(() => evaluate('')).toThrow();
    expect(factorial(0)).toBe(1);
  });
});

describe('integers', () => {
  it('computes GCD and LCM', () => {
    expect(gcdMany([12n, 18n, 30n])).toBe(6n);
    expect(lcmMany([4n, 6n, 10n])).toBe(60n);
    expect(lcmMany([0n, 5n])).toBe(0n);
  });
  it('computes factorials, permutations and combinations exactly', () => {
    expect(factorialBig(20)).toBe(2432902008176640000n);
    expect(describeBig(factorialBig(100)).digits).toBe(158);
    expect(permutations(10, 3)).toBe(720n);
    expect(combinations(52, 5)).toBe(2598960n);
    expect(combinations(5, 3, true)).toBe(35n);
    expect(permutations(4, 2, true)).toBe(16n);
    expect(() => combinations(3, 5)).toThrow();
  });
  it('tests primality', () => {
    expect(isPrime(2n)).toBe(true);
    expect(isPrime(1n)).toBe(false);
    expect(isPrime(97n)).toBe(true);
    expect(isPrime(561n)).toBe(false);
    expect(isPrime(1_000_000_007n)).toBe(true);
    expect(isPrime(18446744073709551557n)).toBe(true);
    expect(factorize(360n)).toEqual([
      { prime: 2n, power: 3 },
      { prime: 3n, power: 2 },
      { prime: 5n, power: 1 },
    ]);
    expect(nextPrime(90n)).toBe(97n);
    expect(prevPrime(2n)).toBeNull();
  });
});

describe('fractions', () => {
  it('parses and operates', () => {
    expect(fracToString(parseFraction('6/8'))).toBe('3/4');
    expect(fracToString(parseFraction('1 1/2'))).toBe('3/2');
    expect(fracToString(parseFraction('0.75'))).toBe('3/4');
    expect(fracToString(fracOp(parseFraction('1/2'), parseFraction('1/3'), '+'))).toBe('5/6');
    expect(toMixed(parseFraction('-7/2'))).toBe('-3 1/2');
    expect(() => parseFraction('1/0')).toThrow();
    expect(() => fracOp(parseFraction('1'), parseFraction('0'), '/')).toThrow();
  });
});

describe('statistics, radicals and ratios', () => {
  it('summarises data', () => {
    const s = stats([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(s.mean).toBe(5);
    expect(s.median).toBe(4.5);
    expect(s.modes).toEqual([4]);
    expect(s.stdDev).toBe(2);
  });
  it('weighted average', () => {
    expect(
      weightedAverage([
        { value: 80, weight: 3 },
        { value: 90, weight: 1 },
      ]).average,
    ).toBe(82.5);
  });
  it('simplifies radicals and ratios', () => {
    expect(simplifyRadical(72, 2)).toEqual({ outside: 6, inside: 2 });
    expect(simplifyRadical(-54, 3)).toEqual({ outside: -3, inside: 2 });
    expect(ratioSimplify([12, 18])).toEqual([2, 3]);
    expect(ratioSimplify([1.5, 2.5])).toEqual([3, 5]);
  });
});
