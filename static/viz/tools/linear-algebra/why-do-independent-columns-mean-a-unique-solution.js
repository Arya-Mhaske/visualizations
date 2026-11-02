import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { plane, vec } from './_la-view.js';

// Columns u and v are independent and b = u + v. A third column w = p u + q v adds nothing new, but gives many ways to reach b.
const U = [2, 1];
const V = [1, 3];
const state = { third: false, p: 1, q: 1, t: 0 };
const W = (s) => [s.p * U[0] + s.q * V[0], s.p * U[1] + s.q * V[1]];
// x = (1, 1, 0) + t (−p, −q, 1)
const coeffs = (s) => (s.third ? [1 - s.t * s.p, 1 - s.t * s.q, s.t] : [1, 1, 0]);

createTool({
  state,
  label: 'The columns u and v of a matrix, and the target b equal to u plus v. With only these two columns there is exactly one way to reach b. Adding a third column w that lies in the plane of the first two gives infinitely many ways: each value of t gives a different path of arrows, all ending at b.',
  setup: (stage, c) => plane(stage, c, 8),
  draw(ctx, stage, c, plot) {
    const x = coeffs(state);
    const w = W(state);
    plot.axes();
    const p1 = [x[0] * U[0], x[0] * U[1]];
    const p2 = [p1[0] + x[1] * V[0], p1[1] + x[1] * V[1]];
    vec(ctx, plot, c, [0, 0], p1, { color: c.a, width: 7 });
    vec(ctx, plot, c, p1, p2, { color: c.b, width: 7 });
    if (state.third) vec(ctx, plot, c, p2, [p2[0] + x[2] * w[0], p2[1] + x[2] * w[1]], { color: c.d, width: 7 });
    vec(ctx, plot, c, [0, 0], U, { color: c.a, width: 2, text: 'u' });
    vec(ctx, plot, c, [0, 0], V, { color: c.b, width: 2, text: 'v' });
    if (state.third) vec(ctx, plot, c, [0, 0], w, { color: c.d, width: 2, text: 'w' });
    plot.point(U[0] + V[0], U[1] + V[1], { fill: c.fillY, r: 8 });
    plot.text('b', U[0] + V[0] + 0.7, U[1] + V[1] + 0.7, { size: 13, patch: false });
  },
  controls: [
    { title: 'Add a column' },
    { key: 'third', label: 'Add a third column w = p·u + q·v', toggle: true },
    { key: 't', label: 'Which solution (t)', min: -2, max: 2, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'p', label: 'p', min: -2, max: 2, step: 1, format: (n) => `${n}` },
    { key: 'q', label: 'q', min: -2, max: 2, step: 1, format: (n) => `${n}` },
    { readout: [
      ['Solutions x₁, x₂, x₃', (s) => `(${coeffs(s).map((v) => fixed(v, 2)).join(', ')})`],
      ['Number of solutions', (s) => ({ text: s.third && (s.p !== 0 || s.q !== 0) ? 'a whole line of them' : (s.third ? 'a whole line (w = 0)' : 'exactly one'), good: !s.third })],
      ['Nullspace vector', (s) => (s.third ? `(${-s.p}, ${-s.q}, 1)` : 'only 0')],
    ] },
  ],
  tex: (s) => (s.third
    ? `x_1\\mathbf u+x_2\\mathbf v+x_3\\mathbf w=\\mathbf b:\\ \\ \\mathbf x=(1,1,0)+t(${-s.p},${-s.q},1)`
    : 'x_1\\mathbf u+x_2\\mathbf v=\\mathbf b\\ \\Rightarrow\\ \\mathbf x=(1,\\,1)\\ \\text{only}'),
  onChange: (s) => show(s),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 3) return;
  fields.forEach((f) => { f.hidden = !s.third; });
}
show(state);
