import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { poly } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

const state = { a: 4, b: 2 };
const N = 360;
const unit = Array.from({ length: N }, (_, i) => [Math.cos((2 * Math.PI * i) / N), Math.sin((2 * Math.PI * i) / N)]);
const shoelace = (pts) => Math.abs(pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const ell = (s = state) => unit.map(([x, y]) => [s.a * x, s.b * y]);

createTool({
  state,
  label: 'The unit circle in grey, which has area pi, stretched sideways by a and up by b into an ellipse in coral. Stretching by a horizontally multiplies every area by a, and stretching by b vertically multiplies it by b, so the ellipse has area pi times a times b. The area of the stretched shape, worked out from its 360 corners, is shown next to pi a b.',
  setup: (stage, c) => createPlot(stage, { x: [-7, 7], y: [-7, 7], c, pad: 14 }),
  draw(ctx, stage, c, plot) {
    plot.setRange([-7, 7], [-7, 7]);
    plot.axes({ xLabel: '', yLabel: '' });
    poly(ctx, ell().map((p) => plot.toPx(...p)), { fill: c.fillA, stroke: c.ink, width: 3 });
    poly(ctx, unit.map((p) => plot.toPx(...p)), { fill: c.fillB, stroke: c.ink, width: 2 });
  },
  controls: [
    { title: 'Stretch the circle' },
    { key: 'a', label: 'Horizontal stretch, a', min: 0.5, max: 6, step: 0.5 },
    { key: 'b', label: 'Vertical stretch, b', min: 0.5, max: 6, step: 0.5 },
    { readout: [
      ['Area of the unit circle', () => fixed(Math.PI, 4)],
      ['Area of the ellipse', (s) => fixed(shoelace(ell(s)), 3)],
      ['π · a · b', (s) => ({ text: fixed(Math.PI * s.a * s.b, 3), good: true })],
    ] },
  ],
  tex: (s) => `\\pi\\cdot ${s.a}\\cdot ${s.b}=${fixed(Math.PI * s.a * s.b, 3)}\\ \\ (\\text{area}=\\pi ab)`,
});
