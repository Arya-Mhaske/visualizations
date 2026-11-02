import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { G } from '../../lib/quick.js';

const state = { mus: 0.15, m: 20, a: 1 };
const need = (s) => s.m * s.a;
const lim = (s) => s.mus * s.m * G;

createTool({
  state,
  label: 'Friction needed to keep the box with the train against the train acceleration. The needed friction rises along a line until it hits the maximum static friction, a horizontal line.',
  setup: (stage, c) => createPlot(stage, { x: [0, 4], y: [0, 120], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'train a (m/s²)', yLabel: 'friction (N)' });
    plot.fn((a) => state.m * a, { color: c.b });
    plot.segment(0, lim(state), 4, lim(state), { color: c.a, width: 3 });
    plot.point(state.a, Math.min(need(state), 118), { fill: c.c });
  },
  controls: [
    { title: 'The train' },
    { key: 'mus', label: 'μₛ', min: 0.05, max: 0.5, step: 0.05 },
    { key: 'm', label: 'Mass of box (kg)', min: 5, max: 40, step: 5 },
    { key: 'a', label: 'Train acceleration (m/s²)', min: 0, max: 4, step: 0.1 },
    { readout: [
      ['Friction needed', (s) => `${fixed(need(s), 1)} N`],
      ['Largest friction', (s) => `${fixed(lim(s), 1)} N`],
      ['Largest a = μₛg', (s) => `${fixed(s.mus * G, 2)} m/s²`],
      ['Box', (s) => (need(s) <= lim(s) ? 'stays put' : 'slips')],
    ] },
  ],
  tex: (s) => `a_{\\max}=\\mu_sg=${s.mus}\\times9.8=${fixed(s.mus * G, 2)}\\ \\mathrm{m/s^2}`,
});
