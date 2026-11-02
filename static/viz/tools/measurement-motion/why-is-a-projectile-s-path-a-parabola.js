import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { fitPath } from '../../lib/quick.js';
import { G, rad, range, peak } from './_proj.js';

const state = { v: 20, th: 45 };
const k = (s) => G / (2 * s.v * s.v * Math.cos(rad(s.th)) ** 2);
const y = (s, x) => x * Math.tan(rad(s.th)) - k(s) * x * x;

createTool({
  state,
  label: 'The path of a projectile drawn as a smooth arch, which is a parabola given by y equals x tan theta minus k x squared.',
  setup: (stage, c) => createPlot(stage, { x: [0, 45], y: [0, 25], c }),
  draw(ctx, stage, c, plot) {
    fitPath(plot, stage, range(state.v, state.th), peak(state.v, state.th));
    plot.axes({ xLabel: 'x (m)', yLabel: 'y (m)' });
    plot.fn((x) => y(state, x), { color: c.b, domain: [0, range(state.v, state.th)] });
  },
  controls: [
    { title: 'Launch' },
    { key: 'v', label: 'Speed v (m/s)', min: 5, max: 30, step: 1 },
    { key: 'th', label: 'Angle θ (°)', min: 5, max: 85, step: 5 },
    { readout: [
      ['tan θ', (s) => fixed(Math.tan(rad(s.th)), 3)],
      ['k = g/(2v²cos²θ)', (s) => fixed(k(s), 4)],
    ] },
  ],
  tex: (s) => `y=${fixed(Math.tan(rad(s.th)), 3)}x-${fixed(k(s), 4)}x^2`,
});
