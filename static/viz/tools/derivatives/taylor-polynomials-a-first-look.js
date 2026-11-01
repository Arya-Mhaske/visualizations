import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const FN = {
  ex: { name: 'eˣ', f: Math.exp, p1: (x) => 1 + x, p2: (x) => 1 + x + x * x / 2, tex2: '1+x+\\tfrac{x^2}{2}', view: [-2.5, 2.5, -1, 6] },
  cos: { name: 'cos x', f: Math.cos, p1: () => 1, p2: (x) => 1 - x * x / 2, tex2: '1-\\tfrac{x^2}{2}', view: [-3, 3, -2, 2] },
  ln: { name: 'ln(1+x)', f: (x) => Math.log(1 + x), p1: (x) => x, p2: (x) => x - x * x / 2, tex2: 'x-\\tfrac{x^2}{2}', view: [-0.9, 2.5, -2.5, 1.5] },
  rt: { name: '√(1+x)', f: (x) => Math.sqrt(1 + x), p1: (x) => 1 + x / 2, p2: (x) => 1 + x / 2 - x * x / 8, tex2: '1+\\tfrac{x}{2}-\\tfrac{x^2}{8}', view: [-0.9, 3, -0.5, 2.5] },
};
const state = { fn: 'ex', quad: true, x: 1 };
const F = () => FN[state.fn];

createTool({
  state,
  label: 'A function with its tangent line at zero in blue and, when switched on, its tangent parabola in coral. The parabola hugs the curve over a wider range than the line does. A marker at x reports the error of each.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-2, 6], c }),
  draw(ctx, stage, c, plot) {
    const { f, p1, p2, view } = F();
    plot.setRange([view[0], view[1]], [view[2], view[3]]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(f, { color: c.ink, width: 4, domain: [view[0], view[1]] });
    plot.fn(p1, { color: c.b, width: 3 });
    if (state.quad) plot.fn(p2, { color: c.a, width: 3 });
    plot.segment(state.x, f(state.x), state.x, p1(state.x), { color: c.b, width: 3, dash: [3, 3] });
    plot.point(state.x, f(state.x), { fill: c.fillY, r: 7 });
  },
  controls: [
    { title: 'Beat the tangent line' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'quad', label: 'Add the x² term', toggle: true },
    { key: 'x', label: 'x', min: -0.8, max: 2.4, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['Function', (s) => fixed(F().f(s.x), 5)],
      ['Line error', (s) => fixed(F().p1(s.x) - F().f(s.x), 5)],
      ['Parabola error', (s) => ({ text: fixed(F().p2(s.x) - F().f(s.x), 5), good: Math.abs(F().p2(s.x) - F().f(s.x)) < Math.abs(F().p1(s.x) - F().f(s.x)) })],
    ] },
  ],
  tex: (s) => `f(x)\\approx ${F().tex2}`,
});
