import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { simpson, num } from './_ia.js';

// Each little step has Δx across and Δy up; its hypotenuse is Δx √(1 + (Δy/Δx)²). Add n of them, let n grow: ∫√(1 + f′²) dx.
const FN = {
  par: { name: 'y = x² on [0, 2]', f: (x) => x * x, d: (x) => 2 * x, a: 0, b: 2, y: [0, 4.4] },
  sin: { name: 'y = sin x on [0, π]', f: Math.sin, d: Math.cos, a: 0, b: Math.PI, y: [-0.3, 1.4] },
  cat: { name: 'y = cosh x on [−1, 1]', f: Math.cosh, d: Math.sinh, a: -1, b: 1, y: [0, 2] },
};
const state = { fn: 'par', n: 4 };
const K = () => FN[state.fn];
const exact = () => simpson((x) => Math.sqrt(1 + K().d(x) ** 2), K().a, K().b, 2000);
const poly = (n) => { let s = 0; const h = (K().b - K().a) / n; for (let i = 0; i < n; i++) s += Math.hypot(h, K().f(K().a + (i + 1) * h) - K().f(K().a + i * h)); return s; };

createTool({
  state,
  label: 'A curve with n straight pieces drawn along it. The total length of the pieces is compared with the integral of the square root of one plus the slope squared.',
  setup: (stage, c) => createPlot(stage, { x: [0, 2], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange([k.a - 0.1, k.b + 0.1], k.y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(k.f, { color: c.grid, width: 2 });
    const h = (k.b - k.a) / state.n;
    for (let i = 0; i < state.n; i++) {
      const [x0, x1] = [k.a + i * h, k.a + (i + 1) * h];
      plot.segment(x0, k.f(x0), x1, k.f(x1), { color: c.a, width: 3 });
      if (state.n <= 8) { plot.segment(x0, k.f(x0), x1, k.f(x0), { color: c.b, width: 1.5, dash: [4, 3] }); plot.segment(x1, k.f(x0), x1, k.f(x1), { color: c.b, width: 1.5, dash: [4, 3] }); }
    }
  },
  controls: [
    { title: 'Add straight pieces' },
    { key: 'fn', label: 'Curve', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Pieces n', min: 1, max: 60, step: 1 },
    { readout: [
      ['Sum of hypotenuses', () => num(poly(state.n), 6)],
      ['Integral ∫√(1 + f′²) dx', () => num(exact(), 6)],
      ['Shortfall', () => num(exact() - poly(state.n), 3)],
      ['Straight line between the ends', () => num(Math.hypot(K().b - K().a, K().f(K().b) - K().f(K().a)), 5)],
    ] },
  ],
  tex: () => 'L=\\int_a^{b}\\sqrt{1+\\left(\\frac{dy}{dx}\\right)^2}\\,dx',
});
