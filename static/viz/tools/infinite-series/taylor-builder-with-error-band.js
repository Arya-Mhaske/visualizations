import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FN, taylor } from './_taylor.js';
import { fact, num } from './_is.js';

// Lagrange: |f(x) − Tₙ(x)| ≤ M |x − a|ⁿ⁺¹/(n+1)!, where M bounds |f⁽ⁿ⁺¹⁾| on the interval.
const state = { fn: 'exp', a: 0, n: 3, h: 1 };
const KEYS = ['exp', 'sin', 'cos', 'ln'];
const K = () => FN[state.fn];
const lo = () => (state.fn === 'ln' ? Math.max(-0.95, state.a - state.h) : state.a - state.h);
const bound = (h = state.h) => (K().M(state.n, state.a, h) * h ** (state.n + 1)) / fact(state.n + 1);
const bound0 = () => (state.fn === 'ln' && state.a - state.h <= -1 ? NaN : bound());
const actual = () => {
  let m = 0;
  for (let i = 0; i <= 400; i++) { const x = lo() + ((state.a + state.h - lo()) * i) / 400; m = Math.max(m, Math.abs(K().f(x) - taylor(state.fn, state.n, state.a, x))); }
  return m;
};

createTool({
  state,
  label: 'A function in black, its Taylor polynomial in coral, and a shaded band around the polynomial whose half-width is the error bound over the chosen interval around the centre.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-2, 8], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange(state.fn === 'ln' ? [-0.95, 4] : [state.a - 4, state.a + 4], state.fn === 'exp' ? [-2, Math.max(8, Math.exp(state.a) * 3)] : K().y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const b = bound0();
    if (Number.isFinite(b)) plot.shade((x) => taylor(state.fn, state.n, state.a, x) + b, (x) => taylor(state.fn, state.n, state.a, x) - b, lo(), state.a + state.h, c.fillC);
    plot.fn(K().f, { color: c.ink, width: 3 });
    plot.fn((x) => taylor(state.fn, state.n, state.a, x), { color: c.a, width: 3 });
    plot.point(state.a, K().f(state.a), { fill: c.b });
  },
  controls: [
    { title: 'Build the polynomial' },
    { key: 'fn', label: 'Function', options: KEYS.map((k) => [k, FN[k].name]) },
    { key: 'a', label: 'Centre a', min: -0.9, max: 3, step: 0.1, format: (v) => v.toFixed(1).replace('-', '−') },
    { key: 'n', label: 'Degree n', min: 0, max: 12, step: 1 },
    { key: 'h', label: 'Half-width h of the interval', min: 0.1, max: 3, step: 0.1, format: (v) => v.toFixed(1) },
    { readout: [
      ['Error bound', () => (Number.isFinite(bound0()) ? num(bound0(), 4) : 'f is not defined on the whole interval')],
      ['Actual largest error', () => (Number.isFinite(bound0()) ? num(actual(), 4) : '—')],
      ['Bound holds?', () => (Number.isFinite(bound0()) ? (actual() <= bound0() + 1e-12 ? { text: 'yes', good: true } : { text: 'no', good: false }) : '—')],
    ] },
  ],
  tex: (s) => `|f-T_{${s.n}}|\\le \\frac{M\\,h^{${s.n + 1}}}{${s.n + 1}!}`,
});
