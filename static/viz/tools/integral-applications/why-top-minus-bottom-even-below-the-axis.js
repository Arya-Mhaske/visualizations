import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from '../integrals/_ig.js';

// Shift both curves down by k. Every vertical gap, top − bottom, is unchanged, so the area is too.
const PAIRS = {
  par: { name: '4 − x² and x²', top: (x) => 4 - x * x, bot: (x) => x * x, a: -Math.SQRT2, b: Math.SQRT2 },
  exp: { name: 'eˣ and x + 0.5', top: (x) => Math.exp(x), bot: (x) => x + 0.5, a: 0, b: 1.2 },
};
const state = { k: 'par', shift: 0 };

const tool = createTool({
  state,
  label: 'Two curves and the region between them, shaded. A slider shifts both curves downwards together. The region slides below the horizontal axis, and the readouts show the area between the curves staying exactly the same while the two separate areas to the axis change.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 2], y: [-8, 6], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const P = PAIRS[state.k];
    const t = (x) => P.top(x) - state.shift;
    const b = (x) => P.bot(x) - state.shift;
    plot.setRange([P.a - 0.8, P.b + 0.8], [-9, 6]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(t, b, P.a, P.b, c.fillY);
    plot.fn(t, { color: c.a });
    plot.fn(b, { color: c.b });
    plot.segment(P.a, -20, P.a, 20, { color: c.ink, width: 1, dash: [4, 4] });
    plot.segment(P.b, -20, P.b, 20, { color: c.ink, width: 1, dash: [4, 4] });
  },
  controls: () => [
    { title: 'Move the curves' },
    { key: 'k', label: 'Curves', options: Object.entries(PAIRS).map(([k, v]) => [k, v.name]) },
    { key: 'shift', label: 'Shift both down by', min: 0, max: 6, step: 0.25, format: (v) => fixed(v, 2) },
    { readout: [
      ['∫ top dx', (s) => fixed(exact((x) => PAIRS[s.k].top(x) - s.shift, PAIRS[s.k].a, PAIRS[s.k].b), 4)],
      ['∫ bottom dx', (s) => fixed(exact((x) => PAIRS[s.k].bot(x) - s.shift, PAIRS[s.k].a, PAIRS[s.k].b), 4)],
      ['Top − bottom', (s) => fixed(exact((x) => PAIRS[s.k].top(x) - PAIRS[s.k].bot(x), PAIRS[s.k].a, PAIRS[s.k].b), 4)],
    ] },
  ],
  tex: (s) => `A=\\int_a^b\\left[(f-k)-(g-k)\\right]dx=\\int_a^b(f-g)\\,dx=${fixed(exact((x) => PAIRS[s.k].top(x) - PAIRS[s.k].bot(x), PAIRS[s.k].a, PAIRS[s.k].b), 4)}`,
});

tool.update();
