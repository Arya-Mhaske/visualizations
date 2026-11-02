import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { speck, sumTo, fact, num } from './_is.js';

// For each N, bracket the true sum between a lower and an upper bound that we can compute exactly.
//   alternating: the sum lies between Sₙ and Sₙ₊₁.   positive, 1/n²: Sₙ + 1/(N+1) ≤ S ≤ Sₙ + 1/N (integral bounds).
//   1/k!: Sₙ + 1/(N+1)! ≤ S ≤ Sₙ + 1/(N!·N) (the tail is smaller than a geometric series).
const nextAlt = (N) => ((N + 1) % 2 ? 1 : -1) / (N + 1);
const SERIES = {
  alt: { name: '1 − ½ + ⅓ − … = ln 2', S: Math.LN2, from: 1, term: (n) => (n % 2 ? 1 : -1) / n, lo: (N, s) => Math.min(s, s + nextAlt(N)), hi: (N, s) => Math.max(s, s + nextAlt(N)), win: 0.35, w: (N) => 1 / (N + 1), tex: '|L-S_N|\\le b_{N+1}' },
  sq: { name: '1 + ¼ + 1/9 + … = π²/6', S: Math.PI ** 2 / 6, from: 1, term: (n) => 1 / (n * n), lo: (N, s) => s + 1 / (N + 1), hi: (N, s) => s + 1 / N, win: 0.45, w: (N) => 1 / (N * (N + 1)), tex: '\\frac1{N+1}\\le L-S_N\\le\\frac1N' },
  fact: { name: '1 + 1 + ½ + ⅙ + … = e', S: Math.E, from: 0, term: (k) => 1 / fact(k), lo: (N, s) => s + 1 / fact(N + 1), hi: (N, s) => s + 1 / (fact(N) * N), win: 0.4, w: (N) => 1 / (fact(N) * N) - 1 / fact(N + 1), tex: '\\frac1{(N+1)!}\\le e-S_N\\le\\frac1{N!\\,N}' },
};
const state = { kind: 'alt', N: 4, digits: 3 };
const K = () => SERIES[state.kind];
const NMAX = 12;
const part = (N) => sumTo(K().term, K().from, N);
const width = (N) => K().hi(N, part(N)) - K().lo(N, part(N));
const needN = () => {
  const tol = 10 ** -state.digits;
  let hi = 1;
  while (K().w(hi) >= tol && hi < 1e9) hi *= 2;
  let lo = Math.max(1, hi / 2);
  while (lo < hi) { const mid = Math.floor((lo + hi) / 2); if (K().w(mid) < tol) hi = mid; else lo = mid + 1; }
  return lo;
};

createTool({
  state,
  label: 'For each number of terms N, a lower bound (blue) and an upper bound (coral) for the true sum, with the true sum as a green line between them. The two bounds close in on it.',
  setup: (stage, c) => createPlot(stage, { x: [0, NMAX + 1], y: [0, 1], c }),
  draw(ctx, stage, c, plot) {
    const S = K().S;
    plot.setRange([0, NMAX + 1], [S - K().win, S + K().win]);
    plot.axes({ xLabel: 'N', yLabel: 'sum' });
    plot.segment(0, S, NMAX + 1, S, { color: c.c, width: 3, dash: [7, 4] });
    for (let N = Math.max(1, K().from); N <= NMAX; N++) {
      const lo = K().lo(N, part(N));
      const hi = K().hi(N, part(N));
      plot.segment(N, lo, N, hi, { color: c.ink, width: N === state.N ? 5 : 2 });
      speck(ctx, plot, N, lo, N === state.N ? 6 : 3.5, c.b, c.ink);
      speck(ctx, plot, N, hi, N === state.N ? 6 : 3.5, c.a, c.ink);
    }
  },
  controls: [
    { title: 'Bracket the sum' },
    { key: 'kind', label: 'Series', options: Object.entries(SERIES).map(([k, v]) => [k, v.name]) },
    { key: 'N', label: 'Terms used N', min: 1, max: NMAX, step: 1 },
    { key: 'digits', label: 'Decimal places wanted', min: 1, max: 6, step: 1 },
    { readout: [
      ['Partial sum Sₙ', () => part(state.N).toFixed(6)],
      ['Lower bound', () => K().lo(state.N, part(state.N)).toFixed(6)],
      ['Upper bound', () => K().hi(state.N, part(state.N)).toFixed(6)],
      ['Bracket width', () => num(width(state.N), 3)],
      ['N for the places wanted', () => `N = ${needN().toLocaleString('en-IN')}`],
    ] },
  ],
  tex: () => K().tex,
});
