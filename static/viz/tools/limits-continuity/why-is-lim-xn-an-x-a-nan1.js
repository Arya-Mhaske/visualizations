import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { n: 4, a: 1.5, k: 2 };
const q = (s, x) => (x ** s.n - s.a ** s.n) / (x - s.a);
// the second factor: x^(n-1) + x^(n-2) a + ... + a^(n-1)
const second = (s, x) => Array.from({ length: s.n }, (_, i) => x ** (s.n - 1 - i) * s.a ** i).reduce((u, v) => u + v, 0);
const target = (s) => s.n * s.a ** (s.n - 1);
const h = (s = state) => 1 / 10 ** s.k;

createTool({
  state,
  label: 'The graph of x to the n minus a to the n, all over x minus a, which has a hole at x equal to a. The top factors as x minus a times a sum of n terms, so the fraction equals that sum everywhere except at x equal to a. The sum is a polynomial, so at x equal to a each of its n terms is a to the n minus 1, and the limit is n times a to the n minus 1.',
  setup: (stage, c) => createPlot(stage, { x: [0, 3], y: [0, 40], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 3], [0, Math.max(10, target(state) * 1.6)]);
    plot.axes();
    plot.fn((x) => q(state, x), { color: c.a, width: 4 });
    plot.fn((x) => second(state, x), { color: c.c, width: 2, dash: [6, 5] });
    plot.point(state.a, target(state), { fill: c.paper, r: 8 });
    plot.point(state.a + h(), q(state, state.a + h()), { fill: c.b, r: 6 });
  },
  controls: [
    { title: 'Choose n and a' },
    { key: 'n', label: 'Power, n', min: 2, max: 8, step: 1 },
    { key: 'a', label: 'Point, a', min: 0.5, max: 2, step: 0.5 },
    { key: 'k', label: 'Distance from a, h = 10⁻ᵏ', min: 1, max: 6, step: 1, format: (v) => fixed(1 / 10 ** v, 6) },
    { readout: [
      ['Fraction at a + h', (s) => fixed(q(s, s.a + h(s)), 5)],
      ['n·aⁿ⁻¹', (s) => ({ text: fixed(target(s), 5), good: true })],
      ['Number of terms in the sum', (s) => `${s.n}, each aⁿ⁻¹ = ${fixed(s.a ** (s.n - 1), 4)}`],
    ] },
  ],
  tex: (s) => `\\dfrac{x^{${s.n}}-a^{${s.n}}}{x-a}=x^{${s.n - 1}}+\\cdots+a^{${s.n - 1}}\\ \\to\\ ${s.n}\\cdot ${s.a}^{${s.n - 1}}=${fixed(target(s), 4)}`,
});
