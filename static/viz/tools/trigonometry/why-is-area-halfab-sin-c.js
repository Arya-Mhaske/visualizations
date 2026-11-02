import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, eqFrame, rad } from './_kit.js';

const state = { a: 7, b: 5, C: 50 };
const h = () => state.b * Math.sin(rad(state.C));

createTool({
  state,
  label: 'A triangle with sides a and b meeting at angle C. Side a is the base along the bottom. A dashed perpendicular from the top corner to the base line is the height. That height is b sin C, so half base times height becomes half a b sin C.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-6, 9.5], [-1.2, 6.2], 10);
    const C0 = f.px([0, 0]);
    const B = f.px([state.a, 0]);
    const Ap = [state.b * Math.cos(rad(state.C)), h()];
    const A = f.px(Ap);
    const F = f.px([Ap[0], 0]);
    poly(ctx, [C0, B, A], { fill: c.fillC, stroke: c.ink, width: 3 });
    if (Ap[0] < 0) line(ctx, ...F, ...C0, { color: c.grid, width: 2, dash: [5, 4] });
    line(ctx, ...A, ...F, { color: c.a, width: 5, dash: [8, 5] });
    line(ctx, ...C0, ...B, { color: c.b, width: 6 });
    line(ctx, ...C0, ...A, { color: c.d, width: 6 });
    angleArc(ctx, C0, B, A, 24, { color: c.ink, width: 3 });
    [[C0, 'C'], [B, 'B'], [A, 'A']].forEach(([p, t]) => { dot(ctx, ...p, 7, c.paper, c.ink); label(ctx, t, p[0], p[1] + (t === 'A' ? -14 : 16), c, { size: 12, bounds: stage, patch: false }); });
    label(ctx, `a = ${fixed(state.a, 1)}`, (C0[0] + B[0]) / 2, C0[1] + 30, c, { size: 11, color: c.b, bounds: stage, patch: false });
    label(ctx, `b = ${fixed(state.b, 1)}`, (C0[0] + A[0]) / 2 - 8, (C0[1] + A[1]) / 2, c, { size: 11, color: c.d, align: 'right', bounds: stage, patch: false });
    label(ctx, `h = b sin C = ${fixed(h(), 2)}`, F[0] + 8, (F[1] + A[1]) / 2, c, { size: 11, color: c.a, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Reshape the triangle' },
    { key: 'a', label: 'Side a (the base)', min: 2, max: 9, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Side b', min: 2, max: 7, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'C', label: 'Angle C', min: 5, max: 175, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Height, h', () => fixed(h(), 3)],
      ['½ × base × height', () => fixed(0.5 * state.a * h(), 3)],
      ['½ab sin C', () => fixed(0.5 * state.a * state.b * Math.sin(rad(state.C)), 3)],
    ] },
  ],
  tex: (s) => `\\text{Area}=\\tfrac12 a h=\\tfrac12 ab\\sin C=\\tfrac12(${fixed(s.a, 1)})(${fixed(s.b, 1)})\\sin ${s.C}^\\circ=${fixed(0.5 * s.a * s.b * Math.sin(rad(s.C)), 2)}`,
});
