import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { R: 5, v: 5, t: 3 };
const A = (s) => (s.v * s.v) / s.R;

createTool({
  state,
  label: 'Graph against time of the true speed, which stays constant; the speed the straight-line formula would predict, which grows; the constant size of the acceleration; and its x-component, which oscillates.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [-8, 40], c }),
  draw(ctx, stage, c, plot) {
    const a = A(state);
    const w = state.v / state.R;
    plot.setRange([0, 10], [-a - 1, state.v + a * 10 + 1]);
    plot.axes({ xLabel: 't (s)', yLabel: 'm/s  or  m/s²' });
    plot.fn((t) => state.v + a * t, { color: c.a, dash: [7, 5] });
    plot.fn(() => state.v, { color: c.b });
    plot.fn(() => a, { color: c.ink });
    plot.fn((t) => -a * Math.cos(w * t), { color: c.c });
    plot.point(state.t, state.v, { fill: c.b });
    plot.point(state.t, state.v + a * state.t, { fill: c.a });
  },
  controls: [
    { title: 'Go round' },
    { key: 'R', label: 'Radius R (m)', min: 2, max: 10, step: 1 },
    { key: 'v', label: 'Speed v (m/s)', min: 2, max: 10, step: 1 },
    { key: 't', label: 'Time t (s)', min: 0, max: 10, step: 0.5 },
    { readout: [
      ['|a| = v²/R (constant)', (s) => `${fixed(A(s), 2)} m/s²`],
      ['True speed', (s) => `${s.v} m/s`],
      ['Predicted by v₀ + at', (s) => `${fixed(s.v + A(s) * s.t, 1)} m/s`],
    ] },
  ],
  tex: (s) => `|a|=\\dfrac{v^2}{R}=${fixed(A(s), 2)}\\quad\\text{but}\\ v\\ne v_0+|a|t`,
});
