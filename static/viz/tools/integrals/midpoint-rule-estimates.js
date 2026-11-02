import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FN, rects, sumOf, exact } from './_ig.js';

const KEYS = ['x2', 'sin', 'exp', 'sqrt', 'cubic'];
const state = { fn: 'sin', n: 4 };
const win = (k) => (k === 'sin' ? [0, Math.PI] : k === 'cubic' ? [-2, 2] : k === 'sqrt' ? [0, 4] : [0, 2]);

const tool = createTool({
  state,
  label: 'A curve with n rectangles, each as tall as the curve at the middle of its slice. Where the rectangle pokes above the curve on one side of the midpoint it falls short on the other, so the errors largely cancel. The estimate is compared with the exact value.',
  setup: (stage, c) => createPlot(stage, { x: [-2.5, 6.5], y: [-3, 8], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const F = FN[state.fn];
    const [a, b] = win(state.fn);
    plot.setRange([a - 0.2, b + 0.2], F.view[1]);
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    rects(ctx, plot, c, F.f, a, b, state.n, 0.5, {});
    plot.fn(F.f, { color: c.a });
  },
  controls: () => [
    { title: 'Estimate with midpoints' },
    { key: 'fn', label: 'Function', options: KEYS.map((k) => [k, FN[k].name]) },
    { key: 'n', label: 'Slices n', min: 1, max: 20, step: 1 },
    { readout: [
      ['Midpoint estimate', (s) => fixed(sumOf(FN[s.fn].f, ...win(s.fn), s.n, 0.5), 5)],
      ['Exact value', (s) => fixed(exact(FN[s.fn].f, ...win(s.fn)), 5)],
      ['Error', (s) => fixed(sumOf(FN[s.fn].f, ...win(s.fn), s.n, 0.5) - exact(FN[s.fn].f, ...win(s.fn)), 5)],
      ['Left-rule error, same n', (s) => fixed(sumOf(FN[s.fn].f, ...win(s.fn), s.n, 0) - exact(FN[s.fn].f, ...win(s.fn)), 5)],
    ] },
  ],
  tex: (s) => `M_n=\\Delta x\\sum f\\!\\left(\\dfrac{x_{i-1}+x_i}{2}\\right)=${fixed(sumOf(FN[s.fn].f, ...win(s.fn), s.n, 0.5), 5)}`,
});

tool.update();
