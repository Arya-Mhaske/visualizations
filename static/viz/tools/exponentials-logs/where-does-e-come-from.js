import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { compound } from './_exp-log-math.js';

const state = { view: 'bars', r: 1, lg: 3 };
const nOf = (s) => Math.round(10 ** s.lg);
const FIXED_N = [1, 2, 4, 12, 365];
const percent = (v) => `${Math.round(v * 100)}%`;

createTool({
  state,
  label: 'One rupee earns interest for a year, with the year split into n equal compounding steps. In the bar view each bar is the year-end amount for a different n, and the last bar is the limit e to the r. In the curve view the amount is drawn against n on a log axis and flattens out at e to the r.',
  setup: (stage, c) => createPlot(stage, { x: [0, 7], y: [-0.4, 3], c }),
  draw(ctx, stage, c, plot) {
    const top = Math.exp(state.r) * 1.12;
    const n = nOf(state);
    if (state.view === 'bars') {
      plot.setRange([0, 7], [-top * 0.14, top]);
      plot.segment(0, 0, 7, 0, { color: c.ink, width: 3 });
      const bars = [...FIXED_N.map((k) => [k, `${k}`]), [n, `${n}`], [Infinity, '∞']];
      bars.forEach(([k, name], i) => {
        const h = k === Infinity ? Math.exp(state.r) : compound(state.r, k);
        const mine = i === 5;
        plot.shade(() => h, null, i + 0.15, i + 0.85, k === Infinity ? c.fillC : mine ? c.fillY : c.fillB);
        plot.segment(i + 0.15, 0, i + 0.15, h, { color: c.ink, width: 3 });
        plot.segment(i + 0.85, 0, i + 0.85, h, { color: c.ink, width: 3 });
        plot.segment(i + 0.15, h, i + 0.85, h, { color: c.ink, width: 3 });
        plot.text(fixed(h, 4), i + 0.5, h + top * 0.05, { size: 9, patch: false });
        plot.text(name, i + 0.5, -top * 0.07, { size: 10, patch: false });
      });
    } else {
      plot.setRange([0, 6], [1, top]);
      plot.axes({ xLabel: 'log₁₀ n', yLabel: 'amount' });
      plot.segment(0, Math.exp(state.r), 6, Math.exp(state.r), { color: c.c, width: 3, dash: [8, 5] });
      plot.fn((x) => compound(state.r, 10 ** x), { color: c.a, width: 4 });
      plot.point(state.lg, compound(state.r, n), { fill: c.fillY, r: 8 });
      plot.text('e^r', 5.6, Math.exp(state.r) + top * 0.04, { color: c.c, patch: false });
    }
  },
  controls: [
    { title: 'Split the year' },
    { key: 'view', label: 'Show', options: [['bars', 'Bars for each n'], ['limit', 'Curve of n']] },
    { key: 'r', label: 'Yearly rate r', min: 0.2, max: 1.5, step: 0.1, format: percent },
    { key: 'lg', label: 'Your n (log scale)', min: 0, max: 6, step: 0.1, format: (v) => `n = ${Math.round(10 ** v)}` },
    { readout: [
      ['Amount at your n', (s) => fixed(compound(s.r, nOf(s)), 5)],
      ['Gain from doubling n', (s) => fixed(compound(s.r, 2 * nOf(s)) - compound(s.r, nOf(s)), 6)],
      ['Limit, e^r', (s) => fixed(Math.exp(s.r), 5)],
    ] },
  ],
  tex: (s) => `\\left(1+\\frac{${fixed(s.r, 1)}}{${nOf(s)}}\\right)^{${nOf(s)}}=${fixed(compound(s.r, nOf(s)), 5)}\\ \\to\\ e^{${fixed(s.r, 1)}}=${fixed(Math.exp(s.r), 5)}`,
});
