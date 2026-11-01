import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { rupee } from './_exp-log-math.js';

const state = { FV: 100000, r: 8, t: 10, n: 12 };
const growth = (s) => (1 + s.r / 100 / s.n) ** s.n;
const pv = (s) => s.FV / growth(s) ** s.t;

createTool({
  state,
  label: 'A growth curve that starts at the amount you invest today, the present value, and climbs to the target amount you want at the end. Move the target, rate or time and the starting point slides to show how much you need to put in now.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 100000], c, pad: 32 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, state.t], [0, state.FV * 1.08]);
    plot.axes({ xLabel: 'years from now', yLabel: '₹' });
    plot.fn((x) => pv(state) * growth(state) ** x, { color: c.a, width: 4 });
    plot.segment(0, state.FV, state.t, state.FV, { color: c.b, width: 2, dash: [6, 5] });
    plot.point(0, pv(state), { fill: c.fillY, r: 9 });
    plot.point(state.t, state.FV, { fill: c.b, r: 9 });
  },
  controls: [
    { title: 'Work backwards' },
    { key: 'FV', label: 'Amount wanted later', min: 10000, max: 1000000, step: 10000, format: rupee },
    { key: 'r', label: 'Yearly rate', min: 1, max: 20, step: 1, format: (v) => `${v}%` },
    { key: 't', label: 'Years', min: 1, max: 30, step: 1 },
    { key: 'n', label: 'Compounded', options: [[1, 'Yearly'], [4, 'Quarterly'], [12, 'Monthly']] },
    { readout: [
      ['Invest today', (s) => ({ text: rupee(pv(s)), good: true })],
      ['Interest earned', (s) => rupee(s.FV - pv(s))],
      ['Share that is interest', (s) => `${fixed(((s.FV - pv(s)) / s.FV) * 100, 0)}%`],
    ] },
  ],
  tex: (s) => `PV=\\dfrac{FV}{(1+r/n)^{nt}}=\\dfrac{${s.FV}}{(1+${s.r / 100}/${s.n})^{${s.n * s.t}}}=${Math.round(pv(s))}`,
});
