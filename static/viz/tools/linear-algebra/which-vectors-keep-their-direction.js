import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { apply2, eig2, rad } from './_la-math.js';
import { IDENTITY, circlePts, curve, plane, vec } from './_la-view.js';

const PRESETS = {
  sym: { name: 'Symmetric', M: [[3, 1], [1, 3]] },
  skew: { name: 'Stretch + skew', M: [[2, 1], [0, 3]] },
  shear: { name: 'Shear', M: [[1, 1], [0, 1]] },
  rot: { name: 'Rotation', M: [[0, -1], [1, 0]] },
  proj: { name: 'Projection', M: [[0.5, 0.5], [0.5, 0.5]] },
};
const state = { preset: 'sym', a: 3, b: 1, c: 1, d: 3, phi: 20, k: 0, ellipse: true };
const M = (s) => [[s.a, s.b], [s.c, s.d]];
const X = (s) => [Math.cos(rad(s.phi)), Math.sin(rad(s.phi))];
const sine = (s) => { const x = X(s); const y = apply2(M(s), x); const n = Math.hypot(...y); return n < 1e-9 ? 0 : Math.abs(x[0] * y[1] - x[1] * y[0]) / n; };
function direction(s, j) {
  let v = X(s);
  for (let i = 0; i < j; i++) { v = apply2(M(s), v); const n = Math.hypot(...v); if (n < 1e-12) return null; v = v.map((t) => t / n); }
  return v;
}

const tool = createTool({
  state,
  label: 'The unit circle and its image under a matrix A. A vector x on the circle turns round as you change its direction, and A x is drawn from the origin. For most directions A x points somewhere else. For special directions, the eigenvectors, A x lies along the same line as x, so the vector is only stretched. Each application of A turns the direction towards the dominant eigenvector.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const A = M(state);
    const x = X(state);
    plot.axes({ grid: false });
    curve(ctx, plot, circlePts(), IDENTITY, { color: c.grid, width: 2, closed: true });
    if (state.ellipse) curve(ctx, plot, circlePts(), A, { color: c.b, width: 3, closed: true });
    const e = eig2(A);
    if (e.real) e.v.forEach((v) => { if (v) plot.segment(-7 * v[0], -7 * v[1], 7 * v[0], 7 * v[1], { color: c.c, width: 2, dash: [6, 5] }); });
    for (let j = 1; j <= state.k; j++) {
      const v = direction(state, j);
      if (v) dot(ctx, ...plot.toPx(...v), 4 + (j === state.k ? 3 : 0), j === state.k ? c.fillY : c.fillA, c.ink, 1);
    }
    plot.segment(...x, ...apply2(A, x), { color: c.grid, width: 2, dash: [4, 4] });
    vec(ctx, plot, c, [0, 0], x, { color: c.a, width: 4, text: 'x' });
    vec(ctx, plot, c, [0, 0], apply2(A, x), { color: c.d, width: 5, text: 'Ax' });
  },
  controls: [
    { title: 'Spin x round while A acts' },
    { key: 'phi', label: 'Direction of x', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'preset', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { key: 'k', label: 'Apply A again and again, k times', min: 0, max: 12, step: 1, format: (n) => `${n}` },
    { key: 'ellipse', label: 'Show the image of the circle', toggle: true },
    { key: 'a', label: 'Row 1, col 1', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Row 1, col 2', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'c', label: 'Row 2, col 1', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'Row 2, col 2', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Does Ax stay on x\'s line?', (s) => ({ text: sine(s) < 0.02 ? 'yes: x is an eigenvector' : 'no: it turns', good: sine(s) < 0.02 })],
      ['Real eigenvalues', (s) => { const e = eig2(M(s)); return e.real ? e.l.map((v) => fixed(v, 3)).join(', ') : `none (${fixed(e.re, 2)} ± ${fixed(e.im, 2)}i)`; }],
    ] },
  ],
  tex: (s) => `A\\mathbf x=\\lambda\\mathbf x:\\quad \\text{trace}=${fixed(s.a + s.d, 2)},\\ \\det=${fixed(s.a * s.d - s.b * s.c, 2)}`,
  onChange: (s) => loadPreset(s),
});
let lastPreset = state.preset;
function loadPreset(s) {
  if (s.preset === lastPreset) return;
  lastPreset = s.preset;
  const m = PRESETS[s.preset].M;
  [s.a, s.b, s.c, s.d] = [m[0][0], m[0][1], m[1][0], m[1][1]];
  tool.ui.refresh();
}
void tool;
