import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Made-up counts for a classroom culture. The fit is the textbook one: N = N0 e^(kt) through two counts.
const state = { N1: 500, N2: 4000, t2: 4, t3: 10 };
const k = (s) => Math.log(s.N2 / s.N1) / s.t2;
const N = (s, t) => s.N1 * Math.exp(k(s) * t);

createTool({
  state,
  label: 'Two bacteria counts, one at the start and one a few hours later, and the exponential curve that passes through both. A third marker reads the predicted count at a later time you choose. The readouts give the growth constant, the doubling time and the hourly percentage increase.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 10000], c, pad: 32 }),
  draw(ctx, stage, c, plot) {
    const xmax = Math.max(state.t3, state.t2) * 1.15 + 1;
    plot.setRange([0, xmax], [0, Math.max(state.N1, state.N2, N(state, state.t3)) * 1.12]);
    plot.axes({ xLabel: 'hours', yLabel: 'bacteria' });
    plot.fn((t) => N(state, t), { color: c.a, width: 4 });
    plot.point(0, state.N1, { fill: c.b, r: 8 });
    plot.point(state.t2, state.N2, { fill: c.b, r: 8 });
    plot.segment(state.t3, 0, state.t3, N(state, state.t3), { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(state.t3, N(state, state.t3), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Two counts' },
    { key: 'N1', label: 'Count at 0 h', min: 100, max: 5000, step: 100 },
    { key: 'N2', label: 'Count later', min: 100, max: 20000, step: 100 },
    { key: 't2', label: 'Hours between counts', min: 1, max: 10, step: 1 },
    { key: 't3', label: 'Predict at hour', min: 0, max: 24, step: 1 },
    { readout: [
      ['Constant k', (s) => `${fixed(k(s), 4)} per hour`],
      ['Doubling time', (s) => (k(s) > 0 ? `${fixed(Math.LN2 / k(s), 2)} h` : 'it is shrinking')],
      ['Change each hour', (s) => `${fixed((Math.exp(k(s)) - 1) * 100, 1)}%`],
      ['Predicted count', (s) => ({ text: fixed(N(s, s.t3), 0), good: true })],
    ] },
  ],
  tex: (s) => `k=\\dfrac{\\ln(${s.N2}/${s.N1})}{${s.t2}}=${fixed(k(s), 4)},\\ \\ N(${s.t3})=${s.N1}e^{${fixed(k(s), 4)}\\times${s.t3}}=${fixed(N(s, s.t3), 0)}`,
});
