import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly, arc } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_right-triangle-math.js';
import { pointAt } from './_unit-circle-math.js';
import { frame, drawFrame } from './_unit-circle-view.js';

const state = { theta: 60 };
const acute = (s = state) => s.theta > 0 && s.theta < 90;
const R = 1.25; // the circle is drawn with radius 1.25 so the ratios are not just the coordinates

createTool({
  state,
  label: 'A circle with a point on it that you turn through any angle. For angles below 90 degrees the point, its two projections and the centre make a right triangle, and the ratios x over r and y over r are the usual triangle ratios. Beyond 90 degrees no right triangle has that angle, but the point still has an x and a y, and the same two ratios still work.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.6);
    const k = f.k * R;
    ctx.save();
    drawFrame(ctx, f, c, { r: R, ticks: false });
    ctx.restore();
    const [x, y] = pointAt(state.theta, R);
    const P = f.px([x, y]);
    const foot = f.px([x, 0]);
    const O = f.px([0, 0]);
    if (acute()) poly(ctx, [O, foot, P], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...O, ...P, { color: c.a, width: 4 });
    line(ctx, ...P, ...foot, { color: c.grid, width: 2, dash: [5, 4] });
    line(ctx, ...O, ...foot, { color: c.b, width: 4 });
    arc(ctx, ...O, 30, -rad(state.theta), 0, { color: c.a, width: 3 });
    dot(ctx, ...P, 8, c.a, c.ink);
    label(ctx, acute() ? 'a right triangle' : 'no right triangle has this angle', stage.w / 2, 14, c, { size: 12, color: acute() ? c.c : c.a, bounds: stage });
    label(ctx, `r = ${R}`, f.cx + k * 0.5, f.cy + 14, c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Turn the point' },
    { key: 'theta', label: 'Angle, θ', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Right triangle exists?', (s) => ({ text: acute(s) ? 'yes' : 'no', good: acute(s) })],
      ['x', (s) => fixed(pointAt(s.theta, R)[0], 3)],
      ['y', (s) => fixed(pointAt(s.theta, R)[1], 3)],
      ['x ÷ r, y ÷ r', (s) => `${fixed(pointAt(s.theta, R)[0] / R, 3)}, ${fixed(pointAt(s.theta, R)[1] / R, 3)}`],
    ] },
  ],
  tex: (s) => `\\cos\\theta=\\dfrac{x}{r}=\\dfrac{${fixed(pointAt(s.theta, R)[0], 2)}}{${R}},\\quad \\sin\\theta=\\dfrac{y}{r}=\\dfrac{${fixed(pointAt(s.theta, R)[1], 2)}}{${R}}`,
});
