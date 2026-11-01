import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { dirCosines, angleDeg, norm, scale } from './_vectors-in-space-math.js';

const state = { a: 3, b: 4, c: 5, show: 'unit' };
const O = [0, 0, 0];
const AXES = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const NAMES = ['α', 'β', 'γ'];

// A short arc in the plane of an axis and the vector, to show the angle between them.
function arc(cam, axis, dir, radius, color) {
  const theta = Math.acos(Math.max(-1, Math.min(1, axis.reduce((s, v, i) => s + v * dir[i], 0))));
  const sin = Math.sin(theta);
  if (sin < 1e-6) return;
  let last = scale(axis, radius);
  for (let i = 1; i <= 16; i++) {
    const t = (i / 16) * theta;
    const w0 = Math.sin(theta - t) / sin;
    const w1 = Math.sin(t) / sin;
    const p = axis.map((v, k) => radius * (w0 * v + w1 * dir[k]));
    cam.line(last, p, { color, width: 2 });
    last = p;
  }
}

const tool = createTool({
  state,
  label: 'A vector in space with its three angles to the x, y and z axes, and the box whose edges are its components.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.75, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const v = [state.a, state.b, state.c];
    const k = dirCosines(v);
    cam.axes({ size: 6 });
    if (!k) { cam.point(O, { fill: c.ink }); return; }
    const shown = state.show === 'unit' ? k : v;
    const [x, y, z] = shown;
    const colours = [c.a, c.b, c.c];
    const F = [x, y, 0];
    cam.line(F, O, { color: c.grid, width: 2, dash: [4, 4] });
    cam.line([x, 0, 0], F, { color: c.grid, width: 2 });
    cam.line([0, y, 0], F, { color: c.grid, width: 2 });
    cam.line(F, shown, { color: c.grid, width: 2 });
    for (let i = 0; i < 3; i++) {
      const from = [0, 0, 0];
      const to = [0, 0, 0];
      to[i] = shown[i];
      cam.line(from, to, { color: colours[i], width: 5 });
    }
    cam.arrow(O, shown, { color: c.d, width: 4 });
    const u = k;
    const radius = state.show === 'unit' ? 0.5 : Math.min(2.2, norm(v) * 0.3);
    AXES.forEach((axis, i) => arc(cam, axis, u, radius, colours[i]));
    cam.label(`${NAMES[0]} ${fixed(angleDeg(k[0]), 0)}°`, [x * 0.5 + 0.6, -0.5, 0], { size: 11, color: c.a });
    cam.label(`${NAMES[1]} ${fixed(angleDeg(k[1]), 0)}°`, [-0.5, y * 0.5 + 0.7, 0], { size: 11, color: c.b });
    cam.label(`${NAMES[2]} ${fixed(angleDeg(k[2]), 0)}°`, [-0.6, -0.6, z * 0.5 + 0.5], { size: 11, color: c.c });
  },
  controls: [
    { title: 'A vector, and the angles it makes' },
    { key: 'show', label: 'Draw', options: [['unit', 'Unit vector (length 1)'], ['full', 'The vector itself']] },
    { key: 'a', label: 'a (x part)', min: -5, max: 5, step: 1 },
    { key: 'b', label: 'b (y part)', min: -5, max: 5, step: 1 },
    { key: 'c', label: 'c (z part)', min: -5, max: 5, step: 1 },
    { readout: [
      ['|v|', (s) => fixed(norm([s.a, s.b, s.c]), 3)],
      ['cos α = l', (s) => { const k = dirCosines([s.a, s.b, s.c]); return k ? fixed(k[0], 3) : '–'; }],
      ['cos β = m', (s) => { const k = dirCosines([s.a, s.b, s.c]); return k ? fixed(k[1], 3) : '–'; }],
      ['cos γ = n', (s) => { const k = dirCosines([s.a, s.b, s.c]); return k ? fixed(k[2], 3) : '–'; }],
      ['l² + m² + n²', (s) => { const k = dirCosines([s.a, s.b, s.c]); return k ? fixed(k.reduce((t, q) => t + q * q, 0), 3) : '–'; }],
    ] },
  ],
  tex: (s) => {
    const k = dirCosines([s.a, s.b, s.c]);
    if (!k) return '\\text{The zero vector has no direction.}';
    const f = (q) => fixed(q * q, 3);
    return `l^2 + m^2 + n^2 = ${f(k[0])} + ${f(k[1])} + ${f(k[2])} = ${fixed(k.reduce((t, q) => t + q * q, 0), 3)}`;
  },
});
tool.extra.orbit(tool.update);
