import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { bmat, det2 } from './_la-math.js';
import { F_SHAPE, SQUARE, gridUnder, plane, shape } from './_la-view.js';

const state = { a: 2, c: 0.5, b: -0.5, d: 1.5, grid: true };
const M = (s) => [[s.a, s.b], [s.c, s.d]];
// Area by the shoelace formula, from the image of the unit square's corners (checks det independently).
function shoelace(M2) {
  const pts = SQUARE.map(([x, y]) => [M2[0][0] * x + M2[0][1] * y, M2[1][0] * x + M2[1][1] * y]);
  return pts.reduce((s, p, i) => s + (p[0] * pts[(i + 1) % 4][1] - pts[(i + 1) % 4][0] * p[1]), 0) / 2;
}

createTool({
  state,
  label: 'The unit square and the letter F, and what a two by two matrix does to them. The unit square becomes a parallelogram whose area is the absolute value of the determinant. Every little square of the grid is scaled by the same factor. If the determinant is negative, the picture is flipped, as the letter F shows.',
  setup: (stage, c) => plane(stage, c, 4),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    const D = det2(A);
    plot.axes({ grid: false });
    if (state.grid) gridUnder(ctx, plot, A, { color: c.grid, half: 5, width: 1 });
    shape(ctx, plot, SQUARE, [[1, 0], [0, 1]], { stroke: c.grid, width: 2 });
    shape(ctx, plot, SQUARE, A, { fill: D >= 0 ? c.fillC : c.fillA, stroke: c.ink });
    shape(ctx, plot, F_SHAPE.map(([x, y]) => [x * 0.6 - 3.4, y * 0.6 + 1.2]), [[1, 0], [0, 1]], { fill: c.fillY, stroke: c.ink, width: 2 });
    shape(ctx, plot, F_SHAPE.map(([x, y]) => [x * 0.6, y * 0.6]), A, { fill: D >= 0 ? c.fillB : c.fillA, stroke: c.ink, width: 2 });
  },
  controls: [
    { title: 'Transform the square' },
    { key: 'a', label: 'Column 1, top (a)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Column 1, bottom (c)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Column 2, top (b)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'Column 2, bottom (d)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'grid', label: 'Show the transformed grid', toggle: true },
    { readout: [
      ['det A', (s) => fixed(det2(M(s)), 3)],
      ['Area of the parallelogram', (s) => fixed(Math.abs(shoelace(M(s))), 3)],
      ['Orientation', (s) => (det2(M(s)) > 1e-9 ? 'kept' : det2(M(s)) < -1e-9 ? 'flipped' : 'flattened to a line')],
    ] },
  ],
  tex: (s) => `\\det${bmat(M(s), (v) => fixed(v, 1))}=ad-bc=${fixed(det2(M(s)), 3)}`,
});
