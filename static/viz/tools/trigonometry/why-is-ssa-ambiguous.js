import { createTool } from '../../lib/tool.js';
import { arc, dot, label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { TAU, eqFrame, rad } from './_kit.js';
import { ssaCount, ssaPoints } from './_triangle-math.js';

const state = { A: 35, b: 8, a: 5.5 };
const C = () => [state.b * Math.cos(rad(state.A)), state.b * Math.sin(rad(state.A))];
const h = () => state.b * Math.sin(rad(state.A));
const WORD = ['No triangle: the arc falls short of the base', 'One triangle', 'Two different triangles'];

createTool({
  state,
  label: 'Angle A at the left end of a base line, with side b going up to a corner C. A circle arc of radius a is swung from C like a compass. It may miss the base, touch it, cross it once, or cross it twice. Each crossing point is a possible corner B.',
  draw(ctx, stage, c) {
    const f = eqFrame(stage, [-1.5, 13], [-3.5, 9]);
    const A = f.px([0, 0]);
    const Cp = f.px(C());
    line(ctx, ...f.px([-1, 0]), ...f.px([12.5, 0]), { color: c.ink, width: 3 });
    line(ctx, ...Cp, ...f.px([C()[0], 0]), { color: c.d, width: 2, dash: [5, 4] });
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, stage.w, stage.h); ctx.clip();
    arc(ctx, ...Cp, state.a * f.k, 0, TAU, { color: c.grid, width: 2, dash: [6, 5] });
    ctx.restore();
    const hits = ssaPoints(state.A, state.a, state.b);
    hits.forEach((x, i) => {
      const B = f.px([x, 0]);
      poly(ctx, [A, B, Cp], { fill: i ? c.fillA : c.fillC, stroke: c.ink, width: 3 });
    });
    line(ctx, ...A, ...Cp, { color: c.b, width: 6 });
    hits.forEach((x, i) => {
      const B = f.px([x, 0]);
      line(ctx, ...B, ...Cp, { color: c.a, width: 5 });
      dot(ctx, ...B, 8, i ? c.fillA : c.c, c.ink);
      label(ctx, `B${hits.length > 1 ? i + 1 : ''}`, B[0], B[1] + 18, c, { size: 12, bounds: stage, patch: false });
    });
    dot(ctx, ...A, 6, c.ink, c.ink);
    dot(ctx, ...Cp, 8, c.b, c.ink);
    label(ctx, 'A', A[0] - 10, A[1] + 16, c, { size: 12, bounds: stage, patch: false });
    label(ctx, 'C', Cp[0], Cp[1] - 14, c, { size: 12, bounds: stage, patch: false });
    label(ctx, `h = b sin A = ${fixed(h(), 2)}`, f.px([C()[0], h() / 2])[0] + 8, f.px([0, h() / 2])[1], c, { size: 10, color: c.d, align: 'left', bounds: stage, patch: false });
  },
  controls: [
    { title: 'Given A, b and a' },
    { key: 'A', label: 'Angle A', min: 10, max: 150, step: 1, format: (n) => `${n}°` },
    { key: 'b', label: 'Side b (blue)', min: 3, max: 9, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'a', label: 'Side a (swings from C)', min: 1, max: 12, step: 0.1, format: (n) => fixed(n, 1) },
    { readout: [
      ['Height h = b sin A', () => fixed(h(), 2)],
      ['Triangles', () => ({ text: WORD[ssaCount(state.A, state.a, state.b)], good: ssaCount(state.A, state.a, state.b) > 0 })],
      ['Angle B', () => { const xs = ssaPoints(state.A, state.a, state.b); return xs.length ? xs.map((x) => `${fixed(180 - (Math.atan2(C()[1], C()[0] - x) * 180) / Math.PI, 1)}°`).join(' or ') : 'none'; }],
    ] },
  ],
  tex: () => `\\sin B=\\dfrac{b\\sin A}{a}=\\dfrac{${fixed(state.b, 1)}\\sin ${state.A}^\\circ}{${fixed(state.a, 1)}}=${fixed((state.b * Math.sin(rad(state.A))) / state.a, 3)}`,
});
