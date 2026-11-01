import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { SIDES_AT, exact, texOf } from './_unit-circle-math.js';

const state = { angle: 30, cut: true };
const S3 = Math.sqrt(3);

createTool({
  state,
  label: 'An equilateral triangle of side 2 or a square of side 1. Cut in half, the equilateral triangle gives a right triangle with sides 1, root 3 and 2, and the square gives a right triangle with sides 1, 1 and root 2. The sides of that triangle give the exact sine, cosine and tangent of 30, 45 and 60 degrees.',
  draw(ctx, stage, c) {
    const sides = SIDES_AT[state.angle];
    const eq = sides.shape === 'equilateral';
    const k = Math.min(stage.w * (eq ? 0.36 : 0.5), stage.h * 0.5);
    const [ox, oy] = [stage.w * (eq ? 0.18 : 0.22), stage.h * 0.78];
    const px = ([x, y]) => [ox + x * k, oy - y * k];
    const pts = eq ? { A: [0, 0], B: [2, 0], T: [1, S3], M: [1, 0] } : { A: [0, 0], B: [1, 0], T: [1, 1], M: [1, 0], D: [0, 1] };
    if (eq) {
      poly(ctx, [pts.A, pts.B, pts.T].map(px), { fill: c.paper, stroke: c.ink, width: 3 });
      if (state.cut) {
        poly(ctx, [pts.A, pts.M, pts.T].map(px), { fill: c.fillC, stroke: c.ink, width: 3 });
        line(ctx, ...px(pts.M), ...px(pts.T), { color: state.angle === 30 ? c.a : c.b, width: 6 });
      }
    } else {
      poly(ctx, [pts.A, pts.B, pts.T, pts.D].map(px), { fill: c.paper, stroke: c.ink, width: 3 });
      if (state.cut) {
        poly(ctx, [pts.A, pts.B, pts.T].map(px), { fill: c.fillC, stroke: c.ink, width: 3 });
        line(ctx, ...px(pts.A), ...px(pts.T), { color: c.d, width: 6 });
      }
    }
    if (state.cut) {
      // opposite is coral, adjacent blue, hypotenuse purple
      const seg = (p, q, colour) => line(ctx, ...px(p), ...px(q), { color: colour, width: 6 });
      if (eq) {
        if (state.angle === 30) { seg(pts.A, pts.M, c.a); seg(pts.M, pts.T, c.b); seg(pts.A, pts.T, c.d); } else { seg(pts.A, pts.M, c.b); seg(pts.M, pts.T, c.a); seg(pts.A, pts.T, c.d); }
        label(ctx, `${sides.opp[0]}`, ...px(state.angle === 30 ? [0.5, -0.12] : [1.14, S3 / 2]), c, { size: 14, color: c.a, bounds: stage, patch: false });
        label(ctx, `${sides.adj[0]}`, ...px(state.angle === 30 ? [1.14, S3 / 2] : [0.5, -0.12]), c, { size: 14, color: c.b, bounds: stage, patch: false });
        label(ctx, '2', ...px([0.35, S3 / 2 + 0.1]), c, { size: 14, color: c.d, bounds: stage, patch: false });
      } else {
        seg(pts.A, pts.B, c.b); seg(pts.B, pts.T, c.a);
        label(ctx, '1', ...px([0.5, -0.12]), c, { size: 14, color: c.b, bounds: stage, patch: false });
        label(ctx, '1', ...px([1.1, 0.5]), c, { size: 14, color: c.a, bounds: stage, patch: false });
        label(ctx, '√2', ...px([0.38, 0.62]), c, { size: 14, color: c.d, bounds: stage, patch: false });
      }
    } else {
      label(ctx, eq ? 'Equilateral: all sides 2' : 'Square: all sides 1', stage.w / 2, 18, c, { size: 12, bounds: stage });
    }
    label(ctx, state.cut ? `the ${state.angle}° corner is at the left` : 'press "Cut it in half"', stage.w / 2, stage.h - 12, c, { size: 11, bounds: stage, patch: false });
  },
  controls: [
    { title: 'Cut a shape in half' },
    { key: 'angle', label: 'Angle', options: [[30, '30°'], [45, '45°'], [60, '60°']] },
    { key: 'cut', label: 'Cut it in half', toggle: true },
    { readout: [
      ['Opposite, adjacent, hypotenuse', (s) => `${SIDES_AT[s.angle].opp[0]}, ${SIDES_AT[s.angle].adj[0]}, ${SIDES_AT[s.angle].hyp[0]}`],
      ['sin', (s) => `${exact(s.angle).sin[0]} = ${fixed(exact(s.angle).sin[1], 4)}`],
      ['cos', (s) => `${exact(s.angle).cos[0]} = ${fixed(exact(s.angle).cos[1], 4)}`],
      ['tan', (s) => `${exact(s.angle).tan[0]} = ${fixed(exact(s.angle).tan[1], 4)}`],
    ] },
  ],
  tex: (s) => `\\sin ${s.angle}^\\circ=\\dfrac{\\text{opp}}{\\text{hyp}}=\\dfrac{${texOf(SIDES_AT[s.angle].opp[0])}}{${texOf(SIDES_AT[s.angle].hyp[0])}}=${texOf(exact(s.angle).sin[0])}`,
});
