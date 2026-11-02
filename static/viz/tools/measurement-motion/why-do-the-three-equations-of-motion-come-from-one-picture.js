import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { v0: 2, a: 1.5, t: 4 };
const v = (s, t) => s.v0 + s.a * t;
const x = (s) => s.v0 * s.t + 0.5 * s.a * s.t * s.t;

createTool({
  state,
  label: 'A graph of velocity against time: a straight line from v-zero with slope a. The area under it up to time t is split into a rectangle of height v-zero and a triangle on top.',
  setup: (stage, c) => createPlot(stage, { x: [0, 9], y: [0, 32], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    plot.shade(() => state.v0, null, 0, state.t, c.fillB);
    plot.shade((t) => v(state, t), () => state.v0, 0, state.t, c.fillA);
    plot.fn((t) => v(state, t), { color: c.ink });
    plot.text('v₀t', state.t / 2, state.v0 / 2, { patch: false });
    plot.point(state.t, v(state, state.t));
  },
  controls: [
    { title: 'The v–t line' },
    { key: 'v0', label: 'Initial velocity v₀ (m/s)', min: 0, max: 5, step: 0.5 },
    { key: 'a', label: 'Acceleration a (m/s²)', min: 0, max: 3, step: 0.5 },
    { key: 't', label: 'Time t (s)', min: 1, max: 8, step: 0.5 },
    { readout: [
      ['Rectangle v₀t', (s) => fixed(s.v0 * s.t, 2)],
      ['Triangle ½at²', (s) => fixed(0.5 * s.a * s.t * s.t, 2)],
      ['Distance x', (s) => `${fixed(x(s), 2)} m`],
      ['v² − v₀²  |  2ax', (s) => `${fixed(v(s, s.t) ** 2 - s.v0 ** 2, 2)}  |  ${fixed(2 * s.a * x(s), 2)}`],
    ] },
  ],
  tex: (s) => `x=v_0t+\\tfrac12at^2=${fixed(x(s), 2)}\\ \\mathrm{m}`,
});
