import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { cosD, rad, sinD } from './_identities-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

// Proof by shadows: the shadow of P on the line at angle B is cos(A − B).
// P is reached by going cos A across and sin A up. Each leg casts its own shadow on the line,
// and the two shadows laid end to end make the shadow of P.
const state = { A: 115, B: 35 };

createTool({
  state,
  label: 'The unit circle with a point P at angle A and a line through the centre at angle B. P is reached by going cosine A across and sine A up. Each of those two steps casts a shadow on the line: cosine A times cosine B, and sine A times sine B. Laid end to end, the two shadows reach the foot of the perpendicular from P, which is at distance cosine of A minus B.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.5);
    drawFrame(ctx, f, c, { ticks: false });
    const { A, B } = state;
    const d = [cosD(B), sinD(B)];
    const t1 = cosD(A) * cosD(B);
    const t2 = sinD(A) * sinD(B);
    const along = (t) => f.px([t * d[0], t * d[1]]);
    const O = f.px([0, 0]);
    const X = f.px([cosD(A), 0]);
    const P = f.px([cosD(A), sinD(A)]);
    const M = along(t1);
    const H = along(t1 + t2);
    const far = f.px([1.4 * d[0], 1.4 * d[1]]);
    const back = f.px([-1.4 * d[0], -1.4 * d[1]]);

    // The right triangle O-H-P: hypotenuse 1, angle A - B at O, right angle at H.
    poly(ctx, [O, H, P], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...back, ...far, { color: c.grid, width: 2 });
    line(ctx, ...O, ...X, { color: c.a, width: 4 });
    line(ctx, ...X, ...P, { color: c.b, width: 4 });
    line(ctx, ...X, ...M, { color: c.grid, width: 2, dash: [5, 4] });
    // Shadows sit either side of the line, so one that runs backwards never hides the other.
    const n = [-d[1] * 6, -d[0] * 6];
    const shift = ([x, y], k) => [x + n[0] * k, y + n[1] * k];
    line(ctx, ...shift(O, 1), ...shift(M, 1), { color: c.a, width: 6 });
    line(ctx, ...shift(M, -1), ...shift(H, -1), { color: c.b, width: 6 });
    const e1 = [(O[0] - H[0]), (O[1] - H[1])];
    const e2 = [(P[0] - H[0]), (P[1] - H[1])];
    const [l1, l2] = [Math.hypot(...e1) || 1, Math.hypot(...e2) || 1];
    const q = Math.min(10, l1 / 3, l2 / 3);
    const sq = [H, [H[0] + (e1[0] / l1) * q, H[1] + (e1[1] / l1) * q], [H[0] + (e1[0] / l1 + e2[0] / l2) * q, H[1] + (e1[1] / l1 + e2[1] / l2) * q], [H[0] + (e2[0] / l2) * q, H[1] + (e2[1] / l2) * q]];
    line(ctx, ...sq[1], ...sq[2], { color: c.ink, width: 2 });
    line(ctx, ...sq[2], ...sq[3], { color: c.ink, width: 2 });
    arc(ctx, ...O, 28, -rad(A), -rad(B), { color: c.c, width: 3 });
    dot(ctx, ...P, 8, c.d, c.ink);
    dot(ctx, ...H, 5, c.fillY, c.ink, 2);

    const tag = (text, x, y, color, align = 'center') => label(ctx, text, x, y, c, { size: 11, color, bounds: stage, align });
    tag('P', P[0] + (P[0] >= O[0] ? 14 : -14), P[1] - 12, c.d);
    tag('cos A', (O[0] + X[0]) / 2, O[1] + (sinD(A) >= 0 ? 16 : -16), c.a);
    tag('sin A', X[0] + (X[0] >= O[0] ? 12 : -12), (X[1] + P[1]) / 2, c.b, X[0] >= O[0] ? 'left' : 'right');
    tag('1', (O[0] + P[0]) / 2 + (P[0] >= O[0] ? 12 : -12), (O[1] + P[1]) / 2 - 8, c.d);
    tag('line at B', far[0], far[1] - 12, c.ink, 'right');
  },
  controls: [
    { title: 'A point and a line' },
    { key: 'A', label: 'Angle A (the point P)', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { key: 'B', label: 'Angle B (the line)', min: 0, max: 360, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Shadow of cos A: cos A cos B', (s) => fixed(cosD(s.A) * cosD(s.B), 4)],
      ['Shadow of sin A: sin A sin B', (s) => fixed(sinD(s.A) * sinD(s.B), 4)],
      ['Total shadow of P', (s) => fixed(cosD(s.A) * cosD(s.B) + sinD(s.A) * sinD(s.B), 4)],
      ['cos(A − B)', (s) => ({ text: fixed(cosD(s.A - s.B), 4), good: true })],
    ] },
  ],
  tex: (s) => `\\cos(A-B)=\\underbrace{${fixed(cosD(s.A) * cosD(s.B), 3)}}_{\\cos A\\cos B}+\\underbrace{${fixed(sinD(s.A) * sinD(s.B), 3)}}_{\\sin A\\sin B}=${fixed(cosD(s.A - s.B), 3)}`,
});
