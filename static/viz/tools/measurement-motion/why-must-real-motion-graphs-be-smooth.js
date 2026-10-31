import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { kinkAcceleration, kinkX } from './_motion-in-a-straight-line-math.js';

const state = { power: 0, v1: 2, v2: -3 };             // the corner takes w = 10^power seconds
const MASS = 1000;
const width = (s) => 10 ** s.power;
const accel = (s) => kinkAcceleration(s.v1, s.v2, width(s));

createTool({
  state,
  label: 'A position graph with a corner, zoomed in. However far you zoom, a real corner stays curved, and a sharper corner needs a larger acceleration.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [-1, 1], c }),
  draw(ctx, stage, c, plot) {
    const zoom = 1.5 * width(state);
    const y0 = kinkX(state.v1, state.v2, width(state), 0);
    const reach = Math.max(Math.abs(state.v1), Math.abs(state.v2), 1) * zoom * 1.3;
    plot.setRange([-zoom, zoom], [y0 - reach, y0 + reach]);
    plot.axes({ xLabel: 't (s)', yLabel: 'x (m)' });
    plot.fn((t) => (t < 0 ? state.v1 * t : state.v2 * t), { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn((t) => kinkX(state.v1, state.v2, width(state), t), { color: c.a, width: 4 });
  },
  controls: [
    { title: 'Sharpen the corner' },
    { text: 'The change of velocity takes a time w. The picture zooms with it.' },
    { key: 'power', label: 'Corner time, w', min: -4, max: 0, step: 0.1, format: (v) => `${sig(10 ** v, 2)} s` },
    { key: 'v1', label: 'Velocity before', min: -5, max: 5, step: 1, format: (v) => `${v} m/s` },
    { key: 'v2', label: 'Velocity after', min: -5, max: 5, step: 1, format: (v) => `${v} m/s` },
    { readout: [
      ['Change in velocity', (s) => `${fixed(s.v2 - s.v1, 1)} m/s`],
      ['Acceleration needed', (s) => `${sig(accel(s), 3)} m/s²`],
      ['Force on a 1000 kg car', (s) => `${sig(Math.abs(accel(s)) * MASS, 3)} N`],
    ] },
  ],
  tex: (s) => `a = \\frac{\\Delta v}{w} = \\frac{${fixed(s.v2 - s.v1, 0).replace('−', '-')}}{${sig(width(s), 2).replace(' ×10', '\\times10')}} = ${fixed(accel(s), 0).replace('−', '-')}\\ \\text{m/s}^2`,
});
