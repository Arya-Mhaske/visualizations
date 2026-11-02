import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { speck, num } from './_is.js';

// ⁿ√|aₙ| → L. If L < 1 the terms are under a geometric series, so Σaₙ converges.
// ln|aₙ| is given exactly, so large powers never overflow.
const SERIES = {
  a: { name: '((2n+1)/(3n+2))ⁿ', ln: (n) => n * Math.log((2 * n + 1) / (3 * n + 2)), L: 2 / 3 },
  b: { name: '(n/(n+1))^(n²)', ln: (n) => n * n * Math.log(n / (n + 1)), L: 1 / Math.E },
  c: { name: '(1 + 1/n)^(n²)', ln: (n) => n * n * Math.log(1 + 1 / n), L: Math.E },
  d: { name: '(1/ln(n+1))ⁿ', ln: (n) => -n * Math.log(Math.log(n + 1)), L: 0 },
  e: { name: '2^(−n + (−1)ⁿ): the ratio test fails here', ln: (n) => (-n + (n % 2 ? -1 : 1)) * Math.LN2, L: 0.5 },
};
const NMAX = 40;
const state = { kind: 'a' };
const K = () => SERIES[state.kind];
const root = (n) => Math.exp(K().ln(n) / n);
const ratio = (n) => Math.exp(K().ln(n + 1) - K().ln(n));

createTool({
  state,
  label: 'The n-th roots of the terms (coral dots) settle on a limit, while the ratios of neighbouring terms (blue dots) may jump about. A line marks 1.',
  setup: (stage, c) => createPlot(stage, { x: [0, NMAX + 1], y: [0, 3], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, NMAX + 1], [0, Math.max(1.6, Math.min(3, K().L + 0.5))]);
    plot.axes({ xLabel: 'n', yLabel: 'value' });
    plot.segment(0, 1, NMAX + 1, 1, { color: c.ink, width: 2, dash: [3, 3] });
    plot.segment(0, K().L, NMAX + 1, K().L, { color: c.c, width: 3, dash: [7, 4] });
    for (let n = 2; n < NMAX; n++) {
      speck(ctx, plot, n, Math.min(5, ratio(n)), 3, c.b, c.ink);
      speck(ctx, plot, n, Math.min(5, root(n)), 4, c.a, c.ink);
    }
  },
  controls: [
    { title: 'Take the n-th root' },
    { key: 'kind', label: 'Series', options: Object.entries(SERIES).map(([k, v]) => [k, v.name]) },
    { readout: [
      ['ⁿ√|aₙ| at n = 40', () => num(root(40), 4)],
      ['Limit L (coral)', () => num(K().L, 4)],
      ['Ratio at n = 39, 40', () => `${num(ratio(39), 3)} and ${num(ratio(40), 3)}`],
      ['Verdict', () => (K().L < 1 ? { text: 'converges (L < 1)', good: true } : { text: 'diverges (L > 1)', good: false })],
    ] },
  ],
  tex: () => '\\sqrt[n]{|a_n|}\\to L<1\\ \\Rightarrow\\ |a_n|<r^n\\ \\text{eventually, } r<1',
});
