import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { rad } from './_right-triangle-math.js';
import { normalise, pointAt, quadrant, referenceAngle, signOf } from './_unit-circle-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 150 };

createTool({
  state,
  label: 'A point on the unit circle in any quadrant and its mirror image in the first quadrant. The two points have the same distances from the axes. Only the signs differ. The acute angle between the radius and the x-axis is the reference angle.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.55);
    drawFrame(ctx, f, c, { ticks: false });
    const [x, y] = pointAt(state.theta);
    const ref = referenceAngle(state.theta);
    const P = f.px([x, y]);
    const Q = f.px([Math.abs(x), Math.abs(y)]);
    line(ctx, ...f.px([x, y]), ...f.px([x, 0]), { color: c.grid, width: 2, dash: [5, 4] });
    line(ctx, ...Q, ...f.px([Math.abs(x), 0]), { color: c.grid, width: 2, dash: [5, 4] });
    line(ctx, f.cx, f.cy, ...Q, { color: c.c, width: 3 });
    line(ctx, f.cx, f.cy, ...P, { color: c.a, width: 4 });
    // the reference angle, always measured from the x-axis towards the radius
    const axis = x < 0 ? Math.PI : 0; // canvas angle of the nearer half of the x-axis
    const toP = Math.atan2(-y, x); // canvas angle of the radius
    const gap = Math.atan2(Math.sin(toP - axis), Math.cos(toP - axis)); // the short way round, signed
    arc(ctx, f.cx, f.cy, 34, Math.min(axis, axis + gap), Math.max(axis, axis + gap), { color: c.a, width: 4 });
    dot(ctx, ...Q, 7, c.c, c.ink);
    dot(ctx, ...P, 9, c.a, c.ink);
    label(ctx, `reference angle ${fixed(ref, 0)}°`, stage.w / 2, 14, c, { size: 12, bounds: stage });
    label(ctx, `(${signOf(x)}, ${signOf(y)})`, P[0] + (x >= 0 ? 26 : -26), P[1] + (y >= 0 ? -14 : 14), c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Move the point into any quadrant' },
    { key: 'theta', label: 'Angle, θ', min: 0, max: 359, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Quadrant', (s) => (quadrant(s.theta) === 0 ? 'on an axis' : quadrant(s.theta))],
      ['Reference angle', (s) => `${fixed(referenceAngle(s.theta), 0)}°`],
      ['|sin θ|, |sin ref|', (s) => `${fixed(Math.abs(pointAt(s.theta)[1]), 4)}, ${fixed(Math.sin(rad(referenceAngle(s.theta))), 4)}`],
      ['|cos θ|, |cos ref|', (s) => `${fixed(Math.abs(pointAt(s.theta)[0]), 4)}, ${fixed(Math.cos(rad(referenceAngle(s.theta))), 4)}`],
    ] },
  ],
  tex: (s) => `\\sin ${normalise(s.theta)}^\\circ=${signOf(pointAt(s.theta)[1]) === '−' ? '-' : ''}\\sin ${fixed(referenceAngle(s.theta), 0)}^\\circ=${fixed(pointAt(s.theta)[1], 4)}`,
});
