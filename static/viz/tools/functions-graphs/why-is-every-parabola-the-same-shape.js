import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 3, match: false };

createTool({
  state,
  label: 'The graph of y equals a x squared drawn in two ways. With the switch off, the axes keep the same scale and the parabola looks narrow or wide as a changes. With the switch on, the vertical axis is measured in units of a, so a graph of y over a against x is shown, and it is exactly the graph of y equals x squared for every a. All parabolas are the same shape, just stretched.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-2, 12], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ yLabel: state.match ? 'y ÷ a' : 'y' });
    plot.fn((x) => x * x, { color: c.grid, width: 3 });
    plot.fn((x) => (state.match ? x * x : state.a * x * x), { color: c.a, width: 4, dash: state.match ? [7, 5] : [] });
    plot.point(2, state.match ? 4 : 4 * state.a, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Compare shapes' },
    { key: 'a', label: 'a', min: 0.25, max: 6, step: 0.25 },
    { key: 'match', label: 'Measure y in units of a', toggle: true },
    { readout: [
      ['Point at x = 2', (s) => (s.match ? `y ÷ a = 4` : `y = ${fixed(4 * s.a, 2)}`)],
      ['Looks like y = x²?', (s) => ({ text: s.match || s.a === 1 ? 'yes: identical' : 'no, a different width', good: s.match || s.a === 1 })],
    ] },
  ],
  tex: (s) => (s.match ? `\\dfrac ya=x^2` : `y=${fixed(s.a, 2)}x^2`),
});
