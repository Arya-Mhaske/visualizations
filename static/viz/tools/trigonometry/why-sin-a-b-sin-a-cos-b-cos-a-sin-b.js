import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { sinD, stacked } from './_identities-math.js';
import { drawFrame, frame } from './_unit-circle-view.js';

const state = { A: 35, B: 30 };

createTool({
  state,
  label: 'Two right triangles stacked inside the unit circle. The first has hypotenuse cosine B and angle A. The second sits on its far end, with hypotenuse 1, so the top corner is at angle A plus B. The height of the top corner splits into two pieces, one from each triangle: cosine B times sine A, and sine B times cosine A.',
  draw(ctx, stage, c) {
    const f = frame(stage, 1.3);
    drawFrame(ctx, f, c, { ticks: false });
    const { q, p, low, high } = stacked(state.A, state.B);
    const [O, Q, P] = [f.px([0, 0]), f.px(q), f.px(p)];
    const S = f.px([p[0], q[1]]);
    const Pf = f.px([p[0], 0]);
    const Qf = f.px([q[0], 0]);
    poly(ctx, [O, Qf, Q], { fill: c.fillA, stroke: c.ink, width: 2 });
    poly(ctx, [Q, S, P], { fill: c.fillB, stroke: c.ink, width: 2 });
    line(ctx, ...O, ...Q, { color: c.ink, width: 3 });
    line(ctx, ...Q, ...P, { color: c.ink, width: 3 });
    line(ctx, ...O, ...P, { color: c.d, width: 4 });
    line(ctx, ...Pf, ...S, { color: c.a, width: 6 });
    line(ctx, ...S, ...P, { color: c.b, width: 6 });
    line(ctx, ...Q, ...S, { color: c.grid, width: 2, dash: [5, 4] });
    line(ctx, ...Qf, ...Q, { color: c.grid, width: 2, dash: [5, 4] });
    dot(ctx, ...P, 7, c.d, c.ink);
    dot(ctx, ...Q, 5, c.fillY, c.ink, 2);
    // Slanted sides: label sits on the outer side of the side, away from the middle of the figure.
    const mid = [(O[0] + Q[0] + P[0]) / 3, (O[1] + Q[1] + P[1]) / 3];
    const outside = (a, b, gap, flip = 1) => {
      const [mx, my] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const [dx, dy] = [b[1] - a[1], a[0] - b[0]];
      const n = Math.hypot(dx, dy) || 1;
      const s = (mx - mid[0]) * dx + (my - mid[1]) * dy >= 0 ? flip : -flip;
      return [mx + (s * dx * gap) / n, my + (s * dy * gap) / n];
    };
    const tag = (text, [x, y], color) => label(ctx, text, x, y, c, { size: 11, color, bounds: stage });
    tag('1', outside(O, P, 12), c.d);
    tag('cos B', outside(O, Q, 14, -1), c.ink);
    tag('sin B', outside(Q, P, 22), c.ink);
    // Vertical pieces: labels in a clear column to the right of both triangles, kept apart.
    const colX = Math.max(Pf[0], Qf[0], S[0]) + 12;
    let yLow = (Pf[1] + S[1]) / 2;
    let yHigh = (S[1] + P[1]) / 2;
    if (yLow - yHigh < 16) {
      const m = (yLow + yHigh) / 2;
      [yHigh, yLow] = [m - 8, m + 8];
    }
    label(ctx, 'cos B sin A', colX, yLow, c, { size: 11, align: 'left', color: c.a, bounds: stage });
    label(ctx, 'sin B cos A', colX, yHigh, c, { size: 11, align: 'left', color: c.b, bounds: stage });
  },
  controls: [
    { title: 'Stack the triangles' },
    { key: 'A', label: 'Angle A', min: 5, max: 80, step: 1, format: (n) => `${n}°` },
    { key: 'B', label: 'Angle B', min: 5, max: 80, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Lower piece', (s) => fixed(stacked(s.A, s.B).low, 4)],
      ['Upper piece', (s) => fixed(stacked(s.A, s.B).high, 4)],
      ['Height of the top corner', (s) => fixed(stacked(s.A, s.B).p[1], 4)],
      ['sin(A + B)', (s) => ({ text: fixed(sinD(s.A + s.B), 4), good: true })],
    ] },
  ],
  tex: (s) => {
    const t = stacked(s.A, s.B);
    return `\\sin(A+B)=\\underbrace{${fixed(t.low, 3)}}_{\\sin A\\cos B}+\\underbrace{${fixed(t.high, 3)}}_{\\cos A\\sin B}=${fixed(t.low + t.high, 3)}`;
  },
});
