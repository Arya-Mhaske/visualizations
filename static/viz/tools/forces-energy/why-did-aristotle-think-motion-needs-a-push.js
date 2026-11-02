import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { G } from '../../lib/quick.js';
import { fixed } from '../../lib/format.js';

const SURF = [['Carpet', 0.5], ['Wood', 0.2], ['Ice', 0.03], ['No friction', 0]];
const state = { v0: 3 };
const speed = (mu, t) => Math.max(0, state.v0 - mu * G * t);
const dist = (mu) => (mu ? state.v0 ** 2 / (2 * mu * G) : Infinity);

createTool({
  state,
  label: 'Speed against time for a toy car let go on four surfaces. It stops soonest on carpet, later on wood, much later on ice, and never on a frictionless surface.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 6], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 12], [0, 6]);
    plot.axes({ xLabel: 't (s)', yLabel: 'v (m/s)' });
    [c.a, c.b, c.c, c.ink].forEach((col, i) => plot.fn((t) => speed(SURF[i][1], t), { color: col, dash: i === 3 ? [6, 5] : [] }));
  },
  controls: [
    { title: 'Give it a push' },
    { key: 'v0', label: 'Push speed (m/s)', min: 1, max: 6, step: 0.5 },
    { readout: SURF.map(([name, mu]) => [`${name}: travels`, () => (mu ? `${fixed(dist(mu), 1)} m` : 'forever')]) },
  ],
  tex: (s) => `d=\\dfrac{v_0^2}{2\\mu g}\\quad(\\mu\\to0:\\ d\\to\\infty)`,
});
