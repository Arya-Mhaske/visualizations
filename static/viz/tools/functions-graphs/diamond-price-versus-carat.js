import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { expFit, rSquared } from './_modelling-math.js';

// Illustrative numbers only: bigger stones cost disproportionately more. This is not a real price list.
const DATA = [[0.3, 700], [0.5, 1500], [0.7, 2700], [1, 5200], [1.2, 7600], [1.5, 12000], [2, 24000], [2.5, 41000]];
const state = { carat: 1.8 };
const E = expFit(DATA);
const model = (x) => E.A * E.base ** x;

createTool({
  state,
  label: 'Eight made-up diamond prices against weight in carats, with an exponential model fitted through them: price equals A times b to the power carat. A marker reads the model price for any weight you choose. The prices grow by roughly the same factor for each extra carat, which is why an exponential fits better than a line.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 50000], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'carats', yLabel: '₹' });
    plot.fn(model, { color: c.a, width: 4 });
    DATA.forEach(([x, y]) => plot.point(x, y, { fill: c.b, r: 6 }));
    plot.segment(state.carat, 0, state.carat, model(state.carat), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(state.carat, model(state.carat), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Read a price off the model' },
    { key: 'carat', label: 'Weight', min: 0.2, max: 2.8, step: 0.05, format: (v) => `${v.toFixed(2)} carats` },
    { readout: [
      ['Model price', (s) => `₹${fixed(model(s.carat), 0)}`],
      ['Growth per carat', () => `×${fixed(E.base, 2)}`],
      ['R² of the exponential', () => ({ text: fixed(rSquared(DATA, model), 4), good: true })],
    ] },
  ],
  tex: (s) => `P=${fixed(E.A, 0)}\\,(${fixed(E.base, 2)})^{c}\\ \\Rightarrow\\ P(${s.carat.toFixed(2)})=${fixed(model(s.carat), 0)}`,
});
