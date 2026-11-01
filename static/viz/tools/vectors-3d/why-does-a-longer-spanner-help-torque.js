import { createTool } from '../../lib/tool.js';
import { createCamera } from '../../lib/project3d.js';
import { fixed } from '../../lib/format.js';
import { cross, torque, norm } from './_cross-product-math.js';

const state = { L: 3, F: 20, phi: 90 };
const O = [0, 0, 0];
const r = (s) => [s.L, 0, 0];
const f = (s) => [s.F * Math.cos((s.phi * Math.PI) / 180), s.F * Math.sin((s.phi * Math.PI) / 180), 0];

const tool = createTool({
  state,
  label: 'A spanner on a nut at the origin, lying along the x axis. A force acts at the hand. The torque arrow stands along the bolt, and its length grows with the spanner length.',
  setup: (stage, c) => createCamera(stage, { extent: 7, yaw: 0.55, pitch: 0.6, c }),
  draw(ctx, stage, c, cam) {
    const hand = r(state);
    const force = f(state).map((v) => v / 10);
    const t = torque(r(state), f(state));
    cam.axes({ size: 5.5 });
    cam.line(O, hand, { color: c.ink, width: 9 });
    cam.line(O, hand, { color: c.fillY, width: 5 });
    cam.point(O, { fill: c.ink, r: 9 });
    cam.arrow(hand, hand.map((v, i) => v + force[i]), { color: c.a, width: 5 });
    cam.point(hand, { fill: c.a, r: 6 });
    cam.label('F', hand.map((v, i) => v + force[i] * 1.2), { size: 13, color: c.a });
    const tip = [0, 0, t[2] / 15];
    if (Math.abs(tip[2]) > 1e-9) {
      cam.arrow(O, tip, { color: c.c, width: 6 });
      cam.label('τ', [0, 0, tip[2] + Math.sign(tip[2]) * 0.6], { size: 13, color: c.c });
    }
    cam.label(`r = ${state.L} m`, [state.L / 2, -0.7, 0], { size: 11 });
  },
  controls: [
    { title: 'Hand position and push' },
    { key: 'L', label: 'Hand at r (m)', min: 0.5, max: 5, step: 0.5 },
    { key: 'F', label: 'Force F (N)', min: 5, max: 40, step: 5 },
    { key: 'phi', label: 'Push angle φ', min: 0, max: 180, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['τ = r F sin φ', (s) => `${fixed(s.L * s.F * Math.sin((s.phi * Math.PI) / 180), 2)} N m`],
      ['|r × F|', (s) => `${fixed(norm(torque(r(s), f(s))), 2)} N m`],
      ['Force for 60 N m', (s) => (Math.sin((s.phi * Math.PI) / 180) < 1e-9 ? '–' : `${fixed(60 / (s.L * Math.sin((s.phi * Math.PI) / 180)), 1)} N`)],
    ] },
  ],
  tex: (s) => `\\tau = rF\\sin\\varphi = ${fixed(s.L, 1)}\\times ${s.F}\\times\\sin ${s.phi}^\\circ = ${fixed(s.L * s.F * Math.sin((s.phi * Math.PI) / 180), 2)}\\ \\text{N m}`,
});
tool.extra.orbit(tool.update);
