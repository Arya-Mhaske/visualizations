import { plotTool } from '../../lib/recipes.js';
import { fixed } from '../../lib/format.js';

const state = { kind: 'ap', a: 2, k: 3, n: 8 };
const rec = (s) => { const out = [s.a]; for (let i = 1; i < s.n; i++) out.push(s.kind === 'ap' ? out[i - 1] + s.k : out[i - 1] * (s.k / 2 + 0.5)); return out; };
const ratio = (s) => s.k / 2 + 0.5;
const exp = (s, n) => (s.kind === 'ap' ? s.a + (n - 1) * s.k : s.a * ratio(s) ** (n - 1));

plotTool({
  state,
  label: 'Dots for the terms built one at a time from the previous one, and a smooth curve for the explicit formula. They lie on the same curve.',
  x: [0, 12],
  y: [0, 40],
  xLabel: 'n',
  yLabel: 'aₙ',
  range: (s) => [[0, s.n + 1], [0, Math.max(...rec(s)) * 1.15 + 1]],
  curves: (s, c) => [[(n) => exp(s, n), { color: c.b, domain: [1, s.n] }]],
  points: (s, c) => rec(s).map((v, i) => [i + 1, v, c.a, 5]),
  controls: [
    { title: 'Two ways to build' },
    { key: 'kind', label: 'Kind', options: [['ap', 'Add d each time'], ['gp', 'Multiply by r each time']] },
    { key: 'a', label: 'First term a₁', min: 1, max: 5, step: 1 },
    { key: 'k', label: 'd (or r = 0.5 + k/2)', min: 1, max: 4, step: 1 },
    { key: 'n', label: 'Number of terms', min: 3, max: 12, step: 1 },
    { readout: [['Recursive a_n', (s) => fixed(rec(s)[s.n - 1], 3)], ['Explicit a_n', (s) => fixed(exp(s, s.n), 3)], ['Rule', (s) => (s.kind === 'ap' ? `d = ${s.k}` : `r = ${fixed(ratio(s), 2)}`)]] },
  ],
  tex: (s) => (s.kind === 'ap' ? `a_n=a_1+(n-1)d=${fixed(exp(s, s.n), 2)}` : `a_n=a_1r^{n-1}=${fixed(exp(s, s.n), 2)}`),
});
