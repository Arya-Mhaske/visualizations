import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { effective } from './_exp-log-math.js';

const state = { r: 12, n: 12 };
const balance = (s, k) => 100 * (1 + s.r / 100 / s.n) ** k;

createTool({
  state,
  label: 'The balance of 100 rupees through one year at a quoted yearly rate. A straight line is simple interest. The coral path pays interest n times and each payment starts earning at once, so the path ends higher than the line. The gap at year end is why the effective rate is above the quoted rate.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [100, 120], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    const end = balance(state, state.n);
    plot.setRange([0, 1], [100, Math.max(end, 100 + state.r) + (state.r / 100 + 0.04) * 8]);
    plot.axes({ xLabel: 'year', yLabel: '₹' });
    plot.segment(0, 100, 1, 100 + state.r, { color: c.b, width: 4 });
    for (let k = 0; k < state.n; k++) plot.segment(k / state.n, balance(state, k), (k + 1) / state.n, balance(state, k + 1), { color: c.a, width: 4 });
    for (let k = 1; k <= Math.min(state.n, 12); k++) plot.point(k / state.n, balance(state, k), { fill: c.fillY, r: 4 });
    plot.point(1, end, { fill: c.a, r: 8 });
    plot.point(1, 100 + state.r, { fill: c.b, r: 8 });
  },
  controls: [
    { title: 'Quote a rate' },
    { key: 'r', label: 'Quoted rate per year', min: 1, max: 40, step: 1, format: (v) => `${v}%` },
    { key: 'n', label: 'Interest paid', options: [[1, 'Yearly'], [2, '2×'], [4, '4×'], [12, 'Monthly'], [365, 'Daily']] },
    { readout: [
      ['Year-end balance', (s) => `₹${fixed(balance(s, s.n), 2)}`],
      ['Effective rate', (s) => ({ text: `${fixed(effective(s.r / 100, s.n) * 100, 2)}%`, good: true })],
      ['Extra over quoted', (s) => `${fixed((effective(s.r / 100, s.n) - s.r / 100) * 100, 2)} points`],
    ] },
  ],
  tex: (s) => `\\left(1+\\dfrac{${s.r / 100}}{${s.n}}\\right)^{${s.n}}-1=${fixed(effective(s.r / 100, s.n) * 100, 2)}\\%`,
});
