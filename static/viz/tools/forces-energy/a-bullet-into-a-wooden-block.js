import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { m: 0.04, v: 90, d: 0.6 };
const a = (s) => (s.v * s.v) / (2 * s.d);

createTool({
  state,
  label: 'Speed of the bullet against depth in the block, falling from the entry speed to zero at the stopping distance.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1.2], y: [0, 200], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 1.2], [0, 200]);
    plot.axes({ xLabel: 'depth (m)', yLabel: 'v (m/s)' });
    plot.fn((x) => Math.sqrt(Math.max(0, state.v ** 2 - 2 * a(state) * x)), { color: c.b, domain: [0, state.d] });
    plot.point(state.d, 0, { fill: c.a, r: 7 });
  },
  controls: [
    { title: 'Stop the bullet' },
    { key: 'm', label: 'Mass (kg)', min: 0.01, max: 0.1, step: 0.01 },
    { key: 'v', label: 'Speed (m/s)', min: 20, max: 200, step: 10 },
    { key: 'd', label: 'Stopping distance (m)', min: 0.1, max: 1.2, step: 0.05 },
    { readout: [
      ['Deceleration a', (s) => `${fixed(a(s), 0)} m/s²`],
      ['Average force F = ma', (s) => `${fixed(s.m * a(s), 0)} N`],
      ['Stopping time', (s) => `${fixed((2 * s.d) / s.v * 1000, 2)} ms`],
    ] },
  ],
  tex: (s) => `F=\\dfrac{mv^2}{2d}=\\dfrac{${s.m}\\times${s.v}^2}{2\\times${s.d}}=${fixed(s.m * a(s), 0)}\\ \\mathrm{N}`,
});
