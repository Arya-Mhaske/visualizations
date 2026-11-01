// Pure maths for the Properties & Library box. No DOM. Reuses the open/closed pieces of the What is a Function? box.
import { valueAt } from './_what-is-a-function-math.js';

// ---- even and odd ----
// Tested at x = 0.05 … 5 and the mirror −x. If only one of f(x), f(−x) exists, the domain itself is not symmetric.
export function parityOf(f) {
  let even = true;
  let odd = true;
  for (let i = 1; i <= 100; i++) {
    const x = i / 20;
    const [a, b] = [f(x), f(-x)];
    if (Number.isFinite(a) !== Number.isFinite(b)) return 'neither';
    if (!Number.isFinite(a)) continue;
    if (Math.abs(a - b) > 1e-9) even = false;
    if (Math.abs(a + b) > 1e-9) odd = false;
  }
  return even && odd ? 'both' : even ? 'even' : odd ? 'odd' : 'neither';
}
export const PARITY_FUNCS = {
  sq: { text: 'x²', f: (x) => x * x },
  cos: { text: 'cos x', f: (x) => Math.cos(x) },
  abs: { text: '|x|', f: (x) => Math.abs(x) },
  cube: { text: 'x³', f: (x) => x ** 3 },
  sin: { text: 'sin x', f: (x) => Math.sin(x) },
  recip: { text: '1/x', f: (x) => 1 / x },
  mix: { text: 'x² + x', f: (x) => x * x + x },
  exp: { text: '2ˣ', f: (x) => 2 ** x },
};
// The three pictures: reflect in the y-axis, turn half a turn about the origin
export const mirrorY = (f) => (x) => f(-x);
export const halfTurn = (f) => (x) => -f(-x);

// ---- turning points ----
export const SHAPES = {
  cubic: { text: 'x³/3 − x', tex: '\\dfrac{x^3}{3}-x', f: (x) => x ** 3 / 3 - x, df: (x) => x * x - 1, span: [-2.5, 2.5], y: [-3, 3] },
  quartic: { text: 'x⁴/4 − x²', tex: '\\dfrac{x^4}{4}-x^2', f: (x) => x ** 4 / 4 - x * x, df: (x) => x ** 3 - 2 * x, span: [-2.5, 2.5], y: [-2, 4] },
  wave: { text: 'sin x', tex: '\\sin x', f: (x) => Math.sin(x), df: (x) => Math.cos(x), span: [-2.5, 2.5], y: [-1.6, 1.6] },
  steady: { text: 'x³/3 + x', tex: '\\dfrac{x^3}{3}+x', f: (x) => x ** 3 / 3 + x, df: (x) => x * x + 1, span: [-2.5, 2.5], y: [-8, 8] },
};
// Where the slope changes sign: a peak (max) if it goes + to −, a valley (min) if − to +. Bisection on the exact slope.
export function turningPoints(shape) {
  const [lo, hi] = shape.span;
  const N = 4000;
  const out = [];
  let prevX = lo;
  let prevS = Math.sign(shape.df(lo));
  for (let i = 1; i <= N; i++) {
    const x = lo + ((hi - lo) * i) / N;
    const s = Math.sign(shape.df(x));
    if (s !== 0 && prevS !== 0 && s !== prevS) {
      let [a, b] = [prevX, x];
      for (let k = 0; k < 60; k++) {
        const mid = (a + b) / 2;
        if (Math.sign(shape.df(mid)) === prevS) a = mid; else b = mid;
      }
      const t = (a + b) / 2;
      out.push({ x: t, y: shape.f(t), kind: prevS > 0 ? 'max' : 'min' });
    }
    if (s !== 0) { prevS = s; prevX = x; }
  }
  return out;
}
// Stretches between the turning points, each rising (+1) or falling (−1).
export function stretches(shape) {
  const edges = [shape.span[0], ...turningPoints(shape).map((t) => t.x), shape.span[1]];
  return edges.slice(0, -1).map((a, i) => ({ a, b: edges[i + 1], dir: Math.sign(shape.df((a + edges[i + 1]) / 2)) }));
}

// ---- the library of parent functions ----
export const LIBRARY = {
  id: { text: 'x', f: (x) => x, domain: 'all real x', range: 'all real y', trend: 'rising everywhere', y: [-4, 4] },
  sq: { text: 'x²', f: (x) => x * x, domain: 'all real x', range: 'y ≥ 0', trend: 'falls, then rises', y: [-1, 8] },
  cube: { text: 'x³', f: (x) => x ** 3, domain: 'all real x', range: 'all real y', trend: 'rising everywhere', y: [-10, 10] },
  root: { text: '√x', f: (x) => Math.sqrt(x), domain: 'x ≥ 0', range: 'y ≥ 0', trend: 'rising, ever slower', y: [-1, 4] },
  cbrt: { text: '∛x', f: (x) => Math.cbrt(x), domain: 'all real x', range: 'all real y', trend: 'rising everywhere', y: [-3, 3] },
  recip: { text: '1/x', f: (x) => 1 / x, domain: 'x ≠ 0', range: 'y ≠ 0', trend: 'falls on each side', y: [-6, 6] },
  abs: { text: '|x|', f: (x) => Math.abs(x), domain: 'all real x', range: 'y ≥ 0', trend: 'falls, then rises', y: [-1, 6] },
  floor: { text: '⌊x⌋', f: (x) => Math.floor(x), domain: 'all real x', range: 'whole numbers', trend: 'steps up, never down', y: [-5, 5] },
};
export const increasingOn = (f, a, b, n = 400) => {
  for (let i = 0; i < n; i++) if (f(a + ((b - a) * (i + 1)) / n) < f(a + ((b - a) * i) / n) - 1e-12) return false;
  return true;
};
export const decreasingOn = (f, a, b, n = 400) => increasingOn((x) => -f(x), a, b, n);

// ---- the greatest-integer function ----
export const floor = (x) => Math.floor(x);
export const fractional = (x) => x - Math.floor(x);

// ---- piecewise builder: three straight pieces with breaks b1 < b2 and a jump at each break ----
// Piece 1 ends at height 1 at b1. Piece 2 starts J1 higher. Piece 3 starts J2 above where piece 2 ends.
// own1 / own2 say which side keeps the break point itself (true: the left piece).
export function buildPieces({ b1, b2, s1, s2, s3, J1, J2, own1, own2 }, lo = -5, hi = 5) {
  const y1 = 1;
  const start2 = y1 + J1;
  const end2 = start2 + s2 * (b2 - b1);
  const start3 = end2 + J2;
  return [
    { a: lo, b: b1, fn: (x) => y1 + s1 * (x - b1), ca: true, cb: own1 },
    { a: b1, b: b2, fn: (x) => start2 + s2 * (x - b1), ca: !own1, cb: own2 },
    { a: b2, b: hi, fn: (x) => start3 + s3 * (x - b2), ca: !own2, cb: true },
  ];
}
export const valueOfPieces = (pieces, x) => valueAt({ pieces }, x);
// Each piece as y = m x + k.
export function coefficients({ b1, b2, s1, s2, s3, J1, J2 }) {
  const start2 = 1 + J1;
  const start3 = start2 + s2 * (b2 - b1) + J2;
  return [[s1, 1 - s1 * b1], [s2, start2 - s2 * b1], [s3, start3 - s3 * b2]];
}

// ---- average rate of change ----
export const MOTIONS = {
  speedup: { text: 's = t²/2', tex: '\\dfrac{t^2}{2}', s: (t) => (t * t) / 2, v: (t) => t },
  brake: { text: 's = 6t − t²/2', tex: '6t-\\dfrac{t^2}{2}', s: (t) => 6 * t - (t * t) / 2, v: (t) => 6 - t },
  wobble: { text: 's = t + 2 sin t', tex: 't+2\\sin t', s: (t) => t + 2 * Math.sin(t), v: (t) => 1 + 2 * Math.cos(t) },
};
export const averageRate = (f, t1, t2) => (f(t2) - f(t1)) / (t2 - t1);

// ---- income tax as a piecewise function (illustrative new-regime slabs, ₹ lakh) ----
export const SLABS = [[0, 4, 0], [4, 8, 5], [8, 12, 10], [12, 16, 15], [16, 20, 20], [20, 24, 25], [24, Infinity, 30]];
export function tax(income) {
  return SLABS.reduce((sum, [lo, hi, rate]) => sum + Math.max(0, Math.min(income, hi) - lo) * (rate / 100), 0);
}
// The rate on the next rupee. At a slab edge it is the rate of the slab that begins there.
export function marginalRate(income) {
  const slab = SLABS.find(([lo, hi]) => income >= lo && income < hi);
  return slab ? slab[2] : SLABS[SLABS.length - 1][2];
}
export const averageTaxRate = (income) => (income > 0 ? (tax(income) / income) * 100 : 0);
