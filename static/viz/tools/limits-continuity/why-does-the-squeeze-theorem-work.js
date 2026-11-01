import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { curve, trace } from '../conics-curves/_conics-view.js';

const state = { k: 0 };
const w = (s = state) => 1 / 3 ** s.k;
const g = (x) => x * x * Math.sin(1 / x);

createTool({
  state,
  label: 'Three graphs near 0: x squared times sine of one over x in coral, trapped between x squared above and minus x squared below. Sine of one over x has no limit, but the factor x squared forces the coral graph between two curves that both go to 0, so it is squeezed to 0 too. Zooming in keeps the coral graph inside its two walls.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 1], y: [-1, 1], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const W = w();
    plot.setRange([-W, W], [-1.2 * W * W, 1.2 * W * W]);
    plot.axes({ grid: false });
    plot.fn((x) => x * x, { color: c.b, width: 3 });
    plot.fn((x) => -x * x, { color: c.b, width: 3 });
    const pts = (a, b) => trace((x) => (x === 0 ? null : [x, g(x)]), a, b, 3000);
    curve(plot, pts(W * 1e-5, W), { color: c.a, width: 2 });
    curve(plot, pts(-W, -W * 1e-5), { color: c.a, width: 2 });
  },
  controls: [
    { title: 'Zoom in on 0' },
    { key: 'k', label: 'Zoom', min: 0, max: 5, step: 1, format: (v) => `x within ${fixed(1 / 3 ** v, 4)}` },
    { readout: [
      ['Walls at the edge', (s) => `±${fixed(w(s) ** 2, 6)}`],
      ['Largest |f| possible', (s) => fixed(w(s) ** 2, 6)],
      ['Limit of the middle', () => ({ text: '0', good: true })],
    ] },
  ],
  tex: () => '-x^2\\le x^2\\sin\\dfrac1x\\le x^2,\\ \\ \\lim_{x\\to0}(\\pm x^2)=0\\ \\Rightarrow\\ \\lim_{x\\to0}x^2\\sin\\dfrac1x=0',
});
