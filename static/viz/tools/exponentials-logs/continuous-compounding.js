import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

const state = { P: 10000, r: 8, t: 10, n: 1 };
const rupee = (x) => `₹${Math.round(x).toLocaleString('en-IN')}`;
const amount = (s, t = s.t) => s.P * (1 + s.r / 100 / s.n) ** (s.n * t);
const continuous = (s, t = s.t) => s.P * Math.exp((s.r / 100) * t);

createTool({
  state,
  label: 'A graph of money growing over time. The coral curve compounds n times a year and the blue dashed curve compounds continuously. As n grows the coral curve climbs and settles onto the blue one, which is P times e to the r t.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 30000], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, state.t], [state.P * 0.8, continuous(state) * 1.05]);
    plot.axes({ xLabel: 'years', yLabel: '₹' });
    plot.fn((x) => continuous(state, x), { color: c.b, width: 4, dash: [8, 5] });
    plot.fn((x) => amount(state, x), { color: c.a, width: 4 });
    plot.point(state.t, amount(state), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Compound more often' },
    { key: 'P', label: 'Principal P', min: 1000, max: 100000, step: 1000, format: rupee },
    { key: 'r', label: 'Rate r', min: 1, max: 20, step: 1, format: (v) => `${v}%` },
    { key: 't', label: 'Time t', min: 1, max: 30, step: 1, format: (v) => `${v} years` },
    { key: 'n', label: 'Compounded per year, n', options: [[1, '1'], [4, '4'], [12, '12'], [365, '365'], [100000, 'many']] },
    { readout: [
      ['With n steps', (s) => rupee(amount(s))],
      ['Continuous, Peʳᵗ', (s) => rupee(continuous(s))],
      ['Still missing', (s) => rupee(continuous(s) - amount(s))],
    ] },
  ],
  tex: (s) => `A=P\\left(1+\\tfrac{r}{n}\\right)^{nt}=${s.P}\\left(1+\\tfrac{${s.r / 100}}{${s.n}}\\right)^{${s.n * s.t}}=${Math.round(amount(s))}\\ \\to\\ Pe^{rt}=${Math.round(continuous(s))}`,
});
