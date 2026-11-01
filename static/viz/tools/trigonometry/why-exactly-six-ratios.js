import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { RATIOS, SIDES, ratioOf, reciprocalName, sidesOf } from './_right-triangle-math.js';

const state = { num: 'opp', den: 'hyp', theta: 35 };
const key = (s = state) => `${s.num}/${s.den}`;
const NAME = { opp: 'opposite', adj: 'adjacent', hyp: 'hypotenuse' };

createTool({
  state,
  label: 'A right triangle and a three by three table. Rows are the side on top of the fraction, columns the side underneath. The six off-diagonal cells each hold one of the six trig ratios, and a cell and its mirror across the diagonal are reciprocals. The diagonal cells would be a side divided by itself, which is always 1.',
  draw(ctx, stage, c) {
    const half = stage.h * 0.46;
    // triangle
    const sides = sidesOf(state.theta, 1);
    const k = Math.min(stage.w * 0.7, half * 1.5) / 1.1;
    const A = [stage.w * 0.14, half * 0.9];
    const C = [A[0] + sides.adj * k, A[1]];
    const B = [C[0], A[1] - sides.opp * k];
    poly(ctx, [A, C, B], { fill: c.fillC, stroke: c.ink, width: 3 });
    const col = (name) => (name === state.num ? c.a : name === state.den ? c.b : c.ink);
    line(ctx, ...C, ...B, { color: col('opp'), width: 6 });
    line(ctx, ...A, ...C, { color: col('adj'), width: 6 });
    line(ctx, ...A, ...B, { color: col('hyp'), width: 6 });
    label(ctx, 'opposite', C[0] + 4, (C[1] + B[1]) / 2, c, { size: 11, align: 'left', color: col('opp'), bounds: stage, patch: false });
    label(ctx, 'adjacent', (A[0] + C[0]) / 2, A[1] + 16, c, { size: 11, color: col('adj'), bounds: stage, patch: false });
    label(ctx, 'hyp.', (A[0] + C[0]) / 2 - 8, (A[1] + B[1]) / 2 - 12, c, { size: 11, color: col('hyp'), bounds: stage, patch: false });
    label(ctx, 'θ', A[0] + 26, A[1] - 8, c, { size: 13, bounds: stage, patch: false });
    // table
    const cell = Math.min(stage.w * 0.2, stage.h * 0.1);
    const x0 = (stage.w - cell * 4) / 2 + cell;
    const y0 = stage.h * 0.58;
    SIDES.forEach((name, i) => {
      label(ctx, `${name} ÷`, x0 - cell * 0.55, y0 + cell * (i + 0.5), c, { size: 10, align: 'right', bounds: stage, patch: false });
      label(ctx, `÷ ${name}`, x0 + cell * (i + 0.5), y0 - 11, c, { size: 10, bounds: stage, patch: false });
    });
    SIDES.forEach((n, r) => SIDES.forEach((d, q) => {
      const same = n === d;
      const picked = n === state.num && d === state.den;
      const mirror = n === state.den && d === state.num;
      const x = x0 + cell * q;
      const y = y0 + cell * r;
      poly(ctx, [[x, y], [x + cell, y], [x + cell, y + cell], [x, y + cell]], { fill: picked ? c.fillA : mirror ? c.fillB : same ? c.grid : c.paper, stroke: c.ink, width: 2 });
      label(ctx, same ? '1' : RATIOS[`${n}/${d}`], x + cell / 2, y + cell / 2, c, { size: 12, bounds: stage, patch: false });
    }));
  },
  controls: [
    { title: 'Pick two sides, in order' },
    { key: 'num', label: 'On top of the fraction', options: SIDES.map((s) => [s, NAME[s]]) },
    { key: 'den', label: 'Underneath', options: SIDES.map((s) => [s, NAME[s]]) },
    { key: 'theta', label: 'Angle, θ', min: 10, max: 80, step: 1, format: (n) => `${n}°` },
    { readout: [
      ['Fraction', (s) => `${s.num} ÷ ${s.den}`],
      ['Name', (s) => (s.num === s.den ? 'always 1' : RATIOS[key(s)])],
      ['Value', (s) => fixed(ratioOf(s.num, s.den, s.theta), 4)],
      ['Its reciprocal', (s) => (s.num === s.den ? 'itself' : `${RATIOS[reciprocalName(s.num, s.den)]} = ${fixed(ratioOf(s.den, s.num, s.theta), 4)}`)],
      ['Ordered pairs of 2 different sides', () => 6],
    ] },
  ],
  tex: (s) => (s.num === s.den ? '\\dfrac{x}{x}=1' : `\\${RATIOS[key(s)]}\\,\\theta=\\dfrac{\\text{${s.num}}}{\\text{${s.den}}}=${fixed(ratioOf(s.num, s.den, s.theta), 4)}`),
});
