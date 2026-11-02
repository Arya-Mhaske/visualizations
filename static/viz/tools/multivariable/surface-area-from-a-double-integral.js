import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { SURF, fx, fy } from './_mv.js';

// A small square dA of the base lies under a patch of surface tilted by f_x and f_y. The patch is a parallelogram on the tangent plane
// with area √(1 + f_x² + f_y²) dA. Add them all: surface area = ∬ √(1 + f_x² + f_y²) dA over the base.
const state = { surface: 'bowl', px: 1, py: 0.5, n: 6 };
const LIM = 2;
const tilt = (f, x, y) => Math.sqrt(1 + fx(f, x, y) ** 2 + fy(f, x, y) ** 2);
export function areaSum(f, n) {
  let s = 0;
  const d = (2 * LIM) / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) s += tilt(f, -LIM + (i + 0.5) * d, -LIM + (j + 0.5) * d) * d * d;
  return s;
}

const tool = createTool({
  state,
  label: 'A surface over a square base. One small square of the base, in blue, lies under a tilted patch of the surface, in coral. The tilted patch is bigger than the square under it by the factor square root of one plus f x squared plus f y squared.',
  setup: (stage, c) => createCamera(stage, { extent: 4.4, yaw: 0.8, pitch: 0.5, c }),
  draw(ctx, stage, c, cam) {
    const { f } = SURF[state.surface];
    const n = 16;
    const d = (2 * LIM) / n;
    const faces = [];
    const P = (i, j) => { const x = -LIM + i * d; const y = -LIM + j * d; return [x, y, f(x, y)]; };
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) faces.push({ pts: [P(i, j), P(i + 1, j), P(i + 1, j + 1), P(i, j + 1)], fill: c.paper, stroke: c.grid, width: 1 });
    cam.faces(faces);
    const h = (2 * LIM) / state.n / 2;
    const [x, y] = [state.px, state.py];
    const [gx, gy, z] = [fx(f, x, y), fy(f, x, y), f(x, y)];
    const tp = (u, v) => [x + u, y + v, z + gx * u + gy * v];
    cam.faces([
      { pts: [[x - h, y - h, 0], [x + h, y - h, 0], [x + h, y + h, 0], [x - h, y + h, 0]], fill: c.fillB, stroke: c.ink, width: 2 },
      { pts: [tp(-h, -h), tp(h, -h), tp(h, h), tp(-h, h)], fill: c.fillA, stroke: c.ink, width: 2 },
    ]);
    cam.axes({ size: 3 });
  },
  controls: [
    { title: 'Tilt a patch' },
    { key: 'surface', label: 'Surface', options: Object.entries(SURF).map(([k, v]) => [k, v.name]) },
    { key: 'px', label: 'Patch x', min: -1.8, max: 1.8, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'py', label: 'Patch y', min: -1.8, max: 1.8, step: 0.1, format: (v) => v.toFixed(1) },
    { key: 'n', label: 'Squares per side, n', min: 2, max: 30, step: 1 },
    { readout: [
      ['Tilt factor', (s) => tilt(SURF[s.surface].f, s.px, s.py).toFixed(4)],
      ['Base square dA', (s) => (((2 * LIM) / s.n) ** 2).toFixed(4)],
      ['Sum of patches', (s) => areaSum(SURF[s.surface].f, s.n).toFixed(4)],
      ['With 200 squares', (s) => areaSum(SURF[s.surface].f, 200).toFixed(4)],
    ] },
  ],
  tex: (s) => `S=\\iint\\sqrt{1+f_x^2+f_y^2}\\,dA\\approx ${areaSum(SURF[s.surface].f, s.n).toFixed(3)}`,
});
tool.extra.orbit(tool.update);
