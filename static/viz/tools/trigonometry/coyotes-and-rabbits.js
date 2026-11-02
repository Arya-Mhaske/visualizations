import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { predator, prey } from './_waves-math.js';

const SPAN = 36;
const state = { P: 12, lag: 0.25, t: 6 };
const R = (t) => prey(t, state.P, 1000, 400);
const Y = (t) => predator(t, state.P, 200, 80, state.lag);

createTool({
  state,
  label: 'Two stacked graphs over 36 months. Top: the number of rabbits as a sine wave. Bottom: the number of coyotes as a sine wave that peaks a fraction of a cycle later. A vertical line at the chosen month reads both.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [0, SPAN], y: [500, 1500], c, pad: 24, box: (g) => ({ x: 0, y: 0, w: g.w, h: g.h * 0.5 }) }),
    low: createPlot(stage, { x: [0, SPAN], y: [100, 300], c, pad: 24, box: (g) => ({ x: 0, y: g.h * 0.5, w: g.w, h: g.h * 0.5 }) }),
  }),
  draw(ctx, stage, c, p) {
    p.top.axes({ xLabel: 'month', yLabel: 'rabbits' });
    p.top.fn(R, { color: c.b, width: 4 });
    p.top.segment(state.t, 500, state.t, 1500, { color: c.grid, width: 1 });
    p.top.point(state.t, R(state.t), { fill: c.b });
    p.low.axes({ xLabel: 'month', yLabel: 'coyotes' });
    p.low.fn(Y, { color: c.a, width: 4 });
    p.low.segment(state.t, 100, state.t, 300, { color: c.grid, width: 1 });
    p.low.point(state.t, Y(state.t), { fill: c.a });
  },
  controls: [
    { title: 'Made-up numbers' },
    { key: 'P', label: 'Cycle length, P', min: 8, max: 18, step: 1, format: (n) => `${n} months` },
    { key: 'lag', label: 'Coyotes trail by', min: 0, max: 0.5, step: 0.05, format: (n) => `${fixed(n, 2)} of a cycle` },
    { key: 't', label: 'Month, t', min: 0, max: SPAN, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Rabbits', (s) => fixed(R(s.t), 0)],
      ['Coyotes', (s) => fixed(Y(s.t), 0)],
      ['Coyotes peak later by', (s) => `${fixed(s.lag * s.P, 1)} months`],
    ] },
  ],
  tex: (s) => `C(t)=200+80\\sin\\dfrac{2\\pi}{${s.P}}\\big(t-${fixed(s.lag * s.P, 1)}\\big)`,
});
