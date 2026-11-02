import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { leftSum, midSum, trapSum, simpSum, num } from '../integral-applications/_ia.js';

// Four rules on one integral. The log–log plot shows each rule's order: the slope is −1 (left), −2 (mid, trapezoid), −4 (Simpson).
const FN = {
  exp: { name: '∫₀² eˣ dx', f: Math.exp, a: 0, b: 2, ex: Math.exp(2) - 1 },
  sin: { name: '∫₀^π sin x dx = 2', f: Math.sin, a: 0, b: Math.PI, ex: 2 },
  rat: { name: '∫₀¹ 4/(1 + x²) dx = π', f: (x) => 4 / (1 + x * x), a: 0, b: 1, ex: Math.PI },
  root: { name: '∫₀¹ √x dx  (rough at 0)', f: Math.sqrt, a: 0, b: 1, ex: 2 / 3 },
};
const state = { fn: 'exp', n: 8 };
const K = () => FN[state.fn];
const exact = () => K().ex;
const rules = [['Left', leftSum, 'a'], ['Midpoint', midSum, 'b'], ['Trapezoid', trapSum, 'c'], ['Simpson', simpSum, 'd']];
const err = (R, n) => Math.abs(R(K().f, K().a, K().b, n) - exact());

createTool({
  state,
  label: 'Log of the error against log of the number of pieces for four rules. Steeper falling lines are better rules. A marker shows the chosen number of pieces.',
  setup: (stage, c) => createPlot(stage, { x: [0, 7], y: [-12, 1], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'log₂ n', yLabel: 'log₁₀ error' });
    for (const [, R, col] of rules) {
      for (let p = 1; p <= 7; p++) plot.point(p, Math.max(-12, Math.log10(Math.max(err(R, 2 ** p), 1e-14))), { fill: c[col], r: 4 });
      const pts = [1, 7].map((p) => [p, Math.max(-12, Math.log10(Math.max(err(R, 2 ** p), 1e-14)))]);
      plot.segment(pts[0][0], pts[0][1], pts[1][0], pts[1][1], { color: c[col], width: 2 });
    }
    plot.segment(Math.log2(state.n), -12, Math.log2(state.n), 1, { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Run the four rules' },
    { key: 'fn', label: 'Integral', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Pieces n', min: 2, max: 128, step: 2 },
    { readout: [
      ['Exact value', () => num(exact(), 8)],
      ...rules.map(([name, R]) => [name, () => `${num(R(K().f, K().a, K().b, state.n), 7)}  (err ${num(err(R, state.n), 2)})`]),
    ] },
  ],
  tex: () => '\\text{left, midpoint, trapezoid, Simpson on one integral}',
});
