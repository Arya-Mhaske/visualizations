import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { dot } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';
import { holeF } from './_rational-math.js';

const state = { a: 1, x: 0 };
const val = (v) => (Number.isFinite(v) ? fixed(v, 3) : 'undefined');

createTool({
  state,
  label: 'A straight line with an open circle on it marking a hole at x equals a. A dashed line shows the simplified version, which has no hole.',
  setup: (stage, c) => createPlot(stage, { x: [-5, 5], y: [-8, 8], c }),
  draw(ctx, stage, c, plot) {
    const a = state.a;
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => x + a, { color: c.a, dash: [7, 5] });
    plot.fn(holeF(a), { color: c.b });
    const [px, py] = plot.toPx(a, 2 * a);
    dot(ctx, px, py, 7, c.paper, c.ink);
    const y = holeF(a)(state.x);
    if (Number.isFinite(y)) plot.point(state.x, y, { fill: c.b, r: 5 });
  },
  controls: [
    { title: 'Find the hole' },
    { key: 'a', label: 'a', min: -3, max: 3, step: 1 },
    { key: 'x', label: 'Probe x', min: -4, max: 4, step: 0.5 },
    { readout: [
      ['Original at x', (s) => val(holeF(s.a)(s.x))],
      ['Simplified x + a', (s) => val(s.x + s.a)],
      ['Hole at', (s) => `(${s.a}, ${2 * s.a})`],
    ] },
  ],
  tex: (s) => `\\dfrac{x^2-${s.a}^2}{x-${s.a}}=x+${s.a}\\quad(x\\neq ${s.a})`,
});
