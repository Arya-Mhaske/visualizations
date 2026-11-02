import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { FN, rects, sumOf, exact, stackBoxes } from './_ig.js';

// Left sums undershoot a rising curve, right sums overshoot, and the midpoint sum sits between. All three close in on the area.
const KEYS = ['x2', 'sqrt', 'exp'];
const state = { fn: 'x2', n: 6 };
const bounds = (k) => (k === 'sqrt' ? [0, 4] : [0, 2]);

const tool = createTool({
  state,
  label: 'Top: a rising curve with midpoint rectangles. Bottom: a graph of three sums against the number of rectangles. The left sum climbs from below, the right sum falls from above, the midpoint sum stays close, and all three close in on the exact area, shown as a dashed line.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 2], y: [0, 4], c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [1, 40], y: [0, 4], c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    const F = FN[state.fn];
    const [a, b] = bounds(state.fn);
    const area = exact(F.f, a, b);
    top.setRange([a, b], F.view[1]);
    top.axes({ xLabel: 'x', yLabel: 'f(x)' });
    rects(ctx, top, c, F.f, a, b, state.n, 0.5, { fill: c.fillB });
    top.fn(F.f, { color: c.a });
    const hi = Math.max(area * 1.6, 1);
    bottom.setRange([1, 40], [0, hi]);
    bottom.axes({ xLabel: 'number of rectangles n', yLabel: 'sum' });
    bottom.segment(1, area, 40, area, { color: c.ink, width: 2, dash: [6, 4] });
    bottom.fn((n) => sumOf(F.f, a, b, Math.max(1, Math.round(n)), 0), { color: c.b, width: 2 });
    bottom.fn((n) => sumOf(F.f, a, b, Math.max(1, Math.round(n)), 1), { color: c.a, width: 2 });
    bottom.fn((n) => sumOf(F.f, a, b, Math.max(1, Math.round(n)), 0.5), { color: c.c, width: 2 });
    bottom.segment(state.n, 0, state.n, hi, { color: c.grid, width: 1 });
  },
  controls: () => [
    { title: 'Add rectangles' },
    { key: 'fn', label: 'Curve', options: KEYS.map((k) => [k, FN[k].name]) },
    { key: 'n', label: 'Rectangles n', min: 1, max: 40, step: 1 },
    { readout: [
      ['Left sum', (s) => fixed(sumOf(FN[s.fn].f, ...bounds(s.fn), s.n, 0), 4)],
      ['Midpoint sum', (s) => fixed(sumOf(FN[s.fn].f, ...bounds(s.fn), s.n, 0.5), 4)],
      ['Right sum', (s) => fixed(sumOf(FN[s.fn].f, ...bounds(s.fn), s.n, 1), 4)],
      ['Exact area', (s) => fixed(exact(FN[s.fn].f, ...bounds(s.fn)), 4)],
    ] },
  ],
  tex: (s) => `L_n\\le A\\le R_n,\\quad R_n-L_n=\\dfrac{(b-a)\\,[f(b)-f(a)]}{n}=${fixed(sumOf(FN[s.fn].f, ...bounds(s.fn), s.n, 1) - sumOf(FN[s.fn].f, ...bounds(s.fn), s.n, 0), 4)}`,
});

tool.update();
