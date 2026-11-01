import { createTool } from '../../lib/tool.js';
import { createTimeline } from '../../lib/timeline.js';
import { transport } from '../../lib/sim.js';
import { arrow, dot, label } from '../../lib/draw.js';
import { fixed, sig } from '../../lib/format.js';

// Units with q = m = 1. B points up the page (side views) or at you (top view). All lengths scale with v/B.
const state = { view: '3d', theta: 40, v: 2, B: 1, t: 5 };
const TURN = 2.4; // seconds on screen per turn
const line2 = createTimeline(document.querySelector('#stage'), state, { cycle: () => 5 * TURN, update: () => tool.update() });
const rad = (d) => (d * Math.PI) / 180;
const rOf = (s) => (s.v * Math.sin(rad(s.theta))) / s.B;
const pitchOf = (s) => (2 * Math.PI * s.v * Math.cos(rad(s.theta))) / s.B;
// a point of the path after tau turns; a positive charge goes clockwise seen from the tip of B
const at = (s, tau) => {
  const r = rOf(s);
  return { x: r * Math.cos(2 * Math.PI * tau), y: -r * Math.sin(2 * Math.PI * tau), z: pitchOf(s) * tau };
};
const project = (view, p) => (view === 'side' ? [p.x, p.z] : view === 'top' ? [p.x, p.y] : [p.x - 0.5 * p.y, p.z + 0.3 * p.y]);

const tool = createTool({
  state,
  label: 'A charge spiralling along a magnetic field, seen from the side, from above, or at an angle. From above the path is a circle. From the side it moves steadily along the field while turning. Together they make a helix.',
  draw(ctx, stage, c) {
    const tau = state.t / TURN;
    const r = Math.max(rOf(state), 1e-6);
    const P = pitchOf(state);
    const now = at(state, tau);
    const top = state.view === 'top';
    const cz = now.z - 0.5 * Math.max(P, 2 * r);
    const span = top ? 2.6 * r : Math.max(2.2 * Math.max(P, 2 * r), 1e-6);
    const s = top ? Math.min(stage.w, stage.h) / span : Math.min(stage.w / (2.9 * r + 0.6 * r), stage.h / span);
    const cx = stage.w / 2;
    const cy = top ? stage.h / 2 : stage.h * 0.7;
    const toPx = (p) => {
      const [X, Y] = project(state.view, p);
      return [cx + X * s, cy - (top ? Y : Y - cz) * s];
    };
    ctx.beginPath();
    const from = Math.max(0, tau - 2.2);
    for (let i = 0; i <= 200; i++) {
      const [x, y] = toPx(at(state, from + ((tau - from) * i) / 200));
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = c.b;
    ctx.lineWidth = 3;
    ctx.stroke();
    const [px, py] = toPx(now);
    dot(ctx, px, py, 8, c.fillY, c.ink);
    if (!top) {
      arrow(ctx, 22, stage.h - 20, 22, stage.h - 70, { color: c.a, width: 4 });
      label(ctx, 'B', 38, stage.h - 70, c, { color: c.a, size: 13 });
    } else {
      label(ctx, 'B toward you (⊙)', stage.w / 2, 16, c, { color: c.a, size: 12 });
    }
  },
  controls: () => [
    { title: 'Shoot a charge at an angle to B' },
    { key: 'view', label: 'View', options: [['3d', 'Angled'], ['side', 'Side'], ['top', 'Above']] },
    { key: 'theta', label: 'Angle to B, θ', min: 25, max: 90, step: 5, format: (n) => `${n}°` },
    { key: 'v', label: 'Speed, v', min: 1, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'B', label: 'Field, B', min: 0.5, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    transport(line2.clock),
    { readout: [
      ['Along B, v cos θ', (s) => fixed(s.v * Math.cos(rad(s.theta)), 2)],
      ['Across B, v sin θ', (s) => fixed(s.v * Math.sin(rad(s.theta)), 2)],
      ['Radius, r', (s) => fixed(rOf(s), 2)],
      ['Pitch, p', (s) => fixed(pitchOf(s), 2)],
    ] },
  ],
  tex: (s) => `r=\\dfrac{mv\\sin\\theta}{qB}=${sig(rOf(s), 3)}\\qquad p=\\dfrac{2\\pi m v\\cos\\theta}{qB}=${sig(pitchOf(s), 3)}`,
  onChange: () => line2.sync(),
});
line2.sync();
tool.update();
