import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_is.js';

// Sₙ(x) = 1 + x + … + xⁿ = (1 − xⁿ⁺¹)/(1 − x). The only thing that can go wrong is xⁿ⁺¹, and it dies only if |x| < 1.
const state = { n: 6, x: 0.5 };
const S = (n, x) => (x === 1 ? n + 1 : (1 - x ** (n + 1)) / (1 - x));
const f = (x) => 1 / (1 - x);

createTool({
  state,
  label: 'The curve 1 over 1 minus x in black and the polynomial made from the first terms of its series in coral. They hug each other between minus 1 and 1 and separate outside.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 2], y: [-5, 5], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(() => 5, () => -5, -1, 1, c.fillC);
    plot.fn(f, { color: c.ink, width: 3 });
    plot.fn((x) => S(state.n, x), { color: c.a, width: 3 });
    plot.segment(state.x, -5, state.x, 5, { color: c.b, width: 2, dash: [5, 4] });
    plot.point(state.x, Math.max(-5, Math.min(5, S(state.n, state.x))), { fill: c.a });
    plot.point(state.x, Math.max(-5, Math.min(5, f(state.x))), { fill: c.ink, r: 4 });
  },
  controls: [
    { title: 'Add terms, move x' },
    { key: 'n', label: 'Highest power n', min: 0, max: 30, step: 1 },
    { key: 'x', label: 'x', min: -1.9, max: 1.9, step: 0.05, format: (v) => v.toFixed(2).replace('-', '−') },
    { readout: [
      ['1/(1 − x)', () => num(f(state.x), 4)],
      ['Sₙ(x)', () => num(S(state.n, state.x), 4)],
      ['xⁿ⁺¹', () => num(state.x ** (state.n + 1), 4)],
      ['Inside |x| < 1?', () => (Math.abs(state.x) < 1 ? { text: 'yes: xⁿ⁺¹ → 0', good: true } : { text: 'no: xⁿ⁺¹ does not shrink', good: false })],
    ] },
  ],
  tex: (s) => `S_{${s.n}}(x)=\\frac{1-x^{${s.n + 1}}}{1-x}`,
});
