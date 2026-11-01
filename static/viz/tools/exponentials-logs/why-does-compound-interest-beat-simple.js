import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { rupee } from './_exp-log-math.js';

const state = { P: 10000, r: 8, t: 25 };
const simple = (s, x) => s.P * (1 + (s.r / 100) * x);
const compound = (s, x) => s.P * (1 + s.r / 100) ** x;

createTool({
  state,
  label: 'Money over time under simple interest, a straight line, and under yearly compound interest, a curve that bends upward. The shaded gap between them is the interest that was earned on earlier interest, and it grows faster the longer you wait.',
  setup: (stage, c) => createPlot(stage, { x: [0, 25], y: [0, 70000], c, pad: 32 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, state.t], [0, Math.max(compound(state, state.t), simple(state, state.t)) * 1.08]);
    plot.axes({ xLabel: 'years', yLabel: '₹' });
    plot.shade((x) => compound(state, x), (x) => simple(state, x), 0, state.t, c.fillY);
    plot.fn((x) => simple(state, x), { color: c.b, width: 4 });
    plot.fn((x) => compound(state, x), { color: c.a, width: 4 });
    plot.point(state.t, compound(state, state.t), { fill: c.a, r: 8 });
    plot.point(state.t, simple(state, state.t), { fill: c.b, r: 8 });
  },
  controls: [
    { title: 'Invest and wait' },
    { key: 'P', label: 'Principal', min: 1000, max: 100000, step: 1000, format: rupee },
    { key: 'r', label: 'Yearly rate', min: 1, max: 20, step: 1, format: (v) => `${v}%` },
    { key: 't', label: 'Years', min: 1, max: 40, step: 1 },
    { readout: [
      ['Simple interest', (s) => rupee(simple(s, s.t))],
      ['Compound interest', (s) => rupee(compound(s, s.t))],
      ['Interest on interest', (s) => rupee(compound(s, s.t) - simple(s, s.t))],
    ] },
  ],
  tex: (s) => `P(1+r)^t=${s.P}(${1 + s.r / 100})^{${s.t}}=${Math.round(compound(s, s.t))}\\qquad P(1+rt)=${Math.round(simple(s, s.t))}`,
});
