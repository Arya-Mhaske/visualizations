import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { boxes, partials, speck, trace, num } from './_is.js';

// Trap a series next to one we know. Under a convergent series → converges. Over a divergent one → diverges.
const CASES = {
  a: { name: 'Σ 1/(n²+1) with Σ 1/n²', a: (n) => 1 / (n * n + 1), b: (n) => 1 / (n * n), bConv: true, bTex: '\\frac1{n^2}', aTex: '\\frac1{n^2+1}' },
  b: { name: 'Σ 1/(2ⁿ+1) with Σ 1/2ⁿ', a: (n) => 1 / (2 ** n + 1), b: (n) => 1 / 2 ** n, bConv: true, bTex: '\\frac1{2^n}', aTex: '\\frac1{2^n+1}' },
  c: { name: 'Σ 1/ln(n+1) with Σ 1/n', a: (n) => 1 / Math.log(n + 1), b: (n) => 1 / n, bConv: false, bTex: '\\frac1n', aTex: '\\frac1{\\ln(n+1)}' },
  d: { name: 'Σ 1/√n with Σ 1/n', a: (n) => 1 / Math.sqrt(n), b: (n) => 1 / n, bConv: false, bTex: '\\frac1n', aTex: '\\frac1{\\sqrt n}' },
  e: { name: 'Σ (2n+1)/(n³+n+1) with Σ 1/n²', a: (n) => (2 * n + 1) / (n ** 3 + n + 1), b: (n) => 1 / (n * n), bConv: true, bTex: '\\frac1{n^2}', aTex: '\\frac{2n+1}{n^3+n+1}' },
};
const NMAX = 30;
const state = { kind: 'a', c: 1, N: 30 };
const K = () => CASES[state.kind];
const cb = (n) => state.c * K().b(n);
const good = (n) => (K().bConv ? K().a(n) <= cb(n) + 1e-15 : K().a(n) >= cb(n) - 1e-15);
const lastBad = () => { let bad = 0; for (let n = 1; n <= NMAX; n++) if (!good(n)) bad = n; return bad; };
const [boxA, boxB] = boxes(2);

createTool({
  state,
  label: 'Top: the terms of the test series (coral) and of the comparison series times a constant (blue). Bottom: the running totals of both.',
  setup: (stage, c) => ({
    a: createPlot(stage, { x: [0, NMAX + 1], y: [0, 1.2], c, box: boxA }),
    b: createPlot(stage, { x: [0, NMAX + 1], y: [0, 5], c, box: boxB }),
  }),
  draw(ctx, stage, c, { a, b }) {
    const sa = partials(K().a, 1, NMAX);
    const sb = partials(cb, 1, NMAX);
    const top = Math.max(1, Math.min(8, Math.max(sa[state.N - 1], sb[state.N - 1]) * 1.15));
    a.setRange([0, NMAX + 1], [0, Math.min(1.5, Math.max(0.4, 1.2 * cb(1), 1.2 * K().a(1)))]);
    b.setRange([0, NMAX + 1], [0, top]);
    a.axes({ xLabel: 'n', yLabel: 'terms' });
    for (let n = 1; n <= NMAX; n++) {
      speck(ctx, a, n, cb(n), 4, c.b, c.ink);
      speck(ctx, a, n, K().a(n), 4, good(n) ? c.a : c.d, c.ink);
    }
    b.axes({ xLabel: 'N', yLabel: 'sums' });
    trace(ctx, b, sb.slice(0, NMAX).map((v, i) => [i + 1, v]), c.b, 3);
    trace(ctx, b, sa.slice(0, NMAX).map((v, i) => [i + 1, v]), c.a, 3);
    b.segment(state.N, 0, state.N, top, { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Trap the series' },
    { key: 'kind', label: 'Pair', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
    { key: 'c', label: 'Multiplier c on the known series', min: 0.25, max: 4, step: 0.25, format: (v) => v.toFixed(2) },
    { key: 'N', label: 'Show sums up to N', min: 2, max: NMAX, step: 1 },
    { readout: [
      ['Known series Σbₙ', () => (K().bConv ? { text: 'converges', good: true } : { text: 'diverges', good: false })],
      ['Trap holds', () => (lastBad() === 0 ? { text: 'for every n shown', good: true } : lastBad() >= NMAX ? { text: 'not yet: fails at n = 30', good: false } : { text: `from n = ${lastBad() + 1} on`, good: true })],
      ['Verdict', () => (lastBad() >= NMAX ? 'no conclusion' : K().bConv ? { text: 'Σaₙ converges', good: true } : { text: 'Σaₙ diverges', good: false })],
    ] },
  ],
  tex: (s) => (K().bConv
    ? `0\\le a_n=${K().aTex}\\ \\le\\ ${s.c}\\cdot ${K().bTex}`
    : `a_n=${K().aTex}\\ \\ge\\ ${s.c}\\cdot ${K().bTex}\\ \\ge 0`),
});
