import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { line, dot, label } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { phi: 60, pos: 30 };
const rad = (d) => (d * Math.PI) / 180;
const v = (a) => [-Math.sin(rad(a)), Math.cos(rad(a))];

createTool({
  state,
  label: 'Left: a circle with a point at two nearby places and its velocity arrows. Right: the two velocity arrows redrawn from one point with their difference, which points towards the centre.',
  draw(ctx, stage, c) {
    const R = Math.min(stage.w * 0.2, stage.h * 0.34);
    const [cx, cy] = [stage.w * 0.27, stage.h * 0.5];
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const angs = [state.pos, state.pos + state.phi];
    angs.forEach((a, i) => {
      const [px, py] = [cx + R * Math.cos(rad(a)), cy - R * Math.sin(rad(a))];
      dot(ctx, px, py, 5, i ? c.b : c.a, c.ink);
      const [vx, vy] = v(a);
      vec(ctx, c, px, py, vx * 36, -vy * 36, { color: i ? c.b : c.a });
    });
    dot(ctx, cx, cy, 3, c.ink, c.ink);
    const [ox, oy] = [stage.w * 0.72, stage.h * 0.55];
    const [v1, v2] = [v(angs[0]), v(angs[1])];
    vec(ctx, c, ox, oy, v1[0] * 50, -v1[1] * 50, { color: c.a });
    vec(ctx, c, ox, oy, v2[0] * 50, -v2[1] * 50, { color: c.b });
    vec(ctx, c, ox + v1[0] * 50, oy - v1[1] * 50, (v2[0] - v1[0]) * 50, -(v2[1] - v1[1]) * 50, { color: c.c, width: 4, text: 'Δv' });
    const mid = rad(state.pos + state.phi / 2);
    line(ctx, cx + R * Math.cos(mid), cy - R * Math.sin(mid), cx, cy, { color: c.c, width: 1, dash: [4, 4] });
    label(ctx, `|Δv| = ${fixed(2 * Math.sin(rad(state.phi / 2)), 3)} v`, stage.w / 2, 20, c, { size: 13, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Two moments' },
    { key: 'pos', label: 'Position of the first point (°)', min: 0, max: 360, step: 5 },
    { key: 'phi', label: 'Angle between the points (°)', min: 5, max: 120, step: 5 },
    { readout: [
      ['|v₁| and |v₂|', () => 'equal'],
      ['|Δv| / v', (s) => fixed(2 * Math.sin(rad(s.phi / 2)), 3)],
      ['Δv points', () => 'to the centre'],
    ] },
  ],
  tex: (s) => `|\\Delta\\vec v|=2v\\sin\\dfrac{\\Delta\\varphi}{2}=${fixed(2 * Math.sin(rad(s.phi / 2)), 3)}\\,v`,
});
