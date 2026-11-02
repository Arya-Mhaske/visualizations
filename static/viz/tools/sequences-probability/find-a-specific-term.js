import { createTool } from '../../lib/tool.js';
import { bars } from '../../lib/quick.js';
import { nCr, term } from './_counting.js';

const state = { n: 6, r: 3, p: 2, q: 1 };
const all = (s) => Array.from({ length: s.n + 1 }, (_, k) => term(s.n, k, s.p, s.q));

createTool({
  state,
  label: 'Bars for the numerical coefficient of every term in the expansion, with the chosen term highlighted.',
  draw(ctx, stage, c) {
    const v = all(state);
    bars(ctx, stage, c, v.map((x, k) => [`T${k + 1}`, Math.abs(x), k === state.r ? c.a : x < 0 ? c.fillA : c.fillB, String(x)]), { max: Math.max(...v.map(Math.abs), 1), top: 8, gap: 4, left: 0.12 });
  },
  controls: [
    { title: 'The expansion (px + qy)ⁿ' },
    { key: 'n', label: 'Power n', min: 1, max: 10, step: 1 },
    { key: 'r', label: 'Term number T(r + 1): r', min: 0, max: 10, step: 1 },
    { key: 'p', label: 'p', min: 1, max: 4, step: 1 },
    { key: 'q', label: 'q', min: -3, max: 4, step: 1 },
    { readout: [
      ['General term', (s) => `C(${s.n}, ${s.r}) ${s.p}^${s.n - s.r} (${s.q})^${s.r}`],
      ['Coefficient', (s) => String(term(s.n, s.r, s.p, s.q))],
      ['All coefficients add to', (s) => `${all(s).reduce((t, x) => t + x, 0)}  (= (p + q)ⁿ = ${(s.p + s.q) ** s.n})`],
      ['C(n, r)', (s) => String(nCr(s.n, s.r))],
    ] },
  ],
  tex: (s) => `T_{${s.r + 1}}=\\binom{${s.n}}{${s.r}}(${s.p}x)^{${s.n - s.r}}(${s.q}y)^{${s.r}}=${term(s.n, s.r, s.p, s.q)}\\,x^{${s.n - s.r}}y^{${s.r}}`,
  onChange: (s) => {
    s.r = Math.min(s.r, s.n);
  },
});
