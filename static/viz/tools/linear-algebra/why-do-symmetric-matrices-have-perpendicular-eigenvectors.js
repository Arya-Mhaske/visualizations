import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { apply2, eig2 } from './_la-math.js';
import { IDENTITY, circlePts, curve, plane, vec } from './_la-view.js';

// A = [[a, b], [b + skew, d]]. With skew = 0 the matrix is symmetric.
const state = { a: 3, b: 1, d: 2, skew: 0 };
const M = (s) => [[s.a, s.b], [s.b + s.skew, s.d]];
const angleBetween = (e) => (e.real && e.v[0] && e.v[1] ? (Math.acos(Math.min(1, Math.abs(e.v[0][0] * e.v[1][0] + e.v[0][1] * e.v[1][1]))) * 180) / Math.PI : null);

createTool({
  state,
  label: 'The unit circle and its image under a matrix, drawn together with the eigenvector directions. For a symmetric matrix the two eigenvector lines are perpendicular and they are exactly the axes of the ellipse that the circle becomes. A slider makes the matrix a little non-symmetric, and then the eigenvectors lean towards each other and no longer line up with the ellipse axes.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    const e = eig2(A);
    plot.axes({ grid: false });
    curve(ctx, plot, circlePts(), IDENTITY, { color: c.grid, width: 2, closed: true });
    curve(ctx, plot, circlePts(), A, { color: c.b, width: 4, closed: true });
    if (!e.real) return;
    e.v.forEach((v, i) => {
      if (!v) return;
      plot.segment(-6 * v[0], -6 * v[1], 6 * v[0], 6 * v[1], { color: c.grid, width: 2, dash: [6, 5] });
      vec(ctx, plot, c, [0, 0], apply2(A, v), { color: i ? c.d : c.a, width: 5, text: `λ${i + 1}x${i + 1}`, dx: 14, dy: -10 });
      vec(ctx, plot, c, [0, 0], v, { color: i ? c.d : c.a, width: 2 });
    });
  },
  controls: [
    { title: 'A symmetric matrix' },
    { key: 'a', label: 'a (top-left)', min: -3, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'b (off-diagonal)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'd (bottom-right)', min: -3, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'skew', label: 'Make it non-symmetric by', min: 0, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { readout: [
      ['Eigenvalues', (s) => { const e = eig2(M(s)); return e.real ? e.l.map((v) => fixed(v, 3)).join(', ') : 'complex'; }],
      ['Angle between eigenvectors', (s) => { const g = angleBetween(eig2(M(s))); return g === null ? '—' : { text: `${fixed(g, 1)}°`, good: Math.abs(g - 90) < 0.01 }; }],
      ['Symmetric?', (s) => ({ text: s.skew === 0 ? 'yes' : 'no', good: s.skew === 0 })],
    ] },
  ],
  tex: (s) => `A^{\\mathsf T}=A\\ \\Rightarrow\\ \\mathbf x_1\\cdot\\mathbf x_2=0${s.skew ? `\\ \\ (\\text{not symmetric, so not guaranteed})` : ''}`,
});
