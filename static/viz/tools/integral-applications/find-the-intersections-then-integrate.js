import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from '../integrals/_ig.js';

// Set up: find where the curves cross, then integrate |f − g| between consecutive crossings.
const PAIRS = {
  par: { name: 'x² and x + 2', f: (x) => x * x, g: (x) => x + 2, win: [-2.5, 3.5], tf: 'x^2', tg: 'x+2' },
  cub: { name: 'x³ and x', f: (x) => x ** 3, g: (x) => x, win: [-1.6, 1.6], tf: 'x^3', tg: 'x' },
  trig: { name: 'sin x and cos x', f: Math.sin, g: Math.cos, win: [0, 2 * Math.PI], tf: '\\sin x', tg: '\\cos x' },
  hill: { name: '4x − x² and x', f: (x) => 4 * x - x * x, g: (x) => x, win: [-0.5, 4], tf: '4x-x^2', tg: 'x' },
};
const state = { k: 'par', step: 1 };

function crossings(P) {
  const [a, b] = P.win;
  const h = (x) => P.f(x) - P.g(x);
  const out = [];
  const N = 800;
  let prev = h(a);
  for (let i = 1; i <= N; i++) {
    const x1 = a + ((b - a) * i) / N;
    const cur = h(x1);
    if (prev === 0 || prev * cur < 0) {
      let lo = a + ((b - a) * (i - 1)) / N;
      let hi = x1;
      for (let j = 0; j < 50; j++) { const mid = (lo + hi) / 2; if (h(lo) * h(mid) <= 0) hi = mid; else lo = mid; }
      out.push((lo + hi) / 2);
    }
    prev = cur;
  }
  return out;
}
const areaOf = (P, xs) => { let t = 0; for (let i = 0; i < xs.length - 1; i++) t += exact((x) => Math.abs(P.f(x) - P.g(x)), xs[i], xs[i + 1]); return t; };

const tool = createTool({
  state,
  label: 'Two curves on a graph. Step 1 shows only the curves. Step 2 marks the points where they cross. Step 3 shades each region trapped between consecutive crossing points, with the area worked out from the absolute difference of the two curves.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 4], y: [-3, 6], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const P = PAIRS[state.k];
    const xs = crossings(P);
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i <= 80; i++) { const x = P.win[0] + ((P.win[1] - P.win[0]) * i) / 80; for (const g of [P.f, P.g]) { lo = Math.min(lo, g(x)); hi = Math.max(hi, g(x)); } }
    const pad = (hi - lo) * 0.1;
    plot.setRange(P.win, [lo - pad, hi + pad]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    if (state.step >= 3) for (let i = 0; i < xs.length - 1; i++) {
      const mid = (xs[i] + xs[i + 1]) / 2;
      const upper = P.f(mid) > P.g(mid) ? P.f : P.g;
      const lower = upper === P.f ? P.g : P.f;
      plot.shade(upper, lower, xs[i], xs[i + 1], i % 2 ? c.fillB : c.fillY);
    }
    plot.fn(P.f, { color: c.a });
    plot.fn(P.g, { color: c.b });
    if (state.step >= 2) xs.forEach((x) => plot.point(x, P.f(x), { fill: c.c, r: 7 }));
  },
  controls: () => [
    { title: 'Set it up in three steps' },
    { key: 'k', label: 'Curves', options: Object.entries(PAIRS).map(([k, v]) => [k, v.name]) },
    { key: 'step', label: 'Step', options: [[1, '1 curves'], [2, '2 crossings'], [3, '3 area']] },
    { readout: [
      ['Crossings at x =', (s) => (s.step >= 2 ? crossings(PAIRS[s.k]).map((x) => fixed(x, 3)).join(', ') : 'step 2')],
      ['Area', (s) => (s.step >= 3 ? fixed(areaOf(PAIRS[s.k], crossings(PAIRS[s.k])), 5) : 'step 3')],
    ] },
  ],
  tex: (s) => { const P = PAIRS[s.k]; return `A=\\int|${P.tf}-(${P.tg})|\\,dx\\ \\text{between consecutive crossings}`; },
});

tool.update();
