import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { exact } from './_ig.js';

// Area under y = √(r² − x²) from 0 to x: with x = r sin θ it is r²(θ + sin θ cos θ)/2. At x = r, θ = π/2 gives πr²/4: a quarter circle.
const state = { r: 2, p: 0.6 };
const A = (r, x) => {
  const th = Math.asin(Math.min(1, x / r));
  return (r * r * (th + Math.sin(th) * Math.cos(th))) / 2;
};

const tool = createTool({
  state,
  label: 'The upper-right quarter of a circle of radius r drawn as the graph of the square root of r squared minus x squared. The area from 0 to x is shaded. A readout compares the numerical area with the formula from the trig substitution; at x equals r the area is a quarter of pi r squared.',
  setup: (stage, c) => createPlot(stage, { x: [-0.3, 3.3], y: [-0.3, 3.3], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    const r = state.r;
    const x = state.p * r;
    plot.setRange([-0.15 * r, 1.15 * r], [-0.15 * r, 1.15 * r]);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    const f = (t) => Math.sqrt(Math.max(r * r - t * t, 0));
    plot.shade(f, null, 0, x, c.fillB);
    plot.fn(f, { color: c.a, domain: [0, r] });
    plot.segment(x, 0, x, f(x), { color: c.ink, width: 2, dash: [4, 4] });
  },
  controls: () => [
    { title: 'Sweep out the area' },
    { key: 'r', label: 'Radius r', min: 1, max: 3, step: 0.5, format: (v) => fixed(v, 1) },
    { key: 'p', label: 'Area up to x', min: 0.05, max: 1, step: 0.01, format: (v) => `${fixed(v * state.r, 2)}` },
    { readout: [
      ['Area by slices', (s) => fixed(exact((t) => Math.sqrt(Math.max(s.r * s.r - t * t, 0)), 0, s.p * s.r), 5)],
      ['Area by formula', (s) => fixed(A(s.r, s.p * s.r), 5)],
      ['Quarter circle πr²/4', (s) => fixed((Math.PI * s.r * s.r) / 4, 5)],
      ['Whole circle', (s) => fixed(Math.PI * s.r * s.r, 5)],
    ] },
  ],
  tex: (s) => `\\int\\sqrt{r^2-x^2}\\,dx=\\dfrac{r^2}{2}\\left(\\theta+\\sin\\theta\\cos\\theta\\right),\\ \\ 4\\times\\dfrac{\\pi r^2}{4}=\\pi r^2=${fixed(Math.PI * s.r * s.r, 3)}`,
});

tool.update();
