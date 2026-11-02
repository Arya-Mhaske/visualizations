import { createTool } from '../../lib/tool.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { apply2, bmat, diag2, eig2, inv2, mul2, rad } from './_la-math.js';
import { plane, vec } from './_la-view.js';

const PRESETS = {
  grow: { name: 'Eigenvalues 2 and 1', A: [[1.5, 0.5], [0.5, 1.5]] },
  settle: { name: 'Eigenvalues 1 and 0.2', A: [[0.6, 0.4], [0.4, 0.6]] },
  shrink: { name: 'Eigenvalues 0.9 and 0.5', A: [[0.7, 0.2], [0.2, 0.7]] },
  mixed: { name: 'Eigenvalues 2 and 1 (not symmetric)', A: [[2, 1], [0, 1]] },
};
const state = { which: 'grow', k: 3, phi: 30 };
const A = (s) => PRESETS[s.which].A;
const x0 = (s) => [Math.cos(rad(s.phi)), Math.sin(rad(s.phi))];
const power = (M, k) => { let P = [[1, 0], [0, 1]]; for (let i = 0; i < k; i++) P = mul2(M, P); return P; };
function parts(s) {
  const e = eig2(A(s));
  const X = [[e.v[0][0], e.v[1][0]], [e.v[0][1], e.v[1][1]]];
  const c = apply2(inv2(X), x0(s)); // x0 = c1 v1 + c2 v2
  return { e, X, c };
}
const viaEigen = (s) => { const { e, X } = parts(s); return mul2(mul2(X, diag2(e.l[0] ** s.k, e.l[1] ** s.k)), inv2(X)); };

createTool({
  state,
  label: 'A starting vector x0 split into two eigenvector parts. After k steps each part has simply been multiplied by its eigenvalue to the power k, shown as two coloured arrows that add up to A to the k times x0. The dots show the whole path of A to the j times x0. Raising A to a power directly and using the eigenvector formula give the same matrix.',
  setup: (stage, c) => plane(stage, c, 4),
  draw(ctx, stage, c, plot) {
    const { e, c: co } = parts(state);
    let top = 3;
    for (let j = 0; j <= 10; j++) top = Math.max(top, Math.hypot(...apply2(power(A(state), j), x0(state))) * 1.2);
    plot.setRange([-top, top], [-top, top]);
    plot.axes({ grid: false });
    for (let j = 0; j <= state.k; j++) dot(ctx, ...plot.toPx(...apply2(power(A(state), j), x0(state))), j === state.k ? 7 : 3, j === state.k ? c.fillY : c.fillA, c.ink, 1);
    const p1 = e.v[0].map((v) => v * co[0] * e.l[0] ** state.k);
    const p2 = e.v[1].map((v) => v * co[1] * e.l[1] ** state.k);
    vec(ctx, plot, c, [0, 0], p1, { color: c.a, width: 4, text: 'λ₁ᵏ part' });
    vec(ctx, plot, c, p1, [p1[0] + p2[0], p1[1] + p2[1]], { color: c.b, width: 4 });
    vec(ctx, plot, c, [0, 0], apply2(power(A(state), state.k), x0(state)), { color: c.c, width: 5, text: 'Aᵏx₀', dx: 12, dy: 14 });
    vec(ctx, plot, c, [0, 0], x0(state), { color: c.ink, width: 2 });
  },
  controls: [
    { title: 'Apply A again and again' },
    { key: 'k', label: 'Power k', min: 0, max: 10, step: 1, format: (n) => `${n}` },
    { key: 'which', label: 'Matrix', options: Object.entries(PRESETS).map(([key, v]) => [key, v.name]) },
    { key: 'phi', label: 'Direction of x₀', min: 0, max: 175, step: 5, format: (n) => `${n}°` },
    { readout: [
      ['λ₁ᵏ, λ₂ᵏ', (s) => `${fixed(parts(s).e.l[0] ** s.k, 4)}, ${fixed(parts(s).e.l[1] ** s.k, 4)}`],
      ['Aᵏ top-left, multiplied', (s) => fixed(power(A(s), s.k)[0][0], 5)],
      ['Aᵏ top-left, XΛᵏX⁻¹', (s) => ({ text: fixed(viaEigen(s)[0][0], 5), good: true })],
    ] },
  ],
  tex: (s) => `A^{${s.k}}=X\\Lambda^{${s.k}}X^{-1}=${bmat(viaEigen(s), (v) => fixed(v, 3))}`,
});
