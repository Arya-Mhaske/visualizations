import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { logb } from './_exp-log-math.js';

const state = { b: 2, x0: 1.5, mirror: true };

createTool({
  state,
  label: 'The graph of b to the x in coral and the graph of log base b of x in blue on equal axes, with the diagonal line y equals x between them. A point on one curve and its reflection across the diagonal, with swapped coordinates, lies on the other.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 9], y: [-3, 9], c }),
  draw(ctx, stage, c, plot) {
    const { b, x0 } = state;
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    if (state.mirror) plot.segment(-3, -3, 9, 9, { color: c.ink, width: 2, dash: [8, 5] });
    plot.fn((x) => b ** x, { color: c.a, width: 4 });
    plot.fn((x) => (x <= 0 ? NaN : logb(b, x)), { color: c.b, width: 4, domain: [0.001, 9] });
    const y0 = b ** x0;
    if (state.mirror) plot.segment(x0, y0, y0, x0, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(x0, y0, { fill: c.a, r: 8 });
    plot.point(y0, x0, { fill: c.b, r: 8 });
  },
  controls: [
    { title: 'Reflect a point' },
    { key: 'b', label: 'Base b', min: 1.25, max: 3, step: 0.25, format: (v) => fixed(v, 2) },
    { key: 'x0', label: 'Point on bˣ at x =', min: -2, max: 2, step: 0.25 },
    { key: 'mirror', label: 'Show the mirror line y = x', toggle: true },
    { readout: [
      ['Point on bˣ', (s) => `(${fixed(s.x0, 2)}, ${fixed(s.b ** s.x0, 2)})`],
      ['Swapped point', (s) => `(${fixed(s.b ** s.x0, 2)}, ${fixed(s.x0, 2)})`],
      ['log_b of that x', (s) => fixed(logb(s.b, s.b ** s.x0), 2)],
    ] },
  ],
  tex: (s) => `${fixed(s.b, 2)}^{${fixed(s.x0, 2)}}=${fixed(s.b ** s.x0, 2)}\\iff \\log_{${fixed(s.b, 2)}}${fixed(s.b ** s.x0, 2)}=${fixed(s.x0, 2)}`,
});
