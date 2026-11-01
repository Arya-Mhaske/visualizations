import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { planeDist, footOnPlane, norm, scale, add, cross } from './_lines-planes-math.js';

// Plane n·r = d with n = (A, B, C). The point Q is moved by sliders.
const state = { A: 1, B: 2, C: 2, D: 3, qx: 3, qy: 2, qz: 4 };
const N = (s) => [s.A, s.B, s.C];
const Q = (s) => [s.qx, s.qy, s.qz];

function sheet(n, d, size) {
  const centre = scale(n, d / (norm(n) ** 2));
  const helper = Math.abs(n[2]) < 0.9 * norm(n) ? [0, 0, 1] : [1, 0, 0];
  const e1 = cross(n, helper);
  const e2 = cross(n, e1);
  const [f1, f2] = [scale(e1, size / norm(e1)), scale(e2, size / norm(e2))];
  return [add(centre, add(scale(f1, -1), scale(f2, -1))), add(centre, add(f1, scale(f2, -1))), add(centre, add(f1, f2)), add(centre, add(scale(f1, -1), f2))];
}

const tool = createTool({
  state,
  label: 'A plane drawn as a sheet, a point Q off it, and the shortest drop from Q along the normal to the plane.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.8, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const n = N(state);
    const q = Q(state);
    if (norm(n) === 0) return;
    cam.axes({ size: 6 });
    cam.faces([{ pts: sheet(n, state.D, 4.5), fill: c.fillB, stroke: c.b, width: 3 }]);
    const foot = footOnPlane(n, state.D, q);
    cam.line(q, foot, { color: c.c, width: 5 });
    cam.arrow(foot, add(foot, scale(n, 1.5 / norm(n))), { color: c.ink, width: 3 });
    cam.point(foot, { fill: c.c, r: 5 });
    cam.point(q, { fill: c.a, r: 8 });
    cam.label('Q', q.map((v) => v + 0.4), { size: 13, color: c.a });
    cam.label('n', add(foot, scale(n, 1.9 / norm(n))), { size: 12 });
  },
  controls: [
    { title: 'The plane  A x + B y + C z = D' },
    { key: 'A', label: 'A', min: -3, max: 3, step: 1 },
    { key: 'B', label: 'B', min: -3, max: 3, step: 1 },
    { key: 'C', label: 'C', min: -3, max: 3, step: 1 },
    { key: 'D', label: 'D', min: -9, max: 9, step: 1 },
    { title: 'The point Q' },
    { key: 'qx', label: 'Q: x', min: -5, max: 5, step: 1 },
    { key: 'qy', label: 'Q: y', min: -5, max: 5, step: 1 },
    { key: 'qz', label: 'Q: z', min: -5, max: 5, step: 1 },
    { readout: [
      ['A x₀ + B y₀ + C z₀ − D', (s) => String(s.A * s.qx + s.B * s.qy + s.C * s.qz - s.D)],
      ['|n|', (s) => fixed(norm(N(s)), 3)],
      ['Distance', (s) => (norm(N(s)) === 0 ? '–' : fixed(Math.abs(planeDist(N(s), s.D, Q(s))), 3))],
      ['Side of the plane', (s) => { const v = planeDist(N(s), s.D, Q(s)); return v === 0 ? 'on it' : v > 0 ? 'n side' : 'other side'; }],
    ] },
  ],
  tex: (s) => {
    if (norm(N(s)) === 0) return '\\text{Choose a normal that is not zero.}';
    const top = s.A * s.qx + s.B * s.qy + s.C * s.qz - s.D;
    return `\\dfrac{|${s.A}(${s.qx}) + ${s.B}(${s.qy}) + ${s.C}(${s.qz}) - ${s.D}|}{\\sqrt{${s.A ** 2 + s.B ** 2 + s.C ** 2}}} = \\dfrac{${Math.abs(top)}}{${fixed(norm(N(s)), 3)}} = ${fixed(Math.abs(top) / norm(N(s)), 3)}`;
  },
});
tool.extra.orbit(tool.update);
