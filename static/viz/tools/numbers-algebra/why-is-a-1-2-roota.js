import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 4, m: 1, n: 2 };
const x = (s = state) => s.m / s.n;

createTool({
  state,
  label: 'The graph of a to the power x, with a point at x equal to m over n. The exponent law that adds exponents says a to the half, times a to the half, equals a to the one, which is a. So a to the half squared is a, which is exactly what the square root of a is. In the same way a to the 1 over n multiplied n times is a, and a to the m over n is the nth root of a, raised to the power m.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 3], y: [0, 12], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((t) => state.a ** t, { color: c.a, width: 4 });
    const v = state.a ** x();
    plot.segment(x(), 0, x(), v, { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(x(), v, { fill: c.fillY, r: 9 });
    plot.point(2 * x(), state.a ** (2 * x()), { fill: c.b, r: 6 });
  },
  controls: [
    { title: 'Choose an exponent m/n' },
    { key: 'a', label: 'Base, a', min: 2, max: 9, step: 1 },
    { key: 'm', label: 'Numerator, m', min: 1, max: 6, step: 1 },
    { key: 'n', label: 'Denominator, n', min: 1, max: 6, step: 1 },
    { readout: [
      ['a^(m/n)', (s) => fixed(s.a ** x(s), 5)],
      ['(ⁿ√a)ᵐ', (s) => fixed((s.a ** (1 / s.n)) ** s.m, 5)],
      ['ⁿ√(aᵐ)', (s) => fixed((s.a ** s.m) ** (1 / s.n), 5)],
      ['(a^(m/n))ⁿ = aᵐ', (s) => ({ text: `${fixed((s.a ** x(s)) ** s.n, 3)} = ${s.a ** s.m}`, good: true })],
    ] },
  ],
  tex: (s) => `\\left(${s.a}^{1/${s.n}}\\right)^{${s.n}}=${s.a}^{1}=${s.a}\\ \\Rightarrow\\ ${s.a}^{1/${s.n}}=\\sqrt[${s.n}]{${s.a}}`,
});
