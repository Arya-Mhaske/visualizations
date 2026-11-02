import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { det2 } from './_sm-math.js';
import { IDENTITY, SQUARE, plane, shape, vec } from '../linear-algebra/_la-view.js';

const state = { a: 3, c: 1, b: 1, d: 2 };
const cols = (s) => [[s.a, s.c], [s.b, s.d]];
const D = (s) => s.a * s.d - s.b * s.c;
// the area by splitting the parallelogram into two triangles with the shoelace formula: independent of det
const shoelace = (s) => { const [u, v] = cols(s); return Math.abs(u[0] * v[1] - u[1] * v[0]); };

createTool({
  state,
  label: 'Two column vectors, drawn as arrows from the origin, and the parallelogram they span. The area of the parallelogram is the absolute value of the determinant of the matrix with those two columns. The unit square is drawn for comparison: it is the parallelogram of the columns (1, 0) and (0, 1), with area 1.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const [u, v] = cols(state);
    plot.axes();
    shape(ctx, plot, SQUARE, IDENTITY, { stroke: c.grid, width: 2 });
    shape(ctx, plot, [[0, 0], u, [u[0] + v[0], u[1] + v[1]], v], IDENTITY, { fill: D(state) >= 0 ? c.fillC : c.fillA, stroke: c.ink });
    vec(ctx, plot, c, [0, 0], u, { color: c.a, width: 5, text: 'col 1' });
    vec(ctx, plot, c, [0, 0], v, { color: c.b, width: 5, text: 'col 2' });
  },
  controls: [
    { title: 'Choose the two columns' },
    { key: 'a', label: 'Column 1, top', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Column 1, bottom', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Column 2, top', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'Column 2, bottom', min: -4, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Determinant ad − bc', (s) => fixed(D(s), 3)],
      ['Area of the parallelogram', (s) => ({ text: fixed(shoelace(s), 3), good: true })],
      ['Sign tells', (s) => (D(s) > 1e-9 ? 'col 2 is anticlockwise of col 1' : D(s) < -1e-9 ? 'col 2 is clockwise of col 1' : 'the columns are on one line')],
    ] },
  ],
  tex: (s) => `\\begin{vmatrix}${fixed(s.a, 1)}&${fixed(s.b, 1)}\\\\${fixed(s.c, 1)}&${fixed(s.d, 1)}\\end{vmatrix}=${fixed(det2([[s.a, s.b], [s.c, s.d]]), 2)}\\ \\Rightarrow\\ \\text{area}=${fixed(shoelace(s), 2)}`,
});
