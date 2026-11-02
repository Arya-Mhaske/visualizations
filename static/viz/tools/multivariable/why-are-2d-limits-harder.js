import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';

// In one variable there are two ways to reach a point (left, right). In the plane there are infinitely many paths.
// A limit exists only if every path gives the same answer.
const FNS = {
  a: { name: 'xy / (x² + y²)', f: (x, y) => (x * y) / (x * x + y * y), tex: '\\frac{xy}{x^2+y^2}', line: (m) => m / (1 + m * m), par: (m) => (m * 0) },
  b: { name: 'x²y / (x⁴ + y²)', f: (x, y) => (x * x * y) / (x ** 4 + y * y), tex: '\\frac{x^2y}{x^4+y^2}', line: () => 0, par: (m) => m / (1 + m * m) },
  c: { name: 'x³ / (x² + y²)', f: (x, y) => x ** 3 / (x * x + y * y), tex: '\\frac{x^3}{x^2+y^2}', line: () => 0, par: () => 0 },
};
const state = { fn: 'a', path: 'line', m: 1 };
const point = (t, m, path) => (path === 'line' ? [t, m * t] : [t, m * t * t]);

createTool({
  state,
  label: 'A graph of the function value against the distance t along a path into the origin. The thick line is the chosen path and the thin lines are other paths of the same kind. If they level off at different heights, the two-variable limit does not exist.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [-1.1, 1.1], c }),
  draw(ctx, stage, c, plot) {
    const F = FNS[state.fn].f;
    plot.axes({ xLabel: 't', yLabel: 'f' });
    [-2, -1, 0, 1, 2].forEach((m) => plot.fn((t) => F(...point(Math.max(t, 1e-4), m, state.path)), { color: c.grid, domain: [0.002, 1] }));
    plot.fn((t) => F(...point(Math.max(t, 1e-4), state.m, state.path)), { color: c.a, domain: [0.002, 1] });
    plot.text(`path ${state.path === 'line' ? 'y = m x' : 'y = m x²'}, m = ${state.m}`, 0.5, 1, { size: 11 });
  },
  controls: [
    { title: 'Approach the origin' },
    { key: 'fn', label: 'Function', options: Object.entries(FNS).map(([k, v]) => [k, v.name]) },
    { key: 'path', label: 'Path', options: [['line', 'Straight line'], ['par', 'Parabola']] },
    { key: 'm', label: 'Path shape, m', min: -3, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['f at t = 0.01', (s) => FNS[s.fn].f(...point(0.01, s.m, s.path)).toFixed(3)],
      ['f at t = 0.001', (s) => FNS[s.fn].f(...point(0.001, s.m, s.path)).toFixed(3)],
      ['Limit along this path', (s) => (s.path === 'line' ? FNS[s.fn].line(s.m) : FNS[s.fn].par(s.m)).toFixed(3)],
    ] },
  ],
  tex: (s) => `\\lim_{(x,y)\\to(0,0)}${FNS[s.fn].tex}`,
});
