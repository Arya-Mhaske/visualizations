// Pure maths for the Modelling with Data box. Points are [x, y]. No DOM.
import { createRng } from '../../lib/rng.js';

export const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
export function linearFit(pts) {
  const mx = mean(pts.map((p) => p[0]));
  const my = mean(pts.map((p) => p[1]));
  const sxx = pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0);
  const sxy = pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0);
  const syy = pts.reduce((s, p) => s + (p[1] - my) ** 2, 0);
  const m = sxy / sxx;
  return { m, b: my - m * mx, r: sxy / Math.sqrt(sxx * syy) };
}
export const sse = (pts, f) => pts.reduce((s, p) => s + (p[1] - f(p[0])) ** 2, 0);
export const rSquared = (pts, f) => {
  const my = mean(pts.map((p) => p[1]));
  return 1 - sse(pts, f) / pts.reduce((s, p) => s + (p[1] - my) ** 2, 0);
};
// Least-squares polynomial of a given degree, by the normal equations and Gaussian elimination
export function polyFit(pts, degree) {
  const n = degree + 1;
  const A = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => pts.reduce((s, p) => s + p[0] ** (i + j), 0)));
  const B = Array.from({ length: n }, (_, i) => pts.reduce((s, p) => s + p[1] * p[0] ** i, 0));
  for (let i = 0; i < n; i++) {
    let piv = i;
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
    [A[i], A[piv]] = [A[piv], A[i]];
    [B[i], B[piv]] = [B[piv], B[i]];
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i];
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c];
      B[r] -= f * B[i];
    }
  }
  const coef = Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) coef[i] = (B[i] - A[i].slice(i + 1).reduce((s, v, k) => s + v * coef[i + 1 + k], 0)) / A[i][i];
  return coef; // lowest power first
}
export const evalLow = (coef, x) => coef.reduceRight((acc, k) => acc * x + k, 0);
// y = A·b^x, fitted by a straight line through (x, ln y)
export function expFit(pts) {
  const { m, b } = linearFit(pts.map((p) => [p[0], Math.log(p[1])]));
  return { A: Math.exp(b), base: Math.exp(m) };
}
// y = a + b ln x
export function logFit(pts) {
  const { m, b } = linearFit(pts.map((p) => [Math.log(p[0]), p[1]]));
  return { a: b, b: m };
}
// y = L / (1 + e^(−k(x − x0))): L set a little above the largest y, then a straight-line fit of ln(L/y − 1)
export function logisticFit(pts) {
  const L = Math.max(...pts.map((p) => p[1])) * 1.08;
  const { m, b } = linearFit(pts.map((p) => [p[0], Math.log(L / p[1] - 1)]));
  return { L, k: -m, x0: b / -m };
}
export const logistic = (m, x) => m.L / (1 + Math.exp(-m.k * (x - m.x0)));

export function cloud(seed, n, slope, noise) {
  const r = createRng(seed);
  const gauss = () => { const u = Math.max(r.next(), 1e-9); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r.next()); };
  return Array.from({ length: n }, (_, i) => { const x = -4 + (8 * i) / (n - 1); return [x, slope * x + noise * gauss()]; });
}
// Made-up data sets for the model picker (labelled as such on the page)
export const DATASETS = [
  { name: 'Bacteria in a dish (made up)', x: 'hours', pts: [[0, 12], [1, 17], [2, 25], [3, 34], [4, 50], [5, 71], [6, 98], [7, 141]] },
  { name: 'Sound level and distance (made up)', x: 'distance', pts: [[1, 90], [2, 84], [3, 80], [4, 78], [6, 73], [8, 70], [10, 67]] },
  { name: 'Population limited by food (made up)', x: 'year', pts: [[0, 10], [1, 14], [2, 22], [3, 36], [4, 55], [5, 76], [6, 91], [7, 100], [8, 103]] },
  { name: 'Ball thrown up (made up)', x: 'time', pts: [[0, 1.5], [0.5, 6], [1, 9], [1.5, 10.2], [2, 9.4], [2.5, 6.1], [3, 1.4]] },
];
