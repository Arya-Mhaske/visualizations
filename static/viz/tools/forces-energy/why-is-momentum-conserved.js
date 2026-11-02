import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { m1: 2, m2: 3, v1: 4, v2: -1, F: 6, t: 1 };
const T_END = 2;
const imp = (s, t) => s.F * Math.min(t, T_END);
const p1 = (s, t) => s.m1 * s.v1 - imp(s, t);
const p2 = (s, t) => s.m2 * s.v2 + imp(s, t);

createTool({
  state,
  label: 'Momentum of each cart against time while they push on each other. One falls and the other rises by the same amount, and the total stays flat.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [-10, 10], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 3], [-12, 14]);
    plot.axes({ xLabel: 't (s)', yLabel: 'p (kg m/s)' });
    plot.fn((t) => p1(state, t), { color: c.a });
    plot.fn((t) => p2(state, t), { color: c.b });
    plot.fn((t) => p1(state, t) + p2(state, t), { color: c.ink, dash: [6, 5] });
    plot.segment(state.t, -12, state.t, 14, { color: c.grid, width: 1 });
  },
  controls: [
    { title: 'Two carts push (for the first 2 s)' },
    { key: 'm1', label: 'Mass 1 (kg)', min: 1, max: 5, step: 1 },
    { key: 'm2', label: 'Mass 2 (kg)', min: 1, max: 5, step: 1 },
    { key: 'F', label: 'Force F (N)', min: 0, max: 10, step: 1 },
    { key: 't', label: 'Time (s)', min: 0, max: 3, step: 0.1 },
    { readout: [
      ['p₁', (s) => fixed(p1(s, s.t), 2)],
      ['p₂', (s) => fixed(p2(s, s.t), 2)],
      ['p₁ + p₂', (s) => fixed(p1(s, s.t) + p2(s, s.t), 2)],
      ['Impulses', (s) => `−${fixed(imp(s, s.t), 1)} and +${fixed(imp(s, s.t), 1)}`],
    ] },
  ],
  tex: (s) => `\\Delta p_1=-F\\Delta t,\\ \\Delta p_2=+F\\Delta t\\ \\Rightarrow\\ p_1+p_2=${fixed(s.m1 * s.v1 + s.m2 * s.v2, 2)}`,
});
