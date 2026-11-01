import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { label } from '../../lib/draw.js';
import { frac, fixed } from '../../lib/format.js';

const EQ = {
  gauss: { name: "y″ + x y′ + y = 0, y(0)=1, y′(0)=0", coef: (a, n) => (n === 0 ? 1 : n === 1 ? 0 : -a[n - 2] / n), exact: (x) => Math.exp(-x * x / 2), rec: 'a(n) = −a(n−2) / n', sub: 'put y = Σ a(n)xⁿ: (n+2)(n+1)a(n+2) + (n+1)a(n) = 0' },
  sinh: { name: "y″ − y = 0, y(0)=0, y′(0)=1", coef: (a, n) => (n === 0 ? 0 : n === 1 ? 1 : a[n - 2] / (n * (n - 1))), exact: Math.sinh, rec: 'a(n) = a(n−2) / (n(n−1))', sub: 'put y = Σ a(n)xⁿ: (n+2)(n+1)a(n+2) − a(n) = 0' },
  e2: { name: "y′ = 2x y, y(0) = 1", coef: (a, n) => (n === 0 ? 1 : n === 1 ? 0 : (2 * a[n - 2]) / n), exact: (x) => Math.exp(x * x), rec: 'a(n) = 2 a(n−2) / n', sub: 'put y = Σ a(n)xⁿ: (n+1)a(n+1) = 2 a(n−1)' },
};
const state = { eq: 'gauss', N: 6 };
const coefs = (s, N = 12) => { const a = []; for (let n = 0; n <= N; n++) a.push(EQ[s.eq].coef(a, n)); return a; };
const partial = (s, x) => { const a = coefs(s); let sum = 0; for (let n = 0; n <= s.N; n++) sum += a[n] * x ** n; return sum; };
const text = (v) => { const f = frac(v, 5000); return f && Math.abs(f.p / f.q - v) < 1e-12 ? (f.q === 1 ? `${f.p}` : `${f.p}/${f.q}`) : fixed(v, 4); };

createTool({
  state,
  label: 'A worked power series solution in steps. The equation is substituted into a series, the matching powers of x give a recurrence, and the recurrence produces the coefficients one by one. A graph compares the polynomial from the coefficients so far with the exact solution.',
  setup: (stage, c) => createPlot(stage, { x: [-2.5, 2.5], y: [-1, 4], c, box: (st) => ({ x: 0, y: st.h * 0.45, w: st.w, h: st.h * 0.55 }) }),
  draw(ctx, stage, c, plot) {
    const E = EQ[state.eq];
    label(ctx, E.sub, 10, 16, c, { size: 10, align: 'left', patch: false, bounds: stage });
    label(ctx, `Recurrence:  ${E.rec}`, 10, 38, c, { size: 11, align: 'left', patch: false, bounds: stage, color: c.c });
    const a = coefs(state);
    let line = 'y = ';
    for (let n = 0; n <= state.N; n++) if (a[n] !== 0) line += `${line === 'y = ' ? '' : '+ '}${text(a[n])}${n ? `x${n === 1 ? '' : n}` : ''} `;
    label(ctx, line.length > 38 ? `${line.slice(0, 38)}…` : line, 10, 64, c, { size: 11, align: 'left', patch: false });
    label(ctx, `a: ${a.slice(0, state.N + 1).map(text).join(', ')}`.slice(0, 44), 10, 90, c, { size: 10, align: 'left', patch: false });
    plot.setRange([-2.5, 2.5], state.eq === 'sinh' ? [-6, 6] : [-1, 4]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(E.exact, { color: c.b, width: 5 });
    plot.fn((x) => partial(state, x), { color: c.a, width: 3 });
  },
  controls: [
    { title: 'Solve with a series' },
    { key: 'eq', label: 'Equation', options: Object.entries(EQ).map(([k, v]) => [k, v.name]) },
    { key: 'N', label: 'Powers included, up to xᴺ', min: 0, max: 12, step: 1 },
    { readout: [
      ['Newest coefficient', (s) => `a${s.N} = ${text(coefs(s)[s.N])}`],
      ['Error at x = 1', (s) => Math.abs(partial(s, 1) - EQ[s.eq].exact(1)).toExponential(1)],
    ] },
  ],
  tex: (s) => ({ gauss: String.raw`a_n=-\dfrac{a_{n-2}}{n}`, sinh: String.raw`a_n=\dfrac{a_{n-2}}{n(n-1)}`, e2: String.raw`a_n=\dfrac{2a_{n-2}}{n}` }[s.eq]),
});
