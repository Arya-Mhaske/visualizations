import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a0: 2, j: 0.5, t: 6 };
const truth = (s, t) => 0.5 * s.a0 * t * t + (s.j * t ** 3) / 6;
const naive = (s, t) => 0.5 * s.a0 * t * t;

createTool({
  state,
  label: 'Distance against time for two cases: the true motion when acceleration grows steadily, and the constant-acceleration formula. They separate as time goes on.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 160], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn((t) => naive(state, t), { color: c.a, dash: [7, 5] });
    plot.fn((t) => truth(state, t), { color: c.b });
    plot.point(state.t, truth(state, state.t), { fill: c.b });
    plot.point(state.t, naive(state, state.t), { fill: c.a });
  },
  controls: [
    { title: 'Changing acceleration' },
    { key: 'a0', label: 'Starting acceleration a₀ (m/s²)', min: 0, max: 4, step: 0.5 },
    { key: 'j', label: 'Jerk j = da/dt (m/s³)', min: -1, max: 2, step: 0.25 },
    { key: 't', label: 'Time t (s)', min: 1, max: 8, step: 0.5 },
    { readout: [
      ['Formula ½a₀t²', (s) => `${fixed(naive(s, s.t), 1)} m`],
      ['True x', (s) => `${fixed(truth(s, s.t), 1)} m`],
      ['Error', (s) => `${fixed(truth(s, s.t) - naive(s, s.t), 1)} m`],
    ] },
  ],
  tex: (s) => `x=\\tfrac12a_0t^2+\\tfrac16jt^3=${fixed(truth(s, s.t), 1)}\\ \\mathrm{m}`,
});
