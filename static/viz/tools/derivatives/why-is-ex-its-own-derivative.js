import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { b: 2 };
let tool;
const slope0 = (b) => Math.log(b); // the slope of b^x at x = 0

tool = createTool({
  state,
  label: 'The graph of b to the power x for a base b that you choose, with its tangent line at x equal to 0. The slope of that tangent depends on b. The dashed line has slope exactly 1. For b equal to 2 the tangent is too flat, for b equal to 3 it is too steep, and for one special base in between, called e, it matches the dashed line. For that base the slope at every point equals the height of the curve.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 3], y: [-1, 8], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    plot.axes();
    plot.fn((x) => state.b ** x, { color: c.a, width: 4 });
    const m = slope0(state.b);
    plot.segment(-3, 1 - 3 * m, 3, 1 + 3 * m, { color: c.c, width: 3 });
    plot.segment(-3, -2, 3, 4, { color: c.grid, width: 2, dash: [6, 5] });
    plot.point(0, 1, { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Try a base' },
    { key: 'b', label: 'Base, b', min: 1.5, max: 4, step: 0.05, format: (v) => v.toFixed(2) },
    { button: 'b = e', onClick: () => { state.b = Math.E; tool.update(); } },
    { readout: [
      ['Slope at x = 0', (s) => fixed(slope0(s.b), 4)],
      ['Compared with 1', (s) => ({ text: Math.abs(slope0(s.b) - 1) < 0.01 ? 'equal' : slope0(s.b) < 1 ? 'too flat' : 'too steep', good: Math.abs(slope0(s.b) - 1) < 0.01 })],
      ['Slope ÷ height, at any x', (s) => fixed(slope0(s.b), 4)],
    ] },
  ],
  tex: (s) => `\\dfrac{d}{dx}${fixed(s.b, 2)}^x\\Big|_{x=0}=\\ln ${fixed(s.b, 2)}=${fixed(slope0(s.b), 4)}${Math.abs(slope0(s.b) - 1) < 0.01 ? '\\approx1:\\ b\\approx e' : ''}`,
});
