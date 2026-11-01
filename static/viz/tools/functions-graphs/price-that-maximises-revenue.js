import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Made-up demand: q = q0 − m·p customers per day buy at price p rupees.
const state = { q0: 200, m: 4, p: 20 };
const q = (s, p) => Math.max(0, s.q0 - s.m * p);
const rev = (s, p) => p * q(s, p);
const best = (s) => s.q0 / (2 * s.m);

createTool({
  state,
  label: 'Revenue against price for a shop whose number of customers falls as the price rises. Revenue is the price times the number of customers, which is a parabola in the price: a low price sells a lot at little each, and a high price sells to few. A marker shows your chosen price. The best price is at the vertex of the parabola, halfway between a free item and the price at which nobody buys.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [0, 2800], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const top = state.q0 / state.m;
    plot.setRange([0, top * 1.05], [0, rev(state, best(state)) * 1.2]);
    plot.axes({ xLabel: 'price (₹)', yLabel: 'revenue' });
    plot.fn((p) => rev(state, p), { color: c.a, width: 4, domain: [0, top] });
    plot.segment(state.p, 0, state.p, rev(state, state.p), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(state.p, rev(state, state.p), { fill: c.fillY, r: 9 });
    plot.point(best(state), rev(state, best(state)), { fill: c.c, r: 6 });
  },
  controls: [
    { title: 'Set the price' },
    { key: 'p', label: 'Price', min: 0, max: 50, step: 1, format: (v) => `₹${v}` },
    { key: 'q0', label: 'Customers at price 0', min: 100, max: 300, step: 20 },
    { key: 'm', label: 'Customers lost per ₹1 rise', min: 2, max: 8, step: 1 },
    { readout: [
      ['Customers', (s) => `${q(s, s.p)}`],
      ['Revenue', (s) => `₹${fixed(rev(s, s.p), 0)}`],
      ['Best price', (s) => ({ text: `₹${fixed(best(s), 1)}`, good: Math.abs(s.p - best(s)) < 0.5 })],
    ] },
  ],
  tex: (s) => `R=p(${s.q0}-${s.m}p)\\ \\Rightarrow\\ p_{\\text{best}}=\\dfrac{${s.q0}}{2\\cdot${s.m}}=${fixed(best(s), 1)}`,
});
