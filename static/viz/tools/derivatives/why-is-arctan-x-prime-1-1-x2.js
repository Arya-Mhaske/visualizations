import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { arc } from '../../lib/draw.js';
import { fixed } from '../../lib/format.js';

// Triangle with adjacent 1 and opposite x, so tan θ = x and θ = arctan x. Raise x by dx: the point moves straight up
// by dx along the line "adjacent = 1". Only the part of that step across the radius turns the angle: dx cos θ = r dθ.
const state = { x: 1, dx: 0.4 };
const r = (x) => Math.hypot(1, x);

createTool({
  state,
  label: 'A right triangle with the horizontal side 1 and the vertical side x, so tan theta equals x. Raising x by a small amount dx moves the top corner straight up. Only the part of the step across the hypotenuse turns the angle, which is dx times cos theta, and the arc length is r times d theta. So d theta over dx is cos theta over r, which is one over one plus x squared.',
  setup: (stage, c) => createPlot(stage, { x: [-1, 5], y: [-1, 5], c, pad: 18 }),
  draw(ctx, stage, c, plot) {
    const { x, dx } = state;
    const theta = Math.atan(x);
    const [ox, oy] = plot.toPx(0, 0);
    const unit = plot.toPx(1, 0)[0] - ox;
    plot.axes();
    plot.shade(() => 0, (t) => x * t, 0, 1, c.fillB);
    plot.segment(0, 0, 1, 0, { color: c.ink, width: 3 });
    plot.segment(1, 0, 1, x, { color: c.ink, width: 3 });
    plot.segment(0, 0, 1, x, { color: c.a, width: 4 });
    plot.segment(0, 0, 1, x + dx, { color: c.grid, width: 3, dash: [5, 4] });
    plot.segment(1, x, 1, x + dx, { color: c.d, width: 6 });
    arc(ctx, ox, oy, r(x) * unit, -Math.atan(x + dx), -theta, { color: c.c, width: 6 });
    arc(ctx, ox, oy, 0.35 * unit, -theta, 0, { color: c.ink, width: 3 });
    plot.point(1, x, { fill: c.fillY });
    plot.text('1', 0.5, -0.35, { size: 12, patch: false });
    plot.text('x', 1.25, x / 2, { size: 12, patch: false });
    plot.text('θ', 0.55, 0.12 + x * 0.06, { size: 12, patch: false });
    plot.text('dx', 1.35, x + dx / 2, { size: 11, color: c.d, patch: false });
  },
  controls: [
    { title: 'Raise the top corner' },
    { key: 'x', label: 'x = tan θ', min: 0.2, max: 4, step: 0.05, format: (n) => fixed(n, 2) },
    { key: 'dx', label: 'Step dx', min: 0.05, max: 1, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['θ = arctan x', (s) => `${fixed((Math.atan(s.x) * 180) / Math.PI, 1)}°`],
      ['Hypotenuse r', (s) => fixed(r(s.x), 4)],
      ['Turn dθ (exact)', (s) => fixed(Math.atan(s.x + s.dx) - Math.atan(s.x), 4)],
      ['dx ÷ (1 + x²)', (s) => fixed(s.dx / (1 + s.x * s.x), 4)],
      ['dθ ÷ dx', (s) => fixed((Math.atan(s.x + s.dx) - Math.atan(s.x)) / s.dx, 4)],
      ['1 ÷ (1 + x²)', (s) => ({ text: fixed(1 / (1 + s.x * s.x), 4), good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{d\\theta}{dx}\\approx\\dfrac{\\cos\\theta}{r}=\\dfrac{1/r}{r}=\\dfrac{1}{1+x^2}=\\dfrac{1}{1+${fixed(s.x * s.x, 3)}}=${fixed(1 / (1 + s.x * s.x), 4)}`,
});
