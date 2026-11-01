import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';

// f(x) = 1/x². Whatever bound M is set, f beats M for every x closer to 0 than 1/√M.
const state = { k: 2 };
const M = (s = state) => 10 ** s.k;
const delta = (s = state) => 1 / Math.sqrt(M(s));

createTool({
  state,
  label: 'The graph of one over x squared near x equal to 0. You choose a bound M, shown as a horizontal line. Every time, the graph climbs above that line once x is close enough to 0, inside the shaded band. The picture looks the same at every scale because the numbers keep growing. The function grows without bound, which is a description of its behaviour, not a value it reaches.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [0, 3], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const d = delta();
    plot.setRange([-3 * d, 3 * d], [0, 3 * M()]);
    plot.axes();
    plot.shade((x) => 3 * M(), (x) => 0, -d, d, c.fillC);
    plot.fn((x) => 1 / (x * x), { color: c.a, width: 4 });
    plot.segment(-3 * d, M(), 3 * d, M(), { color: c.b, width: 3 });
    plot.text('M', -2.8 * d, M() * 1.1, { size: 12, color: c.b, patch: false });
  },
  controls: [
    { title: 'Set a bound' },
    { key: 'k', label: 'Bound, M', min: 1, max: 8, step: 1, format: (v) => sig(10 ** v, 3) },
    { readout: [
      ['M', (s) => sig(M(s), 3)],
      ['Closer to 0 than', (s) => sig(delta(s), 3)],
      ['Then f(x) is above M', () => ({ text: 'for every such x', good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac1{x^2}>${sig(M(s), 3)}\\iff |x|<\\dfrac{1}{\\sqrt{${sig(M(s), 3)}}}=${sig(delta(s), 3)}`,
});
