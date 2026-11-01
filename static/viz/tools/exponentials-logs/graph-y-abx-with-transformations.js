import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 1, b: 2, h: 0, k: 0 };
const f = (s, x) => s.a * s.b ** (x - s.h) + s.k;
const signed = (v) => (v < 0 ? `-${fixed(-v, 2)}` : `+${fixed(v, 2)}`);

createTool({
  state,
  label: 'The graph of y equals a times b to the power of x minus h, plus k. A dashed grey curve is the plain graph of b to the x. Sliders stretch, reflect and shift it. A dashed horizontal line marks the asymptote y equals k and a dot marks the y-intercept.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-8, 8], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => state.b ** x, { color: c.grid, width: 3, dash: [6, 5] });
    plot.segment(-6, state.k, 6, state.k, { color: c.ink, width: 2, dash: [8, 5] });
    plot.fn((x) => f(state, x), { color: c.a, width: 4 });
    plot.point(0, f(state, 0), { fill: c.fillY, r: 7 });
    plot.text(`y = ${fixed(state.k, 1)}`, 5, state.k + 0.8, { size: 11, align: 'right', patch: false });
  },
  controls: [
    { title: 'Change the pieces' },
    { key: 'a', label: 'Stretch a (negative flips)', min: -3, max: 3, step: 0.5 },
    { key: 'b', label: 'Base b', min: 0.25, max: 4, step: 0.25, format: (v) => fixed(v, 2) },
    { key: 'h', label: 'Shift right h', min: -4, max: 4, step: 1 },
    { key: 'k', label: 'Shift up k', min: -5, max: 5, step: 1 },
    { readout: [
      ['Asymptote', (s) => `y = ${fixed(s.k, 0)}`],
      ['y-intercept', (s) => fixed(f(s, 0), 2)],
      ['Shape', (s) => (s.a === 0 ? 'flat line' : (s.b === 1 ? 'flat line' : (s.a > 0) === (s.b > 1) ? 'rises to the right' : 'falls to the right'))],
    ] },
  ],
  tex: (s) => `y=${fixed(s.a, 1)}\\cdot ${fixed(s.b, 2)}^{\\,x${s.h < 0 ? `+${-s.h}` : `-${s.h}`}}${signed(s.k)}`,
});
