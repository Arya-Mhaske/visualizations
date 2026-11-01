import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { euler } from './_de-math.js';

const EQ = {
  grow: { name: "y′ = y, y(0) = 1", f: (x, y) => y, exact: Math.exp, view: [[0, 3], [0, 22]] },
  mix: { name: "y′ = x − y, y(0) = 1", f: (x, y) => x - y, exact: (x) => x - 1 + 2 * Math.exp(-x), view: [[0, 3], [0, 2.5]] },
};
const state = { eq: 'grow', h: 0.5 };
const steps = (h) => Math.round(3 / h);
const run = (s, h = s.h) => euler(EQ[s.eq].f, 0, 1, h, steps(h));
const errAt3 = (s, h = s.h) => Math.abs(run(s, h).at(-1)[1] - EQ[s.eq].exact(3));

createTool({
  state,
  label: 'The exact solution of a differential equation in blue and the Euler polyline in coral, which follows the slope at the start of each step and then goes straight. On a curving solution the straight steps drift away. Halving the step size halves the error at x equal to 3.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 22], c }),
  draw(ctx, stage, c, plot) {
    const E = EQ[state.eq];
    plot.setRange(E.view[0], E.view[1]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(E.exact, { color: c.b, width: 4 });
    const pts = run(state);
    for (let k = 1; k < pts.length; k++) plot.segment(...pts[k - 1], ...pts[k], { color: c.a, width: 3 });
    pts.forEach(([x, y]) => plot.point(x, y, { fill: c.fillY, r: 4 }));
    const last = pts.at(-1);
    plot.segment(3, E.exact(3), 3, last[1], { color: c.ink, width: 4 });
  },
  controls: [
    { title: 'Shrink the step' },
    { key: 'eq', label: 'Equation', options: Object.entries(EQ).map(([k, v]) => [k, v.name]) },
    { key: 'h', label: 'Step size h', options: [[1, '1'], [0.5, '0.5'], [0.25, '0.25'], [0.1, '0.1'], [0.05, '0.05']] },
    { readout: [
      ['Euler at x = 3', (s) => fixed(run(s).at(-1)[1], 4)],
      ['Exact at x = 3', (s) => fixed(EQ[s.eq].exact(3), 4)],
      ['Error', (s) => ({ text: fixed(errAt3(s), 4), good: false })],
      ['Error ÷ h', (s) => fixed(errAt3(s) / s.h, 3)],
    ] },
  ],
  tex: (s) => String.raw`y_{n+1}=y_n+h\,f(x_n,y_n),\quad h=${s.h},\ \ \text{error}=${fixed(errAt3(s), 4)}`,
});
