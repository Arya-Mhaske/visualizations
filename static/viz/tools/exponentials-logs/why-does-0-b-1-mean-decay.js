import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { b: 0.5, x0: 2, mirror: true };

createTool({
  state,
  label: 'The graph of b to the power x for a base you choose, and its mirror image in the y-axis, which is the graph of one over b to the power x. A pair of points joined by a dashed line shows each point reflecting to the other side of the y-axis at the same height.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-0.5, 8], c }),
  draw(ctx, stage, c, plot) {
    const { b, x0 } = state;
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.segment(1, -0.5, 1, 8, { color: c.grid, width: 1 });
    if (state.mirror) plot.fn((x) => (1 / b) ** x, { color: c.b, width: 4, dash: [8, 5] });
    plot.fn((x) => b ** x, { color: c.a, width: 4 });
    plot.point(0, 1, { fill: c.fillY, r: 7 });
    if (state.mirror) {
      plot.segment(-x0, b ** x0, x0, b ** x0, { color: c.ink, width: 2, dash: [4, 4] });
      plot.point(-x0, b ** x0, { fill: c.b, r: 8 });
    }
    plot.point(x0, b ** x0, { fill: c.a, r: 8 });
  },
  controls: [
    { title: 'Pick a base' },
    { key: 'b', label: 'Base b', min: 0.2, max: 3, step: 0.05, format: (v) => fixed(v, 2) },
    { key: 'x0', label: 'Point at x =', min: -3, max: 3, step: 0.25 },
    { key: 'mirror', label: 'Show the mirror graph, (1/b)ˣ', toggle: true },
    { readout: [
      ['Each step right', (s) => `×${fixed(s.b, 2)}`],
      ['Behaviour', (s) => (s.b < 1 ? { text: 'decay', good: false } : s.b > 1 ? { text: 'growth', good: true } : { text: 'constant', good: true })],
      ['b^x at the point', (s) => fixed(s.b ** s.x0, 3)],
    ] },
  ],
  tex: (s) => `\\left(\\tfrac1{${fixed(s.b, 2)}}\\right)^{x}=${fixed(1 / s.b, 2)}^{x}=${fixed(s.b, 2)}^{-x}`,
});
