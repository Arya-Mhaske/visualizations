import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { solve } from './_de-math.js';

// Each ODE gives a recurrence for the coefficients a_n of y = sum a_n x^n.
const EQ = {
  exp: { name: "y′ = y,  y(0) = 1", coef: (a, n) => (n === 0 ? 1 : a[n - 1] / n), exact: Math.exp, rec: 'a(n+1) = a(n) / (n+1)', tex: String.raw`y'=y\Rightarrow a_{n+1}=\dfrac{a_n}{n+1}`, win: 3.5 },
  cos: { name: "y″ = −y,  y(0)=1, y′(0)=0", coef: (a, n) => (n === 0 ? 1 : n === 1 ? 0 : -a[n - 2] / (n * (n - 1))), exact: Math.cos, rec: 'a(n+2) = −a(n) / ((n+1)(n+2))', tex: String.raw`y''=-y\Rightarrow a_{n+2}=\dfrac{-a_n}{(n+1)(n+2)}`, win: 6 },
  airy: { name: "y″ = x y,  y(0)=1, y′(0)=0", coef: (a, n) => (n === 0 ? 1 : n < 3 ? 0 : a[n - 3] / (n * (n - 1))), exact: null, rec: 'a(n+2) = a(n−1) / ((n+1)(n+2))', tex: String.raw`y''=xy\Rightarrow a_{n+2}=\dfrac{a_{n-1}}{(n+1)(n+2)}`, win: 4 },
};
const state = { eq: 'cos', N: 4 };
const coefs = (s, N = 30) => { const a = []; for (let n = 0; n <= N; n++) a.push(EQ[s.eq].coef(a, n)); return a; };
const partial = (s, x) => { const a = coefs(s); let sum = 0; for (let n = 0; n <= s.N; n++) sum += a[n] * x ** n; return sum; };
const truth = (s) => {
  if (EQ[s.eq].exact) return EQ[s.eq].exact;
  const rows = solve((x, [y, v]) => [v, x * y], [1, 0], 0, 5, 1000).concat(solve((x, [y, v]) => [v, x * y], [1, 0], 0, -5, 1000));
  return (x) => { const r = rows.reduce((b, row) => (Math.abs(row[0] - x) < Math.abs(b[0] - x) ? row : b)); return r[1]; };
};

createTool({
  state,
  label: 'A solution of a differential equation built from a power series. The recurrence gives each coefficient from earlier ones. The coral curve is the polynomial made from the first N terms and the blue curve is the true solution. More terms keep the polynomial accurate over a wider stretch.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-3, 3], c }),
  draw(ctx, stage, c, plot) {
    const w = EQ[state.eq].win;
    plot.setRange([-w, w], state.eq === 'exp' ? [-1, 12] : [-3, 3]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const f = truth(state);
    plot.fn(f, { color: c.b, width: 5 });
    plot.fn((x) => partial(state, x), { color: c.a, width: 3 });
  },
  controls: [
    { title: 'Build the series' },
    { key: 'eq', label: 'Equation', options: Object.entries(EQ).map(([k, v]) => [k, v.name]) },
    { key: 'N', label: 'Highest power N', min: 0, max: 20, step: 1 },
    { readout: [
      ['Recurrence', (s) => EQ[s.eq].rec],
      ['First coefficients', (s) => coefs(s, 6).map((v) => fixed(v, 3)).join(', ')],
      ['Error at x = 2', (s) => Math.abs(partial(s, 2) - truth(s)(2)).toExponential(1)],
    ] },
  ],
  tex: (s) => EQ[s.eq].tex,
});
