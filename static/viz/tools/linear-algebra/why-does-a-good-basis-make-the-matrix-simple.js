import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, diag2, eig2, inv2, mul2 } from './_la-math.js';
import { curve, plane, vec } from './_la-view.js';

const PRESETS = {
  sym: { name: 'Symmetric', A: [[2, 1], [1, 2]] },
  skew: { name: 'Not symmetric', A: [[3, 1], [0, 1]] },
  mix: { name: 'Stretch and shrink', A: [[1.5, 1], [0.5, 1]] },
};
const state = { which: 'sym', basis: 'eigen', c1: 1, c2: 1 };
const A = (s) => PRESETS[s.which].A;
const basis = (s) => {
  if (s.basis === 'standard') return [[1, 0], [0, 1]];
  const e = eig2(A(s));
  return [e.v[0], e.v[1]];
};
const X = (s) => { const [b1, b2] = basis(s); return [[b1[0], b2[0]], [b1[1], b2[1]]]; };
const inBasis = (s) => mul2(inv2(X(s)), mul2(A(s), X(s)));
const point = (s, [a, b]) => { const [b1, b2] = basis(s); return [a * b1[0] + b * b2[0], a * b1[1] + b * b2[1]]; };

createTool({
  state,
  label: 'The same transformation seen in two bases. The grid lines show the chosen basis. A vector x with coordinates c1 and c2 in that basis is moved by the matrix to A x. In the standard basis the matrix has off-diagonal entries and A x lands in a new direction. In the eigenvector basis the matrix is diagonal: each coordinate is just multiplied by an eigenvalue, so A x stays on the same grid line.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const [b1, b2] = basis(state);
    plot.axes({ grid: false });
    for (let k = -6; k <= 6; k++) {
      curve(ctx, plot, [[k * b1[0] - 8 * b2[0], k * b1[1] - 8 * b2[1]], [k * b1[0] + 8 * b2[0], k * b1[1] + 8 * b2[1]]], [[1, 0], [0, 1]], { color: c.grid, width: 1 });
      curve(ctx, plot, [[k * b2[0] - 8 * b1[0], k * b2[1] - 8 * b1[1]], [k * b2[0] + 8 * b1[0], k * b2[1] + 8 * b1[1]]], [[1, 0], [0, 1]], { color: c.grid, width: 1 });
    }
    vec(ctx, plot, c, [0, 0], b1, { color: c.a, width: 3, text: state.basis === 'eigen' ? 'v1' : 'e1' });
    vec(ctx, plot, c, [0, 0], b2, { color: c.b, width: 3, text: state.basis === 'eigen' ? 'v2' : 'e2' });
    const x = point(state, [state.c1, state.c2]);
    vec(ctx, plot, c, [0, 0], x, { color: c.ink, width: 3, text: 'x' });
    vec(ctx, plot, c, [0, 0], apply2(A(state), x), { color: c.d, width: 5, text: 'Ax', dx: 12, dy: 12 });
  },
  controls: [
    { title: 'Pick a basis' },
    { key: 'basis', label: 'Describe vectors using', options: [['standard', 'Standard basis'], ['eigen', 'Eigenvector basis']] },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { key: 'c1', label: 'Coordinate c₁', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c2', label: 'Coordinate c₂', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Matrix in this basis', (s) => { const m = inBasis(s); return `[${fixed(m[0][0], 2)} ${fixed(m[0][1], 2)}; ${fixed(m[1][0], 2)} ${fixed(m[1][1], 2)}]`; }],
      ['Off-diagonal entries zero?', (s) => { const m = inBasis(s); const ok = Math.abs(m[0][1]) < 1e-9 && Math.abs(m[1][0]) < 1e-9; return { text: ok ? 'yes: diagonal' : 'no', good: ok }; }],
    ] },
  ],
  tex: (s) => (s.basis === 'eigen'
    ? `X^{-1}AX=\\Lambda=${bmat(diag2(...eig2(A(s)).l), (v) => fixed(v, 2))}`
    : `A=${bmat(A(s), (v) => fixed(v, 2))}\\ \\text{(standard basis)}`),
});
