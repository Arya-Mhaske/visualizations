import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { view: 'strip', x: 0.3 };
const inv = (t) => 1 / t;

function box(plot, x0, x1, h, color, width) {
  plot.segment(x0, 0, x0, h, { color, width });
  plot.segment(x1, 0, x1, h, { color, width });
  plot.segment(x0, h, x1, h, { color, width });
}

createTool({
  state,
  label: 'The thin strip under one over t from 1 to 1 plus x. It is trapped between a one by x rectangle above it and a shorter rectangle below it, and when x is small both rectangles are almost the same size. A second view graphs the natural log of one plus x against the straight line y equals x.',
  setup: (stage, c) => createPlot(stage, { x: [0.5, 2.8], y: [0, 1.2], c }),
  draw(ctx, stage, c, plot) {
    const { x } = state;
    if (state.view === 'strip') {
      plot.setRange([0.5, 2.8], [0, 1.25]);
      plot.axes({ xLabel: 't', yLabel: 'y' });
      plot.shade(inv, null, 1, 1 + x, c.fillA);
      box(plot, 1, 1 + x, 1, c.b, 3);
      box(plot, 1, 1 + x, 1 / (1 + x), c.c, 3);
      plot.fn(inv, { color: c.ink, width: 4, domain: [0.5, 2.8] });
      plot.text('x', 1 + x / 2, 1.1, { size: 12, color: c.b });
    } else {
      plot.setRange([0, 1.6], [0, 1.6]);
      plot.axes({ xLabel: 'x', yLabel: 'y' });
      plot.fn((t) => t, { color: c.b, width: 3, dash: [6, 5] });
      plot.fn((t) => Math.log(1 + t), { color: c.a, width: 4 });
      plot.segment(x, Math.log(1 + x), x, x, { color: c.ink, width: 3 });
      plot.point(x, x, { fill: c.b, r: 7 });
      plot.point(x, Math.log(1 + x), { fill: c.a, r: 8 });
    }
  },
  controls: [
    { title: 'Make the strip thinner' },
    { key: 'view', label: 'View', options: [['strip', 'The strip'], ['graph', 'The graphs']] },
    { key: 'x', label: 'x', min: 0.01, max: 1.5, step: 0.01, format: (v) => fixed(v, 2) },
    { readout: [
      ['Big rectangle, x', (s) => fixed(s.x, 4)],
      ['Strip area, ln(1+x)', (s) => ({ text: fixed(Math.log(1 + s.x), 4), good: true })],
      ['Small rectangle', (s) => fixed(s.x / (1 + s.x), 4)],
      ['Error in using x', (s) => `${fixed(((s.x - Math.log(1 + s.x)) / Math.log(1 + s.x)) * 100, 1)}%`],
    ] },
  ],
  tex: (s) => `\\dfrac{x}{1+x}<\\ln(1+x)<x\\ :\\ \\ ${fixed(s.x / (1 + s.x), 4)}<${fixed(Math.log(1 + s.x), 4)}<${fixed(s.x, 4)}`,
});
