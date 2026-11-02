import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { m: 1000, v: 25, k: 156250, mu: 0.3 };
const ke = (s) => 0.5 * s.m * s.v * s.v;
const fric = (s) => s.mu * s.m * G;
function comp(s) {
  const a = 0.5 * s.k;
  const b = fric(s);
  return (-b + Math.sqrt(b * b + 4 * a * ke(s))) / (2 * a);
}

createTool({
  state,
  label: 'Energy against spring compression: the energy stored in the spring plus the energy lost to friction, rising until it equals the starting kinetic energy, which fixes the compression.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 400000], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 3], [0, Math.max(ke(state) * 1.4, 1)]);
    plot.axes({ xLabel: 'compression x (m)', yLabel: 'energy (J)' });
    plot.segment(0, ke(state), 3, ke(state), { color: c.ink, width: 2, dash: [5, 4] });
    plot.fn((x) => 0.5 * state.k * x * x + fric(state) * x, { color: c.b });
    plot.fn((x) => 0.5 * state.k * x * x, { color: c.c, dash: [4, 4] });
    plot.point(comp(state), ke(state), { fill: c.a });
  },
  controls: [
    { title: 'The crash' },
    { key: 'm', label: 'Car mass (kg)', min: 500, max: 2000, step: 100 },
    { key: 'v', label: 'Speed (m/s)', min: 10, max: 35, step: 1 },
    { key: 'k', label: 'Spring constant k (N/m)', min: 50000, max: 400000, step: 10000 },
    { key: 'mu', label: 'Friction μₖ', min: 0, max: 0.8, step: 0.05 },
    { readout: [
      ['Starting KE', (s) => `${fixed(ke(s) / 1000, 1)} kJ`],
      ['Compression', (s) => `${fixed(comp(s), 2)} m`],
      ['Without friction', (s) => `${fixed(Math.sqrt((s.m * s.v * s.v) / s.k), 2)} m`],
    ] },
  ],
  tex: (s) => `\\tfrac12mv^2=\\tfrac12kx^2+fx\\ \\Rightarrow\\ x=${fixed(comp(s), 2)}\\ \\mathrm{m}`,
});
