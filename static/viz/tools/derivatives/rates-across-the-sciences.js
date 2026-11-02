import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { tangent, num } from '../derivative-applications/_da.js';

// One idea, four names: a rate of change is the slope of a quantity against another quantity.
// Numbers are made up for illustration.
const K = {
  charge: { name: 'Charge on a capacitor', xl: 't (s)', yl: 'Q (mC)', x: [0, 10], y: [0, 11], Q: (t) => 10 * (1 - Math.exp(-t / 2)), D: (t) => 5 * Math.exp(-t / 2), rate: 'Current I = dQ/dt', unit: 'mA', say: 'Charge is flowing in at this rate; the current falls as the capacitor fills.' },
  reaction: { name: 'A reactant being used up', xl: 't (s)', yl: '[A] (mol/L)', x: [0, 12], y: [0, 1.1], Q: (t) => Math.exp(-0.3 * t), D: (t) => -0.3 * Math.exp(-0.3 * t), rate: 'Reaction rate = −d[A]/dt', unit: 'mol/L/s', flip: true, say: 'The rate is the slope with its sign flipped. It is proportional to how much A is left.' },
  cost: { name: 'Cost of making q items', xl: 'q (items)', yl: 'C (₹)', x: [0, 200], y: [0, 7000], Q: (q) => 500 + 20 * q + 0.05 * q * q, D: (q) => 20 + 0.1 * q, rate: 'Marginal cost C′(q)', unit: '₹ per item', say: 'About the cost of making one more item.' },
  pop: { name: 'A population with limited room', xl: 't (years)', yl: 'P (people)', x: [0, 25], y: [0, 1100], Q: (t) => 1000 / (1 + 19 * Math.exp(-0.4 * t)), D: (t) => { const P = 1000 / (1 + 19 * Math.exp(-0.4 * t)); return 0.4 * P * (1 - P / 1000); }, rate: 'Growth rate dP/dt', unit: 'people per year', say: 'Slow at first, fastest at half the carrying capacity, then slow again.' },
};
const state = { kind: 'charge', x: 2 };
const S = () => K[state.kind];
const xAt = () => S().x[0] + (state.x / 100) * (S().x[1] - S().x[0]);

createTool({
  state,
  label: 'A curve of some quantity against time or number of items, with a tangent at a chosen point. The tangent slope is the rate named in the readout.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 10], c }),
  draw(ctx, stage, c, plot) {
    const s = S();
    plot.setRange(s.x, s.y);
    plot.axes({ xLabel: s.xl, yLabel: s.yl });
    plot.fn(s.Q, { color: c.ink, width: 3 });
    const x = xAt();
    tangent(plot, x, s.Q(x), s.D(x), (s.x[1] - s.x[0]) * 0.12, c.a, 3);
    plot.point(x, s.Q(x), { fill: c.a });
  },
  controls: [
    { title: 'Pick a situation' },
    { key: 'kind', label: 'Quantity', options: Object.entries(K).map(([k, v]) => [k, v.name]) },
    { key: 'x', label: 'Where along the curve', min: 0, max: 100, step: 1, format: (v) => `${v}%` },
    { readout: [
      ['Value', () => num(S().Q(xAt()), 4)],
      ['Slope dQ/dx', () => num(S().D(xAt()), 4)],
      ['Called', () => S().rate],
      ['Value of that rate', () => `${num(S().flip ? -S().D(xAt()) : S().D(xAt()), 4)} ${S().unit}`],
      ['Meaning', () => S().say],
    ] },
  ],
  tex: () => '\\text{rate}=\\frac{dQ}{dx}=\\lim_{h\\to0}\\frac{Q(x+h)-Q(x)}{h}',
});
