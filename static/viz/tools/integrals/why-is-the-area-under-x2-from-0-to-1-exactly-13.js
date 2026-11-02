import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { rects, stackBoxes } from './_ig.js';

// Right sum = (1/n³) Σk² = (n+1)(2n+1)/(6n²). Left sum = (n−1)(2n−1)/(6n²). Both → 1/3, and R − L = 1/n.
const state = { n: 5 };
const right = (n) => ((n + 1) * (2 * n + 1)) / (6 * n * n);
const left = (n) => ((n - 1) * (2 * n - 1)) / (6 * n * n);
const f = (x) => x * x;

const tool = createTool({
  state,
  label: 'Top: the curve y equals x squared from 0 to 1 with n right-hand rectangles. Bottom: the exact right-hand and left-hand sums plotted against n. They close in from above and below on one third, shown as a dashed line.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, 1], y: [0, 1.1], c, pad: 24, box: stackBoxes(2)[0] }),
    bottom: createPlot(stage, { x: [1, 40], y: [0, 1.05], c, pad: 24, box: stackBoxes(2)[1] }),
  }),
  draw(ctx, stage, c, { top, bottom }) {
    top.axes({ xLabel: 'x', yLabel: 'x²' });
    rects(ctx, top, c, f, 0, 1, state.n, 1, { fill: c.fillB });
    top.fn(f, { color: c.a });
    bottom.axes({ xLabel: 'n', yLabel: 'sum' });
    bottom.segment(1, 1 / 3, 40, 1 / 3, { color: c.ink, width: 2, dash: [6, 4] });
    bottom.fn((n) => right(Math.max(1, n)), { color: c.a, width: 2 });
    bottom.fn((n) => left(Math.max(1, n)), { color: c.b, width: 2 });
    bottom.point(state.n, right(state.n), { fill: c.a, r: 5 });
    bottom.point(state.n, left(state.n), { fill: c.b, r: 5 });
  },
  controls: () => [
    { title: 'Add rectangles' },
    { key: 'n', label: 'Rectangles n', min: 1, max: 40, step: 1 },
    { readout: [
      ['Right sum', (s) => fixed(right(s.n), 5)],
      ['Left sum', (s) => fixed(left(s.n), 5)],
      ['Right − left', (s) => `${fixed(right(s.n) - left(s.n), 5)} = 1/${s.n}`],
      ['Exact', () => '1/3 = 0.33333'],
    ] },
  ],
  tex: (s) => `R_n=\\dfrac{1}{n^3}\\sum_{k=1}^{n}k^2=\\dfrac{(n+1)(2n+1)}{6n^2}=${fixed(right(s.n), 5)}\\ \\xrightarrow{n\\to\\infty}\\ \\dfrac13`,
});

tool.update();
