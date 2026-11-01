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
    label(ctx, '1', (O[0] + P[0]) / 2 - 14, (O[1] + P[1]) / 2 - 8, c, { size: 11, color: c.d, bounds: stage, patch: false });
    label(ctx, 'cos B', (O[0] + Q[0]) / 2 + 6, (O[1] + Q[1]) / 2 + 14, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'sin B', (Q[0] + P[0]) / 2 - 24, (Q[1] + P[1]) / 2 - 4, c, { size: 10, bounds: stage, patch: false });
    label(ctx, 'cos B sin A', Pf[0] + 8, (Pf[1] + S[1]) / 2, c, { size: 10, align: 'left', color: c.a, bounds: stage, patch: false });
    label(ctx, 'sin B cos A', Pf[0] + 8, (S[1] + P[1]) / 2, c, { size: 10, align: 'left', color: c.b, bounds: stage, patch: false });
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
