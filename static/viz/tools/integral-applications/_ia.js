// Shared numerical helpers for the integrals, integral-applications and limits boxes.
export { boxes, speck, trace, num } from '../infinite-series/_is.js';
export { tangent, roots, FUNS } from '../derivative-applications/_da.js';

export const simpson = (f, a, b, n = 400) => {
  if (n % 2) n += 1;
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
};
export const leftSum = (f, a, b, n) => { const h = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += f(a + i * h); return s * h; };
export const rightSum = (f, a, b, n) => { const h = (b - a) / n; let s = 0; for (let i = 1; i <= n; i++) s += f(a + i * h); return s * h; };
export const midSum = (f, a, b, n) => { const h = (b - a) / n; let s = 0; for (let i = 0; i < n; i++) s += f(a + (i + 0.5) * h); return s * h; };
export const trapSum = (f, a, b, n) => (leftSum(f, a, b, n) + rightSum(f, a, b, n)) / 2;
export const simpSum = (f, a, b, n) => { n += n % 2; const h = (b - a) / n; let s = f(a) + f(b); for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2); return (s * h) / 3; };
// Standard normal pdf and cdf (cdf by Simpson on the pdf, accurate to about 1e-10).
export const phi = (z) => Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
export const Phi = (z) => 0.5 + Math.sign(z) * simpson(phi, 0, Math.min(Math.abs(z), 9), 200);
export const sci = (x) => x.toExponential(2);
