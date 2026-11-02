import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from '../integrals/_ig.js';

// Upper half of an ellipse: y = (b/a)√(a² − x²). Area between x = c and x = a (a cap), doubled for both halves.
// The whole ellipse is πab: the circle's πa² with every height scaled by b/a.
const state = { a: 3, b: 2, cut: 0.5 };
const y = (s) => (x) => (s.b / s.a) * Math.sqrt(Math.max(s.a * s.a - x * x, 0));
const capArea = (s, x) => {
  const th = Math.asin(Math.min(1, x / s.a));
  return s.a * s.b * (Math.PI / 2 - th - Math.sin(th) * Math.cos(th));
};

const tool = createTool({
  state,
  label: 'An ellipse drawn as two halves with semi-axes a and b. The part to the right of a vertical cut line is shaded as a cap. Readouts compare the area found by slices with the exact formulas, and show that squashing a circle of the same width by the factor b over a scales its area by the same factor.',
  setup: (stage, c) => createPlot(stage, { x: [-4, 4], y: [-3, 3], c, pad: 26 }),
  draw(ctx, stage, c, plot) {
    const f = y(state);
    const cx = state.cut * state.a;
    plot.setRange([-4, 4], [-3.4, 3.4]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.shade(f, (x) => -f(x), cx, state.a, c.fillY);
    plot.fn(f, { color: c.a, domain: [-state.a, state.a] });
    plot.fn((x) => -f(x), { color: c.a, domain: [-state.a, state.a] });
    plot.fn((x) => Math.sqrt(Math.max(state.a * state.a - x * x, 0)), { color: c.grid, width: 1, dash: [4, 4], domain: [-state.a, state.a] });
    plot.segment(cx, -4, cx, 4, { color: c.ink, width: 2, dash: [5, 4] });
  },
  controls: () => [
    { title: 'Shape the ellipse' },
    { key: 'a', label: 'Semi-axis a (across)', min: 1, max: 4, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'b', label: 'Semi-axis b (up)', min: 0.5, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'cut', label: 'Cut at x = a ×', min: -0.9, max: 0.95, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['Whole ellipse by slices', (s) => fixed(2 * exact(y(s), -s.a, s.a), 4)],
      ['π a b', (s) => fixed(Math.PI * s.a * s.b, 4)],
      ['Cap by slices', (s) => fixed(2 * exact(y(s), s.cut * s.a, s.a), 4)],
      ['Cap by formula', (s) => fixed(capArea(s, s.cut * s.a), 4)],
      ['Circle of radius a', (s) => fixed(Math.PI * s.a * s.a, 4)],
    ] },
  ],
  tex: (s) => `A=4\\int_0^a\\dfrac{b}{a}\\sqrt{a^2-x^2}\\,dx=\\dfrac{b}{a}\\cdot\\pi a^2=\\pi ab=${fixed(Math.PI * s.a * s.b, 3)}`,
});

tool.update();
