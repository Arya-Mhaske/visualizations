import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { rule: 0, step: 1 };
const RULES = [
  { name: 'y = 2x + 1 (equal steps in y)', f: (x) => 2 * x + 1 },
  { name: 'y = x² (growing steps in y)', f: (x) => x * x },
  { name: 'y = 2ˣ (doubling steps in y)', f: (x) => 2 ** x },
];
const xs = (s = state) => Array.from({ length: 6 }, (_, i) => i * s.step);
const ys = (s = state) => xs(s).map(RULES[s.rule].f);
const diffs = (s = state) => ys(s).slice(1).map((y, i) => y - ys(s)[i]);
const slopes = (s = state) => diffs(s).map((d) => d / s.step);
const constant = (s = state) => slopes(s).every((m) => Math.abs(m - slopes(s)[0]) < 1e-9);

createTool({
  state,
  label: 'Points from a table with x going up in equal steps. Between each pair of neighbouring points a small triangle shows the step in x and the step in y. If every step in y is the same, the slopes of all the pieces are equal and the points lie on one straight line. If the steps in y grow, the pieces get steeper and the points bend away from a line.',
  setup: (stage, c) => createPlot(stage, { x: [-0.5, 6], y: [-2, 34], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const X = xs();
    const Y = ys();
    plot.segment(X[0], Y[0], X[5], Y[0] + (Y[5] - Y[0]), { color: c.grid, width: 2, dash: [5, 4] });
    X.forEach((x, i) => {
      if (i) {
        plot.segment(X[i - 1], Y[i - 1], x, Y[i - 1], { color: c.b, width: 3 });
        plot.segment(x, Y[i - 1], x, Y[i], { color: c.a, width: 3 });
        plot.segment(X[i - 1], Y[i - 1], x, Y[i], { color: c.ink, width: 3 });
      }
    });
    X.forEach((x, i) => plot.point(x, Y[i], { fill: c.fillY, r: 6 }));
  },
  controls: [
    { title: 'Fill a table' },
    { key: 'rule', label: 'Rule', min: 0, max: RULES.length - 1, step: 1, format: (n) => RULES[n].name },
    { key: 'step', label: 'Step in x', min: 0.5, max: 1.5, step: 0.5 },
    { readout: [
      ['y values', (s) => ys(s).map((y) => fixed(y, 1)).join(', ')],
      ['Steps in y', (s) => diffs(s).map((d) => fixed(d, 1)).join(', ')],
      ['Slopes', (s) => slopes(s).map((m) => fixed(m, 2)).join(', ')],
      ['All equal?', (s) => ({ text: constant(s) ? 'yes: a straight line' : 'no: it bends', good: constant(s) })],
    ] },
  ],
  tex: (s) => (constant(s) ? `\\dfrac{\\Delta y}{\\Delta x}=${fixed(slopes(s)[0], 2)}\\ \\text{every time}` : `\\dfrac{\\Delta y}{\\Delta x}=${slopes(s).slice(0, 3).map((m) => fixed(m, 2)).join(',\\ ')},\\dots\\ \\text{keeps changing}`),
});
