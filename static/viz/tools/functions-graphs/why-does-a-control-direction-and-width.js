import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 2 };
const wide = (a) => (Math.abs(a) < 1 ? 'wider than y = x²' : Math.abs(a) === 1 ? 'same width as y = x²' : 'narrower than y = x²');

createTool({
  state,
  label: 'The graph of y equals a x squared compared with y equals x squared in grey. A positive a opens the parabola upward and a negative a opens it downward. A big a makes it narrow, because the height rises quickly, and a small a makes it wide. For a equal to 1 it matches the grey graph.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-8, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => x * x, { color: c.grid, width: 3 });
    plot.fn((x) => state.a * x * x, { color: c.a, width: 4 });
    plot.point(1, state.a, { fill: c.fillY, r: 8 });
    plot.point(2, 4 * state.a, { fill: c.fillY, r: 6 });
  },
  controls: [
    { title: 'Slide a' },
    { key: 'a', label: 'a', min: -4, max: 4, step: 0.25, format: (v) => fixed(v, 2) },
    { readout: [
      ['Opens', (s) => (s.a > 0 ? 'upward' : s.a < 0 ? 'downward' : 'flat line')],
      ['Width', (s) => (s.a === 0 ? '—' : wide(s.a))],
      ['Height at x = 1', (s) => fixed(s.a, 2)],
    ] },
  ],
  tex: (s) => `y=${fixed(s.a, 2)}x^2`,
});
