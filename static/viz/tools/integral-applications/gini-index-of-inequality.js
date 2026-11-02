import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from '../integrals/_ig.js';

// Lorenz curve L(p): the share of income held by the poorest fraction p. Equality is L = p. Gini G = 2 ∫₀¹ (p − L) dp.
// With L = p^k, G = (k − 1)/(k + 1). The curves here are made-up examples, not measured data.
const state = { k: 2.5 };
const L = (k) => (p) => p ** k;
const gini = (k) => 2 * exact((p) => p - L(k)(p), 0, 1);

const tool = createTool({
  state,
  label: 'A square graph of the share of income held against the share of people, poorest first. A diagonal line is perfect equality. A curve bows below it. The area between the diagonal and the curve is shaded, and the Gini index is twice that area.',
  setup: (stage, c) => createPlot(stage, { x: [0, 1], y: [0, 1], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-0.05, 1.05], [-0.05, 1.05]);
    plot.axes({ xLabel: 'share of people', yLabel: 'share of income' });
    plot.shade((p) => p, L(state.k), 0, 1, c.fillY);
    plot.fn((p) => p, { color: c.ink, dash: [6, 4], width: 2, domain: [0, 1] });
    plot.fn(L(state.k), { color: c.a, domain: [0, 1] });
    const p20 = 0.8;
    plot.point(p20, L(state.k)(p20), { fill: c.b, r: 6 });
    plot.text(`poorest 80% hold ${fixed(100 * L(state.k)(p20), 0)}%`, 0.45, L(state.k)(p20) + 0.12, { size: 10, patch: true });
  },
  controls: () => [
    { title: 'Make the society more unequal' },
    { key: 'k', label: 'Curve bend, k in L = pᵏ', min: 1, max: 8, step: 0.1, format: (v) => fixed(v, 1) },
    { readout: [
      ['Area between', (s) => fixed(exact((p) => p - L(s.k)(p), 0, 1), 4)],
      ['Gini index', (s) => fixed(gini(s.k), 3)],
      ['Formula (k − 1)/(k + 1)', (s) => fixed((s.k - 1) / (s.k + 1), 3)],
      ['Top 20% hold', (s) => `${fixed(100 * (1 - L(s.k)(0.8)), 0)}%`],
    ] },
  ],
  tex: (s) => `G=2\\int_0^1\\left(p-p^{${fixed(s.k, 1)}}\\right)dp=${fixed(gini(s.k), 3)}`,
});

tool.update();
