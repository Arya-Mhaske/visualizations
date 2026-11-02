import { createTool } from '../../lib/tool.js';
import { dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { angleArc, eqFrame, rad } from './_kit.js';

const state = { a: 5, b: 4, C: 60 };
const c2 = () => state.a ** 2 + state.b ** 2 - 2 * state.a * state.b * Math.cos(rad(state.C));
const corr = () => -2 * state.a * state.b * Math.cos(rad(state.C));

createTool({
  state,
  label: 'Top: a triangle with sides a and b meeting at angle C, with the third side c drawn. Bottom: bars comparing a squared plus b squared with c squared. At 90 degrees the bars are equal. Below 90 degrees c squared is shorter by 2ab cos C, and above 90 degrees it is longer by the same amount.',
  draw(ctx, stage, c) {
    const f = eqFrame({ w: stage.w, h: stage.h * 0.58 }, [-7.5, 8], [-0.8, 7.5], 8);
    const C0 = f.px([0, 0]);
    const A = f.px([state.b, 0]);
    const B = f.px([state.a * Math.cos(rad(state.C)), state.a * Math.sin(rad(state.C))]);
    poly(ctx, [C0, A, B], { fill: c.fillC, stroke: c.ink, width: 3 });
    line(ctx, ...C0, ...A, { color: c.a, width: 6 });
    line(ctx, ...C0, ...B, { color: c.b, width: 6 });
    line(ctx, ...A, ...B, { color: c.d, width: 6 });
    angleArc(ctx, C0, A, B, 24, { color: c.ink, width: 3 });
    [[C0, 'C'], [A, 'A'], [B, 'B']].forEach(([p, t]) => { dot(ctx, ...p, 7, c.paper, c.ink); label(ctx, t, p[0], p[1] + (t === 'B' ? -14 : 16), c, { size: 12, bounds: stage, patch: false }); });
    label(ctx, `b = ${fixed(state.b, 1)}`, (C0[0] + A[0]) / 2, C0[1] + 15, c, { size: 10, color: c.a, bounds: stage, patch: false });
    label(ctx, `a = ${fixed(state.a, 1)}`, (C0[0] + B[0]) / 2 - 12, (C0[1] + B[1]) / 2, c, { size: 10, color: c.b, align: 'right', bounds: stage, patch: false });
    label(ctx, `c = ${fixed(Math.sqrt(c2()), 2)}`, (A[0] + B[0]) / 2 + 10, (A[1] + B[1]) / 2, c, { size: 10, color: c.d, align: 'left', bounds: stage, patch: false });
    // bars
    const x0 = 16;
    const unit = (stage.w - 32) / 200;
    const y1 = stage.h * 0.68;
    const y2 = stage.h * 0.84;
    const bh = 22;
    const bar = (x, y, w, fill) => poly(ctx, [[x, y], [x + w, y], [x + w, y + bh], [x, y + bh]], { fill, stroke: c.ink, width: 2 });
    bar(x0, y1, state.a ** 2 * unit, c.fillB);
    bar(x0 + state.a ** 2 * unit, y1, state.b ** 2 * unit, c.fillA);
    label(ctx, 'a² + b²', x0 + 4, y1 - 9, c, { size: 10, align: 'left', bounds: stage, patch: false });
    const total = (state.a ** 2 + state.b ** 2) * unit;
    bar(x0, y2, Math.min(c2(), state.a ** 2 + state.b ** 2) * unit, c.fillC);
    if (corr() > 0.005) { // c^2 is longer: the extra bit sits beyond a^2 + b^2
      bar(x0 + total, y2, corr() * unit, c.fillY);
    } else if (corr() < -0.005) { // c^2 is shorter: show what was taken away
      poly(ctx, [[x0 + c2() * unit, y2], [x0 + total, y2], [x0 + total, y2 + bh], [x0 + c2() * unit, y2 + bh]], { stroke: c.ink, width: 2, dash: [5, 4] });
    }
    label(ctx, `c² = ${fixed(c2(), 1)}   (−2ab cos C = ${fixed(corr(), 1)})`, x0 + 4, y2 + bh + 14, c, { size: 10, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Open and close the angle' },
    { key: 'C', label: 'Angle C', min: 5, max: 175, step: 1, format: (n) => `${n}°` },
    { key: 'a', label: 'Side a', min: 2, max: 7, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'Side b', min: 2, max: 7, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['a² + b²', () => fixed(state.a ** 2 + state.b ** 2, 2)],
      ['Correction −2ab cos C', () => fixed(corr(), 2)],
      ['c²', () => fixed(c2(), 2)],
      ['Right angle?', () => (state.C === 90 ? { text: 'Yes: Pythagoras', good: true } : 'No')],
    ] },
  ],
  tex: (s) => `c^2=a^2+b^2-2ab\\cos C=${fixed(s.a ** 2 + s.b ** 2, 1)}${corr() < 0 ? '-' : '+'}${fixed(Math.abs(corr()), 1)}=${fixed(c2(), 1)}`,
});
