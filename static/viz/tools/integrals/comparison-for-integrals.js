import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { simpson, num } from '../integral-applications/_ia.js';

// Trap an unknown integrand between 0 and one with a known integral (below a convergent one), or above a divergent one.
const CASES = {
  a: { name: 'e^(−x²) ≤ e^(−x) for x ≥ 1', f: (x) => Math.exp(-x * x), g: (x) => Math.exp(-x), gConv: true },
  b: { name: '1/(x² + 1) ≤ 1/x² for x ≥ 1', f: (x) => 1 / (x * x + 1), g: (x) => 1 / (x * x), gConv: true },
  c: { name: '(1 + e^(−x))/x ≥ 1/x for x ≥ 1', f: (x) => (1 + Math.exp(-x)) / x, g: (x) => 1 / x, gConv: false },
  d: { name: 'sin²x / x² ≤ 1/x² for x ≥ 1', f: (x) => Math.sin(x) ** 2 / (x * x), g: (x) => 1 / (x * x), gConv: true },
};
const state = { kind: 'a', s: 1 };
const K = () => CASES[state.kind];
const b = () => 10 ** state.s;
const area = (f, bb) => simpson((u) => f(Math.exp(u)) * Math.exp(u), 0, Math.log(bb), Math.max(200, Math.ceil(Math.log(bb) * 60))); // x = e^u

createTool({
  state,
  label: 'Two curves above x equals 1, with the area under each shaded out to b. The unknown integrand is trapped under a known convergent one, or over a known divergent one.',
  setup: (stage, c) => createPlot(stage, { x: [0, 10], y: [0, 1.2], c }),
  draw(ctx, stage, c, plot) {
    const X = Math.min(b(), 12);
    plot.setRange([0.5, 12], [0, 1.1]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(K().g, null, 1, X, c.fillB);
    plot.shade(K().f, null, 1, X, c.fillA);
    plot.fn(K().g, { color: c.b, width: 3, domain: [0.5, 12] });
    plot.fn(K().f, { color: c.a, width: 3, domain: [0.5, 12] });
    plot.segment(Math.min(b(), 12), 0, Math.min(b(), 12), 1.1, { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Push the end out' },
    { key: 'kind', label: 'Pair', options: Object.entries(CASES).map(([k, v]) => [k, v.name]) },
    { key: 's', label: 'End b = 10^s', min: 0.1, max: 6, step: 0.1, format: (v) => num(10 ** v, 6) },
    { readout: [
      ['Area of the unknown (coral)', () => num(area(K().f, b()), 5)],
      ['Area of the known (blue)', () => num(area(K().g, b()), 5)],
      ['Known integral', () => (K().gConv ? { text: 'converges', good: true } : { text: 'diverges', good: false })],
      ['Verdict', () => (K().gConv ? { text: 'unknown is trapped below it: converges', good: true } : { text: 'unknown is above it: diverges', good: false })],
    ] },
  ],
  tex: (s) => (CASES[s.kind].gConv ? '0\\le f\\le g,\\ \\int g<\\infty\\ \\Rightarrow\\ \\int f<\\infty' : 'f\\ge g\\ge 0,\\ \\int g=\\infty\\ \\Rightarrow\\ \\int f=\\infty'),
});
