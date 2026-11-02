import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { fixed } from '../../lib/format.js';
import { rects, sumOf, exact } from './_ig.js';

// Leibniz's ∫ is a stretched S for "summa". Sigma f(x_i)Δx turns into ∫ f(x) dx as the slices thin to dx.
const state = { n: 4 };
const f = (x) => 1 + Math.sin(x) * 0.8 + x * 0.15;
const A = 0;
const B = 6;
const shape = (n) => (n < 12 ? 'sum' : n < 40 ? 'mid' : 'int');

const tool = createTool({
  state,
  label: 'A curve with n thin rectangles under it from 0 to 6. As n grows the rectangles thin to slivers and the outline becomes the curve itself. The formula strip changes from a sum of f times delta x to an integral of f times dx.',
  setup: (stage, c) => createPlot(stage, { x: [0, 6], y: [0, 3], c, pad: 28 }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'f(x)' });
    rects(ctx, plot, c, f, A, B, state.n, 0, { fill: c.fillB, width: state.n > 60 ? 0.5 : 1.5 });
    plot.fn(f, { color: c.a });
  },
  controls: () => [
    { title: 'Thin the slices' },
    { key: 'n', label: 'Slices n', min: 2, max: 150, step: 1 },
    { readout: [
      ['Width Δx', (s) => fixed(6 / s.n, 3)],
      ['Σ f(xᵢ)Δx', (s) => fixed(sumOf(f, A, B, s.n, 0), 4)],
      ['∫ f dx', () => fixed(exact(f, A, B), 4)],
      ['Symbol', (s) => ({ text: shape(s.n) === 'int' ? 'S stretched: ∫, dx' : shape(s.n) === 'mid' ? 'Σ turning into ∫' : 'Σ, Δx', good: shape(s.n) === 'int' })],
    ] },
  ],
  tex: (s) => (shape(s.n) === 'sum'
    ? `\\displaystyle\\sum_{i=1}^{${s.n}}f(x_i)\\,\\Delta x=${fixed(sumOf(f, A, B, s.n, 0), 3)}`
    : shape(s.n) === 'mid'
      ? `\\displaystyle\\lim_{\\Delta x\\to0}\\sum f(x_i)\\,\\Delta x=${fixed(sumOf(f, A, B, s.n, 0), 3)}\\ldots`
      : `\\displaystyle\\int_0^6 f(x)\\,dx=${fixed(exact(f, A, B), 4)}`),
});

tool.update();
