import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

// x = t^2 - 3t, y = t^3 - 3t
const X = (t) => t * t - 3 * t;
const Y = (t) => t ** 3 - 3 * t;
const dX = (t) => 2 * t - 3;
const dY = (t) => 3 * t * t - 3;
const slope = (t) => dY(t) / dX(t);
// d/dt (dy/dx), then divide by dx/dt
const dSlope = (t) => (6 * t * (2 * t - 3) - 2 * (3 * t * t - 3)) / (2 * t - 3) ** 2;
const right = (t) => dSlope(t) / dX(t);
const wrong = (t) => 6 * t / 2; // y''(t) / x''(t)
const numeric = (t) => {
  const e = 1e-4;
  return (slope(t + e) - slope(t - e)) / (X(t + e) - X(t - e));
};
const state = { t: 2.4 };

createTool({
  state,
  label: 'The curve x equals t squared minus 3t, y equals t cubed minus 3t with a point on it. Two small parabolas are drawn through the point with the correct slope. The coral one uses the correct second derivative and hugs the curve. The dashed blue one uses y double prime over x double prime and drifts away from it.',
  setup: (stage, c) => createPlot(stage, { x: [-3, 11], y: [-4, 15], c }),
  draw(ctx, stage, c, plot) {
    const t = state.t;
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    for (let i = 1; i <= 200; i++) {
      const a = -2 + (4.8 * (i - 1)) / 200;
      const b = -2 + (4.8 * i) / 200;
      plot.segment(X(a), Y(a), X(b), Y(b), { color: c.ink, width: 3 });
    }
    if (Math.abs(dX(t)) > 0.05) {
      const m = slope(t);
      const x0 = X(t);
      const y0 = Y(t);
      const sp = (k) => (x) => y0 + m * (x - x0) + 0.5 * k * (x - x0) ** 2;
      plot.fn(sp(wrong(t)), { color: c.b, width: 3, dash: [6, 5], domain: [x0 - 2.5, x0 + 2.5] });
      plot.fn(sp(right(t)), { color: c.a, width: 3, domain: [x0 - 2.5, x0 + 2.5] });
    }
    plot.point(X(t), Y(t), { fill: c.fillY, r: 8 });
  },
  controls: [
    { title: 'Choose the point' },
    { key: 't', label: 'Time t', min: -1.5, max: 2.8, step: 0.05, format: (v) => fixed(v, 2) },
    { readout: [
      ['dy/dx', (s) => (Math.abs(dX(s.t)) < 1e-9 ? 'vertical' : fixed(slope(s.t), 4))],
      ['Correct d²y/dx²', (s) => (Math.abs(dX(s.t)) < 1e-9 ? 'undefined' : { text: fixed(right(s.t), 4), good: true })],
      ['Check by differences', (s) => (Math.abs(dX(s.t)) < 1e-3 ? '—' : fixed(numeric(s.t), 4))],
      ['Wrong guess y″/x″', (s) => ({ text: fixed(wrong(s.t), 4), good: false })],
    ] },
  ],
  tex: (s) => `\\dfrac{d^2y}{dx^2}=\\dfrac{\\frac{d}{dt}\\left(\\frac{dy}{dx}\\right)}{dx/dt}\\ \\neq\\ \\dfrac{y''(t)}{x''(t)}`,
});
