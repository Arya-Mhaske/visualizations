import { createTool } from '../../lib/tool.js';
import { label, line, poly } from '../../lib/draw.js';

// The 2 × 2 matrices that keep lengths: rotations (det +1, the group SO(2)) and reflections (det −1). Together they make O(2).
// Do g1, then g2, to the letter F and see that the result is again a rotation or a reflection.
const state = { t1: 'rot', a1: 50, t2: 'ref', a2: 20 };
const RAD = Math.PI / 180;
const F = [[0, 0], [0, 3], [2, 3], [2, 2.4], [0.6, 2.4], [0.6, 1.8], [1.5, 1.8], [1.5, 1.2], [0.6, 1.2], [0.6, 0]].map(([x, y]) => [x * 0.45 - 0.2, y * 0.45 - 0.7]);
export const rotM = (deg) => [[Math.cos(deg * RAD), -Math.sin(deg * RAD)], [Math.sin(deg * RAD), Math.cos(deg * RAD)]];
export const refM = (deg) => [[Math.cos(2 * deg * RAD), Math.sin(2 * deg * RAD)], [Math.sin(2 * deg * RAD), -Math.cos(2 * deg * RAD)]];
export const mul = (A, B) => A.map((row) => [0, 1].map((j) => row[0] * B[0][j] + row[1] * B[1][j]));
export const det = (M) => M[0][0] * M[1][1] - M[0][1] * M[1][0];
const M1 = (s) => (s.t1 === 'rot' ? rotM(s.a1) : refM(s.a1));
const M2 = (s) => (s.t2 === 'rot' ? rotM(s.a2) : refM(s.a2));
const product = (s) => mul(M2(s), M1(s));
const fmt = (M) => M.map((row) => row.map((v) => (Math.abs(v) < 5e-4 ? '0.00' : v.toFixed(2))).join('  ')).join('  |  ');
export function describe(M) {
  if (det(M) > 0) {
    const a = Math.round((((Math.atan2(M[1][0], M[0][0]) / RAD) % 360) + 360) % 360 * 100) / 100;
    return `rotation by ${a}°`;
  }
  const axis = Math.round((((Math.atan2(M[1][0], M[0][0] + 1) / RAD) % 180) + 180) % 180 * 100) / 100;
  return `reflection in the line at ${axis}°`;
}
const orthogonal = (M) => { const P = mul([[M[0][0], M[1][0]], [M[0][1], M[1][1]]], M); return Math.abs(P[0][0] - 1) < 1e-9 && Math.abs(P[1][1] - 1) < 1e-9 && Math.abs(P[0][1]) < 1e-9; };

createTool({
  state,
  label: 'The plane with a letter F in grey. The blue F is the grey one after the first rotation or reflection. The green F is the blue one after the second. A reflection turns the F into its mirror image, and the green F is always some rotation or reflection of the grey one.',
  draw(ctx, stage, c) {
    const s = Math.min(stage.w, stage.h) / 5.2;
    const [cx, cy] = [stage.w / 2, stage.h / 2];
    const px = ([x, y]) => [cx + x * s, cy - y * s];
    line(ctx, 8, cy, stage.w - 8, cy, { color: c.grid, width: 1 });
    line(ctx, cx, 8, cx, stage.h - 8, { color: c.grid, width: 1 });
    const put = (M, p) => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];
    [[state.t1, state.a1, c.b], [state.t2, state.a2, c.c]].forEach(([type, angle, col], i) => {
      if (type === 'ref') {
        const [dx, dy] = [Math.cos(angle * RAD), Math.sin(angle * RAD)];
        line(ctx, ...px([-dx * 2.4, -dy * 2.4]), ...px([dx * 2.4, dy * 2.4]), { color: col, width: 1.5, dash: [5, 4] });
      }
      void i;
    });
    poly(ctx, F.map(px), { fill: c.paper, stroke: c.grid });
    const first = F.map((p) => put(M1(state), p));
    poly(ctx, first.map(px), { fill: c.fillB, stroke: c.ink });
    const second = first.map((p) => put(M2(state), p));
    poly(ctx, second.map(px), { fill: c.fillC, stroke: c.ink });
    label(ctx, 'start', ...px([F[3][0] - 0.1, F[3][1] - 0.45]), c, { size: 10, patch: false });
  },
  controls: [
    { title: 'Do g₁, then g₂' },
    { key: 't1', label: 'g₁ is a', options: [['rot', 'rotation'], ['ref', 'reflection']] },
    { key: 'a1', label: 'g₁ angle (turn, or line)', min: 0, max: 355, step: 5, format: (v) => `${v}°` },
    { key: 't2', label: 'g₂ is a', options: [['rot', 'rotation'], ['ref', 'reflection']] },
    { key: 'a2', label: 'g₂ angle (turn, or line)', min: 0, max: 355, step: 5, format: (v) => `${v}°` },
    { readout: [
      ['det g₁, det g₂', (s) => `${Math.round(det(M1(s)))}, ${Math.round(det(M2(s)))}`],
      ['g₂g₁ is', (s) => describe(product(s))],
      ['Product matrix', (s) => fmt(product(s))],
      ['Keeps lengths (MᵀM = I)?', (s) => ({ text: orthogonal(product(s)) ? 'yes' : 'no', good: orthogonal(product(s)) })],
    ] },
  ],
  tex: (s) => `\\det(g_2g_1)=\\det g_2\\det g_1=${Math.round(det(M2(s)))}\\cdot(${Math.round(det(M1(s)))})=${Math.round(det(product(s)))}`,
});
