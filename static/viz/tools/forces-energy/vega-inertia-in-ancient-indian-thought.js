import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { v0: 4, r: 0.5 };
const dist = (s) => (s.r ? s.v0 ** 2 / (2 * s.r) : Infinity);

createTool({
  state,
  label: 'Speed against time for a body given an impulse. The speed stays until an opposing force acts, then falls steadily. With no opposition it never falls.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 6], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'speed (m/s)' });
    plot.fn((t) => (t < 2 ? state.v0 : Math.max(0, state.v0 - state.r * (t - 2))), { color: c.b });
    plot.text('impulse', 0.3, state.v0 + 0.5, { align: 'left', patch: false });
    plot.text('opposed from here', 2.2, state.v0 + 0.5, { align: 'left', patch: false });
  },
  controls: [
    { title: 'Impulse and resistance' },
    { key: 'v0', label: 'Speed from the impulse (m/s)', min: 1, max: 6, step: 0.5 },
    { key: 'r', label: 'Opposing deceleration (m/s²)', min: 0, max: 2, step: 0.25 },
    { readout: [
      ['Persists for', (s) => (s.r ? `${fixed(2 + s.v0 / s.r, 1)} s` : 'for ever')],
      ['Distance after resistance starts', (s) => (s.r ? `${fixed(dist(s), 1)} m` : 'unlimited')],
    ] },
  ],
  tex: () => `\\vec F_{\\text{net}}=0\\ \\Rightarrow\\ \\vec v\\ \\text{constant}`,
});
