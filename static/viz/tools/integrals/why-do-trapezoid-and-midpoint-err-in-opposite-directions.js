import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, simpson, trapSum, midSum, num } from '../integral-applications/_ia.js';

// On a concave-up graph chords lie above the curve (trapezoid too big) while tangents at midpoints lie below it (midpoint too small).
const FN = {
  exp: { name: 'eˣ on [0, 2]  (concave up)', f: Math.exp, a: 0, b: 2, y: [0, 8] },
  sin: { name: 'sin x on [0, π]  (concave down)', f: Math.sin, a: 0, b: Math.PI, y: [-0.2, 1.4] },
  mix: { name: 'x³ − 3x on [−2, 2]  (both)', f: (x) => x ** 3 - 3 * x, a: -2, b: 2, y: [-4, 4] },
};
const state = { fn: 'exp', n: 4 };
const K = () => FN[state.fn];
const exact = () => simpson(K().f, K().a, K().b, 2000);
const [bA, bB] = boxes(2);

createTool({
  state,
  label: 'Top: trapezoids joining points on the curve. Bottom: rectangles whose tops are tangent segments at the midpoints. On a curve bending one way the trapezoids lie above and the midpoint pieces lie below.',
  setup: (stage, c) => ({ a: createPlot(stage, { x: [0, 2], y: [0, 8], c, box: bA }), b: createPlot(stage, { x: [0, 2], y: [0, 8], c, box: bB }) }),
  draw(ctx, stage, c, { a, b }) {
    const k = K();
    const h = (k.b - k.a) / state.n;
    for (const p of [a, b]) p.setRange([k.a - 0.1, k.b + 0.1], k.y);
    a.axes({ xLabel: 'x', yLabel: 'trapezoid' });
    b.axes({ xLabel: 'x', yLabel: 'midpoint' });
    for (let i = 0; i < state.n; i++) {
      const x0 = k.a + i * h; const x1 = x0 + h; const xm = x0 + h / 2;
      a.shade((x) => k.f(x0) + ((k.f(x1) - k.f(x0)) * (x - x0)) / h, null, x0, x1, c.fillA);
      const d = (k.f(xm + 1e-5) - k.f(xm - 1e-5)) / 2e-5;
      b.shade((x) => k.f(xm) + d * (x - xm), null, x0, x1, c.fillB);
      a.segment(x0, 0, x0, k.f(x0), { color: c.ink, width: 1 });
    }
    a.fn(k.f, { color: c.ink, width: 3 });
    b.fn(k.f, { color: c.ink, width: 3 });
  },
  controls: [
    { title: 'Cut it up' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Pieces n', min: 1, max: 20, step: 1 },
    { readout: [
      ['Exact area', () => num(exact(), 6)],
      ['Trapezoid  T', () => `${num(trapSum(K().f, K().a, K().b, state.n), 6)}  (error ${num(trapSum(K().f, K().a, K().b, state.n) - exact(), 3)})`],
      ['Midpoint  M', () => `${num(midSum(K().f, K().a, K().b, state.n), 6)}  (error ${num(midSum(K().f, K().a, K().b, state.n) - exact(), 3)})`],
      ['Error ratio T : M', () => num((trapSum(K().f, K().a, K().b, state.n) - exact()) / (midSum(K().f, K().a, K().b, state.n) - exact()), 3)],
    ] },
  ],
  tex: () => "E_T\\approx\\frac{(b-a)^3}{12n^2}f'',\\qquad E_M\\approx-\\frac{(b-a)^3}{24n^2}f''",
});
