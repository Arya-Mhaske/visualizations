import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { h: 25, v0: 20, t: 2 };
const y = (s, t) => s.h + s.v0 * t - 0.5 * G * t * t;
const land = (s) => (s.v0 + Math.sqrt(s.v0 * s.v0 + 2 * G * s.h)) / G;

createTool({
  state,
  label: 'Height against time for a ball thrown up from a roof: it rises, turns and falls to the ground, crossing zero at the landing time.',
  setup: (stage, c) => createPlot(stage, { x: [0, 7], y: [-5, 62], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 't (s)', yLabel: 'height (m)' });
    plot.fn((t) => y(state, t), { color: c.b, domain: [0, land(state)] });
    plot.point(land(state), 0, { fill: c.c, r: 8 });
    plot.point(state.t, y(state, state.t));
  },
  controls: [
    { title: 'Throw from the roof' },
    { key: 'h', label: 'Roof height h (m)', min: 0, max: 50, step: 5 },
    { key: 'v0', label: 'Upward speed v₀ (m/s)', min: 0, max: 25, step: 1 },
    { key: 't', label: 'Time t (s)', min: 0, max: 7, step: 0.1 },
    { readout: [
      ['Height now', (s) => `${fixed(y(s, Math.min(s.t, land(s))), 1)} m`],
      ['Lands at', (s) => `${fixed(land(s), 2)} s`],
      ['Highest point', (s) => `${fixed(s.h + (s.v0 * s.v0) / (2 * G), 1)} m`],
    ] },
  ],
  tex: (s) => `0=${s.h}+${s.v0}t-4.9t^2\\ \\Rightarrow\\ t=${fixed(land(s), 2)}\\ \\mathrm{s}`,
});
