import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sig } from '../../lib/format.js';

const state = { k: 6, x: 0.01 };
const n = (s) => 10 ** s.k;
const logExact = (s, N = n(s)) => N * Math.log10(1 + s.x);
const bound = (s, N = n(s)) => 1 + N * s.x;

createTool({
  state,
  label: 'Graph, on a log scale, of the exact value of one plus x to the power n and of the lower bound one plus n x, against the power n. The exact value is always above the bound.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [0, 8], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 6.2], [0, Math.max(8, Math.min(Math.log10(bound(state, 10 ** 6)) + 2, 60))]);
    plot.axes({ xLabel: 'log₁₀ n', yLabel: 'log₁₀ value' });
    plot.fn((t) => Math.min(logExact(state, 10 ** t), 1e3), { color: c.b });
    plot.fn((t) => Math.log10(bound(state, 10 ** t)), { color: c.a, dash: [6, 5] });
    plot.point(state.k, Math.min(logExact(state), 1e3), { fill: c.b });
    plot.point(state.k, Math.log10(bound(state)), { fill: c.a });
  },
  controls: [
    { title: 'A huge power' },
    { key: 'k', label: 'n = 10^k', min: 1, max: 6, step: 1 },
    { key: 'x', label: 'x', min: 0.001, max: 0.1, step: 0.001 },
    { readout: [
      ['Bound 1 + nx', (s) => sig(bound(s), 6)],
      ['log₁₀ of (1 + x)ⁿ', (s) => sig(logExact(s), 5)],
      ['log₁₀ of the bound', (s) => sig(Math.log10(bound(s)), 5)],
      ['(1 + x)ⁿ ≥ 1 + nx', (s) => ({ text: logExact(s) >= Math.log10(bound(s)) - 1e-12 ? 'yes' : 'no', good: true })],
    ] },
  ],
  tex: (s) => `(1+x)^n\\ge1+nx=1+10^{${s.k}}\\times${s.x}=${sig(bound(s), 6)}`,
});
