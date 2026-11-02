// Pure maths for the Number systems box (no DOM).
export const LEVELS = ['ℕ', 'ℤ', 'ℚ', 'ℝ', 'ℂ'];
export const EQNS = {
  a: { text: 'x + 3 = 7', sol: '4', home: 0 },
  f: { text: '3x = 9', sol: '3', home: 0 },
  b: { text: 'x + 5 = 2', sol: '−3', home: 1 },
  c: { text: '2x = 3', sol: '3/2', home: 2 },
  d: { text: 'x² = 2', sol: '±√2', home: 3 },
  e: { text: 'x² = −1', sol: '±i', home: 4 },
};
// The whole-number p nearest q·√2, and how far p² is from 2q².
export const bestP = (q) => Math.round(q * Math.SQRT2);
export const residual = (q) => bestP(q) ** 2 - 2 * q * q;
// Long division of p/q (0 < p < q): digits, the remainders met, where the cycle starts, and its period.
export function divide(p, q) {
  const seen = new Map();
  const rem = [];
  const digits = [];
  let r = p % q;
  while (r !== 0 && !seen.has(r)) {
    seen.set(r, rem.length);
    rem.push(r);
    r *= 10;
    digits.push(Math.floor(r / q));
    r %= q;
  }
  const terminates = r === 0;
  const start = terminates ? rem.length : seen.get(r);
  return { digits, rem, start, period: terminates ? 0 : rem.length - start, terminates };
}
export function decimalText(p, q) {
  const d = divide(p, q);
  const head = d.digits.slice(0, d.start).join('');
  const loop = d.digits.slice(d.start).join('');
  return `0.${head}${loop ? `(${loop})` : ''}`;
}
export const nextRemainder = (r, q) => (r * 10) % q;
export const product = (a, b) => a * b;
// Evaluate a token list left to right, and with × ÷ before + −.
const apply = (x, op, y) => (op === '+' ? x + y : op === '−' ? x - y : op === '×' ? x * y : x / y);
export function leftToRight(tokens) {
  let v = tokens[0];
  for (let i = 1; i < tokens.length; i += 2) v = apply(v, tokens[i], tokens[i + 1]);
  return v;
}
export function precedence(tokens) {
  const nums = [tokens[0]];
  const ops = [];
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i];
    if (op === '×' || op === '÷') nums.push(apply(nums.pop(), op, tokens[i + 1]));
    else { ops.push(op); nums.push(tokens[i + 1]); }
  }
  return nums.slice(1).reduce((v, x, i) => apply(v, ops[i], x), nums[0]);
}
export const EXPRS = [
  { tokens: [2, '+', 3, '×', 4], story: 'You hold 2 coins and are given 3 packets of 4 coins each: 14 coins.' },
  { tokens: [10, '−', 2, '×', 3], story: 'You have 10 sweets and give 3 friends 2 each: 4 sweets are left.' },
  { tokens: [6, '+', 12, '÷', 3], story: 'You have 6 pens and share 12 more into 3 boxes: 6 + 4 = 10.' },
  { tokens: [8, '−', 6, '÷', 2], story: 'Share 6 sweets between 2 children, 3 each. Take 3 from your 8: 5 are left.' },
];
// (−a)(b + (−b)) = 0 and also −ab + (−a)(−b): a guess g for (−a)(−b) balances only when g = ab.
export const balance = (a, b, g) => -a * b + g;
export const bounds = (n) => ({ lo: n * Math.sin(Math.PI / n), hi: n * Math.tan(Math.PI / n) });
export const interval = ({ a, b, closedL, closedR, infL, infR }) => {
  if (!infL && !infR && (a > b || (a === b && !(closedL && closedR)))) return { text: '∅', ineq: 'no x', setb: '∅' };
  if (!infL && !infR && a === b) return { text: `{${a}}`, ineq: `x = ${a}`, setb: `{x : x = ${a}}` };
  const l = infL ? '(−∞' : `${closedL ? '[' : '('}${a}`;
  const r = infR ? '∞)' : `${b}${closedR ? ']' : ')'}`;
  const lo = infL ? '' : `${a} ${closedL ? '≤' : '<'} `;
  const hi = infR ? '' : ` ${closedR ? '≤' : '<'} ${b}`;
  const ineq = infL && infR ? 'all x' : `${lo}x${hi}`;
  return { text: `${l}, ${r}`, ineq, setb: `{x : ${ineq}}` };
};
