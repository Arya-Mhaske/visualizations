// Shared maths and drawing helpers for the infinite-series subject.
import { line, dot } from '../../lib/draw.js';

export const E = Math.E;
export const fact = (n) => { let f = 1; for (let i = 2; i <= n; i++) f *= i; return f; };
export const sumTo = (term, a, b) => { let s = 0; for (let n = a; n <= b; n++) s += term(n); return s; };
// Partial sums S_a..S_b as an array indexed from a.
export const partials = (term, a, b) => { const out = []; let s = 0; for (let n = a; n <= b; n++) { s += term(n); out.push(s); } return out; };
// p-series sum from 1 to infinity (Euler-Maclaurin tail after M terms).
export function zeta(p, M = 2000) {
  const s = sumTo((n) => n ** -p, 1, M);
  return s + M ** (1 - p) / (p - 1) - 0.5 * M ** -p + (p * M ** (-p - 1)) / 12;
}
// Binomial coefficient C(k, n) for any real k.
export function binom(k, n) { let c = 1; for (let i = 0; i < n; i++) c *= (k - i) / (i + 1); return c; }
// Tiny dot at a plot coordinate (for many points).
export function speck(ctx, plot, x, y, r, fill, ink) {
  const [px, py] = plot.toPx(x, y);
  dot(ctx, px, py, r, fill, ink, 1.5);
}
// Polyline through plot coordinates, no clipping surprises.
export function trace(ctx, plot, pts, color, width = 2.5) {
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = plot.toPx(...pts[i - 1]);
    const [x2, y2] = plot.toPx(...pts[i]);
    line(ctx, x1, y1, x2, y2, { color, width });
  }
}
// Stack n plots as equal boxes (top to bottom) inside a stage, with a gap.
export const boxes = (n, top = 0) => Array.from({ length: n }, (_, i) => (stage) => {
  const h = (stage.h - top) / n;
  return { x: 0, y: top + i * h, w: stage.w, h };
});
// Show a value in readouts: plain, with big numbers in scientific form.
export function num(x, d = 4) {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
  const a = Math.abs(x);
  if (a !== 0 && (a >= 1e6 || a < 1e-4)) return x.toExponential(2).replace('-', '−').replace('e+', ' ×10^').replace('e', ' ×10^');
  return String(Number(x.toFixed(d))).replace('-', '−');
}
// Sequence bank used by the sequence tools: a(n), exact limit.
export const SEQS = {
  inv: { name: 'aₙ = 1 − 1/n', a: (n) => 1 - 1 / n, L: 1 },
  sqrt2: { name: 'aₙ₊₁ = √(2 + aₙ), a₁ = √2', a: (n) => { let x = Math.SQRT2; for (let i = 1; i < n; i++) x = Math.sqrt(2 + x); return x; }, L: 2 },
  e: { name: 'aₙ = (1 + 1/n)ⁿ', a: (n) => (1 + 1 / n) ** n, L: E },
  basel: { name: 'aₙ = 1 + 1/4 + … + 1/n²', a: (n) => sumTo((k) => 1 / (k * k), 1, n), L: Math.PI ** 2 / 6 },
};
// The logistic map.
export const logistic = (r, x) => r * x * (1 - x);
export function logisticPeriod(r, x0 = 0.3) {
  let x = x0;
  for (let i = 0; i < 4000; i++) x = logistic(r, x);
  const orbit = [x];
  for (let i = 0; i < 130; i++) { x = logistic(r, x); orbit.push(x); }
  for (let p = 1; p <= 64; p++) if (Math.abs(orbit[p] - orbit[0]) < 1e-7 && Math.abs(orbit[2 * p] - orbit[0]) < 1e-7) return p;
  return 0;
}
