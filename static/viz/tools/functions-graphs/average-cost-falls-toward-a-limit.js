import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// Made-up costs: a fixed set-up cost F and a variable cost v for each item.
const state = { F: 5000, v: 40, n: 100 };
const avg = (s, n) => (s.F + s.v * n) / n;

createTool({
  state,
  label: 'The average cost per item when a fixed set-up cost is shared among n items and each item also costs v to make. The graph of average cost against n starts very high for small runs and falls towards the line at height v but never reaches it, because the fixed cost, however small its share, is never zero. A marker shows your chosen number of items.',
  setup: (stage, c) => createPlot(stage, { x: [0, 500], y: [0, 400], c, pad: 22 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 500], [0, Math.max(state.v * 4, 100)]);
    plot.axes({ xLabel: 'items n', yLabel: '₹ per item' });
    plot.segment(0, state.v, 500, state.v, { color: c.b, width: 3, dash: [6, 5] });
    plot.fn((n) => avg(state, n), { color: c.a, width: 4, domain: [5, 500] });
    plot.segment(state.n, 0, state.n, avg(state, state.n), { color: c.grid, width: 2, dash: [4, 4] });
    plot.point(state.n, avg(state, state.n), { fill: c.fillY, r: 9 });
  },
  controls: [
    { title: 'Make a batch' },
    { key: 'n', label: 'Items made, n', min: 10, max: 500, step: 10 },
    { key: 'F', label: 'Fixed cost, F', min: 1000, max: 10000, step: 500, format: (v) => `₹${v}` },
    { key: 'v', label: 'Cost per item, v', min: 10, max: 100, step: 5, format: (v) => `₹${v}` },
    { readout: [
      ['Average cost', (s) => `₹${fixed(avg(s, s.n), 2)}`],
      ['Above the limit by', (s) => `₹${fixed(avg(s, s.n) - s.v, 2)}`],
      ['Limit as n grows', (s) => ({ text: `₹${s.v}`, good: true })],
    ] },
  ],
  tex: (s) => `A(n)=\\dfrac{${s.F}+${s.v}n}{n}=${s.v}+\\dfrac{${s.F}}{n}\\to ${s.v}`,
});
