import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { SURFACES } from './_vector-calculus-math.js';
import { fixed } from '../../lib/format.js';

const state = { surface: 'sphere', wrap: 1, lines: 12, pu: 0.3, pv: 0.45 };
const TEX = {
  sphere: '\\mathbf{r}(u,v) = (2\\sin v\\cos u,\\ 2\\sin v\\sin u,\\ 2\\cos v)',
  torus: '\\mathbf{r}(u,v) = ((2+0.8\\cos v)\\cos u,\\ (2+0.8\\cos v)\\sin u,\\ 0.8\\sin v)',
  cylinder: '\\mathbf{r}(u,v) = (2\\cos u,\\ 2\\sin u,\\ v)',
  cone: '\\mathbf{r}(u,v) = (v\\cos u,\\ v\\sin u,\\ v)',
};
// A flat rectangle laid out in the floor, then blended onto the surface.
const place = (S, u, v, w) => {
  const flat = [((u - S.u[0]) / (S.u[1] - S.u[0])) * 7 - 3.5, ((v - S.v[0]) / (S.v[1] - S.v[0])) * 4.5 - 2.25, -2.6];
  const bent = S.r(u, v);
  return flat.map((x, i) => x + (bent[i] - x) * w);
};

const tool = createTool({
  state,
  label: 'A flat grid of (u, v) lines that can be bent onto a sphere, torus, cylinder or cone. One small grid cell is shaded, and it stays one small cell as the grid is wrapped.',
  setup: (stage, c) => createCamera(stage, { extent: 5.2, yaw: 0.7, pitch: 0.45, c }),
  draw(ctx, stage, c, cam) {
    const S = SURFACES[state.surface];
    const w = state.wrap;
    const n = Number(state.lines);
    const steps = 36;
    const at = (a, b) => place(S, S.u[0] + a * (S.u[1] - S.u[0]), S.v[0] + b * (S.v[1] - S.v[0]), w);
    cam.axes({ size: 3.6 });
    for (let i = 0; i <= n; i++) {
      for (let k = 0; k < steps; k++) {
        cam.line(at(i / n, k / steps), at(i / n, (k + 1) / steps), { color: c.a, width: 2 });
        cam.line(at(k / steps, i / n), at(( k + 1) / steps, i / n), { color: c.b, width: 2 });
      }
    }
    const [i0, j0] = [Math.min(n - 1, Math.floor(state.pu * n)), Math.min(n - 1, Math.floor(state.pv * n))];
    const corner = (a, b) => at(a / n, b / n);
    cam.faces([{ pts: [corner(i0, j0), corner(i0 + 1, j0), corner(i0 + 1, j0 + 1), corner(i0, j0 + 1)], fill: c.fillY, stroke: c.ink, width: 3 }]);
  },
  controls: [
    { title: 'Wrap the grid' },
    { key: 'surface', label: 'Shape', options: Object.entries(SURFACES).map(([k, v]) => [k, v.name]) },
    { key: 'wrap', label: 'Flat ↔ wrapped', min: 0, max: 1, step: 0.02, format: (v) => `${Math.round(v * 100)}%` },
    { key: 'lines', label: 'Grid lines', options: [[6, '6'], [12, '12'], [18, '18']] },
    { key: 'pu', label: 'Shaded cell: u', min: 0, max: 0.99, step: 0.01, format: (v) => fixed(v, 2) },
    { key: 'pv', label: 'Shaded cell: v', min: 0, max: 0.99, step: 0.01, format: (v) => fixed(v, 2) },
    { readout: [
      ['u runs over', (s) => `${fixed(SURFACES[s.surface].u[0], 2)} to ${fixed(SURFACES[s.surface].u[1], 2)}`],
      ['v runs over', (s) => `${fixed(SURFACES[s.surface].v[0], 2)} to ${fixed(SURFACES[s.surface].v[1], 2)}`],
    ] },
  ],
  tex: (s) => TEX[s.surface],
});
tool.extra.orbit(tool.update);
