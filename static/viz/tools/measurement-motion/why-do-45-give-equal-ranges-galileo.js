import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { fitPath } from '../../lib/quick.js';
import { G, rad, range, peak, flightTime } from './_proj.js';

const state = { v: 20, al: 20 };
const arc = (th, x) => x * Math.tan(rad(th)) - (G * x * x) / (2 * state.v ** 2 * Math.cos(rad(th)) ** 2);

createTool({
  state,
  label: 'Two projectile paths launched at forty-five degrees minus alpha and forty-five degrees plus alpha. Both land at the same place, but the steeper path goes higher.',
  setup: (stage, c) => createPlot(stage, { x: [0, 42], y: [0, 22], c }),
  draw(ctx, stage, c, plot) {
    const [lo, hi] = [45 - state.al, 45 + state.al];
    fitPath(plot, stage, range(state.v, 45), peak(state.v, hi));
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    plot.fn((x) => arc(lo, x), { color: c.b, domain: [0, range(state.v, lo)] });
    plot.fn((x) => arc(hi, x), { color: c.a, domain: [0, range(state.v, hi)] });
    plot.point(range(state.v, lo), 0, { fill: c.c, r: 7 });
  },
  controls: [
    { title: 'Two angles' },
    { key: 'v', label: 'Speed v (m/s)', min: 10, max: 30, step: 1 },
    { key: 'al', label: 'Angle α from 45° (°)', min: 0, max: 40, step: 5 },
    { readout: [
      ['Range at 45° − α', (s) => `${fixed(range(s.v, 45 - s.al), 2)} m`],
      ['Range at 45° + α', (s) => `${fixed(range(s.v, 45 + s.al), 2)} m`],
      ['Height  lower | higher', (s) => `${fixed(peak(s.v, 45 - s.al), 1)} | ${fixed(peak(s.v, 45 + s.al), 1)} m`],
      ['Time  lower | higher', (s) => `${fixed(flightTime(s.v, 45 - s.al), 2)} | ${fixed(flightTime(s.v, 45 + s.al), 2)} s`],
    ] },
  ],
  tex: (s) => `\\sin(90^\\circ\\mp2\\alpha)=\\cos2\\alpha=${fixed(Math.cos(rad(2 * s.al)), 3)}`,
});
