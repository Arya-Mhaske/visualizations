import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, det2, nullBasis, rad } from './_la-math.js';
import { circlePts, curve, IDENTITY, plane, vec } from './_la-view.js';

const state = { a: 2, c: 1, b: 1, d: 2, ang: 40 };
const M = (s) => [[s.a, s.b], [s.c, s.d]];
const X = (s) => [Math.cos(rad(s.ang)), Math.sin(rad(s.ang))];
const singular = (s) => Math.abs(det2(M(s))) < 1e-9;
const nullDir = (s) => { const n = nullBasis(M(s))[0]; return n ? n.map((v) => v / Math.hypot(...n)) : null; };

const tool = createTool({
  state,
  label: 'The unit circle and its image under the matrix A, the blue curve. When the two columns are different directions the image is a full ellipse and every output comes from exactly one input. When one column is a multiple of the other, the image collapses to a line and some non-zero vector x is sent to zero, so no inverse can bring it back.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    const x = X(state);
    plot.axes();
    curve(ctx, plot, circlePts(), IDENTITY, { color: c.grid, width: 2, closed: true });
    curve(ctx, plot, circlePts(), A, { color: c.b, width: 4, closed: true });
    if (singular(state) && nullDir(state)) {
      const n = nullDir(state);
      plot.segment(-n[0] * 4, -n[1] * 4, n[0] * 4, n[1] * 4, { color: c.c, width: 2, dash: [6, 5] });
    }
    vec(ctx, plot, c, [0, 0], x, { color: c.a, width: 4, text: 'x' });
    vec(ctx, plot, c, [0, 0], apply2(A, x), { color: c.d, width: 5, text: 'Ax' });
  },
  controls: (t) => [
    { title: 'Change the columns' },
    { key: 'ang', label: 'Direction of x', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'a', label: 'Column 1, top', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'c', label: 'Column 1, bottom', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'b', label: 'Column 2, top', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { key: 'd', label: 'Column 2, bottom', min: -3, max: 3, step: 1, format: (n) => `${n}` },
    { row: [
      { button: 'Make column 2 = 2 × column 1', onClick() { state.b = 2 * state.a; state.d = 2 * state.c; t.update(); } },
      { button: 'Point x at the null vector', ghost: true, onClick() { const n = nullDir(state); if (n) { state.ang = Math.round((Math.atan2(n[1], n[0]) * 180) / Math.PI + 360) % 360; t.update(); } } },
    ] },
    { readout: [
      ['det A', (s) => fixed(det2(M(s)), 2)],
      ['Ax', (s) => `(${fixed(apply2(M(s), X(s))[0], 3)}, ${fixed(apply2(M(s), X(s))[1], 3)})`],
      ['Inverse exists?', (s) => ({ text: singular(s) ? 'no: some x ≠ 0 gives Ax = 0' : 'yes', good: !singular(s) })],
    ] },
  ],
  tex: (s) => (singular(s)
    ? `${bmat(M(s), (v) => fixed(v, 0))}\\mathbf x=\\mathbf 0\\ \\text{for}\\ \\mathbf x\\ne\\mathbf 0\\ \\Rightarrow\\ A^{-1}\\mathbf 0\\ \\text{would have to be both}\\ \\mathbf x\\ \\text{and}\\ \\mathbf 0`
    : `\\det A=${fixed(det2(M(s)), 2)}\\ne0:\\ A\\mathbf x=\\mathbf 0\\ \\text{only for}\\ \\mathbf x=\\mathbf 0`),
});
void tool;
