import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';

const state = { a: 10, x0: 1, n: 3 };
// Babylonian: average the two sides of a rectangle of area a. Newton: x - (x^2 - a)/(2x). They are the same step.
const baby = (a, x) => (x + a / x) / 2;
const newton = (a, x) => x - (x * x - a) / (2 * x);
function path(s) {
  const xs = [s.x0];
  for (let i = 0; i < 8; i++) xs.push(baby(s.a, xs[i]));
  return xs;
}

createTool({
  state,
  label: 'A rectangle of area a with sides x and a over x. Averaging the two sides gives a new, more square rectangle with the same target area. The points x and a over x are plotted on the hyperbola x times y equals a, and they close in on the point where the rectangle is a square, with side the square root of a. The numbers from the averaging rule and from Newton method agree at every step.',
  setup: (stage, c) => createPlot(stage, { x: [0, 12], y: [0, 12], c }),
  draw(ctx, stage, c, plot) {
    const { a } = state;
    const hi = Math.max(a, state.x0, a / state.x0) * 1.15;
    plot.setRange([0, hi], [0, hi]);
    plot.axes({ xLabel: 'one side', yLabel: 'other side' });
    plot.fn((x) => a / x, { color: c.ink, width: 3, domain: [a / hi, hi] });
    plot.segment(0, 0, hi, hi, { color: c.c, width: 2, dash: [6, 5] });
    const xs = path(state);
    for (let i = 0; i <= state.n; i++) {
      if (i) plot.segment(xs[i - 1], a / xs[i - 1], xs[i], a / xs[i], { color: c.a, width: 3 });
    }
    for (let i = 0; i <= state.n; i++) plot.point(xs[i], a / xs[i], { fill: i === state.n ? c.fillY : c.a, r: i === state.n ? 8 : 5 });
    plot.point(Math.sqrt(a), Math.sqrt(a), { fill: c.fillC, r: 6 });
  },
  controls: [
    { title: 'Square the rectangle' },
    { key: 'a', label: 'Area a', min: 2, max: 100, step: 1 },
    { key: 'x0', label: 'First side', min: 0.5, max: 10, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'n', label: 'Averaging steps', min: 0, max: 6, step: 1 },
    { readout: [
      ['Sides now', (s) => `${fixed(path(s)[s.n], 6)} × ${fixed(s.a / path(s)[s.n], 6)}`],
      ['Newton\'s rule gives', (s) => fixed(s.n ? newton(s.a, path(s)[s.n - 1]) : s.x0, 6)],
      ['Error', (s) => ({ text: Math.abs(path(s)[s.n] - Math.sqrt(s.a)).toExponential(1), good: true })],
    ] },
  ],
  tex: (s) => `x_{n+1}=\\dfrac12\\left(x_n+\\dfrac{${s.a}}{x_n}\\right)=x_n-\\dfrac{x_n^2-${s.a}}{2x_n}`,
});
