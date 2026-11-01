import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { SLABS, tax, marginalRate, averageTaxRate } from './_properties-library-math.js';

const state = { income: 14 };
const rupees = (lakh) => `₹${Math.round(lakh * 100000).toLocaleString('en-IN')}`;

createTool({
  state,
  label: 'A graph of income tax against income, both in lakh rupees. The graph is made of straight pieces, each steeper than the last, with a bend at the start of every slab. A dot shows your income and the tax on it.',
  setup: (stage, c) => createPlot(stage, { x: [0, 30], y: [0, 5.2], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ grid: true, xLabel: 'income (₹ lakh)', yLabel: 'tax (₹ lakh)' });
    SLABS.forEach(([lo, hi, rate], i) => {
      const end = Math.min(hi, 30);
      plot.fn(tax, { color: [c.grid, c.b, c.c, c.d, c.a, c.b, c.c][i], width: 5, domain: [lo, end] });
      if (lo > 0) plot.segment(lo, 0, lo, tax(lo), { color: c.grid, width: 1, dash: [4, 4] });
      if (rate && lo > 0) plot.text(`${rate}%`, (lo + end) / 2, tax((lo + end) / 2) - 0.45, { size: 10, patch: false });
    });
    plot.segment(state.income, 0, state.income, tax(state.income), { color: c.a, width: 2, dash: [5, 4] });
    plot.point(state.income, tax(state.income), { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Enter an income' },
    { key: 'income', label: 'Income', min: 0, max: 30, step: 0.5, format: (n) => `₹${fixed(n, 1)} lakh` },
    { readout: [
      ['Tax', (s) => rupees(tax(s.income))],
      ['Average rate', (s) => `${fixed(averageTaxRate(s.income), 1)}%`],
      ['Rate on the next rupee', (s) => `${marginalRate(s.income)}%`],
      ['Income after tax', (s) => rupees(s.income - tax(s.income))],
    ] },
  ],
  tex: (s) => `T(${fixed(s.income, 1)})=${fixed(tax(s.income), 3)}\\text{ lakh},\\quad \\text{slope}=${marginalRate(s.income) / 100}`,
});
