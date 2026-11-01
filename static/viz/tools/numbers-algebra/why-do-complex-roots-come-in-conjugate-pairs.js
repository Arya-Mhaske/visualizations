import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { liftedRoots, showComplex } from './_complex-numbers-math.js';

const state = { a: 1, h: 1, k: -3 };
const upper = (stage) => ({ x: 0, y: 0, w: stage.w, h: stage.h * 0.5 });
const lower = (stage) => ({ x: 0, y: stage.h * 0.5, w: stage.w, h: stage.h * 0.5 });
const roots = (s = state) => liftedRoots(s.a, s.h, s.k);

createTool({
  state,
  label: 'Top: a parabola you can slide up and down. While it cuts the x-axis its roots are real. Bottom: the complex plane showing the roots. When the parabola is lifted clear of the axis the roots leave the real axis together, one above and one below, always as mirror images of each other.',
  setup: (stage, c) => ({
    top: createPlot(stage, { x: [-5, 5], y: [-6, 6], c, box: upper, pad: 20 }),
    low: createPlot(stage, { x: [-5, 5], y: [-4, 4], c, box: lower, pad: 20 }),
  }),
  draw(ctx, stage, c, { top, low }) {
    top.axes({ xLabel: 'x', yLabel: 'y' });
    top.fn((x) => state.a * (x - state.h) ** 2 + state.k, { color: c.a, width: 4 });
    low.axes({ xLabel: 'real', yLabel: 'imag' });
    const r = roots();
    if (r.real) r.roots.forEach(([x]) => top.point(x, 0, { fill: c.c, r: 7 }));
    low.segment(r.roots[0][0], r.roots[0][1], r.roots[1][0], r.roots[1][1], { color: c.grid, width: 2, dash: [4, 4] });
    r.roots.forEach(([x, y]) => low.point(x, y, { fill: r.real ? c.c : c.b, r: 8 }));
  },
  controls: [
    { title: 'Lift the parabola' },
    { key: 'k', label: 'Height of the lowest point, k', min: -5, max: 5, step: 0.25 },
    { key: 'h', label: 'Position of the axis, h', min: -3, max: 3, step: 0.5 },
    { key: 'a', label: 'Steepness, a', min: 0.5, max: 2, step: 0.5 },
    { readout: [
      ['Crosses the x-axis?', (s) => ({ text: roots(s).real ? 'yes' : 'no', good: roots(s).real })],
      ['Root 1', (s) => showComplex(roots(s).roots[0], 3)],
      ['Root 2', (s) => showComplex(roots(s).roots[1], 3)],
    ] },
  ],
  tex: (s) => `x=${fixed(s.h, 1)}\\pm\\sqrt{${fixed(-s.k / s.a, 2)}}${s.k > 0 ? `=${fixed(s.h, 1)}\\pm ${fixed(Math.sqrt(s.k / s.a), 2)}i` : ''}`,
});
