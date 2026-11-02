import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { partials, speck, num } from './_is.js';

// Euler's value π²/6 is shown, not proved. The partial sums creep up to it, and (limit − Sₙ) × n tends to 1.
const LIM = Math.PI ** 2 / 6;
const MAX = 400;
const S = partials((n) => 1 / (n * n), 1, MAX);
const state = { N: 20, view: 'sums' };

createTool({
  state,
  label: 'Either the partial sums of one over n squared climbing towards the line at pi squared over six, or the gap between them and that line multiplied by n, which settles near 1.',
  setup: (stage, c) => createPlot(stage, { x: [0, 40], y: [1, 1.8], c }),
  draw(ctx, stage, c, plot) {
    const n = state.N;
    if (state.view === 'sums') {
      plot.setRange([0, n + 1], [1, 1.75]);
      plot.axes({ xLabel: 'n', yLabel: 'Sₙ' });
      plot.segment(0, LIM, n + 1, LIM, { color: c.c, width: 3, dash: [7, 4] });
      plot.text('π²/6', (n + 1) * 0.1, LIM + 0.04, { color: c.c });
      for (let k = 1; k <= n; k++) speck(ctx, plot, k, S[k - 1], n > 120 ? 2 : 4, c.a, c.ink);
    } else {
      plot.setRange([0, n + 1], [0, 1.6]);
      plot.axes({ xLabel: 'n', yLabel: 'n × gap' });
      plot.segment(0, 1, n + 1, 1, { color: c.c, width: 3, dash: [7, 4] });
      for (let k = 1; k <= n; k++) speck(ctx, plot, k, k * (LIM - S[k - 1]), n > 120 ? 2 : 4, c.b, c.ink);
    }
  },
  controls: [
    { title: 'Add the squares' },
    { key: 'view', label: 'Show', options: [['sums', 'Partial sums'], ['gap', 'Gap × n']] },
    { key: 'N', label: 'Terms n', min: 2, max: MAX, step: 1 },
    { readout: [
      ['Sₙ', () => S[state.N - 1].toFixed(5)],
      ['π²/6', () => LIM.toFixed(5)],
      ['Gap', () => num(LIM - S[state.N - 1], 5)],
      ['n × gap', () => (state.N * (LIM - S[state.N - 1])).toFixed(4)],
      ['√(6 Sₙ)', () => Math.sqrt(6 * S[state.N - 1]).toFixed(4)],
    ] },
  ],
  tex: (s) => `S_{${s.N}}=${S[s.N - 1].toFixed(5)}\\ \\to\\ \\frac{\\pi^2}{6}=${LIM.toFixed(5)}`,
});
