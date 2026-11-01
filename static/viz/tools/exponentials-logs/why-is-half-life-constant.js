import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { T: 5, t0: 12, dt: 5 };
const N = (s, t) => 100 * 2 ** (-t / s.T);
const factor = (s) => 2 ** (-s.dt / s.T);

createTool({
  state,
  label: 'A decay curve for a radioactive sample, starting at 100 percent. Two time windows of equal length are marked, one at the start and one later that you can slide. In both windows the sample falls by the same fraction, so the curve loses the same share in every equal time step.',
  setup: (stage, c) => createPlot(stage, { x: [0, 45], y: [0, 105], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'time', yLabel: '% left' });
    plot.fn((t) => N(state, t), { color: c.a, width: 4 });
    const windows = [[0, c.b], [state.t0, c.c]];
    for (const [start, color] of windows) {
      const end = start + state.dt;
      plot.segment(start, 0, start, N(state, start), { color, width: 3, dash: [5, 4] });
      plot.segment(end, 0, end, N(state, end), { color, width: 3, dash: [5, 4] });
      plot.segment(start, N(state, end), end, N(state, end), { color, width: 3 });
      plot.point(start, N(state, start), { fill: color, r: 7 });
      plot.point(end, N(state, end), { fill: color, r: 7 });
      plot.text(`×${fixed(factor(state), 3)}`, (start + end) / 2, N(state, end) + 6, { size: 11, color, patch: true });
    }
  },
  controls: [
    { title: 'Compare two equal windows' },
    { key: 'T', label: 'Half-life T', min: 1, max: 10, step: 0.5 },
    { key: 'dt', label: 'Window length', min: 1, max: 15, step: 0.5 },
    { key: 't0', label: 'Second window starts at', min: 0, max: 30, step: 0.5 },
    { readout: [
      ['Left over, blue window', (s) => `${fixed((N(s, s.dt) / N(s, 0)) * 100, 2)}%`],
      ['Left over, green window', (s) => ({ text: `${fixed((N(s, s.t0 + s.dt) / N(s, s.t0)) * 100, 2)}%`, good: true })],
      ['Sample at window start', (s) => `${fixed(N(s, s.t0), 1)}%`],
    ] },
  ],
  tex: (s) => `\\dfrac{N(t+${s.dt})}{N(t)}=2^{-${s.dt}/${s.T}}=${fixed(factor(s), 4)}\\ \\text{for every}\\ t`,
});
