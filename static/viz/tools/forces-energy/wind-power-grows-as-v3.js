import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';

const state = { v: 8, r: 20 };
const P = (s, v = s.v) => 0.5 * 1.2 * Math.PI * s.r * s.r * v ** 3;

createTool({
  state,
  label: 'Wind power against wind speed: a cubic curve that rises steeply. Markers show the chosen speed and double that speed.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 20], [0, P(state, 20) / 1e6 * 1.05]);
    plot.axes({ xLabel: 'wind speed v (m/s)', yLabel: 'power (MW)' });
    plot.fn((v) => P(state, v) / 1e6, { color: c.b });
    plot.point(state.v, P(state) / 1e6, { fill: c.a });
    if (state.v * 2 <= 20) plot.point(state.v * 2, P(state, state.v * 2) / 1e6, { fill: c.c });
  },
  controls: [
    { title: 'The turbine' },
    { key: 'v', label: 'Wind speed v (m/s)', min: 2, max: 20, step: 1 },
    { key: 'r', label: 'Blade radius (m)', min: 5, max: 50, step: 5 },
    { readout: [
      ['Power ½ρAv³', (s) => `${sig(P(s) / 1e6, 3)} MW`],
      ['At double the speed', (s) => `${sig(P(s, 2 * s.v) / 1e6, 3)} MW`],
      ['Ratio', (s) => `×${sig(P(s, 2 * s.v) / P(s), 3)}`],
    ] },
  ],
  tex: (s) => `P=\\tfrac12\\rho Av^3=\\tfrac12\\times1.2\\times\\pi\\times${s.r}^2\\times${s.v}^3=${sig(P(s) / 1e6, 3)}\\ \\mathrm{MW}`,
});
