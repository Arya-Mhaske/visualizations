import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { bmat, mul, norm, project, transpose } from './_la-math.js';

// Three measurements b = (y0, y1, y2) at t = 0, 1, 2. The columns of A are (1, 1, 1) and (0, 1, 2).
// No line passes through all three points, so Ax = b has no solution: project b onto the column space instead.
const state = { view: 'fit', y0: 1, y1: 3, y2: 2 };
const ONES = [1, 1, 1];
const T = [0, 1, 2];
const A = [[1, 0], [1, 1], [1, 2]];
const b = (s) => [s.y0, s.y1, s.y2];
const fit = (s) => project(A, b(s));

createTool({
  state,
  label: 'Three measurements and the best straight line through them. The line misses the points a little. In the other view, the same measurements are one vector b in three dimensions, and the lines that can be written as C plus D t make a flat plane, the column space. The best fit is the point p of that plane closest to b, found by dropping a perpendicular.',
  setup(stage, c) {
    const cam = createCamera(stage, { extent: 6, yaw: 0.75, pitch: 0.45, c });
    cam.orbit(() => stage.invalidate());
    return { plot: createPlot(stage, { x: [-0.5, 2.5], y: [-1, 6], c, pad: 24 }), cam };
  },
  draw(ctx, stage, c, { plot, cam }) {
    const { x, p } = fit(state);
    const [C, D] = x;
    if (state.view === 'fit') {
      plot.axes({ xLabel: 't', yLabel: 'y' });
      plot.fn((t) => C + D * t, { color: c.a, width: 4, domain: [-0.5, 2.5] });
      T.forEach((t, i) => {
        plot.segment(t, b(state)[i], t, p[i], { color: c.d, width: 4 });
        plot.point(t, b(state)[i], { fill: c.fillY, r: 7 });
      });
      return;
    }
    cam.axes({ size: 5, names: ['y₀', 'y₁', 'y₂'] });
    const at = (s, t) => [0, 1, 2].map((i) => s * ONES[i] + t * T[i]);
    cam.faces([{ pts: [at(-2, -2), at(3, -2), at(3, 2), at(-2, 2)], fill: c.fillB, stroke: c.grid }]);
    cam.line(b(state), p, { color: c.d, width: 5 });
    cam.arrow([0, 0, 0], b(state), { color: c.b, width: 3 });
    cam.point(p, { fill: c.fillY, r: 7 });
    cam.point(b(state), { fill: c.fillA, r: 7 });
    cam.label('b', b(state).map((v) => v * 1.12), { color: c.b });
    cam.label('p', p.map((v) => v - 0.3), { color: c.ink });
  },
  controls: [
    { title: 'Three measurements' },
    { key: 'view', label: 'Picture', options: [['fit', 'The line'], ['cols', 'The column space']] },
    { key: 'y0', label: 'y at t = 0', min: -1, max: 6, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'y1', label: 'y at t = 1', min: -1, max: 6, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'y2', label: 'y at t = 2', min: -1, max: 6, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Best line C + Dt', (s) => `${fixed(fit(s).x[0], 3)} + ${fixed(fit(s).x[1], 3)} t`],
      ['Error size |e|', (s) => fixed(norm(fit(s).e), 3)],
      ['Exact fit?', (s) => ({ text: norm(fit(s).e) < 1e-9 ? 'yes, b is in the plane' : 'no, b is off the plane', good: norm(fit(s).e) < 1e-9 })],
    ] },
  ],
  tex: (s) => `A^{\\mathsf T}A=${bmat(mul(transpose(A), A), (v) => fixed(v, 0))},\\ A^{\\mathsf T}\\mathbf b=${bmat([[s.y0 + s.y1 + s.y2], [s.y1 + 2 * s.y2]], (v) => fixed(v, 1))}\\Rightarrow \\hat{\\mathbf x}=(${fixed(fit(s).x[0], 3)},\\ ${fixed(fit(s).x[1], 3)})`,
});
