import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_is.js';

// Start from a geometric series and integrate or differentiate each term. The radius stays 1; the endpoints may change.
const FUNS = {
  ln: { name: 'ln(1 + x)  from  1/(1 + x) = 1 − x + x² − …', f: (x) => Math.log(1 + x), t: (k) => [k + 1, ((k % 2) ? -1 : 1) / (k + 1)], step: 'integrate each term: ∫(−x)ⁿ dx = (−1)ⁿ xⁿ⁺¹/(n+1)', ends: 'converges on (−1, 1]', y: [-3, 2] },
  atan: { name: 'arctan x  from  1/(1 + x²) = 1 − x² + x⁴ − …', f: Math.atan, t: (k) => [2 * k + 1, ((k % 2) ? -1 : 1) / (2 * k + 1)], step: 'integrate each term: ∫(−1)ⁿ x²ⁿ dx = (−1)ⁿ x²ⁿ⁺¹/(2n+1)', ends: 'converges on [−1, 1]', y: [-2, 2] },
  dgeo: { name: '1/(1 − x)²  from  1/(1 − x) = 1 + x + x² + …', f: (x) => 1 / ((1 - x) ** 2), t: (k) => [k, k + 1], step: 'differentiate each term: d(xⁿ⁺¹)/dx = (n+1) xⁿ', ends: 'converges on (−1, 1): the endpoints are lost', y: [0, 8] },
};
const state = { kind: 'ln', N: 5, x: 0.6 };
const K = () => FUNS[state.kind];
const poly = (x, N = state.N) => { let s = 0; for (let k = 0; k < N; k++) { const [p, c] = K().t(k); s += c * x ** p; } return s; };
const show = () => {
  const out = [];
  for (let k = 0; k < Math.min(state.N, 4); k++) { const [p, c] = K().t(k); out.push(`${c < 0 ? '−' : out.length ? '+' : ''}${Math.abs(c) === 1 ? '' : num(Math.abs(c), 3)}x^${p}`); }
  return out.join(' ') + ' …';
};

createTool({
  state,
  label: 'The target function in black and the polynomial made from the first N terms of its series in coral, on the window from minus 1.6 to 1.6.',
  setup: (stage, c) => createPlot(stage, { x: [-1.6, 1.6], y: [-3, 2], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-1.6, 1.6], K().y);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(() => K().y[1], () => K().y[0], -1, 1, c.fillC);
    plot.fn(K().f, { color: c.ink, width: 3, domain: [-0.999, 1.6] });
    plot.fn((x) => poly(x), { color: c.a, width: 3 });
    plot.segment(state.x, K().y[0], state.x, K().y[1], { color: c.b, width: 2, dash: [5, 4] });
  },
  controls: [
    { title: 'Build the series' },
    { key: 'kind', label: 'Function', options: Object.entries(FUNS).map(([k, v]) => [k, v.name.split('  from')[0]]) },
    { key: 'N', label: 'Terms N', min: 1, max: 20, step: 1 },
    { key: 'x', label: 'x', min: -0.95, max: 0.95, step: 0.05, format: (v) => v.toFixed(2).replace('-', '−') },
    { readout: [
      ['Start', () => K().name.split('  from  ')[1]],
      ['Step', () => K().step],
      ['Series', () => show()],
      ['f(x)', () => num(K().f(state.x), 5)],
      ['Polynomial', () => num(poly(state.x), 5)],
      ['Radius 1', () => K().ends],
    ] },
  ],
});
