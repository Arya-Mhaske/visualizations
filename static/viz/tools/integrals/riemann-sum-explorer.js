import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FN, rects, sumOf, exact } from './_ig.js';

const state = { fn: 'sin', a: 0, b: 3, n: 8, s: 0.5 };
const KEYS = ['x2', 'sin', 'exp', 'sqrt', 'cubic'];
const span = (s) => [Math.min(s.a, s.b - 0.2), s.b];

const tool = createTool({
  state,
  label: 'A function graph with rectangles on the interval you choose. Each rectangle takes its height from a point a set fraction of the way across its slice. The sum of the rectangle areas is compared with the exact area under the curve.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 6.5], y: [-3, 8], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const F = FN[state.fn];
    const [a, b] = span(state);
    plot.setRange([Math.min(F.view[0][0], a - 0.3), Math.max(F.view[0][1], b + 0.3)], F.view[1]);
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    rects(ctx, plot, c, F.f, a, b, state.n, state.s, {});
    plot.fn(F.f, { color: c.a });
  },
  controls: () => [
    { title: 'Choose the sum' },
    { key: 'fn', label: 'Function', options: KEYS.map((k) => [k, FN[k].name]) },
    { key: 'a', label: 'From a', min: -2, max: 3, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'To b', min: 0.5, max: 6, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'n', label: 'Slices n', min: 1, max: 80, step: 1 },
    { key: 's', label: 'Sample point', min: 0, max: 1, step: 0.1, format: (v) => (v === 0 ? 'left edge' : v === 1 ? 'right edge' : v === 0.5 ? 'midpoint' : `${fixed(v, 1)} across`) },
    { readout: [
      ['Riemann sum', (s) => fixed(sumOf(FN[s.fn].f, ...span(s), s.n, s.s), 4)],
      ['Exact integral', (s) => fixed(exact(FN[s.fn].f, ...span(s)), 4)],
      ['Error', (s) => fixed(sumOf(FN[s.fn].f, ...span(s), s.n, s.s) - exact(FN[s.fn].f, ...span(s)), 4)],
    ] },
  ],
  tex: (s) => `\\sum f(x_i^*)\\,\\Delta x=${fixed(sumOf(FN[s.fn].f, ...span(s), s.n, s.s), 4)}\\quad\\Delta x=${fixed((span(s)[1] - span(s)[0]) / s.n, 3)}`,
});

tool.update();
