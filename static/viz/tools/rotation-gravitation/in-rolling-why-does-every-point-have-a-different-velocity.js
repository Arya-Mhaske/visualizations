import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { phi: 90, v: 3 };
const rad = (d) => (d * Math.PI) / 180;
const vel = (s) => [s.v + s.v * Math.cos(rad(s.phi)), s.v * Math.sin(rad(s.phi))];

createTool({
  state,
  label: 'A rolling wheel with velocity arrows at the contact point, the centre, the top and a chosen point on the rim. The arrow at the contact point is zero and the one at the top is twice the centre velocity.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w, stage.h) * 0.28;
    const [cx, cy] = [stage.w / 2, stage.h * 0.5];
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const k = 14;
    vec(ctx, c, cx, cy, state.v * k, 0, { color: c.b, text: 'centre v' });
    vec(ctx, c, cx, cy - R, 2 * state.v * k, 0, { color: c.a, text: 'top 2v' });
    dot(ctx, cx, cy + R, 5, c.ink, c.ink);
    const a = rad(state.phi);
    const [px, py] = [cx - R * Math.sin(a), cy + R * Math.cos(a)];
    dot(ctx, px, py, 7, c.c, c.ink);
    vec(ctx, c, px, py, vel(state)[0] * k, -vel(state)[1] * k, { color: c.c, width: 4 });
    label(ctx, 'contact: 0', cx, cy + R + 18, c, { size: 11, patch: false });
  },
  controls: [
    { title: 'Roll the wheel' },
    { key: 'v', label: 'Centre speed v (m/s)', min: 1, max: 5, step: 0.5 },
    { key: 'phi', label: 'Point at angle φ from the contact (°)', min: 0, max: 360, step: 5 },
    { readout: [
      ['Speed of the point', (s) => `${fixed(Math.hypot(...vel(s)), 2)} m/s`],
      ['2v sin(φ/2)', (s) => `${fixed(2 * s.v * Math.abs(Math.sin(rad(s.phi / 2))), 2)} m/s`],
    ] },
  ],
  tex: (s) => `v_P=2v\\sin\\dfrac{\\varphi}{2}=${fixed(2 * s.v * Math.abs(Math.sin(rad(s.phi / 2))), 2)}`,
});
