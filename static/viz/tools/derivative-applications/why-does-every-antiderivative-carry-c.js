import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { tangent, num } from './_da.js';

// Curves F(x) + C all have the same slope at the same x, because adding a constant slides a curve straight up without tilting it.
const FN = {
  lin: { name: 'f(x) = 2x   →  F = x² + C', f: (x) => 2 * x, F: (x) => x * x, x: [-3, 3], y: [-4, 10] },
  cos: { name: 'f(x) = cos x   →  F = sin x + C', f: Math.cos, F: Math.sin, x: [-6, 6], y: [-5, 5] },
  cub: { name: 'f(x) = 3x² − 1   →  F = x³ − x + C', f: (x) => 3 * x * x - 1, F: (x) => x ** 3 - x, x: [-2.5, 2.5], y: [-8, 8] },
  exp: { name: 'f(x) = eˣ   →  F = eˣ + C', f: Math.exp, F: Math.exp, x: [-3, 3], y: [-3, 10] },
};
const state = { fn: 'lin', C: 1, p: 65 };
const K = () => FN[state.fn];
const X = () => K().x[0] + (state.p / 100) * (K().x[1] - K().x[0]);
const Cs = [-3, -2, -1, 0, 1, 2, 3];

createTool({
  state,
  label: 'A family of curves, each the same shape shifted up or down. One is highlighted. Short tangent segments at one chosen x on every curve all point in the same direction.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-4, 10], c }),
  draw(ctx, stage, c, plot) {
    const k = K();
    plot.setRange(k.x, k.y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    for (const C of Cs) plot.fn((x) => k.F(x) + C, { color: c.grid, width: 2 });
    const x = X();
    for (const C of Cs) tangent(plot, x, k.F(x) + C, k.f(x), (k.x[1] - k.x[0]) * 0.07, c.b, 3);
    plot.fn((t) => k.F(t) + state.C, { color: c.a, width: 4 });
    plot.segment(x, k.y[0], x, k.y[1], { color: c.ink, width: 1.5, dash: [4, 4] });
    plot.point(x, k.F(x) + state.C, { fill: c.a });
  },
  controls: [
    { title: 'Slide the curve' },
    { key: 'fn', label: 'Slope rule f', options: Object.entries(FN).map(([k, v]) => [k, v.name.split('   →')[0]]) },
    { key: 'C', label: 'Constant C', min: -3, max: 3, step: 0.25, format: (v) => v.toFixed(2).replace('-', '−') },
    { key: 'p', label: 'Look at x =', min: 0, max: 100, step: 1, format: (v) => (K().x[0] + (v / 100) * (K().x[1] - K().x[0])).toFixed(2).replace('-', '−') },
    { readout: [
      ['Antiderivatives', () => K().name.split('   →  ')[1]],
      ['Slope of F + C at this x', () => num(K().f(X()), 4)],
      ['Slope of F + C + 2 at this x', () => num(K().f(X()), 4)],
      ['Height of the highlighted curve', () => num(K().F(X()) + state.C, 4)],
    ] },
  ],
  tex: () => '\\frac{d}{dx}\\big(F(x)+C\\big)=F\'(x)=f(x)\\quad\\text{for every constant } C',
});
