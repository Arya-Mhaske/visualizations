import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2, ts: 4 };
const ship = (s, t) => 0.5 * s.a * t * t;
const man = (s, t) => (t <= s.ts ? ship(s, t) : ship(s, s.ts) + s.a * s.ts * (t - s.ts));

createTool({
  state,
  label: 'Position against time for a ship that keeps accelerating, a curve, and an astronaut who steps off at the chosen time and then moves along a straight line.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 10], [0, ship(state, 10) * 1.05]);
    plot.axes({ xLabel: 't (s)', yLabel: 'position (m)' });
    plot.fn((t) => ship(state, t), { color: c.b });
    plot.fn((t) => man(state, t), { color: c.a });
    plot.point(state.ts, ship(state, state.ts), { fill: c.c, r: 7 });
  },
  controls: [
    { title: 'Step out' },
    { key: 'a', label: 'Ship acceleration (m/s²)', min: 1, max: 5, step: 0.5 },
    { key: 'ts', label: 'Steps off at t = (s)', min: 1, max: 9, step: 1 },
    { readout: [
      ['Astronaut speed after', (s) => `${fixed(s.a * s.ts, 1)} m/s, constant`],
      ['Ship speed at 10 s', (s) => `${fixed(s.a * 10, 1)} m/s`],
      ['Gap at 10 s', (s) => `${fixed(ship(s, 10) - man(s, 10), 1)} m`],
    ] },
  ],
  tex: (s) => `v=at_s=${fixed(s.a * s.ts, 1)}\\ \\mathrm{m/s}\\ \\text{(no force, no change)}`,
});
