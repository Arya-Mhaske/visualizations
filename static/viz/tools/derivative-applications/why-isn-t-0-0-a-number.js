import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sci, fixed } from '../../lib/format.js';

const state = { k: 1 };
const x = (s) => 10 ** -s.k;
const R = [
  ['x² ÷ x', (t) => t, 'a'],
  ['5x ÷ x', () => 5, 'b'],
  ['x ÷ x²', (t) => 1 / t, 'c'],
];

createTool({
  state,
  label: 'Three ratios that all look like zero over zero when x is zero: x squared over x, 5x over x, and x over x squared. A slider moves x toward 0. The first ratio heads to 0, the second stays at 5 and the third grows without bound, so the form 0 over 0 has no single value.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-1, 10], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 1], [-0.5, 10]);
    plot.axes({ xLabel: 'x', yLabel: 'ratio' });
    plot.fn((t) => t, { color: c.a, width: 4, domain: [0.001, 1] });
    plot.fn(() => 5, { color: c.b, width: 4, domain: [0.001, 1] });
    plot.fn((t) => 1 / t, { color: c.c, width: 4, domain: [0.001, 1] });
    const t = x(state);
    plot.segment(t, -0.5, t, 10, { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(t, t, { fill: c.a, r: 7 });
    plot.point(t, 5, { fill: c.b, r: 7 });
    if (1 / t <= 10) plot.point(t, 1 / t, { fill: c.c, r: 7 });
    plot.text('x²/x', 0.9, 0.8, { size: 10, color: c.a });
    plot.text('5x/x', 0.9, 5.7, { size: 10, color: c.b });
    plot.text('x/x²', 0.25, 8.4, { size: 10, color: c.c });
  },
  controls: [
    { title: 'Squeeze x towards 0' },
    { key: 'k', label: 'x = 10 to the power −k', min: 0, max: 6, step: 0.5, format: (v) => `x = ${sci(10 ** -v, 2)}` },
    { readout: [
      ['x² ÷ x', (s) => ({ text: sci(x(s), 3), good: false })],
      ['5x ÷ x', (s) => fixed(5, 1)],
      ['x ÷ x²', (s) => ({ text: sci(1 / x(s), 3), good: false })],
    ] },
  ],
  tex: () => '\\dfrac{x^2}{x}\\to0,\\qquad \\dfrac{5x}{x}\\to5,\\qquad \\dfrac{x}{x^2}\\to\\infty',
});
