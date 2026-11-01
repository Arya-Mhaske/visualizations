import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { pointAt } from './_unit-circle-math.js';
import { frame, drawFrame } from './_unit-circle-view.js';

const state = { theta: 40, r: 2 };

createTool({
  state,
  label: 'A point on a circle whose radius you can change, with the unit circle drawn lightly inside it. The coordinates change as the circle grows, but the coordinates divided by the radius stay exactly the same. At radius 1 the coordinates themselves are the cosine and the sine.',
  draw(ctx, stage, c) {
    const f = frame(stage, 3.2);
    drawFrame(ctx, f, c, { r: state.r, ticks: false });
    const [x, y] = pointAt(state.theta, state.r);
    const P = f.px([x, y]);
    const U = f.px(pointAt(state.theta, 1));
    line(ctx, f.cx, f.cy, ...P, { color: c.a, width: 4 });
    line(ctx, ...P, ...f.px([x, 0]), { color: c.grid, width: 2, dash: [5, 4] });
    line(ctx, f.cx, f.cy, ...f.px([x, 0]), { color: c.b, width: 4 });
    dot(ctx, ...U, 5, c.fillY, c.ink);
    dot(ctx, ...P, 8, c.a, c.ink);
    label(ctx, '1', f.cx + f.k * 0.5, f.cy + 14, c, { size: 10, bounds: stage, patch: false });
    label(ctx, `r = ${fixed(state.r, 1)}`, P[0] + 8, P[1] - 12, c, { size: 11, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Resize the circle' },
    { key: 'r', label: 'Radius, r', min: 0.5, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'theta', label: 'Angle, θ', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['x, y', (s) => `${fixed(pointAt(s.theta, s.r)[0], 3)}, ${fixed(pointAt(s.theta, s.r)[1], 3)}`],
      ['x ÷ r', (s) => fixed(pointAt(s.theta, s.r)[0] / s.r, 4)],
      ['y ÷ r', (s) => fixed(pointAt(s.theta, s.r)[1] / s.r, 4)],
      ['Same on the unit circle?', (s) => ({ text: Math.abs(pointAt(s.theta, 1)[0] - pointAt(s.theta, s.r)[0] / s.r) < 1e-9 ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{x}{r}=\\dfrac{${fixed(pointAt(s.theta, s.r)[0], 2)}}{${fixed(s.r, 1)}}=${fixed(pointAt(s.theta, s.r)[0] / s.r, 3)}=\\cos\\theta`,
});
