import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { add, scale, unit, braking } from './_space-curves-math.js';
import { drawCurve } from './_space-curves-view.js';

// A car on a helix of radius A and pitch B (z rises B per radian). Speed v and its rate of change are set by the student.
const A = 3;
const B = 0.4;
const ROAD = { r: (t) => [A * Math.cos(t), A * Math.sin(t), B * t], range: [-2 * Math.PI, 2 * Math.PI] };
const state = { angle: 60, v: 6, vdot: -3 };
const rad = (d) => (d * Math.PI) / 180;
const pos = (s) => [A * Math.cos(rad(s.angle)), A * Math.sin(rad(s.angle)), B * rad(s.angle)];
const T = (s) => unit([-A * Math.sin(rad(s.angle)), A * Math.cos(rad(s.angle)), B]);
const N = (s) => [-Math.cos(rad(s.angle)), -Math.sin(rad(s.angle)), 0];

const tool = createTool({
  state,
  label: 'A car on a helical road. Its acceleration arrow is split into a part along the road (braking or speeding up) and a part into the turn.',
  setup: (stage, c) => createCamera(stage, { extent: 6, yaw: 0.7, pitch: 0.4, c }),
  draw(ctx, stage, c, cam) {
    const p = pos(state);
    const parts = braking(A, B, state.v, state.vdot);
    const k = 0.35;
    cam.axes({ size: 4.2 });
    drawCurve(cam, ROAD, { color: c.grid, width: 3 });
    const aT = scale(T(state), parts.aT * k);
    const aN = scale(N(state), parts.aN * k);
    cam.arrow(p, add(p, aT), { color: c.a, width: 5 });
    cam.arrow(p, add(p, aN), { color: c.b, width: 5 });
    cam.arrow(p, add(add(p, aT), aN), { color: c.c, width: 6 });
    cam.line(add(p, aT), add(add(p, aT), aN), { color: c.grid, width: 1.5, dash: [3, 3] });
    cam.line(add(p, aN), add(add(p, aT), aN), { color: c.grid, width: 1.5, dash: [3, 3] });
    cam.point(p, { fill: c.ink, r: 7 });
    cam.label('a_T', add(add(p, aT), scale(T(state), 0.3 * Math.sign(parts.aT || 1))), { size: 11, color: c.a });
    cam.label('a_N', add(add(p, aN), [0, 0, 0.4]), { size: 11, color: c.b });
  },
  controls: [
    { title: 'Drive and brake' },
    { key: 'angle', label: 'Place on the road', min: -300, max: 300, step: 5, format: (v) => `${v}°` },
    { key: 'v', label: 'Speed v (m/s)', min: 0, max: 10, step: 1 },
    { key: 'vdot', label: 'Speeding up (+) or braking (−)', min: -6, max: 6, step: 1 },
    { readout: [
      ['a_T = dv/dt', (s) => fixed(braking(A, B, s.v, s.vdot).aT, 2)],
      ['a_N = κ v²', (s) => fixed(braking(A, B, s.v, s.vdot).aN, 2)],
      ['|a|', (s) => fixed(braking(A, B, s.v, s.vdot).total, 2)],
    ] },
  ],
  tex: (s) => {
    const r = braking(A, B, s.v, s.vdot);
    return `\\mathbf{a} = \\dfrac{dv}{dt}\\mathbf{T} + \\kappa v^2\\mathbf{N} = ${fixed(r.aT, 2)}\\,\\mathbf{T} + ${fixed(r.aN, 2)}\\,\\mathbf{N}`;
  },
});
tool.extra.orbit(tool.update);
