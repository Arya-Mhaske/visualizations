import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cosD, halfAngle, normalise, rad, sinD } from './_identities-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { theta: 100 };
const quadrantOf = (t) => Math.floor(normalise(t) / 90) + 1;

createTool({
  state,
  label: 'The unit circle with a coral radius at angle theta and a blue radius at half that angle. The same coral point is reached again after a full extra turn, but half of the larger angle then lands on the opposite side of the circle, so the sine of the half angle changes sign while cosine theta does not. A dashed radius shows that other candidate.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.4);
    drawFrame(ctx, f, c, { ticks: false });
    const O = f.px([0, 0]);
    const t = state.theta;
    const at = (a, r = 1) => f.px([r * cosD(a), r * sinD(a)]);
    const other = at(t / 2 + 180);
    line(ctx, ...O, ...other, { color: c.grid, width: 3, dash: [6, 5] });
    line(ctx, ...O, ...at(t), { color: c.a, width: 4 });
    line(ctx, ...O, ...at(t / 2), { color: c.b, width: 5 });
    arc(ctx, ...O, 20, -rad(t), 0, { color: c.a, width: 3 });
    arc(ctx, ...O, 34, -rad(t / 2), 0, { color: c.b, width: 3 });
    dot(ctx, ...at(t), 7, c.a, c.ink);
    dot(ctx, ...at(t / 2), 8, c.b, c.ink);
    line(ctx, ...at(t / 2), ...f.px([cosD(t / 2), 0]), { color: c.b, width: 3, dash: [4, 4] });
    label(ctx, 'θ', at(t, 1.18)[0], at(t, 1.18)[1], c, { size: 12, color: c.a, bounds: stage, patch: false });
    label(ctx, 'θ/2', at(t / 2, 1.2)[0], at(t / 2, 1.2)[1], c, { size: 12, color: c.b, bounds: stage, patch: false });
    label(ctx, 'other half', other[0], other[1] + (other[1] > O[1] ? 12 : -12), c, { size: 10, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Go round twice' },
    { key: 'theta', label: 'Angle, θ', min: 0, max: 720, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['cos θ', (s) => fixed(cosD(s.theta), 3)],
      ['(1 − cos θ) ÷ 2', (s) => fixed(halfAngle(s.theta).value, 3)],
      ['√ of that', (s) => fixed(halfAngle(s.theta).root, 3)],
      ['Quadrant of θ/2', (s) => `${quadrantOf(s.theta / 2)}`],
      ['sin(θ/2) itself', (s) => ({ text: fixed(halfAngle(s.theta).actual, 3), good: halfAngle(s.theta).sign > 0 })],
      ['Sign needed', (s) => ({ text: halfAngle(s.theta).sign > 0 ? '+' : '−', good: halfAngle(s.theta).sign > 0 })],
    ] },
  ],
  tex: (s) => `\\sin\\dfrac{\\theta}{2}=${halfAngle(s.theta).sign > 0 ? '+' : '-'}\\sqrt{\\dfrac{1-\\cos\\theta}{2}}=${halfAngle(s.theta).sign > 0 ? '+' : '-'}${fixed(halfAngle(s.theta).root, 3)}`,
});
