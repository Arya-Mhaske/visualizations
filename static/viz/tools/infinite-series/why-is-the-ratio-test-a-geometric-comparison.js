import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, speck, num } from './_is.js';

// Each series gives ln|aₙ| exactly. Ratios rₙ = aₙ₊₁/aₙ. If rₙ stays under ρ from N on, aₙ ≤ a_N ρ^(n−N): a geometric series.
const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
const SERIES = {
  half: { name: 'n / 2ⁿ', ln: (n) => Math.log(n) - n * Math.LN2, L: 0.5 },
  fact: { name: '1 / n!', ln: (n) => -lf(n), L: 0 },
  sq3: { name: 'n² / 3ⁿ', ln: (n) => 2 * Math.log(n) - n * Math.log(3), L: 1 / 3 },
  grow: { name: '2ⁿ / n²', ln: (n) => n * Math.LN2 - 2 * Math.log(n), L: 2 },
  inv2: { name: '1 / n²  (the test is silent)', ln: (n) => -2 * Math.log(n), L: 1 },
};
const NMAX = 30;
const state = { kind: 'half', rho: 0.8, N: 6 };
const K = () => SERIES[state.kind];
const ratio = (n) => Math.exp(K().ln(n + 1) - K().ln(n));
const holdsFrom = () => { let bad = 0; for (let n = 1; n < NMAX; n++) if (ratio(n) >= state.rho) bad = n; return bad + 1; };
const [boxA, boxB] = boxes(2);

createTool({
  state,
  label: 'Top: the ratios of neighbouring terms, with a line at their limit L and a line at the chosen rho. Bottom: log of the terms, with a straight dashed line, a geometric series, started at N.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, NMAX + 1], y: [0, 2.6], c, box: boxA }),
    b: createPlot(stage, { x: [0, NMAX + 1], y: [-12, 4], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    a.axes({ xLabel: 'n', yLabel: 'ratio rₙ' });
    a.segment(0, K().L, NMAX + 1, K().L, { color: c.c, width: 2.5, dash: [7, 4] });
    a.segment(0, state.rho, NMAX + 1, state.rho, { color: c.a, width: 3 });
    a.segment(0, 1, NMAX + 1, 1, { color: c.ink, width: 1.5, dash: [3, 3] });
    for (let n = 1; n < NMAX; n++) speck(ctx, a, n, Math.min(2.55, ratio(n)), 3.5, ratio(n) < state.rho ? c.c : c.b, c.ink);
    const lo = Math.min(...Array.from({ length: NMAX }, (_, i) => K().ln(i + 1) / Math.LN10));
    const hi = Math.max(...Array.from({ length: NMAX }, (_, i) => K().ln(i + 1) / Math.LN10));
    const [ylo, yhi] = [Math.max(-16, lo - 0.5), Math.min(10, hi + 0.7)];
    b.setRange([0, NMAX + 1], [ylo, yhi]);
    b.axes({ xLabel: 'n', yLabel: 'log₁₀ aₙ' });
    const base = K().ln(state.N) / Math.LN10;
    b.fn((x) => base + (x - state.N) * Math.log10(state.rho), { color: c.a, width: 2.5, dash: [6, 4], domain: [state.N, NMAX] });
    for (let n = 1; n <= NMAX; n++) speck(ctx, b, n, K().ln(n) / Math.LN10, 3.5, n >= state.N ? c.b : c.d, c.ink);
    b.segment(state.N, ylo, state.N, yhi, { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Compare with a geometric series' },
    { key: 'kind', label: 'Series', options: Object.entries(SERIES).map(([k, v]) => [k, v.name]) },
    { key: 'rho', label: 'Ratio ρ of the geometric series', min: 0.1, max: 1.5, step: 0.05, format: (v) => v.toFixed(2) },
    { key: 'N', label: 'Start the comparison at N', min: 1, max: 20, step: 1 },
    { readout: [
      ['Limit of rₙ', () => num(K().L, 3)],
      ['rₙ < ρ from', () => (holdsFrom() <= NMAX - 1 ? `n = ${holdsFrom()} on` : 'never (up to 30)')],
      ['Comparison valid?', () => (holdsFrom() <= state.N ? { text: `yes: aₙ ≤ a_${state.N}·ρⁿ⁻${state.N}`, good: true } : { text: 'no: some ratio is too big', good: false })],
      ['Verdict', () => (K().L < 1 ? { text: 'converges (L < 1)', good: true } : K().L > 1 ? { text: 'diverges (L > 1)', good: false } : 'ratio test says nothing (L = 1)')],
    ] },
  ],
  tex: (s) => `r_n=\\frac{a_{n+1}}{a_n}<${s.rho.toFixed(2)}\\ \\Rightarrow\\ a_n\\le a_{${s.N}}\\,${s.rho.toFixed(2)}^{\\,n-${s.N}}`,
});
