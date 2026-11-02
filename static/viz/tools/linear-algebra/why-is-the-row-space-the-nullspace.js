import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { apply2, rad } from './_la-math.js';
import { vec } from './_la-view.js';

// A = [row; k·row] has rank 1. Input space R² (left): row space and nullspace. Output space R² (right): column space and left nullspace.
const state = { theta: 60, k: 2, phi: 20 };
const row = (s) => [Math.cos(rad(s.theta)), Math.sin(rad(s.theta))];
const A = (s) => [row(s), row(s).map((v) => v * s.k)];
const nul = (s) => [-row(s)[1], row(s)[0]];
const colDir = (s) => { const n = Math.hypot(1, s.k); return [1 / n, s.k / n]; };
const leftDir = (s) => { const n = Math.hypot(1, s.k); return [s.k / n, -1 / n]; };
const x = (s) => [Math.cos(rad(s.phi)), Math.sin(rad(s.phi))];
const dotp = (a, b) => a[0] * b[0] + a[1] * b[1];

createTool({
  state,
  label: 'Two small plots side by side. On the left, the input space with the row space line and the nullspace line, which meet at a right angle. On the right, the output space with the column space line and the left nullspace line, also at a right angle. A vector x is split into a row space part and a nullspace part, and A only sees the row space part.',
  setup: (stage, c) => [
    createPlot(stage, { x: [-1.7, 1.7], y: [-1.7, 1.7], c, pad: 10, box: (st) => ({ x: 0, y: 0, w: st.w / 2, h: st.h }) }),
    createPlot(stage, { x: [-3, 3], y: [-3, 3], c, pad: 10, box: (st) => ({ x: st.w / 2, y: 0, w: st.w / 2, h: st.h }) }),
  ],
  draw(ctx, stage, c, [inp, out]) {
    const r = row(state);
    const n = nul(state);
    const xv = x(state);
    const xr = r.map((v) => v * dotp(xv, r));
    const xn = n.map((v) => v * dotp(xv, n));
    const cd = colDir(state);
    const ld = leftDir(state);
    inp.axes({ grid: false, xLabel: '', yLabel: '' });
    out.axes({ grid: false, xLabel: '', yLabel: '' });
    inp.segment(-2 * r[0], -2 * r[1], 2 * r[0], 2 * r[1], { color: c.a, width: 4 });
    inp.segment(-2 * n[0], -2 * n[1], 2 * n[0], 2 * n[1], { color: c.b, width: 4 });
    vec(ctx, inp, c, [0, 0], xv, { color: c.ink, width: 4, text: 'x', dx: 8, dy: 8 });
    vec(ctx, inp, c, [0, 0], xr, { color: c.a, width: 3 });
    vec(ctx, inp, c, xr, xv, { color: c.b, width: 3 });
    inp.text('row space', 1.0 * r[0] + 0.2, 1.1 * r[1] + 0.1, { size: 10, color: c.a, patch: false });
    inp.text('nullspace', 1.0 * n[0] - 0.5, 1.1 * n[1] + 0.1, { size: 10, color: c.b, patch: false });
    out.segment(-4 * cd[0], -4 * cd[1], 4 * cd[0], 4 * cd[1], { color: c.c, width: 4 });
    out.segment(-4 * ld[0], -4 * ld[1], 4 * ld[0], 4 * ld[1], { color: c.d, width: 4 });
    vec(ctx, out, c, [0, 0], apply2(A(state), xv), { color: c.ink, width: 5, text: 'Ax', dx: 8, dy: 8 });
    out.text('column space', 2 * cd[0], 2.1 * cd[1] + 0.3, { size: 10, color: c.c, patch: false });
    out.text('left nullspace', 1.6 * ld[0], 1.6 * ld[1] + 0.3, { size: 10, color: c.d, patch: false });
    dot(ctx, ...out.toPx(0, 0), 4, c.ink, c.ink, 1);
  },
  controls: [
    { title: 'The big picture' },
    { key: 'phi', label: 'Direction of x', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'theta', label: 'Direction of the rows', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { key: 'k', label: 'Row 2 = k × row 1, k', min: 0.5, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Row · null direction', (s) => ({ text: fixed(dotp(row(s), nul(s)), 3), good: true })],
      ['Col · left-null direction', (s) => ({ text: fixed(dotp(colDir(s), leftDir(s)), 3), good: true })],
      ['A·(null part of x)', (s) => { const v = apply2(A(s), nul(s).map((w) => w * dotp(x(s), nul(s)))); return fixed(Math.hypot(...v), 3); }],
    ] },
  ],
  tex: () => 'A\\mathbf x=\\mathbf 0\\ \\Rightarrow\\ \\text{every row}\\cdot\\mathbf x=0\\ \\Rightarrow\\ N(A)\\perp C(A^{\\mathsf T})',
});
