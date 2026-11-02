import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { deriv, tangent } from '../../lib/graph.js';
import { fixed } from '../../lib/format.js';

const state = { k: 2, x: 0.4 };

createTool({
  state,
  label: 'The graph of sine of k x, squeezed sideways by k, with its tangent at a chosen x. The dashed grey curve is plain sine x. The true slope of the squeezed curve is k times the cosine of k x, not just the cosine of k x.',
  setup: (stage, c) => createPlot(stage, { x: [-3.2, 3.2], y: [-1.7, 1.7], c, pad: 20 }),
  draw(ctx, stage, c, plot) {
    const { k, x } = state;
    const f = (t) => Math.sin(k * t);
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    plot.fn(Math.sin, { color: c.grid, width: 2, dash: [6, 5] });
    plot.fn(f, { color: c.a, width: 4 });
    const slope = deriv(f, x);
    const naive = Math.cos(k * x);
    tangent(plot, x, f(x), naive, 0.5, { color: c.b, width: 3, dash: [6, 4] });
    tangent(plot, x, f(x), slope, 0.5, { color: c.ink, width: 4 });
    plot.point(x, f(x), { fill: c.fillY });
  },
  controls: [
    { title: 'Squeeze the sine wave' },
    { key: 'k', label: 'Squeeze factor k', min: 1, max: 4, step: 0.5, format: (n) => fixed(n, 1) },
    { key: 'x', label: 'Point x', min: -3, max: 3, step: 0.05, format: (n) => fixed(n, 2) },
    { readout: [
      ['True slope (measured)', (s) => fixed(deriv((t) => Math.sin(s.k * t), s.x), 3)],
      ['Guess: cos kx (blue dashed)', (s) => fixed(Math.cos(s.k * s.x), 3)],
      ['k · cos kx', (s) => ({ text: fixed(s.k * Math.cos(s.k * s.x), 3), good: true })],
    ] },
  ],
  tex: (s) => `\\dfrac{d}{dx}\\sin(${fixed(s.k, 1)}x)=\\underbrace{\\cos(${fixed(s.k, 1)}x)}_{\\text{outside}}\\cdot\\underbrace{${fixed(s.k, 1)}}_{\\text{inside}}=${fixed(s.k * Math.cos(s.k * s.x), 3)}`,
});
