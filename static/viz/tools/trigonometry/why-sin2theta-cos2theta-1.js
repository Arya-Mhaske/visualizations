import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { pointAt, squares } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 35 };

createTool({
  state,
  label: 'The unit circle with a right triangle whose hypotenuse is the radius, 1. Its legs are cosine and sine. Below, a bar of length 1 is split in two: one part is cosine squared and the other is sine squared. Together they always fill the bar exactly.',
  draw(ctx, stage, c) {
    const f = frame({ w: stage.w, h: stage.h * 0.78 }, 1.45);
    drawFrame(ctx, f, c, { ticks: false });
    const [x, y] = pointAt(state.theta);
    const O = [f.cx, f.cy];
    const P = f.px([x, y]);
    const F = f.px([x, 0]);
    poly(ctx, [O, F, P], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...O, ...F, { color: c.b, width: 6 });
    line(ctx, ...F, ...P, { color: c.a, width: 6 });
    line(ctx, ...O, ...P, { color: c.d, width: 4 });
    dot(ctx, ...P, 8, c.d, c.ink);
    label(ctx, 'cos θ', (O[0] + F[0]) / 2, O[1] + (y >= 0 ? 14 : -14), c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, 'sin θ', F[0] + (x >= 0 ? 26 : -26), (F[1] + P[1]) / 2, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, '1', (O[0] + P[0]) / 2 - 8, (O[1] + P[1]) / 2 - 10, c, { size: 11, color: c.d, bounds: stage, patch: false });
    // the bar
    const { sin2, cos2 } = squares(state.theta);
    const [bx, by, bw, bh] = [stage.w * 0.1, stage.h * 0.86, stage.w * 0.8, stage.h * 0.08];
    poly(ctx, [[bx, by], [bx + bw * cos2, by], [bx + bw * cos2, by + bh], [bx, by + bh]], { fill: c.fillB, stroke: c.ink, width: 2 });
    poly(ctx, [[bx + bw * cos2, by], [bx + bw, by], [bx + bw, by + bh], [bx + bw * cos2, by + bh]], { fill: c.fillA, stroke: c.ink, width: 2 });
    label(ctx, 'cos²θ', bx + (bw * cos2) / 2, by - 11, c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, 'sin²θ', bx + bw * cos2 + (bw * sin2) / 2, by - 11, c, { size: 11, color: c.a, bounds: stage, patch: false });
    label(ctx, 'total = 1', bx + bw / 2, by + bh + 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Turn the radius' },
    { key: 'theta', label: 'Angle, θ', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['cos θ, sin θ', (s) => `${fixed(pointAt(s.theta)[0], 4)}, ${fixed(pointAt(s.theta)[1], 4)}`],
      ['cos²θ', (s) => fixed(squares(s.theta).cos2, 4)],
      ['sin²θ', (s) => fixed(squares(s.theta).sin2, 4)],
      ['Sum', (s) => ({ text: fixed(squares(s.theta).cos2 + squares(s.theta).sin2, 4), good: true })],
    ] },
  ],
  tex: (s) => `\\sin^2\\theta+\\cos^2\\theta=${fixed(squares(s.theta).sin2, 3)}+${fixed(squares(s.theta).cos2, 3)}=1`,
});
