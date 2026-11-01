import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed, sig } from '../../lib/format.js';
import { asymptoteGap } from './_conics-math.js';
import { curve, trace } from './_conics-view.js';

const state = { a: 2, b: 1.5, zoom: 1 };
const half = (s = state) => 6 * s.zoom;

createTool({
  state,
  label: 'A hyperbola with its two diagonal asymptote lines. Zoom out and the view covers a much larger region. Far from the centre the 1 in x squared over a squared minus y squared over b squared equals 1 is tiny compared with the other terms, so the curve is almost indistinguishable from the lines.',
  setup: (stage, c) => createPlot(stage, { x: [-6, 6], y: [-6, 6], c, pad: 16 }),
  draw(ctx, stage, c, plot) {
    const H = half();
    plot.setRange([-H, H], [-H, H]);
    plot.axes({ xLabel: '', yLabel: '', grid: false });
    const slope = state.b / state.a;
    plot.segment(-H, -slope * H, H, slope * H, { color: c.b, width: 3, dash: [6, 5] });
    plot.segment(-H, slope * H, H, -slope * H, { color: c.b, width: 3, dash: [6, 5] });
    [-1, 1].forEach((side) => curve(plot, trace((t) => [side * state.a * Math.cosh(t), state.b * Math.sinh(t)], -6, 6, 400), { color: c.a, width: 4 }));
  },
  controls: [
    { title: 'Zoom out' },
    { key: 'zoom', label: 'Zoom out by', min: 1, max: 40, step: 1, format: (n) => `×${n}` },
    { key: 'a', label: 'a', min: 1, max: 4, step: 0.5 },
    { key: 'b', label: 'b', min: 1, max: 4, step: 0.5 },
    { readout: [
      ['Window half-width', (s) => sig(half(s), 3)],
      ['Gap, curve to line, at the edge', (s) => sig(asymptoteGap(s.a, s.b, half(s) * 0.98 < s.a ? s.a : half(s) * 0.98), 3)],
      ['The "1" as a share of x²/a²', (s) => `${sig((100 * s.a * s.a) / (half(s) * half(s)), 2)}%`],
    ] },
  ],
  tex: (s) => `\\dfrac{x^2}{a^2}-\\dfrac{y^2}{b^2}=1\\ \\text{; when }\\dfrac{x^2}{a^2}\\text{ is huge, the 1 is lost: }\\ y\\approx\\pm\\dfrac ba x=\\pm${fixed(s.b / s.a, 2)}x`,
});
