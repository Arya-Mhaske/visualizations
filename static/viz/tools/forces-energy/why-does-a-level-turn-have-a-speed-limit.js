import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { mus: 0.6, R: 50, v: 15 };
const vmax = (s) => Math.sqrt(s.mus * s.R * G);

createTool({
  state,
  label: 'Needed centripetal force per kilogram against speed, a rising curve, and a horizontal line for the most friction can give. They cross at the speed limit of the bend.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [0, 40], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'v (m/s)', yLabel: 'force per kg (N/kg)' });
    plot.fn((v) => (v * v) / state.R, { color: c.b });
    plot.segment(0, state.mus * G, 40, state.mus * G, { color: c.a, width: 3 });
    plot.segment(vmax(state), 0, vmax(state), 40, { color: c.c, width: 2, dash: [5, 4] });
    plot.point(state.v, (state.v ** 2) / state.R, { fill: state.v > vmax(state) ? c.a : c.c });
  },
  controls: [
    { title: 'The bend' },
    { key: 'mus', label: 'μₛ', min: 0.1, max: 1, step: 0.05 },
    { key: 'R', label: 'Radius R (m)', min: 10, max: 150, step: 5 },
    { key: 'v', label: 'Speed v (m/s)', min: 1, max: 40, step: 1 },
    { readout: [
      ['Needed v²/R', (s) => `${fixed(s.v ** 2 / s.R, 2)} N/kg`],
      ['Available μₛg', (s) => `${fixed(s.mus * G, 2)} N/kg`],
      ['Speed limit', (s) => `${fixed(vmax(s), 1)} m/s (${fixed(vmax(s) * 3.6, 0)} km/h)`],
      ['Car', (s) => (s.v <= vmax(s) ? 'holds the road' : 'skids outward')],
    ] },
  ],
  tex: (s) => `v_{\\max}=\\sqrt{\\mu_sRg}=${fixed(vmax(s), 1)}\\ \\mathrm{m/s}`,
});
