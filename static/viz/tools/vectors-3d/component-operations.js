import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { add, sub, scale, unit, norm } from './_vectors-in-space-math.js';

const state = { op: 'add', ux: 3, uy: 1, uz: 2, vx: 1, vy: 3, vz: 1, k: 2 };
const O = [0, 0, 0];
const U = (s) => [s.ux, s.uy, s.uz];
const V = (s) => [s.vx, s.vy, s.vz];
const vec = (p) => `(${p.map((v) => fixed(v, 2)).join(', ')})`;
const result = (s) => {
  const [u, v] = [U(s), V(s)];
  return { add: add(u, v), sub: sub(u, v), scale: scale(u, s.k), unit: unit(u) }[s.op];
};

const tool = createTool({
  state,
  label: 'Vectors u and v in space, and the result of adding, subtracting, scaling or normalising, drawn from the origin.',
  setup: (stage, c) => createCamera(stage, { extent: 8, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const [u, v, r] = [U(state), V(state), result(state)];
    cam.axes({ size: 7 });
    if (state.op === 'add') {
      cam.line(u, r, { color: c.b, width: 2, dash: [5, 4] });
      cam.line(v, r, { color: c.a, width: 2, dash: [5, 4] });
    }
    if (state.op === 'sub') cam.arrow(v, u, { color: c.d, width: 3 });
    cam.arrow(O, u, { color: c.a, width: 4 });
    if (state.op === 'add' || state.op === 'sub') cam.arrow(O, v, { color: c.b, width: 4 });
    if (r) cam.arrow(O, r, { color: c.c, width: 6 });
    cam.label('u', u.map((x) => x * 1.1), { size: 13, color: c.a });
    if (state.op === 'add' || state.op === 'sub') cam.label('v', v.map((x) => x * 1.1), { size: 13, color: c.b });
    if (r) cam.label('result', r.map((x) => x * 1.05 + 0.4), { size: 11, color: c.c });
  },
  controls: [
    { title: 'Do something to u' },
    { key: 'op', label: 'Operation', options: [['add', 'u + v'], ['sub', 'u − v'], ['scale', 'k u'], ['unit', 'û (length 1)']] },
    { key: 'ux', label: 'u: x', min: -5, max: 5, step: 1 },
    { key: 'uy', label: 'u: y', min: -5, max: 5, step: 1 },
    { key: 'uz', label: 'u: z', min: -5, max: 5, step: 1 },
    { key: 'vx', label: 'v: x', min: -5, max: 5, step: 1 },
    { key: 'vy', label: 'v: y', min: -5, max: 5, step: 1 },
    { key: 'vz', label: 'v: z', min: -5, max: 5, step: 1 },
    { key: 'k', label: 'k', min: -3, max: 3, step: 0.5 },
    { readout: [
      ['Result', (s) => { const r = result(s); return r ? vec(r) : 'u = 0: no direction'; }],
      ['Its length', (s) => { const r = result(s); return r ? fixed(norm(r), 3) : '–'; }],
    ] },
  ],
  tex: (s) => {
    const [u, v] = [U(s), V(s)];
    const col = (p) => `\\begin{pmatrix}${p.map((x) => fixed(x, 2)).join('\\\\')}\\end{pmatrix}`;
    if (s.op === 'add') return `${col(u)} + ${col(v)} = ${col(add(u, v))}`;
    if (s.op === 'sub') return `${col(u)} - ${col(v)} = ${col(sub(u, v))}`;
    if (s.op === 'scale') return `${fixed(s.k, 1)}${col(u)} = ${col(scale(u, s.k))}`;
    const h = unit(u);
    return h ? `\\hat{\\mathbf{u}} = \\dfrac{1}{${fixed(norm(u), 3)}}${col(u)} = ${col(h)}` : '\\text{The zero vector cannot be normalised.}';
  },
});
tool.extra.orbit(tool.update);
