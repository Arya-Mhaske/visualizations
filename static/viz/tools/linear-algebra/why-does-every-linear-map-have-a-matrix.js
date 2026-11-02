import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, det2 } from './_la-math.js';
import { F_SHAPE, IDENTITY, SQUARE, gridUnder, plane, shape, vec } from './_la-view.js';

// The images of e1 and e2 are the two columns. A linear map is then decided for every vector: T(x) = x1 T(e1) + x2 T(e2).
const state = { p: 2, q: 1, r: -1, s: 1.5, x1: 1, x2: 1.5 };
const M = (s) => [[s.p, s.r], [s.q, s.s]];

createTool({
  state,
  label: 'The standard basis vectors e1 and e2 and the places a linear map sends them. These two images are the columns of the matrix. Any other vector x, written as x1 times e1 plus x2 times e2, goes to x1 times the first column plus x2 times the second. The letter F and the grid show that everything else follows.',
  setup: (stage, c) => plane(stage, c, 4),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    plot.axes({ grid: false });
    gridUnder(ctx, plot, A, { color: c.grid, half: 5, width: 1 });
    shape(ctx, plot, SQUARE, IDENTITY, { stroke: c.grid, width: 2 });
    shape(ctx, plot, SQUARE, A, { fill: det2(A) >= 0 ? c.fillC : c.fillA, stroke: c.ink, width: 2 });
    shape(ctx, plot, F_SHAPE.map(([x, y]) => [x * 0.5, y * 0.5]), A, { fill: c.fillY, stroke: c.ink, width: 2 });
    vec(ctx, plot, c, [0, 0], [1, 0], { color: c.a, width: 2, text: 'e1' });
    vec(ctx, plot, c, [0, 0], [0, 1], { color: c.b, width: 2, text: 'e2' });
    vec(ctx, plot, c, [0, 0], [state.p, state.q], { color: c.a, width: 5, text: 'T(e1)' });
    vec(ctx, plot, c, [0, 0], [state.r, state.s], { color: c.b, width: 5, text: 'T(e2)' });
    vec(ctx, plot, c, [0, 0], [state.x1, state.x2], { color: c.ink, width: 2, text: 'x' });
    vec(ctx, plot, c, [0, 0], apply2(A, [state.x1, state.x2]), { color: c.d, width: 5, text: 'T(x)', dx: 14, dy: 10 });
  },
  controls: [
    { title: 'Say where e1 and e2 go' },
    { key: 'p', label: 'T(e1), x-part', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'q', label: 'T(e1), y-part', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'r', label: 'T(e2), x-part', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 's', label: 'T(e2), y-part', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'x1', label: 'x₁', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'x2', label: 'x₂', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Matrix columns', (s) => `(${fixed(s.p, 1)}, ${fixed(s.q, 1)}) and (${fixed(s.r, 1)}, ${fixed(s.s, 1)})`],
      ['T(x)', (s) => `(${fixed(apply2(M(s), [s.x1, s.x2])[0], 3)}, ${fixed(apply2(M(s), [s.x1, s.x2])[1], 3)})`],
    ] },
  ],
  tex: (s) => `A=\\begin{bmatrix}T(\\mathbf e_1)&T(\\mathbf e_2)\\end{bmatrix}=${bmat(M(s), (v) => fixed(v, 1))}`,
});
