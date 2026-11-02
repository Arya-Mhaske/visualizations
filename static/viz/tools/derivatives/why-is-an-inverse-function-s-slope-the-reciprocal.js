import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, direction } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

const FUNCS = {
  cube: { name: 'x³', f: (x) => x ** 3, inv: Math.cbrt, d: (x) => 3 * x * x },
  exp: { name: 'eˣ', f: Math.exp, inv: Math.log, d: Math.exp },
  square: { name: 'x² (x ≥ 0)', f: (x) => x * x, inv: Math.sqrt, d: (x) => 2 * x },
};
const state = { which: 'cube', a: 1.2, mirror: true };
const point = (s) => { const g = FUNCS[s.which]; return [s.a, g.f(s.a)]; };

createTool({
  state,
  label: 'A function f and its inverse drawn on the same square axes, with the line y equals x between them. A tangent to f at a point P has some rise and run. Folding the picture along y equals x swaps rise and run, so the tangent to the inverse at the mirror point has the reciprocal slope.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 7], y: [-1, 7], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const g = FUNCS[state.which];
    const [a, b] = point(state);
    const m = g.d(a);
    plot.axes();
    plot.segment(-1, -1, 7, 7, { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn(g.f, { color: c.a, width: 4, domain: state.which === 'square' ? [0, 3] : [-1, 3] });
    direction(plot, a, b, 1, m, 0.8, { color: c.ink, width: 3 });
    plot.point(a, b, { fill: c.fillY });
    if (state.mirror) {
      plot.fn(g.inv, { color: c.b, width: 4, domain: [state.which === 'exp' ? 0.05 : 0, 7] });
      direction(plot, b, a, m, 1, 0.8, { color: c.ink, width: 3 });
      plot.segment(a, b, b, a, { color: c.grid, width: 2, dash: [3, 4] });
      plot.point(b, a, { fill: c.fillY });
    }
    // rise and run triangles: run 1, rise m on f; swapped on the inverse
    plot.segment(a, b, a + 1, b, { color: c.a, width: 3 });
    plot.segment(a + 1, b, a + 1, b + m, { color: c.a, width: 3 });
    if (state.mirror) {
      plot.segment(b, a, b, a + 1, { color: c.b, width: 3 });
      plot.segment(b, a + 1, b + m, a + 1, { color: c.b, width: 3 });
    }
  },
  controls: [
    { title: 'Fold along y = x' },
    { key: 'which', label: 'Function f', options: Object.entries(FUNCS).map(([key, v]) => [key, v.name]) },
    { key: 'a', label: 'Point a', min: 0.3, max: 1.9, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'mirror', label: 'Show the mirror image (the inverse)', toggle: true },
    { readout: [
      ['Slope of f at a', (s) => fixed(FUNCS[s.which].d(s.a), 4)],
      ['Slope of the inverse (measured)', (s) => fixed(deriv(FUNCS[s.which].inv, point(s)[1]), 4)],
      ['1 ÷ slope of f', (s) => ({ text: fixed(1 / FUNCS[s.which].d(s.a), 4), good: true })],
    ] },
  ],
  tex: (s) => `\\left(f^{-1}\\right)'(${fixed(point(s)[1], 2)})=\\dfrac{1}{f'(${fixed(s.a, 1)})}=\\dfrac{1}{${fixed(FUNCS[s.which].d(s.a), 3)}}=${fixed(1 / FUNCS[s.which].d(s.a), 3)}`,
});
