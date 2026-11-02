import { barTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const X = [10, 20, 30, 40, 50];
const F = [3, 7, 12, 6, 2];
const state = { A: 2, h: 10 };
const N = F.reduce((t, f) => t + f, 0);
const direct = () => { const m = F.reduce((t, f, i) => t + f * X[i], 0) / N; return { m, v: F.reduce((t, f, i) => t + f * (X[i] - m) ** 2, 0) / N }; };
const step = (s) => { const u = X.map((x) => (x - X[s.A]) / s.h); const mu = F.reduce((t, f, i) => t + f * u[i], 0) / N; const su = F.reduce((t, f, i) => t + f * u[i] ** 2, 0) / N; return { u, m: X[s.A] + s.h * mu, v: s.h ** 2 * (su - mu * mu) }; };

barTool({
  state,
  label: 'Bars for the class frequencies, with the step-deviation values u listed in the labels. The mean and variance from the step-deviation method match the direct calculation.',
  rows: (s, c) => X.map((x, i) => [`x = ${x}, u = ${step(s).u[i]}`, F[i], i === s.A ? c.a : c.fillB, `f = ${F[i]}`]),
  max: 14,
  left: 0.34,
  controls: [
    { title: 'Grouped data' },
    { key: 'A', label: 'Assumed mean A (class mark)', min: 0, max: 4, step: 1, format: (v) => String(X[v]) },
    { key: 'h', label: 'Class width h', options: [[5, '5'], [10, '10']] },
    { readout: [
      ['Mean (step)', (s) => fixed(step(s).m, 4)],
      ['Mean (direct)', () => fixed(direct().m, 4)],
      ['Variance (step)', (s) => fixed(step(s).v, 4)],
      ['Variance (direct)', () => fixed(direct().v, 4)],
    ] },
  ],
  tex: (s) => `\\bar x=A+h\\bar u=${fixed(step(s).m, 3)},\\ \\sigma^2=h^2\\sigma_u^2=${fixed(step(s).v, 3)}`,
});
