import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { line } from '../../lib/draw.js';
import { partials, speck, num } from './_is.js';

// Sₙ zigzags. Each step is smaller than the last, so every new swing lands inside the previous one.
const SERIES = {
  h: { name: '1 − ½ + ⅓ − …  (sum ln 2)', b: (n) => 1 / n, L: Math.LN2, conv: true },
  odd: { name: '1 − ⅓ + ⅕ − …  (sum π/4)', b: (n) => 1 / (2 * n - 1), L: Math.PI / 4, conv: true },
  sq: { name: '1 − ¼ + 1/9 − …  (sum π²/12)', b: (n) => 1 / (n * n), L: Math.PI ** 2 / 12, conv: true },
  slow: { name: '1 − 1/√2 + 1/√3 − …', b: (n) => 1 / Math.sqrt(n), L: 0.6048986434, conv: true },
  bad: { name: 'terms not shrinking steadily', b: (n) => (n % 2 ? 1 / n : 1 / (n * n)), L: NaN, conv: false },
};
const state = { kind: 'h', N: 12 };
const K = () => SERIES[state.kind];
const S = () => partials((n) => (n % 2 ? 1 : -1) * K().b(n), 1, 60);

createTool({
  state,
  label: 'The partial sums of an alternating series as dots joined in a zigzag. Odd-numbered sums sit above the limit, even-numbered ones below, and each swing is smaller than the one before.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [0, 1.2], c }),
  draw(ctx, stage, c, plot) {
    const s = S();
    const n = state.N;
    const hi = Math.max(...s.slice(0, n));
    const lo = Math.min(...s.slice(0, n));
    plot.setRange([0, n + 1], [Math.min(0, lo) - 0.1, Math.max(1.05, hi + 0.1)]);
    plot.axes({ xLabel: 'n', yLabel: 'Sₙ' });
    if (K().conv) {
      plot.segment(0, K().L, n + 1, K().L, { color: c.c, width: 3, dash: [7, 4] });
      // the last swing, shaded as the trap for the limit
      const a = s[n - 2] ?? s[0];
      const b = s[n - 1];
      plot.shade(() => Math.max(a, b), () => Math.min(a, b), 0, n + 1, c.fillC);
    }
    for (let k = 1; k < n; k++) {
      const [x1, y1] = plot.toPx(k, s[k - 1]);
      const [x2, y2] = plot.toPx(k + 1, s[k]);
      line(ctx, x1, y1, x2, y2, { color: c.ink, width: 1.5 });
    }
    for (let k = 1; k <= n; k++) speck(ctx, plot, k, s[k - 1], 4.5, k % 2 ? c.a : c.b, c.ink);
  },
  controls: [
    { title: 'Add and subtract' },
    { key: 'kind', label: 'Series', options: Object.entries(SERIES).map(([k, v]) => [k, v.name]) },
    { key: 'N', label: 'Terms n', min: 3, max: 40, step: 1 },
    { readout: [
      ['Sₙ', () => S()[state.N - 1].toFixed(5)],
      ['Limit', () => (K().conv ? num(K().L, 5) : { text: 'none: odd sums climb', good: false })],
      ['Error bound |L − Sₙ|', () => (K().conv ? `≤ b_${state.N + 1} = ${num(K().b(state.N + 1), 4)}` : '—')],
      ['Actual error', () => (K().conv ? num(Math.abs(K().L - S()[state.N - 1]), 4) : '—')],
    ] },
  ],
  tex: (s) => (K().conv ? `|L-S_{${s.N}}|\\le b_{${s.N + 1}}\\quad\\text{because } b_n\\downarrow 0` : 'b_n \\text{ must fall steadily to } 0'),
});
