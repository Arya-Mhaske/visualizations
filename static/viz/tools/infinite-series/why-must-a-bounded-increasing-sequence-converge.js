import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { SEQS, speck, num } from './_is.js';

// Every term sits under the ceiling. Lower the ceiling: the lowest one that still holds is the limit L.
// Any ceiling below L is broken by some term, so the terms must climb to within any gap of L.
const N = 40;
const state = { seq: 'inv', pct: 130, eps: 0.1 };
const S = () => SEQS[state.seq];
const a1 = () => S().a(1);
const ceiling = () => a1() + ((S().L - a1()) * state.pct) / 100;
const epsAbs = () => state.eps * (S().L - a1());
const terms = () => Array.from({ length: N }, (_, i) => S().a(i + 1));
const firstAbove = () => terms().findIndex((v) => v > ceiling() + 1e-12) + 1;
const firstInside = () => { const t = terms(); for (let n = 1; n <= N; n++) if (t.slice(n - 1).every((v) => v > S().L - epsAbs())) return n; return 0; };

createTool({
  state,
  label: 'The terms of an increasing sequence as dots, a horizontal ceiling line you can lower, and a thin band just under the limit.',
  setup: (stage, c) => createPlot(stage, { x: [0, N + 1], y: [0, 1], c }),
  draw(ctx, stage, c, plot) {
    const span = S().L - a1();
    plot.setRange([0, N + 1], [a1() - 0.15 * span, S().L + 0.45 * span]);
    plot.axes({ xLabel: 'n', yLabel: 'aₙ' });
    if (state.pct >= 100) plot.shade(() => S().L, () => S().L - epsAbs(), 0, N + 1, c.fillC);
    const M = ceiling();
    plot.segment(0, M, N + 1, M, { color: c.a, width: 3, dash: [8, 5] });
    plot.text(`ceiling ${num(M, 3)}`, N * 0.62, M + 0.07 * span, { color: c.a, size: 12 });
    terms().forEach((v, i) => speck(ctx, plot, i + 1, v, 4, v > M + 1e-12 ? c.a : c.b, c.ink));
    const [x0, y0] = plot.toPx(0, S().L);
    const [x1] = plot.toPx(N + 1, S().L);
    line(ctx, x0, y0, x1, y0, { color: c.c, width: 2 });
  },
  controls: [
    { title: 'Push up against a ceiling' },
    { key: 'seq', label: 'Sequence', options: Object.entries(SEQS).map(([k, v]) => [k, v.name]) },
    { key: 'pct', label: 'Ceiling height', min: 40, max: 160, step: 1, format: (v) => (v === 100 ? '= the limit' : `${v}% of the way`) },
    { key: 'eps', label: 'Gap ε below L', min: 0.02, max: 0.5, step: 0.01, format: (v) => v.toFixed(2) },
    { readout: [
      ['Limit L', () => num(S().L, 5)],
      ['Ceiling', () => num(ceiling(), 4)],
      ['Ceiling holds?', () => (firstAbove() ? { text: `broken at n = ${firstAbove()}`, good: false } : { text: `all ${N} terms under`, good: true })],
      ['Inside the gap from', () => (state.pct >= 100 && firstInside() ? `n = ${firstInside()} on` : '—')],
    ] },
  ],
  tex: (s) => `a_n \\le ${num(ceiling(), 3)}\\ \\text{for all } n \\;\\Rightarrow\\; a_n \\to \\sup a_n = ${num(S().L, 4)}`,
});
