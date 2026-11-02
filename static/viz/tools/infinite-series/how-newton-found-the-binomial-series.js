import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { binom, num } from './_is.js';
import { frac } from '../../lib/format.js';

// Newton's idea: keep the pattern of the coefficients C(n, k) in Pascal's triangle for n = 1/2, -1, 3/2 ...
// Check: raise the series for (1+x)^(p/q) to the power q and get 1+x to the power p, term by term.
const EXPS = { 0.5: [1, 2], '-1': [-1, 1], 1.5: [3, 2], '-0.5': [-1, 2], [1 / 3]: [1, 3] };
const state = { a: '0.5', N: 4 };
const alpha = () => Number(state.a);
const coefs = (N) => Array.from({ length: N + 1 }, (_, k) => binom(alpha(), k));
const polyMul = (p, q, N) => { const r = Array(N + 1).fill(0); p.forEach((a, i) => q.forEach((b, j) => { if (i + j <= N) r[i + j] += a * b; })); return r; };
const powerOf = (p, e, N) => { let r = [1, ...Array(N).fill(0)]; for (let i = 0; i < e; i++) r = polyMul(r, p, N); return r; };
const poly = (x) => coefs(state.N).reduce((s, c, k) => s + c * x ** k, 0);
const fr = (v) => { const f = frac(v, 200); return f && Math.abs(f.p / f.q - v) < 1e-9 ? (f.q === 1 ? `${f.p}` : `${f.p}/${f.q}`) : num(v, 4); };
const denom = () => { const n = [...Object.entries(EXPS)].find(([k]) => Number(k) === alpha()); return n ? Math.abs(n[1][1]) : 1; };
const checked = () => { const e = alpha() * denom(); const r = powerOf(coefs(state.N), denom(), state.N); return { e, r }; };

createTool({
  state,
  label: 'The curve one plus x to a fractional power in black, and the polynomial built from the first terms of Newton s series in coral.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [0, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => (1 + x) ** alpha(), { color: c.ink, width: 3, domain: [-0.99, 1] });
    plot.fn(poly, { color: c.a, width: 3 });
  },
  controls: [
    { title: 'Extend the pattern' },
    { key: 'a', label: 'Power n', options: [['0.5', '½'], ['-0.5', '−½'], ['1.5', '3/2'], [String(1 / 3), '⅓'], ['-1', '−1']] },
    { key: 'N', label: 'Terms up to xᴺ', min: 1, max: 8, step: 1 },
    { readout: [
      ['Coefficients', () => coefs(Math.min(state.N, 5)).map(fr).join(', ') + ' …'],
      ['Newton’s check', () => { const { e, r } = checked(); return `series^${denom()} = ${r.slice(0, 4).map((v) => num(v, 3)).join(', ')} … (should be (1+x)^${e})`; }],
    ] },
  ],
  tex: (s) => `(1+x)^{${fr(Number(s.a))}}=1+${fr(Number(s.a))}\\,x+\\binom{${fr(Number(s.a))}}{2}x^2+\\cdots`,
});
