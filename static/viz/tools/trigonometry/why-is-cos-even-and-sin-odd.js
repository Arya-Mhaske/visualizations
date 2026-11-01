import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_right-triangle-math.js';
import { pointAt } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 55 };

createTool({
  state,
  label: 'The unit circle with a point at angle theta and a second point at angle minus theta, its mirror image in the x-axis. The two points have the same x, so the cosines are equal. Their y-values are opposite, so the sines are opposite.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.5);
    drawFrame(ctx, f, c, { ticks: false });
    const [x, y] = pointAt(state.theta);
    const P = f.px([x, y]);
    const Q = f.px([x, -y]);
    line(ctx, ...P, ...Q, { color: c.grid, width: 2, dash: [5, 4] });
    line(ctx, f.cx, f.cy, ...P, { color: c.a, width: 4 });
    line(ctx, f.cx, f.cy, ...Q, { color: c.b, width: 4 });
    arc(ctx, f.cx, f.cy, 34, -rad(state.theta), 0, { color: c.a, width: 3 });
    arc(ctx, f.cx, f.cy, 46, 0, rad(state.theta), { color: c.b, width: 3 });
    line(ctx, f.cx, f.cy, ...f.px([x, 0]), { color: c.c, width: 6 });
    dot(ctx, ...P, 9, c.a, c.ink);
    dot(ctx, ...Q, 9, c.b, c.ink);
    label(ctx, 'θ', P[0] + (x >= 0 ? 12 : -12), P[1] - 12, c, { size: 13, color: c.a, bounds: stage, patch: false });
    label(ctx, '−θ', Q[0] + (x >= 0 ? 16 : -16), Q[1] + 12, c, { size: 13, color: c.b, bounds: stage, patch: false });
    label(ctx, 'same x', f.px([x / 2, 0])[0], f.cy + (y >= 0 ? 14 : -14), c, { size: 10, color: c.c, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Mirror the angle' },
    { key: 'theta', label: 'Angle, θ', min: -180, max: 180, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['cos θ, cos(−θ)', (s) => `${fixed(pointAt(s.theta)[0], 4)}, ${fixed(pointAt(-s.theta)[0], 4)}`],
      ['sin θ, sin(−θ)', (s) => `${fixed(pointAt(s.theta)[1], 4)}, ${fixed(pointAt(-s.theta)[1], 4)}`],
      ['Cosine', (s) => ({ text: 'cos(−θ) = cos θ', good: Math.abs(pointAt(s.theta)[0] - pointAt(-s.theta)[0]) < 1e-9 })],
      ['Sine', (s) => ({ text: 'sin(−θ) = −sin θ', good: Math.abs(pointAt(s.theta)[1] + pointAt(-s.theta)[1]) < 1e-9 })],
    ] },
  ],
  tex: (s) => `\\cos(-\\theta)=\\cos\\theta=${fixed(pointAt(s.theta)[0], 3)},\\quad \\sin(-\\theta)=-\\sin\\theta=${fixed(pointAt(-s.theta)[1], 3)}`,
});
