import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2, ts: 3 };
const train = (s, t) => 0.5 * s.a * t * t;
const stone = (s, t) => (t <= s.ts ? train(s, t) : train(s, s.ts) + s.a * s.ts * (t - s.ts));

createTool({
  state,
  label: 'Horizontal position against time for the accelerating train, a curve, and for the stone, which follows the train until release and then moves along a straight line.',
  setup: (stage, c) => createPlot(stage, { x: [0, 8], y: [0, 70], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 8], [0, train(state, 8) * 1.05]);
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn((t) => train(state, t), { color: c.b });
    plot.fn((t) => stone(state, t), { color: c.a });
    plot.point(state.ts, train(state, state.ts), { fill: c.c, r: 7 });
  },
  controls: [
    { title: 'Drop the stone' },
    { key: 'a', label: 'Train acceleration (m/s²)', min: 0.5, max: 4, step: 0.5 },
    { key: 'ts', label: 'Released at t = (s)', min: 1, max: 6, step: 0.5 },
    { readout: [
      ['Sideways speed after release', (s) => `${fixed(s.a * s.ts, 1)} m/s, constant`],
      ['Horizontal force on stone', () => '0 N'],
      ['Train ahead of stone at 8 s', (s) => `${fixed(train(s, 8) - stone(s, 8), 1)} m`],
    ] },
  ],
  tex: (s) => `F_x=0\\ \\Rightarrow\\ a_x=0,\\quad v_x=${fixed(s.a * s.ts, 1)}\\ \\mathrm{m/s}`,
});
