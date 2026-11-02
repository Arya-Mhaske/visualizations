// Taylor coefficients f⁽ᵏ⁾(a)/k! for the functions used in the Taylor box, plus polynomial evaluation.
import { fact } from './_is.js';

export const FN = {
  exp: { name: 'eˣ', f: Math.exp, coef: (k, a) => Math.exp(a) / fact(k), R: Infinity, win: [-4, 4], y: [-2, 8], M: (n, a, h) => Math.exp(a + h) },
  sin: { name: 'sin x', f: Math.sin, coef: (k, a) => Math.sin(a + (k * Math.PI) / 2) / fact(k), R: Infinity, win: [-8, 8], y: [-3, 3], M: () => 1 },
  cos: { name: 'cos x', f: Math.cos, coef: (k, a) => Math.cos(a + (k * Math.PI) / 2) / fact(k), R: Infinity, win: [-8, 8], y: [-3, 3], M: () => 1 },
  ln: { name: 'ln(1 + x)', f: (x) => Math.log(1 + x), coef: (k, a) => (k === 0 ? Math.log(1 + a) : ((k % 2 ? 1 : -1)) / (k * (1 + a) ** k)), R: 1, win: [-0.95, 3], y: [-4, 2.5], M: (n, a, h) => fact(n) / (1 + a - h) ** (n + 1) },
  rat: { name: '1/(1 + x²)', f: (x) => 1 / (1 + x * x), coef: (k) => (k % 2 ? 0 : (k / 2) % 2 ? -1 : 1), R: 1, win: [-2.5, 2.5], y: [-1.5, 2], M: null },
};
// Degree-n Taylor polynomial about a.
export function taylor(key, n, a, x) {
  let s = 0;
  for (let k = 0; k <= n; k++) s += FN[key].coef(k, a) * (x - a) ** k;
  return s;
}
