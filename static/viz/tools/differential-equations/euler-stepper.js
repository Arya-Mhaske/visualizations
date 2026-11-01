import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { euler } from './_de-math.js';

// y' = x + y, y(0) = 1.  Exact: y = 2e^x - x - 1.
const f = (x, y) => x + y;
const exact = (x) => 2 * Math.exp(x) - x - 1;
const state = { h: 0.25, k: 3 };
const pts = (s) => euler(f, 0, 1, s.h, 20);

createTool({
  state,
  label: 'Euler method for y prime equals x plus y starting at the point 0, 1, one step at a time. Each step takes the slope at the current point, shown as a short coral line, and moves along it for a distance h. The exact solution is drawn in blue for comparison. Use the slider to run more steps.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 14], c }),
  draw(ctx, stage, c, plot) {
    const P = pts(state);
    const xEnd = Math.max(1, P[Math.min(state.k, 20)][0] * 1.1);
    plot.setRange([0, Math.max(xEnd, 1)], [0, Math.max(exact(xEnd), P[state.k][1]) * 1.1 + 1]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(exact, { color: c.b, width: 4 });
    for (let i = 1; i <= state.k; i++) plot.segment(...P[i - 1], ...P[i], { color: c.a, width: 4 });
    for (let i = 0; i <= state.k; i++) plot.point(...P[i], { fill: i === state.k ? c.fillY : c.a, r: i === state.k ? 7 : 4 });
  },
  controls: [
    { title: 'Take steps' },
    { key: 'h', label: 'Step size h', min: 0.05, max: 0.5, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'k', label: 'Steps taken', min: 0, max: 20, step: 1 },
    { readout: [
      ['Step', (s) => { const P = pts(s); return s.k ? `from (${fixed(P[s.k - 1][0], 2)}, ${fixed(P[s.k - 1][1], 3)})` : 'start (0, 1)'; }],
      ['Slope used', (s) => { const P = pts(s); return s.k ? fixed(f(...P[s.k - 1]), 3) : '—'; }],
      ['New point', (s) => { const P = pts(s); return `(${fixed(P[s.k][0], 2)}, ${fixed(P[s.k][1], 3)})`; }],
      ['Exact y there', (s) => fixed(exact(pts(s)[s.k][0]), 3)],
    ] },
  ],
  tex: (s) => { const P = pts(s); return s.k ? String.raw`y_{${s.k}}=y_{${s.k - 1}}+h\,(x_{${s.k - 1}}+y_{${s.k - 1}})=${fixed(P[s.k - 1][1], 3)}+${s.h}\times${fixed(f(...P[s.k - 1]), 3)}=${fixed(P[s.k][1], 3)}` : 'y_0=1'; },
});
