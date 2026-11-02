import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { k: 200, x: 0.2 };

createTool({
  state,
  label: 'A graph of the spring force against stretch: a straight line from the origin. The triangle under the line up to the stretch is the stored energy.',
  setup: (stage, c) => createPlot(stage, { x: [0, 0.4], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 0.42], [0, 0.42 * state.k * 1.05]);
    plot.axes({ xLabel: 'x (m)', yLabel: 'F (N)' });
    plot.shade((x) => state.k * x, null, 0, state.x, c.fillA);
    plot.fn((x) => state.k * x, { color: c.ink });
    plot.point(state.x, state.k * state.x);
  },
  controls: [
    { title: 'Stretch the spring' },
    { key: 'k', label: 'Spring constant k (N/m)', min: 50, max: 400, step: 10 },
    { key: 'x', label: 'Stretch x (m)', min: 0.02, max: 0.4, step: 0.02 },
    { readout: [
      ['Force at x', (s) => `${fixed(s.k * s.x, 1)} N`],
      ['Triangle ½ × x × kx', (s) => `${fixed(0.5 * s.x * s.k * s.x, 2)} J`],
    ] },
  ],
  tex: (s) => `U=\\tfrac12kx^2=\\tfrac12\\times${s.k}\\times${s.x}^2=${fixed(0.5 * s.k * s.x * s.x, 2)}\\ \\mathrm{J}`,
});
