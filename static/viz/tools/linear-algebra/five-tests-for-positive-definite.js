import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { eig2, rad } from './_la-math.js';

const state = { a: 2, b: 1, d: 2 };
const q = (s, t) => { const [c, n] = [Math.cos(rad(t)), Math.sin(rad(t))]; return s.a * c * c + 2 * s.b * c * n + s.d * n * n; };
const tests = (s) => {
  const [l1, l2] = eig2([[s.a, s.b], [s.b, s.d]]).l;
  const pivot2 = s.a > 1e-9 ? s.d - (s.b * s.b) / s.a : NaN;
  let low = Infinity;
  for (let t = 0; t < 360; t += 1) low = Math.min(low, q(s, t));
  return {
    eig: { ok: l2 > 1e-9, text: `${fixed(l1, 3)}, ${fixed(l2, 3)}` },
    pivots: { ok: s.a > 1e-9 && pivot2 > 1e-9, text: `${fixed(s.a, 2)}, ${Number.isNaN(pivot2) ? '—' : fixed(pivot2, 3)}` },
    minors: { ok: s.a > 1e-9 && s.a * s.d - s.b * s.b > 1e-9, text: `${fixed(s.a, 2)}, ${fixed(s.a * s.d - s.b * s.b, 3)}` },
    energy: { ok: low > 1e-9, text: `lowest ${fixed(low, 3)}` },
    chol: { ok: s.a > 1e-9 && pivot2 > 1e-9, text: s.a > 1e-9 && pivot2 > 1e-9 ? `R = [[${fixed(Math.sqrt(s.a), 3)}, ${fixed(s.b / Math.sqrt(s.a), 3)}], [0, ${fixed(Math.sqrt(pivot2), 3)}]]` : 'no real R exists' },
  };
};
const yes = (t) => ({ text: `${t.ok ? 'pass' : 'fail'}: ${t.text}`, good: t.ok });

createTool({
  state,
  label: 'The energy x transpose A x of a symmetric matrix measured round the unit circle and plotted against the angle. If it stays above zero for every direction the matrix is positive definite. The readouts run the five tests: eigenvalues, pivots, upper-left determinants, the energy, and a factorisation A equals R transpose R. They always agree.',
  setup: (stage, c) => createPlot(stage, { x: [0, 360], y: [-6, 8], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'direction x (°)', yLabel: 'xᵀAx' });
    plot.shade((t) => q(state, t), null, 0, 360, tests(state).energy.ok ? c.fillC : c.fillA);
    plot.fn((t) => q(state, t), { color: c.ink, width: 4, domain: [0, 360] });
  },
  controls: [
    { title: 'Choose a symmetric matrix' },
    { key: 'a', label: 'a', min: -3, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'b', label: 'b', min: -3, max: 3, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'd', label: 'd', min: -3, max: 5, step: 0.5, format: (n) => fixed(n, 1) },
    { readout: [
      ['1 Eigenvalues all > 0', (s) => yes(tests(s).eig)],
      ['2 Pivots all > 0', (s) => yes(tests(s).pivots)],
      ['3 Upper-left dets > 0', (s) => yes(tests(s).minors)],
      ['4 Energy > 0', (s) => yes(tests(s).energy)],
      ['5 A = RᵀR', (s) => yes(tests(s).chol)],
    ] },
  ],
  tex: (s) => `A=\\begin{bmatrix}${fixed(s.a, 1)}&${fixed(s.b, 1)}\\\\${fixed(s.b, 1)}&${fixed(s.d, 1)}\\end{bmatrix}:\\ \\ ${tests(s).eig.ok ? '\\text{positive definite}' : '\\text{not positive definite}'}`,
});
