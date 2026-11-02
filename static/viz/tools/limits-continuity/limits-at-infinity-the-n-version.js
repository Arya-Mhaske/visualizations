import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from '../integral-applications/_ia.js';

// Around the asymptote y = L put a band of half-width ε. N is the point after which the graph never leaves the band again.
const FN = {
  rat: { name: '(2x + 1)/(x + 3) → 2', f: (x) => (2 * x + 1) / (x + 3), L: 2 },
  wave: { name: '2 + sin(x)/x → 2  (wiggles in)', f: (x) => 2 + Math.sin(x) / x, L: 2 },
  exp: { name: '1 + e^(−x/10) → 1', f: (x) => 1 + Math.exp(-x / 10), L: 1 },
};
const state = { fn: 'rat', eps: 0.3 };
const K = () => FN[state.fn];
// Last x (scanning to 4000) where the graph is outside the band; N is just after it.
const N = () => {
  let last = 0;
  for (let x = 0.5; x <= 4000; x += x < 100 ? 0.05 : 0.5) if (!(Math.abs(K().f(x) - K().L) < state.eps)) last = x;
  return last;
};

createTool({
  state,
  label: 'A graph levelling off at a horizontal asymptote, with a shaded band around the asymptote and a vertical line at N, after which the graph stays inside the band.',
  setup: (stage, c) => createPlot(stage, { x: [0, 60], y: [0, 4], c }),
  draw(ctx, stage, c, plot) {
    const n = N();
    const X = Math.max(20, n * 1.5);
    plot.setRange([0, X], [K().L - 1.2, K().L + 1.2]);
    plot.axes({ xLabel: 'x', yLabel: 'f' });
    plot.shade(() => K().L + state.eps, () => K().L - state.eps, 0, X, c.fillB);
    plot.shade(() => K().L + 1.2, () => K().L - 1.2, n, X, c.fillC);
    plot.fn(K().f, { color: c.ink, width: 3, domain: [0.3, X] });
    plot.segment(0, K().L, X, K().L, { color: c.c, width: 2, dash: [6, 4] });
    plot.segment(n, K().L - 1.2, n, K().L + 1.2, { color: c.c, width: 3 });
  },
  controls: [
    { title: 'Set the band' },
    { key: 'fn', label: 'Function', options: Object.entries(FN).map(([k, v]) => [k, v.name]) },
    { key: 'eps', label: 'Band half-width ε', min: 0.02, max: 0.6, step: 0.01, format: (v) => v.toFixed(2) },
    { readout: [
      ['Limit L', () => String(K().L)],
      ['N (stays inside after this)', () => num(N(), 4)],
      ['Check', () => `|f(x) − L| < ε for every x > N`],
    ] },
  ],
  tex: (s) => `x>N\\ \\Rightarrow\\ |f(x)-L|<${s.eps.toFixed(2)}`,
});
