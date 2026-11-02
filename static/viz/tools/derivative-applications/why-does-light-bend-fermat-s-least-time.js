import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, dot } from '../../lib/draw.js';
import { num } from './_da.js';

// Light goes from A in air (speed c) to B in glass or water (speed c/n), crossing the surface at x.
// T(x) = √(x² + a²)/c + √((d − x)² + b²)/(c/n). Setting T′(x) = 0 gives sin θ₁ / sin θ₂ = n: Snell's law.
const A = 3; const B = 3; const D = 6;
const state = { x: 1.5, n: 1.5 };
const T = (x, n = state.n) => Math.hypot(x, A) + n * Math.hypot(D - x, B); // in units of 1/c
const sin1 = (x) => x / Math.hypot(x, A);
const sin2 = (x) => (D - x) / Math.hypot(D - x, B);
const best = () => { let lo = 0; let hi = D; for (let i = 0; i < 80; i++) { const m1 = lo + (hi - lo) / 3; const m2 = hi - (hi - lo) / 3; if (T(m1) < T(m2)) hi = m2; else lo = m1; } return (lo + hi) / 2; };

createTool({
  state,
  label: 'Top: light travelling from a point in air to a point in glass, crossing the surface at a point you choose. Bottom: the total travel time against the crossing point, with a minimum where the angles obey Snell\'s law.',
  setup: (stage, c) => createPlot(stage, { x: [0, D], y: [0, 10], c, box: (s) => ({ x: 0, y: s.h * 0.52, w: s.w, h: s.h * 0.48 }) }),
  draw(ctx, stage, c, plot) {
    const h = stage.h * 0.52;
    const sc = Math.min((stage.w - 40) / D, (h - 20) / (A + B));
    const [x0, yS] = [20, 12 + A * sc];
    const P = (x, y) => [x0 + x * sc, yS - y * sc];
    ctx.fillStyle = c.fillB;
    ctx.fillRect(0, yS, stage.w, h - yS);
    line(ctx, 0, yS, stage.w, yS, { color: c.ink, width: 3 });
    const [ax, ay] = P(0, A); const [bx, by] = P(D, -B); const [sx, sy] = P(state.x, 0); const [ox, oy] = P(best(), 0);
    line(ctx, ax, ay, sx, sy, { color: c.a, width: 4 }); line(ctx, sx, sy, bx, by, { color: c.a, width: 4 });
    line(ctx, sx, sy - A * sc * 0.9, sx, sy + B * sc * 0.9, { color: c.ink, width: 1.5, dash: [4, 4] });
    dot(ctx, ax, ay, 7, c.b, c.ink); dot(ctx, bx, by, 7, c.b, c.ink); dot(ctx, ox, oy, 6, c.c, c.ink);
    plot.setRange([0, D], [T(best()) * 0.9, T(0) > T(D) ? T(0) : T(D)]);
    plot.axes({ xLabel: 'crossing point x', yLabel: 'time T (× 1/c)' });
    plot.fn((x) => T(x), { color: c.ink, width: 3 });
    plot.point(best(), T(best()), { fill: c.c, r: 8 });
    plot.point(state.x, T(state.x), { fill: c.a });
  },
  controls: [
    { title: 'Choose the crossing point' },
    { key: 'x', label: 'Crossing point x', min: 0.1, max: 5.9, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'n', label: 'Glass: light slower by n', min: 1, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Travel time T', () => num(T(state.x), 5)],
      ['Fastest crossing at', () => num(best(), 4)],
      ['sin θ₁ / sin θ₂ here', () => num(sin1(state.x) / sin2(state.x), 4)],
      ['At the fastest point', () => num(sin1(best()) / sin2(best()), 4)],
    ] },
  ],
  tex: (s) => `\\frac{dT}{dx}=0\\ \\Rightarrow\\ \\sin\\theta_1=n\\sin\\theta_2\\ \\ (n=${s.n.toFixed(2)})`,
});
