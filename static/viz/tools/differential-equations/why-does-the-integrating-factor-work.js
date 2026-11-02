import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { productRate } from './_separable-math.js';

// y' + p y = q. Multiply by e^{kx}: the product rule says (e^{kx} y)' = e^{kx}(y' + k y) = e^{kx}(q + (k − p) y).
// That is the plain right side e^{kx} q only when k = p. That choice of multiplier is the integrating factor.
const state = { k: 0.5, p: 1, q: 3, y0: 0 };
const X_END = 2;
const gap = (s) => {
  let worst = 0;
  for (let i = 0; i <= 100; i++) {
    const x = (X_END * i) / 100;
    worst = Math.max(worst, Math.abs(productRate(s.k, s.p, s.q, s.y0, x) - Math.exp(s.k * x) * s.q));
  }
  return worst;
};

createTool({
  state,
  label: 'Two curves against x. The solid curve is the derivative of e to the k x times y, found by the product rule. The dashed curve is e to the k x times q, the right side of the equation after multiplying. The shaded gap between them closes to nothing exactly when the multiplier exponent k equals p. That multiplier is the integrating factor.',
  setup: (stage, c) => createPlot(stage, { x: [0, X_END], y: [0, 20], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    const left = (x) => productRate(state.k, state.p, state.q, state.y0, x);
    const right = (x) => Math.exp(state.k * x) * state.q;
    const top = Math.max(left(X_END), right(X_END), left(0), right(0), 1) * 1.15;
    plot.setRange([0, X_END], [Math.min(0, left(0), left(X_END)) * 1.1, top]);
    plot.axes({ xLabel: 'x', yLabel: 'rate' });
    plot.shade(left, right, 0, X_END, c.fillY);
    plot.fn(right, { color: c.b, width: 4, dash: [7, 5] });
    plot.fn(left, { color: c.a, width: 4 });
    plot.text('(e^(kx)·y)′', X_END * 0.62, top * 0.9, { size: 11, color: c.a, patch: false });
    plot.text('e^(kx)·q', X_END * 0.62, top * 0.8, { size: 11, color: c.b, patch: false });
  },
  controls: [
    { title: 'Choose a multiplier' },
    { key: 'k', label: 'Multiply the equation by e^(kx), k', min: 0, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'p', label: 'Equation y′ + p·y = q, p', min: 0.5, max: 1.5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'q', label: 'q', min: 1, max: 4, step: 1, format: (n) => `${n}` },
    { key: 'y0', label: 'Starting value y(0)', min: 0, max: 4, step: 1, format: (n) => `${n}` },
    { readout: [
      ['k − p', (s) => fixed(s.k - s.p, 2)],
      ['Biggest gap between the curves', (s) => ({ text: fixed(gap(s), 3), good: gap(s) < 1e-9 })],
      ['Exact left side?', (s) => ({ text: s.k === s.p ? 'yes: the left side is a product rule' : 'no', good: s.k === s.p })],
    ] },
  ],
  tex: (s) => `\\left(e^{${fixed(s.k, 2)}x}y\\right)'=e^{${fixed(s.k, 2)}x}\\bigl(q+(k-p)\\,y\\bigr),\\quad k-p=${fixed(s.k - s.p, 2)}`,
});
