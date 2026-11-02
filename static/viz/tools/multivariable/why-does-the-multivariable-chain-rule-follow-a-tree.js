import { createTool } from '../../lib/tool.js';
import { label, line } from '../../lib/draw.js';

// z depends on x and y, which both depend on t. Every route from z down to t contributes (product of the slopes along it); add the routes.
export const CASES = {
  a: { name: 'z = x²y, x = cos t, y = sin t', z: (x, y) => x * x * y, zx: (x, y) => 2 * x * y, zy: (x) => x * x, x: Math.cos, y: Math.sin, xp: (t) => -Math.sin(t), yp: Math.cos },
  b: { name: 'z = xy, x = t², y = t³', z: (x, y) => x * y, zx: (x, y) => y, zy: (x) => x, x: (t) => t * t, y: (t) => t ** 3, xp: (t) => 2 * t, yp: (t) => 3 * t * t },
  c: { name: 'z = x eʸ, x = t, y = t²', z: (x, y) => x * Math.exp(y), zx: (x, y) => Math.exp(y), zy: (x, y) => x * Math.exp(y), x: (t) => t, y: (t) => t * t, xp: () => 1, yp: (t) => 2 * t },
};
const state = { which: 'a', t: 0.8 };
export function parts(s) {
  const C = CASES[s.which];
  const [x, y] = [C.x(s.t), C.y(s.t)];
  const route1 = C.zx(x, y) * C.xp(s.t);
  const route2 = C.zy(x, y) * C.yp(s.t);
  const h = 1e-5;
  const direct = (C.z(C.x(s.t + h), C.y(s.t + h)) - C.z(C.x(s.t - h), C.y(s.t - h))) / (2 * h);
  return { x, y, zx: C.zx(x, y), zy: C.zy(x, y), xp: C.xp(s.t), yp: C.yp(s.t), route1, route2, total: route1 + route2, direct };
}
const f2 = (v) => v.toFixed(2);

createTool({
  state,
  label: 'A tree with z at the top, branching to x and y, each of which leads down to t. Each branch is marked with its slope. Each route from z to t multiplies its slopes, and the two route products add to give dz by dt.',
  draw(ctx, stage, c) {
    const p = parts(state);
    const W = stage.w;
    const nodes = { z: [W / 2, 40], x: [W * 0.27, stage.h * 0.42], y: [W * 0.73, stage.h * 0.42], t1: [W * 0.27, stage.h * 0.74], t2: [W * 0.73, stage.h * 0.74] };
    const edge = (a, b, color, text) => { line(ctx, ...nodes[a], ...nodes[b], { color, width: 4 }); label(ctx, text, (nodes[a][0] + nodes[b][0]) / 2 + (a === 'z' ? (b === 'x' ? -34 : 34) : 0), (nodes[a][1] + nodes[b][1]) / 2, c, { size: 11, bounds: stage }); };
    edge('z', 'x', c.a, `∂z/∂x = ${f2(p.zx)}`);
    edge('z', 'y', c.b, `∂z/∂y = ${f2(p.zy)}`);
    edge('x', 't1', c.a, `dx/dt = ${f2(p.xp)}`);
    edge('y', 't2', c.b, `dy/dt = ${f2(p.yp)}`);
    Object.entries({ z: 'z', x: 'x', y: 'y', t1: 't', t2: 't' }).forEach(([k, t]) => {
      ctx.fillStyle = k === 'z' ? c.fillY : k.startsWith('t') ? c.fillC : c.paper;
      ctx.fillRect(nodes[k][0] - 18, nodes[k][1] - 16, 36, 32);
      ctx.strokeStyle = c.ink;
      ctx.lineWidth = 3;
      ctx.strokeRect(nodes[k][0] - 18, nodes[k][1] - 16, 36, 32);
      label(ctx, t, nodes[k][0], nodes[k][1], c, { size: 15, patch: false });
    });
    label(ctx, `${f2(p.route1)}`, nodes.t1[0], nodes.t1[1] + 34, c, { size: 13, color: c.a });
    label(ctx, `${f2(p.route2)}`, nodes.t2[0], nodes.t2[1] + 34, c, { size: 13, color: c.b });
    label(ctx, `${f2(p.route1)} + ${f2(p.route2)} = ${f2(p.total)}`, W / 2, stage.h - 16, c, { size: 14, bounds: stage });
  },
  controls: [
    { title: 'Trace the routes' },
    { key: 'which', label: 'Functions', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
    { key: 't', label: 't', min: -2, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { readout: [
      ['dz/dt by the tree', (s) => parts(s).total.toFixed(4)],
      ['dz/dt by direct slope', (s) => parts(s).direct.toFixed(4)],
    ] },
  ],
  tex: () => '\\frac{dz}{dt}=\\frac{\\partial z}{\\partial x}\\frac{dx}{dt}+\\frac{\\partial z}{\\partial y}\\frac{dy}{dt}',
});
