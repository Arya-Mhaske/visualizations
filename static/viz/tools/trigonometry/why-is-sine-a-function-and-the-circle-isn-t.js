import { createTool } from '../../lib/tool.js';
import { dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { pointAt, pointsAtX } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { angle: 50, x: 0.6 };

createTool({
  state,
  label: 'The unit circle with two kinds of input. A ray at the angle you choose meets the circle at exactly one point, so the angle gives one output. A vertical line at the x-value you choose meets the circle at two points, so that x gives two outputs.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.5);
    drawFrame(ctx, f, c, { ticks: false });
    // one angle, one point
    const P = f.px(pointAt(state.angle));
    line(ctx, f.cx, f.cy, ...P, { color: c.a, width: 4 });
    dot(ctx, ...P, 9, c.a, c.ink);
    // one x, two points
    line(ctx, ...f.px([state.x, -1.45]), ...f.px([state.x, 1.45]), { color: c.b, width: 3, dash: [6, 5] });
    pointsAtX(state.x).forEach((y) => dot(ctx, ...f.px([state.x, y]), 8, c.fillB, c.ink));
    label(ctx, 'angle → 1 point', 10, 14, c, { size: 11, align: 'left', color: c.a, bounds: stage, patch: false });
    label(ctx, 'x → 2 points', 10, 30, c, { size: 11, align: 'left', color: c.b, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Feed it two kinds of input' },
    { key: 'angle', label: 'Input is an angle, θ', min: 0, max: 360, step: 5, format: (n) => `${n}°` },
    { key: 'x', label: 'Input is an x-value', min: -1, max: 1, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['θ gives y =', (s) => `${fixed(pointAt(s.angle)[1], 3)} (1 output)`],
      ['This x gives y =', (s) => pointsAtX(s.x).map((y) => fixed(y, 3)).join(' and ')],
      ['Outputs for this x', (s) => pointsAtX(s.x).length],
    ] },
  ],
  tex: (s) => `\\sin ${s.angle}^\\circ=${fixed(pointAt(s.angle)[1], 3)},\\quad x=${fixed(s.x, 2)}\\Rightarrow y=\\pm${fixed(Math.sqrt(Math.max(0, 1 - s.x * s.x)), 3)}`,
});
