import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FNS = [
  { name: '2x + 1', f: (x) => 2 * x + 1, inv: (y) => (y - 1) / 2, xs: [-2.5, 2.5] },
  { name: 'x³', f: (x) => x ** 3, inv: Math.cbrt, xs: [-1.9, 1.9] },
  { name: 'eˣ', f: Math.exp, inv: (y) => (y > 0 ? Math.log(y) : NaN), xs: [-2.5, 2.2] },
  { name: 'x² (x ≥ 0)', f: (x) => x * x, inv: (y) => (y < 0 ? NaN : Math.sqrt(y)), xs: [0, 2.6] },
];
const state = { which: 0, n: 3 };
const F = (s = state) => FNS[s.which];
const pts = (s) => Array.from({ length: s.n }, (_, i) => F(s).xs[0] + ((F(s).xs[1] - F(s).xs[0]) * (s.n === 1 ? 0.5 : i / (s.n - 1))));

createTool({
  state,
  label: 'The graph of a function in coral, the dashed line y equals x, and the graph of its inverse in blue. A function takes an input a to an output b. Its inverse takes b back to a. So every point (a, b) on the graph of f has a partner point (b, a) on the graph of the inverse, which is its mirror image in the line y equals x. Pairs of points are marked and joined, and more pairs fill in the inverse.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-6, 6], [-6, 6]);
    plot.axes();
    plot.segment(-6, -6, 6, 6, { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn(F().f, { color: c.a, width: 4, domain: F().xs.map((v, i) => (i ? v + 1.5 : v - 1.5)) });
    plot.fn(F().inv, { color: c.b, width: 4 });
    pts(state).forEach((a) => {
      const b = F().f(a);
      plot.segment(a, b, b, a, { color: c.grid, width: 1 });
      plot.point(a, b, { fill: c.a, r: 7 });
      plot.point(b, a, { fill: c.b, r: 7 });
    });
  },
  controls: [
    { title: 'Swap the coordinates' },
    { key: 'which', label: 'Function', min: 0, max: FNS.length - 1, step: 1, format: (v) => FNS[v].name },
    { key: 'n', label: 'Pairs of points', min: 1, max: 9, step: 1 },
    { readout: [
      ['A point on f', (s) => { const a = pts(s)[0]; return `(${fixed(a, 2)}, ${fixed(F(s).f(a), 2)})`; }],
      ['Its partner on the inverse', (s) => { const a = pts(s)[0]; return `(${fixed(F(s).f(a), 2)}, ${fixed(a, 2)})`; }],
      ['f⁻¹(f(a)) = a?', (s) => ({ text: pts(s).every((a) => Math.abs(F(s).inv(F(s).f(a)) - a) < 1e-9) ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: () => '(a,\\ b)\\ \\text{on}\\ f\\iff(b,\\ a)\\ \\text{on}\\ f^{-1}',
});
