import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// cos²x = sin²(x + π/2) is sin² shifted, and sin² + cos² = 1. Over a whole number of half-turns the two have equal area, so each averages ½.
const s2 = (x) => Math.sin(x) ** 2;
const c2 = (x) => Math.cos(x) ** 2;
const state = { L: 6.28, shift: 1 };

const tool = createTool({
  state,
  label: 'A graph of sine squared in blue stacked under cosine squared in green, so the two always reach a height of exactly 1 together. A dashed line at one half is the average. Sine squared is a wave between 0 and 1 that sits centred on one half.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6.6], y: [0, 1.25], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x (rad)', yLabel: 'y' });
    plot.shade(s2, null, 0, state.L, c.fillB);
    if (state.shift) plot.shade(() => 1, s2, 0, state.L, c.fillC);
    plot.fn(s2, { color: c.b });
    plot.fn(c2, { color: c.c, dash: [6, 4], width: 2 });
    plot.segment(0, 0.5, 6.6, 0.5, { color: c.ink, width: 2, dash: [5, 4] });
    plot.segment(state.L, 0, state.L, 1.25, { color: c.ink, width: 2 });
  },
  controls: () => [
    { title: 'Average over a stretch' },
    { key: 'L', label: 'Average from 0 to L', min: 0.5, max: 6.5, step: 0.01, format: (v) => `${fixed(v, 2)} rad` },
    { key: 'shift', label: 'Stack cos² on top', toggle: true },
    { readout: [
      ['Area of sin²', (s) => fixed(exact(s2, 0, s.L), 4)],
      ['Average of sin²', (s) => fixed(exact(s2, 0, s.L) / s.L, 4)],
      ['Average of cos²', (s) => fixed(exact(c2, 0, s.L) / s.L, 4)],
      ['Sum of the averages', (s) => fixed((exact(s2, 0, s.L) + exact(c2, 0, s.L)) / s.L, 4)],
    ] },
  ],
  tex: (s) => `\\overline{\\sin^2x}=\\dfrac{1}{L}\\int_0^{L}\\sin^2x\\,dx=${fixed(exact(s2, 0, s.L) / s.L, 3)}\\ \\to\\ \\dfrac12`,
});

tool.update();
