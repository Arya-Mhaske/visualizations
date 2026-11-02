import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { speck, num } from './_is.js';

// |aₙ − L| < ε from some N on. A squeeze: lo(n) ≤ aₙ ≤ hi(n), and both bounds go to L.
const N = 100;
const SEQS = {
  sin: { name: 'sin n / n', a: (n) => Math.sin(n) / n, lo: (n) => -1 / n, hi: (n) => 1 / n, L: 0, why: '−1/n ≤ sin n / n ≤ 1/n' },
  alt: { name: '(−1)ⁿ / n', a: (n) => (-1) ** n / n, lo: (n) => -1 / n, hi: (n) => 1 / n, L: 0, why: '−1/n ≤ (−1)ⁿ/n ≤ 1/n' },
  cos: { name: 'cos n / n²', a: (n) => Math.cos(n) / (n * n), lo: (n) => -1 / (n * n), hi: (n) => 1 / (n * n), L: 0, why: '−1/n² ≤ cos n / n² ≤ 1/n²' },
  mix: { name: '(2 + sin n) / n', a: (n) => (2 + Math.sin(n)) / n, lo: (n) => 1 / n, hi: (n) => 3 / n, L: 0, why: '1/n ≤ (2 + sin n)/n ≤ 3/n' },
  root: { name: 'n^(1/n)', a: (n) => n ** (1 / n), lo: () => 1, hi: (n) => 1 + 2 / Math.sqrt(n), L: 1, why: '1 ≤ n^(1/n) ≤ 1 + 2/√n' },
};
const state = { seq: 'sin', eps: 0.2, squeeze: true };
const S = () => SEQS[state.seq];
// The least N so that every aₙ with n ≥ N is within ε of L (checked far past the window; the bounds shrink there).
function needN() {
  let last = 0;
  for (let n = 1; n <= 20000; n++) if (Math.abs(S().a(n) - S().L) >= state.eps) last = n;
  return last + 1;
}

createTool({
  state,
  label: 'Dots for the terms of a sequence, a shaded band of half-width epsilon around the limit, and, when switched on, the two bounding curves that squeeze the sequence.',
  setup: (stage, c) => createPlot(stage, { x: [0, N + 1], y: [-0.6, 1.8], c }),
  draw(ctx, stage, c, plot) {
    const L = S().L;
    plot.setRange([0, N + 1], [L - 0.6, L + 1.2]);
    plot.axes({ xLabel: 'n', yLabel: 'aₙ' });
    plot.shade(() => L + state.eps, () => L - state.eps, 0, N + 1, c.fillC);
    if (state.squeeze) {
      plot.fn(S().lo, { color: c.b, width: 2, dash: [6, 4], domain: [1, N] });
      plot.fn(S().hi, { color: c.b, width: 2, dash: [6, 4], domain: [1, N] });
    }
    const big = needN();
    for (let n = 1; n <= N; n++) {
      const v = S().a(n);
      speck(ctx, plot, n, v, 3, Math.abs(v - L) < state.eps ? c.c : c.a, c.ink);
    }
    if (big <= N) plot.segment(big, L - 0.6, big, L + 1.2, { color: c.ink, width: 2, dash: [4, 4] });
  },
  controls: [
    { title: 'Meet the definition' },
    { key: 'seq', label: 'Sequence', options: Object.entries(SEQS).map(([k, v]) => [k, v.name]) },
    { key: 'eps', label: 'Gap ε', min: 0.05, max: 1, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'squeeze', label: 'Show the squeeze', toggle: true },
    { readout: [
      ['Limit L', () => num(S().L, 3)],
      ['Inside the band from', () => `n = ${needN()}`],
      ['Squeeze', () => (state.squeeze ? S().why : 'switched off')],
      ['Both bounds tend to', () => num(S().L, 3)],
    ] },
  ],
  tex: (s) => `|a_n-${S().L}|<${s.eps.toFixed(2)}\\ \\text{for all } n\\ge ${needN()}`,
});
