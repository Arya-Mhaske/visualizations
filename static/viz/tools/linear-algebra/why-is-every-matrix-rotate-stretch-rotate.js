import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { bmat, det2, diag2, mul2, rot2, svd2 } from './_la-math.js';
import { F_SHAPE, IDENTITY, circlePts, curve, plane, shape } from './_la-view.js';

// A = R(γ) · diag(σ1, σ2) · R(β): rotate by β, stretch the axes, rotate by γ. σ2 < 0 means a reflection is folded in.
const state = { a: 2, b: 1, c: 0.5, d: 1.5, t: 3 };
const A = (s) => [[s.a, s.b], [s.c, s.d]];
const NAMES = ['Start: the unit circle', 'After the first rotation (Vᵀ)', 'After the stretch (Σ)', 'After the last rotation (U)'];
function stage(s, t) {
  const { s: sv, beta, gamma } = svd2(A(s));
  const u = Math.max(0, Math.min(1, t - 1));
  const first = rot2(beta * Math.min(1, t));
  const stretch = diag2(1 + (sv[0] - 1) * u, 1 + (sv[1] - 1) * u);
  const last = rot2(gamma * Math.max(0, Math.min(1, t - 2)));
  return mul2(last, mul2(stretch, first));
}
const ARMS = [[[0, 0], [1, 0]], [[0, 0], [0, 1]]];

createTool({
  state,
  label: 'The unit circle, with two radii and the letter F, moved in three steps by a matrix. First a rotation, then a stretch along the coordinate axes, then another rotation. The three steps together do exactly what the matrix does, so the circle always ends as an ellipse whose axes are the stretched directions. Slide the progress control to watch each step.',
  setup: (stage2, c) => plane(stage2, c, 5),
  draw(ctx, stage2, c, plot) {
    const M = stage(state, state.t);
    plot.axes({ grid: false });
    curve(ctx, plot, circlePts(), IDENTITY, { color: c.grid, width: 2, closed: true });
    curve(ctx, plot, circlePts(), M, { color: c.b, width: 4, closed: true });
    curve(ctx, plot, ARMS[0], M, { color: c.a, width: 5 });
    curve(ctx, plot, ARMS[1], M, { color: c.c, width: 5 });
    shape(ctx, plot, F_SHAPE.map(([x, y]) => [x * 0.45 - 0.2, y * 0.45 - 0.45]), M, { fill: c.fillY, stroke: c.ink, width: 2 });
  },
  controls: [
    { title: 'Three moves' },
    { key: 't', label: 'Progress', min: 0, max: 3, step: 0.05, format: (n) => `${fixed(n, 2)}  ${NAMES[Math.min(3, Math.round(n))]}` },
    { key: 'a', label: 'Row 1, col 1', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Row 1, col 2', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Row 2, col 1', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'Row 2, col 2', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Singular values σ₁, σ₂', (s) => { const v = svd2(A(s)).s; return `${fixed(v[0], 3)}, ${fixed(Math.abs(v[1]), 3)}`; }],
      ['Product σ₁σ₂', (s) => fixed(svd2(A(s)).s[0] * Math.abs(svd2(A(s)).s[1]), 3)],
      ['|det A|', (s) => ({ text: fixed(Math.abs(det2(A(s))), 3), good: true })],
      ['Reflection folded in?', (s) => (det2(A(s)) < -1e-9 ? 'yes (det < 0)' : 'no')],
    ] },
  ],
  tex: (s) => `${bmat(A(s), (v) => fixed(v, 1))}=U\\,\\Sigma\\,V^{\\mathsf T},\\quad \\sigma_1=${fixed(svd2(A(s)).s[0], 3)},\\ \\sigma_2=${fixed(Math.abs(svd2(A(s)).s[1]), 3)}`,
});
