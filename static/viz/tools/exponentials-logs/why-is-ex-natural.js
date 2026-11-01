import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { b: 2, x0: 1 };
const height = (s) => s.b ** s.x0;
const slope = (s) => height(s) * Math.log(s.b);
const ratio = (s) => slope(s) / height(s);
const isE = (s) => Math.abs(ratio(s) - 1) < 0.004;

createTool({
  state,
  label: 'The graph of b to the power x with a tangent line at a point you choose. Slope and height are read out together, and their ratio is the same everywhere on the curve. It equals 1 only for the special base e.',
  setup: (stage, c) => createPlot(stage, { x: [-2, 3], y: [-1, 12], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn((x) => state.b ** x, { color: c.a, width: 4 });
    const h = height(state);
    const m = slope(state);
    plot.fn((x) => h + m * (x - state.x0), { color: c.b, width: 3 });
    plot.segment(state.x0, 0, state.x0, h, { color: c.ink, width: 2, dash: [4, 4] });
    plot.point(state.x0, h, { fill: c.fillY, r: 8 });
  },
  controls: (tool) => [
    { title: 'Compare slope with height' },
    { key: 'b', label: 'Base b', min: 1.2, max: 4, step: 0.01, format: (v) => fixed(v, 3) },
    { key: 'x0', label: 'Point at x =', min: -1.5, max: 2.5, step: 0.1 },
    { button: 'Set b = e', onClick: () => { state.b = Math.E; tool.update(); } },
    { readout: [
      ['Height, bˣ', (s) => fixed(height(s), 3)],
      ['Slope', (s) => fixed(slope(s), 3)],
      ['Slope ÷ height', (s) => ({ text: fixed(ratio(s), 3), good: isE(s) })],
    ] },
  ],
  tex: (s) => `\\dfrac{\\text{slope}}{\\text{height}}=\\dfrac{${fixed(slope(s), 3)}}{${fixed(height(s), 3)}}=${fixed(ratio(s), 3)}=\\ln ${fixed(s.b, 3)}`,
});
