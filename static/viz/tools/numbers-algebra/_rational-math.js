// Pure maths for the Rational expressions box (no DOM).
export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a, b) => (a * b) / gcd(a, b);
// 1/a + 1/b over the common denominator L = lcm(a, b).
export function addUnit(a, b) {
  const L = lcm(a, b);
  const num = L / a + L / b;
  const g = gcd(num, L);
  return { L, num, simple: [num / g, L / g] };
}
export const CANCEL = [
  { name: '(x + 2) ÷ x  →  2', tex: '\\dfrac{x+2}{x}', claim: '2', f: (x) => (x + 2) / x, g: () => 2, ok: false, why: 'x is a term in x + 2, not a factor of it.' },
  { name: '(x² + 2x) ÷ x  →  x + 2', tex: '\\dfrac{x^2+2x}{x}', claim: 'x+2', f: (x) => (x * x + 2 * x) / x, g: (x) => x + 2, ok: true, why: 'x² + 2x = x(x + 2): x is a common factor.' },
  { name: '(x + 3) ÷ (x + 2)  →  3/2', tex: '\\dfrac{x+3}{x+2}', claim: '\\tfrac32', f: (x) => (x + 3) / (x + 2), g: () => 1.5, ok: false, why: 'The x terms cannot be cancelled: they are added, not multiplied.' },
  { name: '(2x + 4) ÷ (x + 2)  →  2', tex: '\\dfrac{2x+4}{x+2}', claim: '2', f: (x) => (2 * x + 4) / (x + 2), g: () => 2, ok: true, why: '2x + 4 = 2(x + 2): the factor (x + 2) cancels.' },
  { name: '(x² − 1) ÷ (x − 1)  →  x + 1', tex: '\\dfrac{x^2-1}{x-1}', claim: 'x+1', f: (x) => (x * x - 1) / (x - 1), g: (x) => x + 1, ok: true, why: 'x² − 1 = (x − 1)(x + 1): the factor (x − 1) cancels.' },
];
export const agree = (item, x) => {
  const a = item.f(x);
  return Number.isFinite(a) && Math.abs(a - item.g(x)) < 1e-9;
};
export const holeF = (a) => (x) => (x * x - a * a) / (x - a);
export const PROBLEMS = [
  { title: '1/(x−1) + 1/(x+1)', f: (x) => 1 / (x - 1) + 1 / (x + 1), g: (x) => (2 * x) / (x * x - 1), steps: [
    ['\\dfrac{1}{x-1}+\\dfrac{1}{x+1}', 'start'],
    ['\\text{LCM}=(x-1)(x+1)', 'both denominators are already factored'],
    ['=\\dfrac{x+1}{(x-1)(x+1)}+\\dfrac{x-1}{(x-1)(x+1)}', 'give each fraction the LCM'],
    ['=\\dfrac{(x+1)+(x-1)}{(x-1)(x+1)}', 'add the numerators'],
    ['=\\dfrac{2x}{x^2-1}', 'simplify'],
  ] },
  { title: '3/(x²−4) − 2/(x+2)', f: (x) => 3 / (x * x - 4) - 2 / (x + 2), g: (x) => (7 - 2 * x) / (x * x - 4), steps: [
    ['\\dfrac{3}{x^2-4}-\\dfrac{2}{x+2}', 'start'],
    ['x^2-4=(x-2)(x+2)\\ \\Rightarrow\\ \\text{LCM}=(x-2)(x+2)', 'factor the denominators'],
    ['=\\dfrac{3}{(x-2)(x+2)}-\\dfrac{2(x-2)}{(x+2)(x-2)}', 'give each fraction the LCM'],
    ['=\\dfrac{3-2(x-2)}{(x-2)(x+2)}', 'subtract the numerators'],
    ['=\\dfrac{7-2x}{x^2-4}', 'simplify'],
  ] },
  { title: '1/x + 2/(x²+x)', f: (x) => 1 / x + 2 / (x * x + x), g: (x) => (x + 3) / (x * x + x), steps: [
    ['\\dfrac1x+\\dfrac{2}{x^2+x}', 'start'],
    ['x^2+x=x(x+1)\\ \\Rightarrow\\ \\text{LCM}=x(x+1)', 'factor the denominators'],
    ['=\\dfrac{x+1}{x(x+1)}+\\dfrac{2}{x(x+1)}', 'give each fraction the LCM'],
    ['=\\dfrac{(x+1)+2}{x(x+1)}', 'add the numerators'],
    ['=\\dfrac{x+3}{x^2+x}', 'simplify'],
  ] },
  { title: 'x/(x²−9) + 1/(x+3)', f: (x) => x / (x * x - 9) + 1 / (x + 3), g: (x) => (2 * x - 3) / (x * x - 9), steps: [
    ['\\dfrac{x}{x^2-9}+\\dfrac{1}{x+3}', 'start'],
    ['x^2-9=(x-3)(x+3)\\ \\Rightarrow\\ \\text{LCM}=(x-3)(x+3)', 'factor the denominators'],
    ['=\\dfrac{x}{(x-3)(x+3)}+\\dfrac{x-3}{(x+3)(x-3)}', 'give each fraction the LCM'],
    ['=\\dfrac{x+(x-3)}{(x-3)(x+3)}', 'add the numerators'],
    ['=\\dfrac{2x-3}{x^2-9}', 'simplify'],
  ] },
];
export const COMPLEX = [
  { title: '(1/x + 1/2) ÷ (1/x − 1/2)', f: (x) => (1 / x + 0.5) / (1 / x - 0.5), g: (x) => (2 + x) / (2 - x), steps: [
    ['\\dfrac{\\frac1x+\\frac12}{\\frac1x-\\frac12}', 'start'],
    ['\\text{LCM of the small denominators}=2x', 'x and 2'],
    ['=\\dfrac{2x\\left(\\frac1x+\\frac12\\right)}{2x\\left(\\frac1x-\\frac12\\right)}', 'multiply top and bottom by 2x'],
    ['=\\dfrac{2+x}{2-x}', 'the layers collapse'],
  ] },
  { title: '(1 − 1/x) ÷ (1 − 1/x²)', f: (x) => (1 - 1 / x) / (1 - 1 / (x * x)), g: (x) => x / (x + 1), steps: [
    ['\\dfrac{1-\\frac1x}{1-\\frac1{x^2}}', 'start'],
    ['\\text{LCM}=x^2', 'the small denominators are x and x²'],
    ['=\\dfrac{x^2-x}{x^2-1}', 'multiply top and bottom by x²'],
    ['=\\dfrac{x(x-1)}{(x-1)(x+1)}', 'factor'],
    ['=\\dfrac{x}{x+1}', 'cancel the common factor (x − 1)'],
  ] },
  { title: '(1/(x+1) + 1) ÷ (1/(x+1) − 1)', f: (x) => (1 / (x + 1) + 1) / (1 / (x + 1) - 1), g: (x) => -(x + 2) / x, steps: [
    ['\\dfrac{\\frac1{x+1}+1}{\\frac1{x+1}-1}', 'start'],
    ['\\text{LCM}=x+1', 'the only small denominator'],
    ['=\\dfrac{1+(x+1)}{1-(x+1)}', 'multiply top and bottom by x + 1'],
    ['=\\dfrac{x+2}{-x}', 'simplify'],
  ] },
  { title: '(2/x) ÷ (3/x²)', f: (x) => 2 / x / (3 / (x * x)), g: (x) => (2 * x) / 3, steps: [
    ['\\dfrac{\\frac2x}{\\frac3{x^2}}', 'start'],
    ['\\text{LCM}=x^2', 'the small denominators are x and x²'],
    ['=\\dfrac{2x}{3}', 'multiply top and bottom by x²'],
  ] },
];
export const probe = (fn, x) => {
  const v = fn(x);
  return Number.isFinite(v) ? v : null;
};
// Two pipes filling a tank of 1 unit; an optional drain with time c to empty it.
export const fillTime = (a, b, c) => {
  const rate = 1 / a + 1 / b - (c ? 1 / c : 0);
  return rate > 0 ? 1 / rate : null;
};
