import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { eig2 } from './_la-math.js';

// Energy q(x, y) = a x² + 2b x y + d y² = xᵀ A x with A = [[a, b], [b, d]], drawn as a surface.
const state = { a: 2, b: 0.5, d: 1.5 };
const q = (s, x, y) => s.a * x * x + 2 * s.b * x * y + s.d * y * y;
const kind = (s) => { const l = eig2([[s.a, s.b], [s.b, s.d]]).l; if (l[1] > 1e-9) return 'a bowl: positive definite'; if (l[0] < -1e-9) return 'an upside-down bowl: negative definite'; if (l[0] > 1e-9 && l[1] < -1e-9) return 'a saddle: indefinite'; return 'a trough: only semi-definite'; };
const N = 12;
const H = 2;

createTool({
  state,
  label: 'The surface of the energy x transpose A x for a symmetric two by two matrix, drawn as a mesh over the floor. If every eigenvalue is positive the surface is a bowl with its lowest point at the origin. A negative eigenvalue bends it downward in one direction and makes a saddle. A zero eigenvalue leaves a flat trough. Drag on the picture to turn it.',
  setup(stage, c) {
    const cam = createCamera(stage, { extent: 4.5, yaw: 0.8, pitch: 0.55, c });
    cam.orbit(() => stage.invalidate());
    return cam;
  },
  draw(ctx, stage, c, cam) {
    cam.axes({ size: 3 });
    const z = (x, y) => Math.max(-3.5, Math.min(3.5, q(state, x, y) / 2));
    const at = (i, j) => { const x = -H + (2 * H * i) / N; const y = -H + (2 * H * j) / N; return [x, y, z(x, y)]; };
    for (let i = 0; i <= N; i++) for (let j = 0; j < N; j++) {
      cam.line(at(i, j), at(i, j + 1), { color: c.a, width: 2 });
      cam.line(at(j, i), at(j + 1, i), { color: c.b, width: 2 });
    }
    cam.point([0, 0, 0], { fill: c.fillY, r: 6 });
  },
  controls: [
    { title: 'Shape the surface' },
    { key: 'a', label: 'a (x² coefficient)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'b (the xy part is 2b)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'd (y² coefficient)', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Eigenvalues', (s) => { const e = eig2([[s.a, s.b], [s.b, s.d]]); return e.l.map((v) => fixed(v, 3)).join(', '); }],
      ['The surface is', (s) => ({ text: kind(s), good: kind(s).startsWith('a bowl') })],
    ] },
  ],
  tex: (s) => `\\mathbf x^{\\mathsf T}A\\mathbf x=${fixed(s.a, 1)}x^2+${fixed(2 * s.b, 1)}xy+${fixed(s.d, 1)}y^2`,
});
