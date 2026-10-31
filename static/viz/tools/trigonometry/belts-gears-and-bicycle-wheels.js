import { createTool } from '../../lib/tool.js';
import { createLoop } from '../../lib/anim.js';
import { arc, dot, line, label, TAU } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { followerOmega, speed } from './_angles-arcs-math.js';

const state = { omega: 2, driver: 6, follower: 3, a1: 0, a2: 0 };
const omega2 = (s) => followerOmega(s.omega, s.driver, s.follower);
let loop = null;

function pulley(ctx, x, y, r, angle, c, fill) {
  dot(ctx, x, y, r, fill, c.ink);
  for (let i = 0; i < 3; i++) {
    const a = angle + (i * TAU) / 3;
    line(ctx, x, y, x + r * Math.cos(a), y + r * Math.sin(a), { color: c.ink, width: 2 });
  }
  dot(ctx, x + r * 0.8 * Math.cos(angle), y + r * 0.8 * Math.sin(angle), 5, c.a, c.ink, 2);
}

const tool = createTool({
  state,
  label: 'Two pulleys joined by a belt. Each has a spoke marker, so the smaller pulley is seen turning faster.',
  draw(ctx, stage, c) {
    const unit = stage.w / 32;
    const [x1, x2, y] = [stage.w * 0.27, stage.w * 0.73, stage.h * 0.5];
    const [r1, r2] = [state.driver * unit, state.follower * unit];
    const tilt = Math.asin((r1 - r2) / (x2 - x1));
    const top = -Math.PI / 2 + tilt;
    const bottom = Math.PI / 2 - tilt;
    arc(ctx, x1, y, r1 + 4, bottom, top + TAU, { color: c.ink, width: 4 });
    arc(ctx, x2, y, r2 + 4, top, bottom, { color: c.ink, width: 4 });
    for (const a of [top, bottom]) {
      line(ctx, x1 + (r1 + 4) * Math.cos(a), y + (r1 + 4) * Math.sin(a), x2 + (r2 + 4) * Math.cos(a), y + (r2 + 4) * Math.sin(a), { color: c.ink, width: 4 });
    }
    pulley(ctx, x1, y, r1, state.a1, c, c.fillB);
    pulley(ctx, x2, y, r2, state.a2, c, c.fillY);
    label(ctx, `belt speed ${fixed(speed(state.driver, state.omega), 1)} cm/s on both rims`, stage.w / 2, stage.h - 14, c, { size: 11, bounds: stage });
  },
  controls: (self) => [
    { title: 'One belt, two speeds' },
    { key: 'driver', label: 'Driver radius, r₁', min: 2, max: 7, step: 0.5, format: (v) => `${fixed(v, 1)} cm` },
    { key: 'follower', label: 'Follower radius, r₂', min: 1, max: 5, step: 0.5, format: (v) => `${fixed(v, 1)} cm` },
    { key: 'omega', label: 'Driver speed, ω₁', min: 0.5, max: 4, step: 0.5, format: (v) => `${fixed(v, 1)} rad/s` },
    { row: [
      { button: 'Turn', onClick() { if (!loop.start()) { state.a1 += 0.5; state.a2 += 0.5 * omega2(state) / state.omega; self.update(); } } },
      { button: 'Stop', ghost: true, onClick() { loop.stop(); } },
    ] },
    { readout: [
      ['Belt speed, v', (s) => `${fixed(speed(s.driver, s.omega), 2)} cm/s`],
      ['Driver, ω₁', (s) => `${fixed(s.omega, 2)} rad/s`],
      ['Follower, ω₂', (s) => `${fixed(omega2(s), 2)} rad/s`],
      ['Follower turns per driver turn', (s) => fixed(s.driver / s.follower, 2)],
    ] },
  ],
  tex: (s) => `r_1\\omega_1 = r_2\\omega_2:\\quad ${fixed(s.driver, 1)} \\times ${fixed(s.omega, 1)} = ${fixed(s.follower, 1)} \\times ${fixed(omega2(s), 2)}`,
});

loop = createLoop(document.querySelector('#stage'), (dt) => {
  state.a1 += state.omega * dt;
  state.a2 += omega2(state) * dt;
  tool.stage.invalidate();
});
