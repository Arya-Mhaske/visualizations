import { createTool } from '../../lib/tool.js';
import { fixed } from '../../lib/format.js';
import { inv2, mul2, rad, rot2 } from './_la-math.js';
import { F_SHAPE, IDENTITY, plane, shape } from './_la-view.js';

// B is a rotation and A a shear. AB means: do B first, then A. Socks go on before shoes, so shoes come off first.
const state = { step: 2, theta: 60, shear: 1, wrong: false };
const B = (s) => rot2(rad(s.theta));
const A = (s) => [[1, s.shear], [0, 1]];
const AB = (s) => mul2(A(s), B(s));
// the matrix applied to the original F after each step
function path(s) {
  const Bm = B(s);
  const Am = A(s);
  const both = AB(s);
  return s.wrong
    ? [IDENTITY, Bm, both, mul2(inv2(Bm), both), mul2(inv2(Am), mul2(inv2(Bm), both))]
    : [IDENTITY, Bm, both, Bm, IDENTITY];
}
const NAMES = (s) => (s.wrong
  ? ['Start', 'After B', 'After A  (this is AB)', 'Undo B first', 'Then undo A']
  : ['Start', 'After B', 'After A  (this is AB)', 'Undo A first', 'Then undo B']);
const gap = (M) => Math.hypot(M[0][0] - 1, M[0][1], M[1][0], M[1][1] - 1);

createTool({
  state,
  label: 'The letter F is turned by B and then sheared by A. Stepping back to undo the two moves, you must undo the last move first. A switch undoes them in the wrong order, and the F does not come back to where it started.',
  setup: (stage, c) => plane(stage, c, 4.5),
  draw(ctx, stage, c, plot) {
    plot.axes();
    shape(ctx, plot, F_SHAPE, IDENTITY, { fill: null, stroke: c.grid, width: 2 });
    shape(ctx, plot, F_SHAPE, path(state)[state.step], { fill: state.step === 4 ? c.fillC : c.fillA, stroke: c.ink });
    plot.text(NAMES(state)[state.step], 0, 4, { size: 12 });
  },
  controls: [
    { title: 'Do it, then undo it' },
    { key: 'step', label: 'Step', min: 0, max: 4, step: 1, format: (n) => NAMES(state)[n] },
    { key: 'wrong', label: 'Undo in the wrong order (B⁻¹ then A⁻¹)', toggle: true },
    { key: 'theta', label: 'B: rotate by', min: 0, max: 180, step: 15, format: (n) => `${n}°` },
    { key: 'shear', label: 'A: shear by', min: -2, max: 2, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['Distance from the identity', (s) => fixed(gap(path(s)[s.step]), 3)],
      ['Back where we started?', (s) => ({ text: s.step === 4 ? (gap(path(s)[4]) < 1e-9 ? 'yes' : 'no') : 'not yet', good: s.step < 4 || gap(path(s)[4]) < 1e-9 })],
    ] },
  ],
  tex: (s) => (s.wrong ? '\\text{wrong:}\\ A^{-1}B^{-1}(AB)\\ne I' : '(AB)^{-1}=B^{-1}A^{-1}\\ \\ \\text{(undo the last move first)}'),
});
