import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { mul, rad } from './_la-math.js';

// A 3 × 3 matrix can rotate and scale but always fixes the origin: it cannot translate. Add a fourth coordinate (1) to every point
// and the 4 × 4 matrix [[R, t], [0, 1]] rotates and translates in one multiplication.
const state = { spin: 30, s: 1, tx: 2, ty: 1, tz: 0, hom: true };
const CUBE = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
const matrix = (s) => {
  const [c, n] = [Math.cos(rad(s.spin)) * s.s, Math.sin(rad(s.spin)) * s.s];
  return [[c, -n, 0, s.hom ? s.tx : 0], [n, c, 0, s.hom ? s.ty : 0], [0, 0, s.s, s.hom ? s.tz : 0], [0, 0, 0, 1]];
};
const place = (M, p) => mul(M, [[p[0]], [p[1]], [p[2]], [1]]).map((r) => r[0]).slice(0, 3);

createTool({
  state,
  label: 'A cube turned about the vertical axis, scaled and moved by a 4 by 4 matrix, drawn beside the original grey cube. With the fourth coordinate in use, one matrix multiplication does the turn and the move together. A switch removes the fourth coordinate, and then the same controls can turn and scale the cube but can no longer move it away from the origin.',
  setup(stage, c) {
    const cam = createCamera(stage, { extent: 6, yaw: 0.8, pitch: 0.5, c });
    cam.orbit(() => stage.invalidate());
    return cam;
  },
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 5 });
    const M = matrix(state);
    for (const [a, b] of EDGES) cam.line(CUBE[a], CUBE[b], { color: c.grid, width: 2 });
    for (const [a, b] of EDGES) cam.line(place(M, CUBE[a]), place(M, CUBE[b]), { color: c.a, width: 4 });
    CUBE.forEach((p) => cam.point(place(M, p), { fill: c.fillY, r: 4 }));
  },
  controls: [
    { title: 'Turn, scale and move' },
    { key: 'hom', label: 'Use the 4th coordinate (a 4 × 4 matrix)', toggle: true },
    { key: 'spin', label: 'Turn about the z axis', min: 0, max: 180, step: 5, format: (n) => `${n}°` },
    { key: 's', label: 'Scale', min: 0.5, max: 1.5, step: 0.25, format: (n) => fixed(n, 2) },
    { key: 'tx', label: 'Move in x', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'ty', label: 'Move in y', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'tz', label: 'Move in z', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [0, 1, 2, 3].map((i) => [`Row ${i + 1}`, (s) => matrix(s)[i].map((v) => fixed(v, 2)).join('  ')]).concat([
      ['Centre of the cube moves to', (s) => place(matrix(s), [0, 0, 0]).map((v) => fixed(v, 1)).join(', ')],
    ]) },
  ],
  tex: () => '\\begin{bmatrix}x\'\\\\y\'\\\\z\'\\\\1\\end{bmatrix}=\\begin{bmatrix}R&\\mathbf t\\\\\\mathbf 0^{\\mathsf T}&1\\end{bmatrix}\\begin{bmatrix}x\\\\y\\\\z\\\\1\\end{bmatrix}',
  onChange: (s) => show(s),
});
const fields = [...document.querySelectorAll('#panel .nb-field')];
function show(s) {
  if (fields.length < 5) return;
  fields[2].hidden = !s.hom;
  fields[3].hidden = !s.hom;
  fields[4].hidden = !s.hom;
}
show(state);
