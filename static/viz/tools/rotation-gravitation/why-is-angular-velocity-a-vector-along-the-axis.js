import { createTool } from '../../lib/tool.js';
import { vec } from '../../lib/quick.js';
import { dot, label } from '../../lib/draw.js';

const state = { w: 2, ccw: true, t: 0.5 };

createTool({
  state,
  label: 'A disc seen from above with a curved arrow for the sense of rotation and, beside it, a vertical arrow for the angular velocity vector, up for anticlockwise and down for clockwise. A point on the rim has its velocity arrow along the tangent.',
  draw(ctx, stage, c) {
    const [cx, cy, R] = [stage.w * 0.32, stage.h * 0.55, Math.min(stage.w, stage.h) * 0.22];
    const s = state.ccw ? 1 : -1;
    ctx.save();
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R, R * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    const a = state.w * state.t * s;
    const [px, py] = [cx + R * Math.cos(a), cy - R * 0.45 * Math.sin(a)];
    dot(ctx, px, py, 7, c.c, c.ink);
    vec(ctx, c, px, py, -Math.sin(a) * s * 26, -Math.cos(a) * 0.45 * s * 26, { color: c.c, text: 'v' });
    const [ax, ay] = [stage.w * 0.72, stage.h * 0.55];
    vec(ctx, c, ax, ay, 0, -s * state.w * 24, { color: c.a, width: 5, text: 'ω' });
    label(ctx, state.ccw ? 'anticlockwise seen from above: ω up' : 'clockwise seen from above: ω down', stage.w / 2, 20, c, { size: 12, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Spin' },
    { key: 'ccw', label: 'Anticlockwise (seen from above)', toggle: true },
    { key: 'w', label: 'Angular speed ω (rad/s)', min: 0.5, max: 4, step: 0.5 },
    { key: 't', label: 'Time (s)', min: 0, max: 3, step: 0.1 },
    { readout: [['ω direction', (s) => (s.ccw ? 'up the axis' : 'down the axis')], ['v = ω × r', () => 'along the tangent']] },
  ],
  tex: () => `\\vec v=\\vec\\omega\\times\\vec r`,
});
