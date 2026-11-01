import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { tetra, scale, add, norm } from './_lines-planes-math.js';

// A, B, C on the floor corner; D moves. Face area vectors point outward and their sum is zero.
const state = { dx: 1, dy: 1, dz: 4, show: 'all' };
const A = [0, 0, 0];
const B = [4, 0, 0];
const C = [0, 3, 0];
const D = (s) => [s.dx, s.dy, s.dz];
const NAMES = ['BCD', 'ACD', 'ABD', 'ABC'];
const FACE_COLOURS = ['a', 'b', 'c', 'd'];

const tool = createTool({
  state,
  label: 'A tetrahedron with an arrow standing out of each of its four faces. The arrow length is the face area. Joined head to tail, the four arrows close into a loop.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const d = D(state);
    const t = tetra(A, B, C, d);
    cam.axes({ size: 5 });
    const faces = [[B, C, d], [A, C, d], [A, B, d], [A, B, C]];
    cam.faces(faces.map((pts, i) => ({ pts, fill: c[`fill${'ABCY'[i]}`], stroke: c.ink, width: 2 })));
    faces.forEach((pts, i) => {
      const centre = scale(add(add(pts[0], pts[1]), pts[2]), 1 / 3);
      const f = scale(t.faces[i], 0.25);
      if (state.show === 'all') cam.arrow(centre, add(centre, f), { color: c[FACE_COLOURS[i]], width: 4 });
    });
    if (state.show === 'chain') {
      // Same arrows, joined head to tail: they come back to the start.
      let at = [-5, -4, 0];
      t.faces.forEach((f, i) => {
        const next = add(at, scale(f, 0.25));
        cam.arrow(at, next, { color: c[FACE_COLOURS[i]], width: 5 });
        at = next;
      });
      cam.point(at, { fill: c.ink, r: 6 });
    }
  },
  controls: [
    { title: 'Move the top vertex D' },
    { key: 'show', label: 'Arrows', options: [['all', 'On the faces'], ['chain', 'Head to tail']] },
    { key: 'dx', label: 'D: x', min: -2, max: 5, step: 1 },
    { key: 'dy', label: 'D: y', min: -2, max: 5, step: 1 },
    { key: 'dz', label: 'D: z (height)', min: 1, max: 6, step: 1 },
    { readout: [
      ...NAMES.map((name, i) => [`Area ${name}`, (s) => fixed(norm(tetra(A, B, C, D(s)).faces[i]), 3)]),
      ['Sum of the four', (s) => `(${tetra(A, B, C, D(s)).total.map((v) => fixed(Math.abs(v) < 1e-9 ? 0 : v, 3)).join(', ')})`],
      ['Volume', (s) => fixed(tetra(A, B, C, D(s)).volume, 3)],
    ] },
  ],
  tex: () => '\\overrightarrow{S_{BCD}} + \\overrightarrow{S_{ACD}} + \\overrightarrow{S_{ABD}} + \\overrightarrow{S_{ABC}} = \\mathbf{0}',
});
tool.extra.orbit(tool.update);
