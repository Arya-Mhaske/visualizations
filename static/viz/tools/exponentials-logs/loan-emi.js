import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { emi, balanceAfter, rupee } from './_exp-log-math.js';

const state = { P: 1000000, r: 9, y: 10, k: 1 };
const months = (s) => s.y * 12;
const pay = (s) => emi(s.P, s.r / 100, months(s));
const bal = (s, k) => balanceAfter(s.P, s.r / 100, months(s), k);
const interestPart = (s, k) => bal(s, k - 1) * (s.r / 1200);

createTool({
  state,
  label: 'The balance still owed on a loan as the months go by, falling to zero, together with the total interest paid so far. Every EMI is the same, but early on most of it is interest and later most of it pays off the principal. A month slider splits any single EMI into its two parts.',
  setup: (stage, c) => createPlot(stage, { x: [0, 120], y: [0, 1500000], c, pad: 34 }),
  draw(ctx, stage, c, plot) {
    const m = months(state);
    const total = pay(state) * m;
    plot.setRange([0, m], [0, Math.max(total, state.P) * 1.05]);
    plot.axes({ xLabel: 'months', yLabel: '₹' });
    plot.segment(0, total, m, total, { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn((x) => bal(state, x), { color: c.b, width: 4 });
    plot.fn((x) => pay(state) * x - (state.P - bal(state, x)), { color: c.a, width: 4 });
    const k = Math.min(state.k, m);
    plot.segment(k, 0, k, Math.max(total, state.P) * 1.05, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(k, bal(state, k), { fill: c.b, r: 7 });
    plot.text('balance owed', m * 0.45, bal(state, m * 0.45) + total * 0.07, { color: c.b, size: 10, patch: false });
    plot.text('interest paid so far', m * 0.55, pay(state) * m * 0.55 - (state.P - bal(state, m * 0.55)) - total * 0.08, { color: c.a, size: 10, patch: false });
  },
  controls: [
    { title: 'Borrow money' },
    { key: 'P', label: 'Loan amount', min: 100000, max: 5000000, step: 50000, format: rupee },
    { key: 'r', label: 'Yearly rate', min: 1, max: 20, step: 0.5, format: (v) => `${fixed(v, 1)}%` },
    { key: 'y', label: 'Tenure', min: 1, max: 30, step: 1, format: (v) => `${v} years` },
    { key: 'k', label: 'Look at month', min: 1, max: 360, step: 1 },
    { readout: [
      ['EMI', (s) => ({ text: rupee(pay(s)), good: true })],
      ['Total interest', (s) => rupee(pay(s) * months(s) - s.P)],
      ['Total paid', (s) => rupee(pay(s) * months(s))],
      ['Month: interest part', (s) => rupee(interestPart(s, Math.min(s.k, months(s))))],
      ['Month: principal part', (s) => rupee(pay(s) - interestPart(s, Math.min(s.k, months(s))))],
    ] },
  ],
  tex: (s) => `EMI=\\dfrac{P\\,i\\,(1+i)^{m}}{(1+i)^{m}-1},\\ \\ i=${(s.r / 1200).toFixed(5)},\\ m=${months(s)}\\ \\Rightarrow\\ ${Math.round(pay(s))}`,
});
