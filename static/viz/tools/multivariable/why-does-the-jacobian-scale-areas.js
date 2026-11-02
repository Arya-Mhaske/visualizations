import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line, poly } from '../../lib/draw.js';

// A change of variables (u, v) → (x, y) turns a tiny square of area du dv into a tiny parallelogram of area |J| du dv,
// where J = x_u y_v − x_v y_u is the determinant of the matrix of partial derivatives.
const state = { map: 'lin', a: 2, b: 1, c: 0, d: 1.5, u: 1.2, v: 0.8, h: 0.4 };
const MAPS = {
  lin: { name: 'Linear: (au + bv, cu + dv)', f: (s, u, v) => [s.a * u + s.b * v, s.c * u + s.d * v] },
  polar: { name: 'Polar: (u cos v, u sin v)', f: (s, u, v) => [u * Math.cos(v), u * Math.sin(v)] },
  sq: { name: 'Squaring: (u² − v², 2uv)', f: (s, u, v) => [u * u - v * v, 2 * u * v] },
};
const F = (u, v) => MAPS[state.map].f(state, u, v);
export function jac(s, u, v) {
  const f = MAPS[s.map].f;
  const h = 1e-5;
  const xu = [0, 1].map((k) => (f(s, u + h, v)[k] - f(s, u - h, v)[k]) / (2 * h));
  const xv = [0, 1].map((k) => (f(s, u, v + h)[k] - f(s, u, v - h)[k]) / (2 * h));
  return xu[0] * xv[1] - xv[0] * xu[1];
}
export function cellArea(s, u, v, h) {
  const f = MAPS[s.map].f;
  const p = [f(s, u, v), f(s, u + h, v), f(s, u + h, v + h), f(s, u, v + h)];
  let a = 0;
  p.forEach((q, i) => { const r = p[(i + 1) % 4]; a += q[0] * r[1] - r[0] * q[1]; });
  return Math.abs(a) / 2;
}

createTool({
  state,
  label: 'The xy plane showing the image of a grid of lines in u and v under a change of variables. One small cell of the grid is filled in coral. Its area equals the absolute Jacobian times the area du dv of the little square it came from.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-5, 5], c }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    for (let k = 0; k <= 8; k++) {
      const t = k * 0.25 + (state.map === 'polar' ? 0.25 : 0);
      for (const horizontal of [true, false]) {
        const pts = [];
        for (let i = 0; i <= 60; i++) { const s = (i / 60) * (state.map === 'polar' ? 2 * Math.PI : 2.2); pts.push(plot.toPx(...(horizontal ? F(t, s) : F(s * (state.map === 'polar' ? 1 / (2 * Math.PI) * 2.2 : 1), t)))); }
        poly(ctx, pts, { stroke: c.grid, width: 1, closed: false });
      }
    }
    const h = state.h;
    const [u, v] = [state.u, state.v];
    poly(ctx, [F(u, v), F(u + h, v), F(u + h, v + h), F(u, v + h)].map((p) => plot.toPx(...p)), { fill: c.fillA, stroke: c.ink, width: 3 });
    void line;
  },
  controls: [
    { title: 'Stretch a little square' },
    { key: 'map', label: 'Change of variables', options: Object.entries(MAPS).map(([k, v]) => [k, v.name]) },
    { key: 'a', label: 'a (linear)', min: -3, max: 3, step: 0.5 },
    { key: 'b', label: 'b (linear)', min: -3, max: 3, step: 0.5 },
    { key: 'c', label: 'c (linear)', min: -3, max: 3, step: 0.5 },
    { key: 'd', label: 'd (linear)', min: -3, max: 3, step: 0.5 },
    { key: 'u', label: 'Square at u', min: 0.2, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'v', label: 'Square at v', min: 0.2, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'h', label: 'Square side (du = dv)', min: 0.05, max: 0.6, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['Jacobian J', (s) => jac(s, s.u, s.v).toFixed(3)],
      ['|J| du dv', (s) => (Math.abs(jac(s, s.u + s.h / 2, s.v + s.h / 2)) * s.h * s.h).toFixed(4)],
      ['Area of the image cell', (s) => cellArea(s, s.u, s.v, s.h).toFixed(4)],
    ] },
  ],
  tex: () => 'dA=\\left|\\dfrac{\\partial(x,y)}{\\partial(u,v)}\\right|du\\,dv',
});
