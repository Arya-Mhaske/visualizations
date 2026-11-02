import { createTool } from '../../lib/tool.js';
import { dot, label, poly } from '../../lib/draw.js';
import { specFill } from './_aa-view.js';

// A rotation of the cube is decided by which face ends up on top (6 choices) and how the cube is then turned about the vertical (4 choices).
const state = { up: 0, spin: 0, show: true };
const NORMALS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const TO_TOP = [
  [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
  [[0, 0, 1], [0, 1, 0], [-1, 0, 0]],
  [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
  [[1, 0, 0], [0, 0, 1], [0, -1, 0]],
  [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[1, 0, 0], [0, -1, 0], [0, 0, -1]],
];
const apply = (M, v) => M.map((row) => row[0] * v[0] + row[1] * v[1] + row[2] * v[2]);
const mulM = (A, B) => A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]));
const spinM = (k) => { const [c, s] = [[1, 0, -1, 0][k % 4], [0, 1, 0, -1][k % 4]]; return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
export const orientation = (up, spin) => mulM(spinM(spin), TO_TOP[up]);
export const allOrientations = () => { const set = new Set(); for (let u = 0; u < 6; u++) for (let s = 0; s < 4; s++) set.add(JSON.stringify(orientation(u, s))); return set; };

const YAW = 0.6;
const TILT = 0.55;
const view = (p) => {
  const x = p[0] * Math.cos(YAW) - p[1] * Math.sin(YAW);
  const y = p[0] * Math.sin(YAW) + p[1] * Math.cos(YAW);
  return { sx: x, sy: -(p[2] * Math.cos(TILT) + y * Math.sin(TILT)), toward: -y * Math.sin(TILT) + p[2] * Math.cos(TILT) };
};

createTool({
  state,
  label: 'A cube with numbered faces, turned so that the chosen face is on top and then spun by a multiple of 90 degrees. A coral dot on each visible face shows which way the face is turned. Six choices of top face times four spins gives 24 different positions.',
  draw(ctx, stage, c) {
    const R = orientation(state.up, state.spin);
    const s = Math.min(stage.w, stage.h) * 0.22;
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const faces = NORMALS.map((n, f) => {
      const axis = n.findIndex((v) => v !== 0);
      const [a, b] = [0, 1, 2].filter((k) => k !== axis);
      const corner = (da, db) => { const p = [0, 0, 0]; p[axis] = n[axis]; p[a] = da; p[b] = db; return p; };
      const model = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
      const mark = corner(0.55, 0);
      return { f, model, mark, normal: apply(R, n), centre: apply(R, n) };
    });
    faces.forEach((face) => {
      if (view(face.normal).toward <= 0) return;
      const pts = face.model.map((p) => { const v = view(apply(R, p)); return [cx + v.sx * s, cy + v.sy * s]; });
      poly(ctx, pts, { fill: specFill(c, face.f), stroke: c.ink, width: 3 });
      const mid = view(face.centre);
      label(ctx, String(face.f + 1), cx + mid.sx * s, cy + mid.sy * s, c, { size: 16, patch: false });
      if (state.show) {
        const m = view(apply(R, face.mark));
        dot(ctx, cx + m.sx * s, cy + m.sy * s, 5, c.a, c.ink, 2);
      }
    });
    const top = faces.find((fc) => Math.abs(fc.normal[2] - 1) < 1e-9);
    label(ctx, `face ${top.f + 1} is on top`, stage.w / 2, 16, c, { size: 13 });
  },
  controls: [
    { title: 'Place the cube' },
    { key: 'up', label: 'Face on top', min: 0, max: 5, step: 1, format: (v) => `face ${v + 1}` },
    { key: 'spin', label: 'Spin about the vertical', min: 0, max: 3, step: 1, format: (v) => `${v * 90}°` },
    { key: 'show', label: 'Mark each face\'s turn with a dot', toggle: true },
    { readout: [
      ['Choices for the top face', () => '6'],
      ['Choices for the spin', () => '4'],
      ['This is position', (s) => `${s.up * 4 + s.spin + 1} of 24`],
      ['Different positions', () => String(allOrientations().size)],
    ] },
  ],
  tex: () => '6\\times 4=24',
});
