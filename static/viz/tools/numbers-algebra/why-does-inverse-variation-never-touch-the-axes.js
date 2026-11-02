import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { k: 4, x: 2 };

createTool({
  state,
  label: 'The graph of y = k over x in the first quadrant. A shaded rectangle runs from the origin to the point (x, y). Its area is always k, so as x grows the rectangle gets low and wide, and as x shrinks it gets tall and thin, but never flat.',
  setup: (stage, c) => createPlot(stage, { c, x: [0, 10], y: [0, 10] }),
  draw(ctx, stage, c, plot) {
    const y = state.k / state.x;
    const top = Math.max(10, Math.ceil(y * 1.2));
    plot.setRange([0, 10], [0, top]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(() => y, null, 0, state.x, c.fillY);
    plot.fn((x) => state.k / x, { color: c.a, domain: [state.k / top, 10] });
    plot.segment(state.x, 0, state.x, y, { width: 2, dash: [4, 4] });
    plot.segment(0, y, state.x, y, { width: 2, dash: [4, 4] });
    plot.point(state.x, y, { fill: c.a });
    plot.text(`area = ${fixed(state.k, 0)}`, state.x / 2, y / 2, { color: c.ink, size: 12 });
  },
  controls: [
    { title: 'Hold x · y = k' },
    { key: 'x', label: 'x', min: 0.1, max: 10, step: 0.1, format: (v) => fixed(v, 1) },
    { key: 'k', label: 'Constant k', min: 1, max: 8, step: 1 },
    { readout: [
      ['x', (s) => fixed(s.x, 1)],
      ['y = k ÷ x', (s) => fixed(s.k / s.x, 2)],
      ['x · y', (s) => fixed(s.x * (s.k / s.x), 2)],
      ['Is y = 0?', () => ({ text: 'never: 0 ≠ k', good: true })],
    ] },
  ],
  tex: (s) => `xy=${fixed(s.x, 1)}\\times ${fixed(s.k / s.x, 2)}=${fixed(s.k, 0)}`,
});
