/**
 * Safe arithmetic expression evaluator (shunting-yard). No eval/Function is used.
 * Supports + − × ÷ ^ %, parentheses, implicit multiplication, postfix !, constants
 * (pi, e) and common functions. Trigonometric functions respect the angle mode.
 */
export type AngleMode = 'deg' | 'rad';

export class ExpressionError extends Error {}

type Token =
  | { t: 'num'; v: number }
  | { t: 'op'; v: string }
  | { t: 'fn'; v: string }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'comma' }
  | { t: 'post'; v: '!' | '%' };

const FUNCS: Record<string, (x: number, mode: AngleMode) => number> = {
  sin: (x, m) => cleanTrig(Math.sin(toRad(x, m))),
  cos: (x, m) => cleanTrig(Math.cos(toRad(x, m))),
  tan: (x, m) => {
    const c = cleanTrig(Math.cos(toRad(x, m)));
    if (c === 0) throw new ExpressionError('tan is undefined at this angle.');
    return cleanTrig(Math.sin(toRad(x, m))) / c;
  },
  asin: (x, m) => fromRad(domain(Math.asin(x), 'asin needs a value between −1 and 1.'), m),
  acos: (x, m) => fromRad(domain(Math.acos(x), 'acos needs a value between −1 and 1.'), m),
  atan: (x, m) => fromRad(Math.atan(x), m),
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  ln: (x) => {
    if (x <= 0) throw new ExpressionError('ln is only defined for positive numbers.');
    return Math.log(x);
  },
  log: (x) => {
    if (x <= 0) throw new ExpressionError('log is only defined for positive numbers.');
    return Math.log10(x);
  },
  log2: (x) => {
    if (x <= 0) throw new ExpressionError('log2 is only defined for positive numbers.');
    return Math.log2(x);
  },
  sqrt: (x) => {
    if (x < 0) throw new ExpressionError('Square root of a negative number is not a real number.');
    return Math.sqrt(x);
  },
  cbrt: Math.cbrt,
  abs: Math.abs,
  exp: Math.exp,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
};

function domain(v: number, msg: string) {
  if (Number.isNaN(v)) throw new ExpressionError(msg);
  return v;
}
const toRad = (x: number, m: AngleMode) => (m === 'deg' ? (x * Math.PI) / 180 : x);
const fromRad = (x: number, m: AngleMode) => (m === 'deg' ? (x * 180) / Math.PI : x);
/** Snap tiny floating residue (sin 180° = 1.2e-16) to exact values. */
const cleanTrig = (v: number) =>
  Math.abs(v) < 1e-12
    ? 0
    : Math.abs(Math.abs(v) - 1) < 1e-12
      ? Math.sign(v)
      : Math.abs(Math.abs(v) - 0.5) < 1e-12
        ? Math.sign(v) * 0.5
        : v;

export function factorial(n: number): number {
  if (!Number.isInteger(n) || n < 0)
    throw new ExpressionError('Factorial needs a non-negative whole number.');
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function tokenize(src: string): Token[] {
  const s = src
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/\s+/g, '')
    .toLowerCase();
  if (!s) throw new ExpressionError('Enter an expression.');
  if (s.length > 500) throw new ExpressionError('Expression is too long.');
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/.exec(s.slice(i));
      if (!m) throw new ExpressionError(`Unexpected “${c}”.`);
      out.push({ t: 'num', v: Number(m[0]) });
      i += m[0].length;
    } else if (/[a-z]/.test(c)) {
      let name = /^[a-z]+/.exec(s.slice(i))![0];
      if (name === 'log' && s[i + 3] === '2' && s[i + 4] === '(') name = 'log2';
      if (name === 'pi') out.push({ t: 'num', v: Math.PI });
      else if (name === 'e') out.push({ t: 'num', v: Math.E });
      else if (name in FUNCS) out.push({ t: 'fn', v: name });
      else throw new ExpressionError(`Unknown function “${name}”.`);
      i += name.length;
    } else if ('+-*/^'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
    } else if (c === '!' || c === '%') {
      out.push({ t: 'post', v: c });
      i++;
    } else if (c === '(') {
      out.push({ t: 'lp' });
      i++;
    } else if (c === ')') {
      out.push({ t: 'rp' });
      i++;
    } else throw new ExpressionError(`Unexpected character “${c}”.`);
  }
  // Insert implicit multiplication: 2pi, 2(3), (1)(2), 3sin(x), 2!3
  const withImplicit: Token[] = [];
  for (let k = 0; k < out.length; k++) {
    const cur = out[k];
    const prev = withImplicit[withImplicit.length - 1];
    const prevEndsValue = prev && (prev.t === 'num' || prev.t === 'rp' || prev.t === 'post');
    const curStartsValue = cur.t === 'num' || cur.t === 'lp' || cur.t === 'fn';
    if (prevEndsValue && curStartsValue) withImplicit.push({ t: 'op', v: '*' });
    withImplicit.push(cur);
  }
  return withImplicit;
}

const PREC: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, neg: 3, '^': 4 };
const RIGHT = new Set(['^', 'neg']);

export function evaluate(expr: string, mode: AngleMode = 'deg'): number {
  const tokens = tokenize(expr);
  const output: (number | string)[] = [];
  const stack: (Token | { t: 'op'; v: 'neg' })[] = [];
  let expectValue = true;
  for (const tok of tokens) {
    if (tok.t === 'num') {
      output.push(tok.v);
      expectValue = false;
    } else if (tok.t === 'fn') {
      stack.push(tok);
      expectValue = true;
    } else if (tok.t === 'post') {
      if (expectValue) throw new ExpressionError(`“${tok.v}” must follow a number.`);
      output.push(tok.v === '!' ? '!' : 'pct');
    } else if (tok.t === 'op') {
      let op = tok.v;
      if (expectValue) {
        if (op === '-') op = 'neg';
        else if (op === '+') continue;
        else throw new ExpressionError(`Operator “${op}” is missing a number before it.`);
      }
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.t === 'fn') {
          output.push(`fn:${top.v}`);
          stack.pop();
          continue;
        }
        if (top.t !== 'op') break;
        const pTop = PREC[top.v];
        const pCur = PREC[op];
        if (pTop > pCur || (pTop === pCur && !RIGHT.has(op)))
          output.push((stack.pop() as { v: string }).v);
        else break;
      }
      stack.push({ t: 'op', v: op });
      expectValue = true;
    } else if (tok.t === 'lp') {
      stack.push(tok);
      expectValue = true;
    } else if (tok.t === 'rp') {
      while (stack.length && stack[stack.length - 1].t !== 'lp') {
        const top = stack.pop()!;
        output.push(top.t === 'fn' ? `fn:${top.v}` : (top as { v: string }).v);
      }
      if (!stack.length) throw new ExpressionError('Mismatched parentheses.');
      stack.pop();
      if (stack.length && stack[stack.length - 1].t === 'fn')
        output.push(`fn:${(stack.pop() as { v: string }).v}`);
      expectValue = false;
    }
  }
  while (stack.length) {
    const top = stack.pop()!;
    if (top.t === 'lp') throw new ExpressionError('Mismatched parentheses.');
    output.push(top.t === 'fn' ? `fn:${top.v}` : (top as { v: string }).v);
  }
  const st: number[] = [];
  const pop = () => {
    const v = st.pop();
    if (v === undefined) throw new ExpressionError('The expression is incomplete.');
    return v;
  };
  for (const item of output) {
    if (typeof item === 'number') st.push(item);
    else if (item.startsWith('fn:')) st.push(FUNCS[item.slice(3)](pop(), mode));
    else if (item === 'neg') st.push(-pop());
    else if (item === '!') st.push(factorial(pop()));
    else if (item === 'pct') st.push(pop() / 100);
    else {
      const b = pop();
      const a = pop();
      if (item === '+') st.push(a + b);
      else if (item === '-') st.push(a - b);
      else if (item === '*') st.push(a * b);
      else if (item === '/') {
        if (b === 0) throw new ExpressionError('Division by zero is undefined.');
        st.push(a / b);
      } else if (item === '^') {
        const r = a ** b;
        if (Number.isNaN(r)) throw new ExpressionError('This power is not a real number.');
        st.push(r);
      }
    }
  }
  if (st.length !== 1) throw new ExpressionError('The expression is incomplete.');
  const result = st[0];
  if (!Number.isFinite(result)) throw new ExpressionError('The result is too large.');
  // Remove binary noise like 0.1+0.2 = 0.30000000000000004
  return Number(result.toPrecision(15));
}
