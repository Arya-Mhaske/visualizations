import { createTool } from '../../lib/tool.js';
import { createPlot } from '../../lib/plot.js';
import { sumTo, num } from './_is.js';

// Rectangles of width 1 under f(x) = 1/xᵖ: the right-hand ones (height f(n+1)) fit under the curve,
// the left-hand ones (height f(n)) stick out over it. So ∫₁^N f sits between two partial sums.
const state = { p: 2, N: 8, under: true, over: true };
const f = (x) => x ** -state.p;
const area = (a, b) => (state.p === 1 ? Math.log(b / a) : (a ** (1 - state.p) - b ** (1 - state.p)) / (state.p - 1));
const MAXN = 12;

function rects(ctx, plot, c, from, color) {
  for (let n = 1; n < state.N; n++) {
    const h = f(from === 'left' ? n : n + 1);
    const [x1, y1] = plot.toPx(n, h);
    const [x2, y2] = plot.toPx(n + 1, 0);
    ctx.fillStyle = color;
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
    ctx.strokeStyle = c.ink;
    ctx.lineWidth = 2;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  }
}

createTool({
  state,
  label: 'The curve y equals 1 over x to the p. Unit-width rectangles stand under the curve (blue) and over it (coral). Their total areas are partial sums of the series.',
  setup: (stage, c) => createPlot(stage, { x: [0, MAXN + 1], y: [0, 1.2], c }),
  draw(ctx, stage, c, plot) {
    plot.axes({ xLabel: 'x', yLabel: 'y' });
    if (state.over) rects(ctx, plot, c, 'left', c.fillA);
    if (state.under) rects(ctx, plot, c, 'right', c.fillB);
    plot.fn(f, { color: c.ink, width: 3, domain: [0.9, MAXN + 1] });
    plot.segment(state.N, 0, state.N, 1.2, { color: c.ink, width: 1.5, dash: [4, 4] });
  },
  controls: [
    { title: 'Trap the area' },
    { key: 'p', label: 'Exponent p', min: 1, max: 4, step: 0.5, format: (v) => v.toFixed(1) },
    { key: 'N', label: 'Stop at N', min: 2, max: MAXN, step: 1 },
    { key: 'under', label: 'Rectangles under the curve', toggle: true },
    { key: 'over', label: 'Rectangles over the curve', toggle: true },
    { readout: [
      ['Under: a₂+…+a_N', () => num(sumTo((n) => f(n), 2, state.N), 4)],
      ['Area ∫₁ᴺ f dx', () => num(area(1, state.N), 4)],
      ['Over: a₁+…+a_{N−1}', () => num(sumTo((n) => f(n), 1, state.N - 1), 4)],
      ['Area out to ∞', () => (state.p > 1 ? { text: num(1 / (state.p - 1), 4), good: true } : { text: 'infinite', good: false })],
    ] },
  ],
  tex: (s) => `a_2+\\dots+a_N\\ \\le\\ \\int_1^N \\frac{dx}{x^{${s.p}}}\\ \\le\\ a_1+\\dots+a_{N-1}`,
});
