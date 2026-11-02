import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { v: 15, a: 6 };
const dist = (v, a) => (v * v) / (2 * a);

createTool({
  state,
  label: 'Stopping distance against starting speed: a curve that rises like a square. Markers show the chosen speed and double that speed.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 160], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'v₀ (m/s)', yLabel: 'stopping distance (m)' });
    plot.fn((v) => dist(v, state.a), { color: c.b });
    [11, 15, 20, 25].forEach((v) => plot.point(v, dist(v, state.a), { fill: c.c, r: 4 }));
    plot.point(state.v, dist(state.v, state.a), { fill: c.a });
    if (state.v * 2 <= 30) plot.point(state.v * 2, dist(state.v * 2, state.a), { fill: c.a });
  },
  controls: [
    { title: 'Brake from speed v₀' },
    { key: 'v', label: 'Speed v₀ (m/s)', min: 5, max: 30, step: 1 },
    { key: 'a', label: 'Braking a (m/s²)', min: 3, max: 10, step: 0.5 },
    { readout: [
      ['Stopping distance', (s) => `${fixed(dist(s.v, s.a), 1)} m`],
      ['At double the speed', (s) => `${fixed(dist(2 * s.v, s.a), 1)} m`],
      ['Ratio', (s) => `×${fixed(dist(2 * s.v, s.a) / dist(s.v, s.a), 2)}`],
    ] },
  ],
  tex: (s) => `x=\\dfrac{v_0^2}{2a}=\\dfrac{${s.v}^2}{2\\times${s.a}}=${fixed(dist(s.v, s.a), 1)}\\ \\mathrm{m}`,
});
