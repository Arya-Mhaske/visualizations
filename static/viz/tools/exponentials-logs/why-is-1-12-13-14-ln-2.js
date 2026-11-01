import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { altHarmonic } from './_exp-log-math.js';

const state = { N: 10 };
const termsTex = (n) => {
  const list = Array.from({ length: Math.min(n, 5) }, (_, i) => (i === 0 ? '1' : `${i % 2 ? '-' : '+'}\\tfrac1{${i + 1}}`)).join('');
  return n > 5 ? `${list}\\cdots` : list;
};

createTool({
  state,
  label: 'The running totals of one minus a half plus a third minus a quarter and so on, plotted term by term. They jump above and below the natural log of 2, about 0.6931, and the swings shrink, so the totals close in on it.',
  setup: (stage, c) => createPlot(stage, { x: [0, 20], y: [0.4, 1.05], c, pad: 30 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, Math.max(10, state.N + 1)], [0.4, 1.05]);
    plot.axes({ xLabel: 'terms added', yLabel: 'total' });
    plot.segment(0, Math.LN2, Math.max(10, state.N + 1), Math.LN2, { color: c.c, width: 3, dash: [8, 5] });
    plot.text('ln 2 = 0.6931', Math.max(10, state.N + 1) * 0.8, Math.LN2 + 0.05, { size: 10, color: c.c, patch: false });
    for (let k = 1; k <= state.N; k++) {
      if (k > 1) plot.segment(k - 1, altHarmonic(k - 1), k, altHarmonic(k), { color: c.grid, width: 2 });
      plot.point(k, altHarmonic(k), { fill: k % 2 ? c.a : c.b, r: k === state.N ? 8 : 5 });
    }
  },
  controls: [
    { title: 'Add terms' },
    { key: 'N', label: 'Terms added', min: 1, max: 60, step: 1 },
    { readout: [
      ['Total so far', (s) => fixed(altHarmonic(s.N), 5)],
      ['ln 2', () => fixed(Math.LN2, 5)],
      ['Gap', (s) => fixed(altHarmonic(s.N) - Math.LN2, 5)],
      ['Gap is smaller than', (s) => fixed(1 / (s.N + 1), 5)],
    ] },
  ],
  tex: (s) => `S_{${s.N}}=${termsTex(s.N)}=${fixed(altHarmonic(s.N), 5)}`,
});
