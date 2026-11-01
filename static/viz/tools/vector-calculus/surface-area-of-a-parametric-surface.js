import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { SURFACES, surfNormal, surfArea, norm, add, scale } from './_vector-calculus-math.js';

const state = { surface: 'torus', pu: 0.2, pv: 0.15, cell: 2, n: 6 };
const SIZE = { 1: 0.04, 2: 0.08, 3: 0.14 };
const at = (S, a, b) => [S.u[0] + a * (S.u[1] - S.u[0]), S.v[0] + b * (S.v[1] - S.v[0])];

const tool = createTool({
  state,
  label: 'A curved surface with one small patch picked out. Two short tangent arrows, r_u du and r_v dv, span a parallelogram that approximates the patch. Its area is the length of their cross product.',
  setup: (stage, c) => createCamera(stage, { extent: 3.6, yaw: 0.7, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const S = SURFACES[state.surface];
    cam.axes({ size: 3.2 });
    const grid = 18;
    for (let i = 0; i <= grid; i++) for (let k = 0; k < 28; k++) {
      cam.line(S.r(...at(S, i / grid, k / 28)), S.r(...at(S, i / grid, (k + 1) / 28)), { color: c.grid, width: 1 });
      cam.line(S.r(...at(S, k / 28, i / grid)), S.r(...at(S, (k + 1) / 28, i / grid)), { color: c.grid, width: 1 });
    }
    const [u, v] = at(S, state.pu, state.pv);
    const f = SIZE[state.cell];
    const [du, dv] = [(S.u[1] - S.u[0]) * f, (S.v[1] - S.v[0]) * f];
    const p = S.r(u, v);
    const a = scale(S.ru(u, v), du);
    const b = scale(S.rv(u, v), dv);
    cam.faces([{ pts: [p, add(p, a), add(add(p, a), b), add(p, b)], fill: c.fillY, stroke: c.ink, width: 2 }]);
    cam.arrow(p, add(p, a), { color: c.a, width: 4 });
    cam.arrow(p, add(p, b), { color: c.b, width: 4 });
    const nn = surfNormal(S, u, v);
    cam.arrow(p, add(p, scale(nn, 0.8 / norm(nn))), { color: c.c, width: 3 });
    cam.point(p, { fill: c.ink, r: 4 });
  },
  controls: [
    { title: 'Pick a patch' },
    { key: 'surface', label: 'Surface', options: Object.entries(SURFACES).map(([k, v]) => [k, v.name]) },
    { key: 'pu', label: 'Patch: u', min: 0, max: 0.95, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'pv', label: 'Patch: v', min: 0, max: 0.95, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'cell', label: 'Patch size', options: [[1, 'Small'], [2, 'Medium'], [3, 'Large']] },
    { key: 'n', label: 'Patches in the sum, per side', options: [[2, '2'], [6, '6'], [20, '20'], [60, '60']] },
    { readout: [
      ['|r_u × r_v| here', (s) => { const S = SURFACES[s.surface]; return fixed(norm(surfNormal(S, ...at(S, s.pu, s.pv))), 3); }],
      ['Sum over all patches', (s) => fixed(surfArea(SURFACES[s.surface], Number(s.n)), 3)],
      ['Exact area', (s) => fixed(SURFACES[s.surface].area, 3)],
    ] },
  ],
  tex: () => 'A = \\iint_D |\\mathbf{r}_u\\times\\mathbf{r}_v|\\,du\\,dv',
});
tool.extra.orbit(tool.update);
