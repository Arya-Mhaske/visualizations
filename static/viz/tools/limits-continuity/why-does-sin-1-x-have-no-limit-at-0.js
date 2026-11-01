import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { curve, trace } from '../conics-curves/_conics-view.js';

const state = { k: 0 };
const w = (s = state) => 1 / 4 ** s.k;
// zeros of sin(1/x) are at x = 1/(nπ); count those between w/10 and w
const zeros = (s = state) => Math.floor(10 / (Math.PI * w(s))) - Math.floor(1 / (Math.PI * w(s)));

createTool({
  state,
  label: 'The graph of sine of one over x on a window that you can shrink towards x equal to 0. However far you zoom in, the graph still swings all the way between minus 1 and 1, and it does so faster and faster. It never settles on one value, so there is no limit at 0.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [-1.5, 1.5], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const W = w();
    plot.setRange([-W, W], [-1.5, 1.5]);
    plot.axes();
    const pos = trace((x) => (x === 0 ? null : [x, Math.sin(1 / x)]), W * 1e-5, W, 4000);
    const neg = trace((x) => (x === 0 ? null : [x, Math.sin(1 / x)]), -W, -W * 1e-5, 4000);
    curve(plot, pos, { color: c.a, width: 2 });
    curve(plot, neg, { color: c.a, width: 2 });
    plot.segment(-W, 1, W, 1, { color: c.grid, width: 1, dash: [4, 4] });
    plot.segment(-W, -1, W, -1, { color: c.grid, width: 1, dash: [4, 4] });
  },
  controls: [
    { title: 'Zoom in towards 0' },
    { key: 'k', label: 'Zoom', min: 0, max: 6, step: 1, format: (v) => `x from −${fixed(1 / 4 ** v, 5)} to ${fixed(1 / 4 ** v, 5)}` },
    { readout: [
      ['Highest and lowest values', () => '1 and −1'],
      ['Crossings of the axis between a tenth of the window and its edge', (s) => `${zeros(s)}`],
    ] },
  ],
  tex: () => '\\sin\\dfrac1x=\\pm1\\ \\text{at}\\ x=\\dfrac{1}{(2n+\\tfrac12)\\pi}\\ \\text{for every}\\ n\\ \\Rightarrow\\ \\text{no limit}',
});
