import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { num } from './_ia.js';

// Stretching a spring needs more force the further you go: F = k x. Each tiny stretch dx costs F·dx, a thin strip. Add the strips: a triangle of area ½ k x².
const state = { k: 200, x: 0.3, n: 6 };
const F = (x) => state.k * x;
const stripSum = () => { const h = state.x / state.n; let s = 0; for (let i = 0; i < state.n; i++) s += F(i * h) * h; return s; }; // left strips, all under the line

createTool({
  state,
  label: 'The force needed to stretch a spring against the stretch, a straight line through the origin. Thin strips under it are the small jobs force times distance; together they make a triangle.',
  setup: (stage, c) => createPlot(stage, { x: [0, 0.5], y: [0, 100], c }),
  draw(ctx, stage, c, plot) {
    plot.setRange([0, 0.5], [0, 110]);
    plot.axes({ xLabel: 'stretch x (m)', yLabel: 'force F (N)' });
    const h = state.x / state.n;
    for (let i = 0; i < state.n; i++) {
      const [x1, y1] = plot.toPx(i * h, F(i * h)); const [x2, y2] = plot.toPx((i + 1) * h, 0);
      ctx.fillStyle = c.fillA; ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      ctx.strokeStyle = c.ink; ctx.lineWidth = 1.5; ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    }
    plot.shade(F, null, 0, state.x, c.fillB);
    plot.fn(F, { color: c.ink, width: 3, domain: [0, 0.5] });
    plot.point(state.x, F(state.x), { fill: c.a });
  },
  controls: [
    { title: 'Stretch the spring' },
    { key: 'k', label: 'Spring constant k', min: 50, max: 400, step: 10, format: (v) => `${v} N/m` },
    { key: 'x', label: 'Stretch x', min: 0.05, max: 0.5, step: 0.01, format: (v) => `${v.toFixed(2)} m` },
    { key: 'n', label: 'Number of strips', min: 1, max: 40, step: 1 },
    { readout: [
      ['Force at the end', () => `${num(F(state.x), 4)} N`],
      ['Sum of strips', () => `${num(stripSum(), 5)} J`],
      ['Triangle ½ k x²', () => `${num(0.5 * state.k * state.x ** 2, 5)} J`],
      ['Work if the force were steady (F at the end × x)', () => `${num(F(state.x) * state.x, 5)} J`],
    ] },
  ],
  tex: (s) => `W=\\int_0^{x}kx\\,dx=\\tfrac12 k x^2=\\tfrac12(${s.k})(${s.x.toFixed(2)})^2`,
});
