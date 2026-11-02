import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { FN, taylor } from './_taylor.js';
import { fact, num } from './_is.js';

// Each new term fixes one more derivative at 0. The green band is where the polynomial is within 0.01 of f.
const state = { fn: 'exp', n: 2 };
const K = () => FN[state.fn];
const reach = () => {
  const [lo, hi] = K().win;
  const ok = (x) => Math.abs(K().f(x) - taylor(state.fn, state.n, 0, x)) < 0.01;
  const scan = (dir) => { let x = 0; const dx = ((dir > 0 ? hi : lo) - 0) / 800; for (let i = 0; i < 800; i++) { const nx = x + dx; if (!ok(nx)) break; x = nx; } return x; };
  return [scan(-1), scan(1)];
};
// k-th derivative of f at 0 is coef·k!
const deriv = (k) => K().coef(k, 0) * fact(k);

createTool({
  state,
  label: 'The graph of a function in black and its Taylor polynomial in coral. A green band marks where they differ by less than 0.01. Raising the degree widens the band.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-2, 8], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange(K().win, K().y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const [a, b] = reach();
    if (b > a) plot.shade(() => K().y[1], () => K().y[0], a, b, c.fillC);
    plot.fn(K().f, { color: c.ink, width: 3 });
    plot.fn((x) => taylor(state.fn, state.n, 0, x), { color: c.a, width: 3 });
    plot.point(0, K().f(0), { fill: c.b });
  },
  controls: [
    { title: 'Add terms one at a time' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).filter(([k]) => k !== 'rat').map(([k, v]) => [k, v.name]) },
    { key: 'n', label: 'Degree n', min: 0, max: 14, step: 1 },
    { readout: [
      ['Derivatives matched at 0', () => `f, f′ … f⁽${state.n}⁾`],
      ['f⁽ⁿ⁾(0) of f and of Tₙ', () => `${num(deriv(state.n), 4)} and ${num(deriv(state.n), 4)}`],
      ['Within 0.01 for x in', () => { const [a, b] = reach(); return `[${num(a, 2)}, ${num(b, 2)}]`; }],
      ['Radius of convergence', () => (Number.isFinite(K().R) ? `${K().R}: no degree reaches past x = 1` : '∞: every x is reached in the end')],
    ] },
  ],
  tex: (s) => `T_{${s.n}}(x)=\\sum_{k=0}^{${s.n}}\\frac{f^{(k)}(0)}{k!}x^k`,
});
