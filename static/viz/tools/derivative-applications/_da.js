// Shared helpers for the derivative-applications boxes (and the rates box): a function bank with exact f, f', f'',
// root finding, a curve coloured by the sign of its slope, and a tangent drawer.
import { line } from '../../lib/draw.js';

export { boxes, speck, trace, num } from '../infinite-series/_is.js';

export const FUNS = {
  cubic: { name: 'x³/3 − x', f: (x) => x ** 3 / 3 - x, d: (x) => x * x - 1, d2: (x) => 2 * x, x: [-3, 3], y: [-3, 3] },
  quartic: { name: 'x⁴/4 − 2x² + 1', f: (x) => x ** 4 / 4 - 2 * x * x + 1, d: (x) => x ** 3 - 4 * x, d2: (x) => 3 * x * x - 4, x: [-3.2, 3.2], y: [-5, 6] },
  wave: { name: 'sin x + 0.4x', f: (x) => Math.sin(x) + 0.4 * x, d: (x) => Math.cos(x) + 0.4, d2: (x) => -Math.sin(x), x: [-6.5, 6.5], y: [-4, 4] },
  hill: { name: '3 − (x − 1)²', f: (x) => 3 - (x - 1) ** 2, d: (x) => -2 * (x - 1), d2: () => -2, x: [-2, 4], y: [-2, 4] },
  bump: { name: 'x e^(−x²/2)', f: (x) => x * Math.exp(-x * x / 2), d: (x) => (1 - x * x) * Math.exp(-x * x / 2), d2: (x) => (x ** 3 - 3 * x) * Math.exp(-x * x / 2), x: [-3.5, 3.5], y: [-1, 1] },
};
export const sign = (v, tol = 1e-9) => (v > tol ? 1 : v < -tol ? -1 : 0);

// All roots of g in [lo, hi] where g changes sign (bisection), plus exact zeros on the grid.
export function roots(g, lo, hi, n = 600) {
  const out = [];
  let x0 = lo;
  let y0 = g(x0);
  for (let i = 1; i <= n; i++) {
    const x1 = lo + ((hi - lo) * i) / n;
    const y1 = g(x1);
    if (y0 === 0) out.push(x0);
    else if (y0 * y1 < 0) {
      let a = x0;
      let b = x1;
      for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (g(a) * g(m) <= 0) b = m; else a = m; }
      out.push((a + b) / 2);
    }
    x0 = x1;
    y0 = y1;
  }
  return out;
}

// Draw f over [lo, hi], green where `d` > 0 and coral where d < 0.
export function curveBySign(ctx, plot, f, d, lo, hi, c, width = 3.5) {
  const n = 400;
  ctx.save();
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x1 = lo + ((hi - lo) * i) / n;
    const x2 = lo + ((hi - lo) * (i + 1)) / n;
    const [y1, y2] = [f(x1), f(x2)];
    if (!Number.isFinite(y1) || !Number.isFinite(y2) || Math.abs(y2 - y1) > 1e3) continue;
    const s = d((x1 + x2) / 2);
    ctx.strokeStyle = s > 1e-9 ? c.c : s < -1e-9 ? c.a : c.ink;
    ctx.beginPath();
    ctx.moveTo(...plot.toPx(x1, y1));
    ctx.lineTo(...plot.toPx(x2, y2));
    ctx.stroke();
  }
  ctx.restore();
}

// A tangent segment of half-width h (in x) at x0 with slope m.
export function tangent(plot, x0, y0, m, h, color, width = 2.5) {
  plot.segment(x0 - h, y0 - m * h, x0 + h, y0 + m * h, { color, width });
}
export const pxLine = line;

// Map a 0–100 slider to an x inside a function's window.
export const xAt = (k, p) => k.x[0] + (p / 100) * (k.x[1] - k.x[0]);
