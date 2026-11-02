import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

const TS = {
  rotate: { name: 'Rotate 40°', f: ([x, y]) => [x * Math.cos(rad(40)) - y * Math.sin(rad(40)), x * Math.sin(rad(40)) + y * Math.cos(rad(40))], linear: true },
  shear: { name: 'Shear', f: ([x, y]) => [x + 0.8 * y, y], linear: true },
  scale: { name: 'Stretch x by 2', f: ([x, y]) => [2 * x, y], linear: true },
  shift: { name: 'Translate by (1, 0.5)', f: ([x, y]) => [x + 1, y + 0.5], linear: false },
  square: { name: 'Square the x-part', f: ([x, y]) => [x * x, y], linear: false },
};
const U = [1.5, 0.5];
const V = [-0.5, 1.5];
const state = { t: 'rotate', c: 1, d: 1 };
const mix = (s) => [s.c * U[0] + s.d * V[0], s.c * U[1] + s.d * V[1]];
const lhs = (s) => TS[s.t].f(mix(s));
const rhs = (s) => { const a = TS[s.t].f(U); const b = TS[s.t].f(V); return [s.c * a[0] + s.d * b[0], s.c * a[1] + s.d * b[1]]; };
const gap = (s) => Math.hypot(lhs(s)[0] - rhs(s)[0], lhs(s)[1] - rhs(s)[1]);

createTool({
  state,
  label: 'Two vectors u and v and a transformation T. The blue point is T applied to the mix c u plus d v. The coral point is the same mix of T of u and T of v. For a linear transformation the two points always coincide. For a translation or a squaring they usually do not, and the gap between them is shown.',
  setup: (stage, c) => plane(stage, c, 5),
  draw(ctx, stage, c, plot) {
    const f = TS[state.t].f;
    plot.axes();
    vec(ctx, plot, c, [0, 0], U, { color: c.a, width: 3, text: 'u' });
    vec(ctx, plot, c, [0, 0], V, { color: c.b, width: 3, text: 'v' });
    vec(ctx, plot, c, [0, 0], f(U), { color: c.a, width: 3, text: 'T(u)', dx: 14, dy: -10 });
    vec(ctx, plot, c, [0, 0], f(V), { color: c.b, width: 3, text: 'T(v)', dx: 14, dy: -10 });
    dot(ctx, ...plot.toPx(...mix(state)), 6, c.fillY, c.ink);
    dot(ctx, ...plot.toPx(...rhs(state)), 10, c.fillA, c.ink);
    dot(ctx, ...plot.toPx(...lhs(state)), 6, c.fillB, c.ink);
    plot.segment(...lhs(state), ...rhs(state), { color: c.ink, width: 3, dash: [4, 3] });
  },
  controls: [
    { title: 'Test T(cu + dv) = cT(u) + dT(v)' },
    { key: 't', label: 'Transformation', options: Object.entries(TS).map(([key, v]) => [key, v.name]) },
    { key: 'c', label: 'c', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'd', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['T(cu + dv)  (blue)', (s) => `(${fixed(lhs(s)[0], 3)}, ${fixed(lhs(s)[1], 3)})`],
      ['cT(u) + dT(v)  (coral)', (s) => `(${fixed(rhs(s)[0], 3)}, ${fixed(rhs(s)[1], 3)})`],
      ['Gap', (s) => ({ text: fixed(gap(s), 3), good: gap(s) < 1e-9 })],
      ['Linear?', (s) => ({ text: TS[s.t].linear ? 'yes, for every c and d' : 'no: it breaks the rule', good: TS[s.t].linear })],
    ] },
  ],
  tex: () => 'T(c\\mathbf u+d\\mathbf v)\\overset{?}{=}c\\,T(\\mathbf u)+d\\,T(\\mathbf v)',
});
