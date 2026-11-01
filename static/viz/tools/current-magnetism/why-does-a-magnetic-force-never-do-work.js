import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label, line } from '../../lib/draw.js';
import { sig, fixed } from '../../lib/format.js';

// Units chosen so m = q = 1. B points out of the page (⊙). The electric field points along +x.
const state = { field: 'B', v: 1.5, strength: 1, t: 1.6 };
const CYCLE = (s) => (s.field === 'B' ? (2 * Math.PI) / s.strength : 2.2);
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: CYCLE, update: () => tool.update() });
line2.clock.speed = 1;

// position and velocity at time t
function motion(s, t) {
  if (s.field === 'B') {
    const w = s.strength;
    const r = s.v / w;
    // A positive charge in B out of the page goes clockwise: it starts at (r, 0) heading down.
    return { p: [r * Math.cos(w * t), -r * Math.sin(w * t)], v: [-s.v * Math.sin(w * t), -s.v * Math.cos(w * t)] };
  }
  const a = s.strength;
  return { p: [-3 + 0.5 * a * t * t, -3 + s.v * t], v: [a * t, s.v] };
}
const speed = (v) => Math.hypot(v[0], v[1]);
// force on the charge: q v × B for B out of the page is (v_y, -v_x) B
const forceOf = (s, t) => {
  const m = motion(s, t);
  return s.field === 'B' ? [m.v[1] * s.strength, -m.v[0] * s.strength] : [s.strength, 0];
};
const workRate = (s, t) => {
  const f = forceOf(s, t);
  const v = motion(s, t).v;
  return s.field === 'B' ? 0 : f[0] * v[0] + f[1] * v[1]; // for B the dot product is exactly zero
};

const tool = createTool({
  state,
  label: 'A charged particle moving in a field. In a magnetic field it goes round in a circle, its velocity arrow turning but never growing. In an electric field it speeds up. Coral shows the velocity, blue shows the force, and a small square marks a right angle between them.',
  draw(ctx, stage, c) {
    const half = 4.6;
    const s = Math.min(stage.w, stage.h) / (2 * half);
    const cx = stage.w / 2;
    const cy = stage.h / 2;
    const px = (p) => [cx + p[0] * s, cy - p[1] * s];
    // trail
    ctx.beginPath();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const [x, y] = px(motion(state, (state.t * i) / steps).p);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 3;
    ctx.stroke();
    const m = motion(state, state.t);
    const [x, y] = px(m.p);
    const f = forceOf(state, state.t);
    const unit = 34;
    arrow(ctx, x, y, x + m.v[0] * unit, y - m.v[1] * unit, { color: c.a, width: 4 });
    arrow(ctx, x, y, x + f[0] * unit, y - f[1] * unit, { color: c.b, width: 4 });
    dot(ctx, x, y, 9, c.fillY, c.ink);
    label(ctx, 'velocity', x + m.v[0] * unit, y - m.v[1] * unit - 12, c, { color: c.a, size: 11, bounds: [0, stage.w] });
    label(ctx, 'force', x + f[0] * unit, y - f[1] * unit + 14, c, { color: c.b, size: 11, bounds: [0, stage.w] });
    label(ctx, state.field === 'B' ? 'B out of the page (⊙)' : 'E → (to the right)', stage.w / 2, 16, c, { color: c.ink, size: 12 });
    if (state.field === 'B') line(ctx, cx - 4, cy, cx + 4, cy, { color: c.grid, width: 2 });
  },
  controls: () => [
    { title: 'Charge in a field' },
    { key: 'field', label: 'Field', options: [['B', 'Magnetic B'], ['E', 'Electric E']] },
    { key: 'v', label: 'Starting speed', min: 0.5, max: 2.5, step: 0.1, format: (n) => fixed(n, 1) },
    { key: 'strength', label: 'Field strength', min: 0.5, max: 2, step: 0.1, format: (n) => fixed(n, 1) },
    transport(line2.clock),
    { readout: [
      ['Speed', (s) => fixed(speed(motion(s, s.t).v), 3)],
      ['Kinetic energy', (s) => fixed(0.5 * speed(motion(s, s.t).v) ** 2, 3)],
      ['Work rate, F·v', (s) => (workRate(s, s.t) === 0 ? '0 exactly' : fixed(workRate(s, s.t), 3))],
    ] },
  ],
  tex: (s) => (s.field === 'B'
    ? '\\vec F\\cdot\\vec v=q(\\vec v\\times\\vec B)\\cdot\\vec v=0'
    : `\\vec F\\cdot\\vec v=${sig(workRate(s, s.t), 3)}`),
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
